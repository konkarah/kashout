app.post('/safaricom',safaricomauth, (req, res) => {
    res.status(200).json({ access_token: req.access_token })
    console.log(req.access_token)
});

app.get('/registersaf', safaricomauth, (req, res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "ShortCode": "600998",
                "ResponseType": "Completed",
                "ConfirmationURL": "https://nasty-mails-buy-41-76-172-105.loca.lt/confirmation",
                "ValidationURL": "https://nasty-mails-buy-41-76-172-105.loca.lt/validation"
            }
        },
        function (error, response, body) {
            if (error) { console.log(error) }
            res.status(200).json(body)
            //console.log(body)
        }
    )
})

app.post('/confirmation', (req, res) => {
    console.log('....................... confirmation .............')
    console.log(req.body)
})

app.post('/validation', (req, resp) => {
    console.log('....................... validation .............')
    console.log(req.body)
})

app.post('/stk', safaricomauth, (req, res) => {
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
                "CallBackURL": "https://nasty-mails-buy-41-76-172-105.loca.lt/stk_callback",
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

app.post('/stk_callback', (req, res) => {
    console.log('.......... STK Callback ..................')
    //console.log(JSON.stringify(req.body.Body[stkCallback]))
    let message = req.body.Body;
    console.log(message)
})

//pCCNeic90GTcWbs0AvIN1YL9BhrrWz6N:KL9Guw9PgUMZsRDD
//"Authorization": "Basic " + auth,

function safaricomauth(req, res, next) {

    // access token
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("pCCNeic90GTcWbs0AvIN1YL9BhrrWz6N:KL9Guw9PgUMZsRDD").toString('base64');

    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            "Authorization": "Basic " + auth,
        }
      };
      request(options, function (error, response) {
        if (error) console.log(error);
        console.log(response.body);
      });
}

app.get('/safaricom1', (req, res) => {
    safaricomauth()
})

//simulate a C2B transaction

app.get('/c2b', (req, res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "Command ID": "CustomerPayBillOnline",
                "Amount":"1",
                "Msisdn":"254717616430",
                "BillRefNumber":"testpay",
                "ShortCode":"174379",
                "ConfirmationURL": "https://nasty-mails-buy-41-76-172-105.loca.lt/confirmation",
                "ValidationURL": "https://nasty-mails-buy-41-76-172-105.loca.lt/validation"
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

app.get('/test3', (req, res) => {
    console.log('.......... test ..................')
})