const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();// define storageDisk
const qr = require('qr-image');
const moment = require('moment');
const {isEmail} = require('validator');
require('dotenv').config({path :'./config/.env'});
// use bd mongodb for store url_qr_user_code 
const mongoose = require('mongoose');
const {PORT , ADDRESS , MONGO_ADDRESS , MONGO_PORT} = process.env;
// start connection at server

const connectionRetryServer = async () =>{
    mongoose
        .connect(`mongodb://${MONGO_ADDRESS}:${MONGO_PORT}`)
        .then(() => {
            console.log('Connexion success');
        })
        .catch((err) =>{
            console.log(err);
            connectionRetryServer();
        });
};

// start connection with mongodb
connectionRetryServer();

//define models user 
const userSchema = new mongoose.Schema({
    name : {
        required : true ,
        type : String ,
        unique : true,
        lowercase : true,
        trimp : true
    },
    email :{
        required : true,
        type : String,
        unique : true,
        lowercase : true,
        validate : [isEmail],
        trim : true
    },
    password : {
        required : true,
        type: String,
        unique : true ,
        maxlength : 10,
        max : 1024
    },
    qr_code_user :{
        type : String,
        unique : true , 
        default : './api_qr_code'
    },
    picture : {
        type : String,
        default : './public'
    }
},
{
    timestamps : true
});

const userModel = mongoose.model('user' , userSchema);

// Define cors options
const corsOptions = {
    origin : "*", // 
    methods : "GET,POST",
    optionsSuccessStatus: 200
};

// define app server
const app = express();

// define middleware
app
    .use(bodyParser.urlencoded({
        extended : true
    }))
    .use(bodyParser.json())
    .use(cors(corsOptions))
    .use(express.static('qr_code_folder'))
    // define routes resquest 
    .get('/create-qr-code' , async ( req , res) =>{
        // generate link QR_CODE
        const {userId}= await req.body;
        console.log(userId)
        const qr_user_code = qr.image(userId, {type : 'png'});
        let name_file = `${userId}${new Date().getHours()}${new Date().getDate()}`;
        qr_user_code.pipe(require('fs').createWriteStream(`./qr_code_folder/${name_file}.png`));
        // response at client 
        res.status(200).json({
            status : true ,
            url_qr_code : `htpp ://${ADDRESS}:${PORT}/${name_file}.png`,
            time : moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
        }); 
        name_file = undefined ;
        //save 
       const usr = await userModel.findOneAndUpdate({
            _id : user._id
        },
            {
            qr_code_user : `htpp ://${ADDRESS}:${PORT}/${name_file}.png`
            }, 
            {

                new : true , 
                upsert : true,
                rawResult : true
            }
        );
        // log user 
        console.log(usr);
    })
    // start server 
    .listen(PORT , () =>{
        console.log('Server started on the port ',PORT);
    });