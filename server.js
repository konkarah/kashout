const express = require('express');
const app = express();
const userRouter = require('./routes/user');
const https = require('https')
const cors = require('cors');
//process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
const request = require('request');
const bodyParser = require('body-parser')
const delivery = require('./routes/delivery')
const axios = require('axios')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.use( express.static( "public" ) );
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use('/user', userRouter);
app.use('/delivery', delivery)

app.get('/', (req, res) => {
    res.render('index');
});

//Acquire the access token
app.get('/accesstoken',access_token, (req,res)=> {
    res.status(200).json({access_token: req.access_token})
      
})

//URL registration
app.get('/registerurl',access_token, (req,res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth = "Bearer " +req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers:{
                "Authorization": auth
            },
            json: {
                "ShortCode": "174379",
                "ResponseType": "Complete",
                "ConfirmationURL": "https://olive-spoons-lose-41-76-172-105.loca.lt/confirmation",
                "ValidationURL": "https://olive-spoons-lose-41-76-172-105.loca.lt/validation"
            }
        },
        function(error, response, body){
            if(error){
                console.log(error)
            }else{
                res.status(200).json(body)
            }
        }
    )
})

//confirmation url
app.post('/confirmation', (req,res)=> {
    console.log("....confirmation....")
    console.log(req.body)
})

//validation url
app.post('/validation', (req, res)=> {
    console.log(".....validation....")
    console.log(req.body)
})

//C2B Intergration
app.get('/simulate', access_token, (req,res)=> {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
    let auth ="Bearer "+ req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth,
                "Content-Type": 'application/json'
            },
            json: {    
                "ShortCode":"174379",
                "CommandID":"CustomerPayBillOnline",
                "Amount":"10",
                "Msisdn":"254717616430",
                "BillRefNumber":" 254717616430"
            }
        },
        function(error, response, body){
            if(error){
                console.log(error)
            }else{
                res.status(200).json(body)
            }
            
        }
    )

})

//STK Push intergration
app.get('/stk',access_token, (req,res)=>{
    let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    let auth = "Bearer " +req.access_token

    console.log(auth)

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
            headers:{
                "Authorization": auth,
                "Content-Type": 'application/json'
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
                "CallBackURL": "https://olive-spoons-lose-41-76-172-105.loca.lt/stk_callback",
                "AccountReference": "Test",
                "TransactionDesc": "TestPay"
            }
        },
        function(error, response, body){
            if(error){
                console.log(error)
            }else{
                res.status(200).json(body)
            }
        }
    )
})

//function to recursively get the access token
function access_token(req, res, next){
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer("gI5ZRbGMZo26KSF5lewKhqMGU39b0vUS:RSvEKZ3s5WZquzuM").toString('base64')
    
    request(
        {
          url: url,
          headers:{
              "Authorization": "Basic " + auth
          }  
        },
        (error, response, body) => {
            if(error){
                console.log(error)
            }else{
                req.access_token = JSON.parse(body).access_token
                next()
            }
        }
    )
}

async function lipanampesa() {
    let oauth_token = ''
        try {
          let response = await axios.get(url, {
              headers: {
                  "Authorization": "Basic " + Buffer.from('EhyC5GunIxu4N6tZObmm1VxWaGDfGOow:kJcg1p4nrKf6g45l').toString("base64")
              }
          })
          oauth_token = response.data.access_token;
      } catch (error) {
          console.log("Auth Error: ", error.response);
      }
  
  
      let timestamp = formatDate();
      const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
      const shortcode = '174379'
        
      let unirest = require('unirest');
      let req = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
      .headers({
          'Content-Type': 'application/json',
          /*'Authorization': 'Bearer FZgx61uxWxRhrZTzKSr4DJWsEsVG'*/
          'Authorization': 'Bearer ' + oauth_token
      })
      .send(JSON.stringify({
          "BusinessShortCode": 174379,
          "Password": Buffer.from(shortcode + passkey + timestamp).toString("base64"),
          "Timestamp": timestamp,
          "TransactionType": "CustomerPayBillOnline",
          "Amount": 1,
          "PartyA": 254717616430,
          "PartyB": 174379,
          "PhoneNumber": 254717616430,
          "CallBackURL": "https://inuajamii.go.ke:7000/apptest",
          "AccountReference": "CompanyXLTD",
          "TransactionDesc": "Payment of X" 
        }))
      .end(res => {
          if (res.error) throw new Error(res.error);
          console.log(res.raw_body);
      });
  }


//cENDTmVpYzkwR1RjV2JzMEF2SU4xWUw5Qmhycld6Nk46S0w5R3V3OVBnVU1ac1JERA==


app.listen(3005);