if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const User = require('../models/User')
const trx = require('../models/trx')
const courier = require('../models/courier')
const courierMessage = require('../courier/courier')
const sendSMS = require('../SMS')
const otpGenerator = require('otp-generator')
const completed = require('../models/completedTrx')
const randomstring = require("randomstring");
const axios = require('axios')
const unirest = require('unirest')
//let refreshTokens = []

router.use(express.json())



router.post('/login', async (req, res) => {
  // Authenticate User
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username }).exec();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password is correct, generate and return access token
    const accessToken = await generateAccessToken(user);
    res.json({ accessToken: accessToken });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/register', async (req, res) => {
    const { name, username } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);// 10 is the salt rounds

        // Create a new user with the hashed password
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword, // Store the hashed password
        });

        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(200).json({ success: true, data: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
});

router.post('/mpesanow',authenticateToken, async (req, res) => {
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




async function generateAccessToken(user) {
  const userObject = user.toJSON(); // Convert Mongoose document to plain JavaScript object
  return jwt.sign(userObject, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3600s' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
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

module.exports = router;