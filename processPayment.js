const unirest = require('unirest');
const axios = require('axios'); // Make sure to import axios

async function performPaymentRequest(phone, amount) {
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
                "OriginatorConversationID": "6320e227-2406-4d08-bd6a-b6f4542e9591",
                "InitiatorName": "testapi",
                "SecurityCredential": "CAUioVCBe9iK99KeVpI9/QZvmOqYNCIH5RslYj+0g/HYYWn3bnY9djFy4FD5peeJwHVCAJmugpDHtjPdCvSqtrPQxWPnckUEt4orgT3AmO3hJdzNAya/sOiSKrkGc2TmcJmaKDEncRH8f2/IRLy3NBkB+GZ5hC0g1mLUH4MqPZouZbptZaeEG4inf4V/EjfdSmNL6BHFCyBXDhUtj8/Ct+QOK7Iw9yB46nJczNNIC+SoYIgBhjdeRJuz6TgUC4TvUDZuSw67/635NLF6R7BXJEnXNABtRjVTLNL1xTnJ8jgHbE1bwm1/6bhHc4+WcT28HSPyQfF31coRERIGd24/yw==",
                "CommandID": "BusinessPayment",
                "Amount": 10,
                "PartyA": 600997,
                "PartyB": 254708374149,
                "Remarks": "Test remarks",
                "QueueTimeOutURL": "https://e071-196-22-131-250.ngrok-free.app",
                "ResultURL": "https://e071-196-22-131-250.ngrok-free.app",
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

module.exports = performPaymentRequest;
