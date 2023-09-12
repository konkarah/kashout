/*var unirest = require("unirest");
var req = unirest("GET", "https://sandbox.safaricom.co.ke/oauth/v1/generate");
 
req.query({
 "grant_type": "client_credentials"
});
 
req.headers({
 "Authorization": "Basic SWZPREdqdkdYM0FjWkFTcTdSa1RWZ2FTSklNY001RGQ6WUp4ZVcxMTZaV0dGNFIzaA=="
});
 
req.end(res => {
 if (res.error) throw new Error(res.error);
 console.log(res.body);
});*/

function celcom(text,element){
    const https = require('https');

    var data = JSON.stringify({
        "apikey": "8de31b933855c2f41b114d477d014438",
        "partnerID": "77",
        "mobile": element,
        "message": text,
        "shortcode": "CELCOM_SMS",
        "username": "demoaccount",
        "password":"demo35"
    })
    var settings = {
        hostname: 'mysms.celcomafrica.com',
        path: 443,
        path: '/api/services/sendsms',
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'connection': 'keep-alive'
        },
    };
    
    const req = https.request(settings, res => {
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', d => {
        process.stdout.write(d)
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
  req.write(data)
  req.end()
}


//safaricom generate auth-token
function safaricom(){
    const https = require('https')

    var data = JSON.stringify({
        "grant_type": "client_credentials"
    })
    var settings = {
        hostname: 'sandbox.safaricom.co.ke',
        path: 443,
        path: '/oauth/v1/generate?grant_type=client_credentials',
        method: 'POST',
        headers: {
            "Authorization": "Basic SWZPREdqdkdYM0FjWkFTcTdSa1RWZ2FTSklNY001RGQ6WUp4ZVcxMTZaV0dGNFIzaA==",
            connection: 'keep-alive'
        },
    };
    const req = https.request(settings, res => {
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', d => {
        process.stdout.write(d)
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
    req.write(data)
    req.end()
}   

module.exports = celcom;

app.post('/stk_callback', (req, res) => {
    console.log('.......... STK Callback ..................')
    console.log(JSON.stringify(req.body.Body.stkCallback))
})

app.get('/stk', safaricomauth, (req, res) => {
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        auth = "Bearer " + req.access_token
    let date = new Date()

    const timestamp = date.getFullYear() + "" + "" +getMonth() +"" + "" + date.getDate() + "" + "" + getHours() + "" + "" + getMinutes() + "" + "" + date.getSeconds()
    const password = new Buffer.from('174379' + 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' + timestamp).toString('base64')
    function  getMonth(){
        let month = date.getMonth() + 1
        if(month < 10){
            month = "0" + month
        }
        return month
    }
    function getHours(){
        let hours = date.getHours()
        if(hours < 10){
            hours = "0" + hours
        }
        return hours
    }
    function getMinutes(){
        let minutes = date.getMinutes()
        if(minutes < 10){
            minutes = "0" + minutes
        }
        return minutes
    }

    console.log(timestamp)
    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "BusinessShortCode": "174379",
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": "254717616430",
                "PartyB": "174379",
                "PhoneNumber": "254717616430",
                "CallBackURL": "https://tender-fish-55.loca.lt/stk_callback",
                "AccountReference": "Test",
                "TransactionDesc": "TestPay"
            }
        },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json(body)
            }
        }
    )
})