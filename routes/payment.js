const express = require('express');
const router = express.Router();

router.post('/myUI',  (req,res)=> {
    const myphone = req.body.myphone
    const recphone = req.body.recphone
    const amount = req.body.amount
    const location = req.body.coordinates
    const timeout = req.body.timeout
    const courier = req.body.courier
    const date = Date.now()

    //process transaction
    mytest(myphone)
    res.send("success")

    //if courrer is set, send response to courier

})

router.post('/myUIreply', (req,res)=> {
    const response = req.body;

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

  // Respond to the incoming request
  res.send('Payment callback received.');
})

router.post('/extAPI', (req,res)=> {
    const myphone = req.body.myphone
    const recphone = req.body.recphone
    const amount = req.body.amount
    const location = req.body.coordinates
    const timeout = req.body.timeout
    const courier = req.body.courier
})

async function mytest(myphone){
    const unirest = require('unirest');

    function generateTimestamp() {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
    
      const timestamp = year + month + day + hours + minutes + seconds;
    
      return timestamp;
    }
    
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const shortcode = '174379';
    const phone = myphone // Replace with the actual phone number
    
    // Generate Timestamp
    const timestamp = generateTimestamp();
    
    // Concatenate Shortcode, Passkey, and Timestamp
    const concatenatedString = shortcode + passkey + timestamp;
    
    // Encode the concatenated string to base64
    const base64Encoded = Buffer.from(concatenatedString).toString('base64');
    
    // Define the input string
    const inputString = '174379:your_passkey_here'; // Replace with the actual passkey
    
    // Encode the string to base64
    const base64Enc = Buffer.from(inputString).toString('base64');
    let oauth_token = '';
    
    // Make an OAuth request to get the token
    (async () => {
      try {
        const response = await unirest
          .get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
          .headers({
            Authorization: 'Basic ' + base64Enc,
          });
    
        if (response.error) {
          throw new Error(response.error);
        }
    
        oauth_token = JSON.parse(response.raw_body).access_token;
    
        // Create your request data
        const myjson = {
          BusinessShortCode: '174379',
          Password: base64Encoded,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: '1',
          PartyA: phone,
          PartyB: '174379',
          PhoneNumber: phone,
          CallBackURL: 'https://stale-jokes-love.loca.lt/myapis/myUIreply',
          AccountReference: 'Test',
          TransactionDesc: 'TestPay',
        };
    
        // Send your request
        const response2 = await unirest
          .post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
          .headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + oauth_token,
          })
          .send(myjson);
    
        console.log(response2.body);
      } catch (error) {
        console.error('Error:', error.message);
      }
    })();

}



module.exports = router;