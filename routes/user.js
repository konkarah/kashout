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
const bodyParser = require('body-parser')
const unirest = require('unirest')
const mongoose = require('mongoose')
const trx = require('../models/trx')
const courier = require('../models/courier')
const courierMessage = require('../courier/courier')
const sendSMS = require('../SMS')
const otpGenerator = require('otp-generator')
const completed = require('../models/completedTrx')
const randomstring = require("randomstring");

router.use(bodyParser.json())


const initialisepassport = require('../passport-config');
const { appendFile } = require('fs');
const timeout = require('rest/interceptor/timeout');
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

//connect to mongodb
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

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

router.post('/mpesanow', async (req, res) => {
    const recipient = req.body.phone;
    const amount = req.body.amount;
    const location = req.body.coordinates
    //const timeout = req.body.timeout
    const courier = req.body.courier
    const clientPhone= "phoneNumber"
    const clientId = "test"
    const pickuplocation = "location"
    const deliverylocation = "deliverylocation"
    const timeout = Date.now()
    const courierId =  "G4S"
    const mydate = Date.now()
    const status = "pending"
    const MpesaReceiptNumber = "NULL"
    //CheckoutRequestID: CheckoutRequestID

    try {
        const result = await lipanampesa(recipient, amount); // Wait for lipanampesa to complete and get the result
        console.log(result);

        // Use the result data or handle success/error as needed
        if (result.success) {
            const newtrx = new trx({
                cltphone: clientPhone,
                recphone: recipient,
                amount: amount,
                clientId: clientId,
                location: pickuplocation,
                timeout: timeout,
                courierId: courierId,
                Date: mydate,
                status: status,
                CheckoutRequestID: result.data.CheckoutRequestID,
                MpesaReceiptNumber: MpesaReceiptNumber
            })
            try {
                const savedTRX = await newtrx.save()
                res.status(200).json({ success: true, data: savedTRX });
            }catch(err){
                console.log(err)
            }
        } else {
            res.status(500).json({ success: false, error: result.error });
            //console.log("error")
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
});

/*router.post('/apptest', async (req,res)=> {
    try {
        const response = await req.body;
        // Destructure the relevant information
        const {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata: { Item },
        } = response.Body.stkCallback;
      
        // Extract additional information from the CallbackMetadata Item array
        const amount = Item.find((item) => item.Name === 'Amount').Value;
        const mpesaReceiptNumber = Item.find((item) => item.Name === 'MpesaReceiptNumber').Value;
        const transactionDate = Item.find((item) => item.Name === 'TransactionDate').Value;
        const phoneNumber = Item.find((item) => item.Name === 'PhoneNumber').Value;
      
        // Now, you can use these variables in your application as needed
        console.log('MerchantRequestID:', MerchantRequestID);
        console.log('CheckoutRequestID:', CheckoutRequestID);
        console.log('ResultCode:', ResultCode);
        console.log('ResultDesc:', ResultDesc);
        console.log('Amount:', amount);
        console.log('MpesaReceiptNumber:', mpesaReceiptNumber);
        console.log('TransactionDate:', transactionDate);
        console.log('PhoneNumber:', phoneNumber);
        if(ResultCode==0){
            try{
                const updatedtrx = await trx.findOneAndUpdate(
                    { CheckoutRequestID:CheckoutRequestID },
                    { $set: { status: "success", MpesaReceiptNumber:mpesaReceiptNumber } },
                    { new: true } // Return the modified document
                );
            
                if (updatedtrx) {
                    res.status(200).json(updatedtrx);
                    var myresult = {}
                    //fetch the details from the transaction
                    try {
                        const checkoutId = CheckoutRequestID;
                        const result = await trx.findOne({ CheckoutRequestID: checkoutId }).exec();
                
                        if (result) {
                            // Update myresult based on result
                            myresult = result;
                            //console.log('Found item:', myresult);
                        } else {
                            console.log('Item not found');
                        }
                    } catch (error) {
                        console.error(error);
                        return res.status(500).send('Internal Server Error');
                    }
                    const pickuplocation = myresult.location
                    const deliverylocation = myresult.location
                    const timeToDeliver = myresult.timeout
                    const uniqueIdentifier = myresult.CheckoutRequestID
                    const classOfTransaction = "test"
                    const url = myresult.courierId
                    try{
                        courierMessage(pickuplocation, deliverylocation, timeToDeliver, uniqueIdentifier, classOfTransaction, url)
                    }catch{
                        console.log(error)
                    }
                } else {
                    res.status(404).json({ error: 'not found' });
                }
                } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
                }
        }else if(ResultCode!=0){
            res.json({"Message": "User cancelled the transaction"})
        }
    
      
        // Respond to the incoming request
        //res.send('Payment callback received.');
    } catch (error) {
        console.error('Error extracting callback data:', error);
        res.status(500).json({ success: false, error: 'An error occurred while processing callback data' });
    }
})*/


router.post('/apptest', async (req, res) => {
    try {
        const response = req.body;
        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata: { Item },
        } = response.Body.stkCallback;

        const amount = Item.find((item) => item.Name === 'Amount').Value;
        const mpesaReceiptNumber = Item.find((item) => item.Name === 'MpesaReceiptNumber').Value;
        const transactionDate = Item.find((item) => item.Name === 'TransactionDate').Value;
        const phoneNumber = Item.find((item) => item.Name === 'PhoneNumber').Value;

        if (ResultCode === 0) {
            try {
                const updatedtrx = await trx.findOneAndUpdate(
                    { CheckoutRequestID: CheckoutRequestID },
                    { $set: { status: "success", MpesaReceiptNumber: mpesaReceiptNumber } },
                    { new: true }
                );

                if (updatedtrx) {
                    res.status(200).json(updatedtrx);
                    try {
                        const checkoutId = CheckoutRequestID;
                        const result = await trx.findOne({ CheckoutRequestID: checkoutId }).exec();

                        if (result) {
                            const pickuplocation = result.location;
                            const deliverylocation = result.location;
                            const timeToDeliver = result.timeout;
                            const uniqueIdentifier = result.CheckoutRequestID;
                            const classOfTransaction = "test";
                            //const mycourier = await courier.findOne({ courierId: result.courierId }).exec();
                            const mycourier = "test"
                            //const url = mycourier.courierCallBack;
                            const url = "http://localhost:3010/receive"

                            courierMessage(pickuplocation, deliverylocation, timeToDeliver, uniqueIdentifier, classOfTransaction, url);

                        } else {
                            console.log('Item not found');
                        }
                    } catch (error) {
                        console.error('Error fetching transaction details:', error);
                        //res.status(500).json({ success: false, error: 'Internal Server Error' });
                    }
                } else {
                    res.status(404).json({ error: 'Not found' });
                }
            } catch (error) {
                console.error('Error updating transaction status:', error);
                //res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.json({ message: "User cancelled the transaction" });
        }
    } catch (error) {
        console.error('Error extracting callback data:', error);
        //res.status(500).json({ success: false, error: 'An error occurred while processing callback data' });
    }
});


router.post('/statuscheck', async(req,res)=> {
    try {
    const checkoutId = req.body.checkoutId;

  trx.findOne({ CheckoutRequestID: checkoutId }, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    if (result) {
      console.log('Found item:', result.status);
    } else {
      console.log('Item not found');
    }

  });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})


router.get('/test', (req,res)=> {
    res.render('hometest')
})

router.post('/generateOTP', async (req, res) => {
    const checkoutId = req.body.checkoutID;
                // Generate OTP
                const OTP = generateOTP();
                console.log(OTP)

    try {
        // Check if transaction exists
        const result = await trx.findOne({ CheckoutRequestID: checkoutId }).exec();

        if (result) {

            // Update transaction with OTP
            const updatedtrx = await trx.findOneAndUpdate(
                { CheckoutRequestID: checkoutId },
                { $set: { OTP: OTP } },
                { new: true }
            ).exec();

            // Send OTP to the customer
            try {
                const response = await sendSMS(OTP);
                console.log(response);
            } catch (smsError) {
                console.error('Error sending SMS:', smsError);
                // Log the error and handle it appropriately
            }

            res.status(200).json({ success: true, data: updatedtrx });
        } else {
            res.status(404).json({ success: false, error: 'Transaction not found' });
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/processOTP', async(req,res)=> {
    const OTP = req.body.OTP
    //compare OTP
    const result = await trx.findOne({ OTP: OTP }).exec()
    const origin = await randomstring.generate();
    console.log(result)
    if(result){
        const result = await performPaymentRequest(origin, result.recphone, result.amount);
        console.log(result) 
        if (result.success) {
            //log the trx on DB
            const newtrx = new completed({
                originatorID: origin,
            })
            try {
                const savedTRX = await newtrx.save()
                //res.status(200).json({ success: true, data: savedTRX });
                console.log(savedTRX)
            }catch(err){
                console.log(err)
            }
            console.log(result)
        } else {
            res.status(500).json({ success: false, error: result.error });
            //console.log("error")
        }
        try {
            const updatedtrx = await trx.findOneAndUpdate(
                { OTP: OTP },
                { $set: { status: "sucess",} },
                { new: true }
            );
            res.status(200).json({ success: true, data: updatedtrx });
        }catch(err){
            console.log(err)
        }
    }else{
        res.send("WRONG OTP")
    }

})
router.post('/processResult', async(req, res) => {
    try {
        const result = req.body.Result;
        

        // Check if the result has the expected properties
        if (result && result.ResultType !== undefined && result.ResultCode !== undefined) {
                        // Log the result
                        console.log(result.ResultParameters.ResultParameter[0].Value);
            //const trxresult = await completed.findOne({ originatorID: result.OriginatorConversationID }).exec()
            // Update transaction with OTP
            const updatedtrx = await completed.findOneAndUpdate(
                { originatorID: result.OriginatorConversationID },
                { $set: { mpesaTrx: result.TransactionID,  amount: result.ResultParameters.ResultParameter[0].Value,recipient: result.ResultParameters.ResultParameter[4].Value} },
                { new: true }
            ).exec();

                console.log(updatedtrx)
            // Send a response indicating successful processing
            //res.status(200).json({ success: true, message: 'Result processed successfully' });
        } else {
            // Invalid result format
            res.status(400).json({ success: false, error: 'Invalid result format' });
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('Error processing result:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/timeout', (req,res)=> {
    const result = req.body.Result;
    console.log(result)
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

async function lipanampesa(recipient, amount) {
    try {
        let oauth_token = await getOAuthToken();
        
        let timestamp = formatDate();
        const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        const shortcode = '174379'
        
        let response = await unirest.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
            .headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + oauth_token
            })
            .send({
                "BusinessShortCode": 174379,
                "Password": Buffer.from(shortcode + passkey + timestamp).toString("base64"),
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": recipient,
                "PartyB": 174379,
                "PhoneNumber": recipient,
                "CallBackURL": "https://3cba-41-76-168-3.ngrok-free.app/user/apptest",
                "AccountReference": "CompanyXLTD",
                "TransactionDesc": "Payment of X"
            });

        return {
            success: true,
            data: response.raw_body
        };
    } catch (error) {
        console.log("Error: ", error);
        return {
            success: false,
            error: error.message || 'An error occurred'
        };
    }
}
async function processpayment(recipient, amount) {
    try {
        let oauth_token = await getOAuthToken();
        
        let timestamp = formatDate();
        const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        const shortcode = '174379'
        
        let response = await unirest.post('https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest')
            .headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + oauth_token
            })
            .send({
                "OriginatorConversationID": "96cd0ed4-f3fa-4f4d-b719-72db6808046c",
                "InitiatorName": "testapi",
                "SecurityCredential":"MCshn9hwULWa11zact4SnnD+99r20AmlPQQiHdF0mDITlw9yoUtaO6TEBZAFhN038hnkwLGP5Yxoz/V8uwvw1vBHw2hnkZnswxw26lNOhIxQyRVZ3nKbgZrxxb+Z6xDZ6D0CbWac5LXyGBvMPIj0Noq80Qqy6j2Twb6xs8DDY5BPPF2Au3Gx/G5WGPygsV7vXq1/kirpncuyMYVwYmAgG8R77tVjQmUG8LHBWHAm0fFuETwUbvKUgJEnvvxEA91H/zNiwzpWcwSzllK49S+nuB8A6YbRbT0QfRSfAFNFhcHZ9oKOrrJQkm8Ly+FUMIQUvvVYfJ/0JNVRmlT/H3usyw==",
                "CommandID":"BusinessPayment",
                "Amount":"10",
                "PartyA":"600996",
                "PartyB":"254717616430",
                "Remarks":"here are my remarks",
                "QueueTimeOutURL":"https://e071-196-22-131-250.ngrok-free.app/user/timeout",
                "ResultURL":"https://e071-196-22-131-250.ngrok-free.app/user/processresult",
                "Occassion":"Christmas"
            });

        return {
            success: true,
            data: response.raw_body
        };
    } catch (error) {
        console.log("Error: ", error);
        return {
            success: false,
            error: error.message || 'An error occurred'
        };
    }
}

async function getOAuthToken() {
    try {
        let response = await axios.get(url, {
            headers: {
                "Authorization": "Basic " + Buffer.from('CFALNZPZT3lExbSu9KU7nNhF40OR5DZ6KnxerdPWOcEr6dM6:DvGkJcCupGAGayClqAYrEKw2ZY6qwO1SES6tWWGemYFGAlm2K9RzLKkX0Wx6CMxU').toString("base64")
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.log("Auth Error: ", error.response);
        throw new Error('Authentication failed');
    }
}

function formatDate() {
    const date = new Date();
    
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

//generate OTP
const generateOTP = () => {
    // You can customize the length and digits of the OTP
    const otp = otpGenerator.generate(10, { digits: true,lowerCaseAlphabets: true, upperCaseAlphabets: true, specialChars: true });
    console.log(otp)
    return otp;
  };
  async function performPaymentRequest(origin, phone, amount) {
    try {
        let oauth_token = await getOAuthToken();
        
        //let timestamp = formatDate();
        //const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        //const shortcode = '174379'
        
        let response = await unirest.post('https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest')
            .headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + oauth_token
            })
            .send({
                "OriginatorConversationID": origin,
                "InitiatorName": "testapi",
                "SecurityCredential": "CAUioVCBe9iK99KeVpI9/QZvmOqYNCIH5RslYj+0g/HYYWn3bnY9djFy4FD5peeJwHVCAJmugpDHtjPdCvSqtrPQxWPnckUEt4orgT3AmO3hJdzNAya/sOiSKrkGc2TmcJmaKDEncRH8f2/IRLy3NBkB+GZ5hC0g1mLUH4MqPZouZbptZaeEG4inf4V/EjfdSmNL6BHFCyBXDhUtj8/Ct+QOK7Iw9yB46nJczNNIC+SoYIgBhjdeRJuz6TgUC4TvUDZuSw67/635NLF6R7BXJEnXNABtRjVTLNL1xTnJ8jgHbE1bwm1/6bhHc4+WcT28HSPyQfF31coRERIGd24/yw==",
                "CommandID": "BusinessPayment",
                "Amount": amount,
                "PartyA": 600997,
                "PartyB": phone,
                "Remarks": "Test remarks",
                "QueueTimeOutURL": "https://e071-196-22-131-250.ngrok-free.app/user/processresult",
                "ResultURL": "https://e071-196-22-131-250.ngrok-free.app/user/processresult",
                "occasion": "tst" 
            });

        return {
            success: true,
            data: response.raw_body
        };
    } catch (error) {
        console.log("Error: ", error);
        return {
            success: false,
            error: error.message || 'An error occurred'
        };
    }
}


router.get('/sms', async(req, res)=> {
    try {
        // Call your sendSMS function
        const response = await sendSMS();
        res.json({ success: true, response });
      } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
})
  

module.exports = router;