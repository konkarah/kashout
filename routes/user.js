if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodoverride = require('method-override');
const axios = require('axios')


const initialisepassport = require('../passport-config');
const { appendFile } = require('fs');
initialisepassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id));

router.use(cors());
router.use(methodoverride('_method'));
router.use( express.static( "public" ) );
router.use(express.urlencoded({extended: false}));
router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

const users = [];

router.get('/', (req, res) => {
    res.send("hello world");
});

 
router.get('/signin', checknotauthenticated,(req, res) => {
    res.render('signin');
});

router.post('/signin',checknotauthenticated, passport.authenticate('local', {
    successRedirect: 'homepage',
    failureRedirect: 'signin',
    failureFlash: true
}));

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup',checknotauthenticated, async (req, res) => {
    try {
        const hashedpassword = await bcrypt.hash(req.body.password, 10);

        users.push({
            id: Date.now().toString(),
            Fname: req.body.firstname,
            Lname: req.body.lastname,
            email: req.body.email,
            password: hashedpassword
        })
        res.redirect('signin');
    } catch(error)  {
        res.redirect('signup');
        console.log(error);
    }
    console.log(users);
})

router.get('/homepage', /*checkauthenticated,*/ (req, res) => {
    res.render('homepage');
});

router.delete('/delete', (req, res) => {
    req.logout();
    res.redirect('signin');
});

router.get('/mpesa', (req, res) => {
    res.render('mpesa');
});

router.post('/mpesanow', (req,res) => {
    const recipient = req.body.recipient;
    const amount = req.body.amount;

    console.log(recipient,amount);
    lipanampesa()
})

router.get('/test', (req,res)=> {
    res.render('hometest')
})

function checkauthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('signin');
}

function checknotauthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('homepage');
    }
    next();
}
function pad2(n) { return n < 10 ? '0' + n : n }

function formatDate() {
  let date = new Date();
  let correctDate =
      date.getFullYear().toString() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds());
  return correctDate;
}
function startInterval(seconds) {
  setInterval(function () { getOauthToken() }, seconds * 1000);
}
const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

async function lipanampesa() {
    let oauth_token = ''
        try {
          let response = await axios.get(url, {
              headers: {
                "Authorization": "Basic " + Buffer.from('UAYWIGgR9xASYtDOBQYmXANzWcA8KAn2:AAj1RxKJSGGYMjwm').toString("base64")
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

  

module.exports = router;