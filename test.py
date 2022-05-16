import requests


data = {
    'userId' : '59IJKUYTRsqse45670qsz1235'
}

try :
    global req
    req = requests.get('http://localhost:3210/create-qr-code', data = data)

except : print('hum error')

else :
    print(req.json())
    dictio = dict()
    dictio = req.json()
    print(dictio['url_qr_code'])