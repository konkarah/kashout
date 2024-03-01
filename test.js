const request = require('request')

function access_token() {
    // access token
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("pCCNeic90GTcWbs0AvIN1YL9BhrrWz6N:KL9Guw9PgUMZsRDD").toString('base64');

    request(
        {
            url: url,
            headers: {
                "Authorization": "Basic " + auth
            }
        },
        (error, response, body) => {
            if (error) {
                console.log(error)
            }
            else {
                // let resp = 
               //console.log(JSON.parse(body).access_token)
               console.log(response.body)
            }
        }
    )
}

module.exports = access_token


Headers
  Key: Authorization
  Value: Basic Q0ZBTE5aUFpUM2xFeGJTdTlLVTduTmhGNDBPUjVEWjZLbnhlcmRQV09jRXI2ZE02OkR2R2tKY0N1cEdBR2F5Q2xxQVlyRUt3MlpZNnF3TzFTRVM2dFdXR2VtWUZHQWxtMks5UnpMS2tYMFd4NkNNeFU=
  
  Body
    { 
      "OriginatorConversationID": "47636273-697c-407b-92d0-e74a840e6992",
      "InitiatorName": "testapi",
      "SecurityCredential": "SMYZGN33TKzVY1bmsQBOPvo9gW/Z/qKCYiZUBoYJBR7UGnRDjWoRTmCZkgoVrW+Q41lczHAh92fTFeiPFO9sjXBqDUcoOaARhjLc3StYZ2JdlPF5Mu5mHvO2HZUN78XoZncVNudiWj7yFD2H+jTbEsSIY31NaCqLGGWBtBcVDdyektN5V9kKZEgS6YqVdGUIyOq3K5FPjLvz4/zZW8U8uS6d3c/V0DP3VLPuH4RW+6smkDQKQnQWPm+sBSzuSfKMO+IFn6mPi7w5szRYEMhBmpWmFg9zcoqzjt/vE9v3OD4kV9QrYQxvJjmlL20pZoN+kCo76+cTdQ8S62EMhDyClQ==",
      "CommandID": "BusinessPayment",
      "Amount": 10,
      "PartyA": 600997,
      "PartyB": 254708374149,
      "Remarks": "Test remarks",
      "QueueTimeOutURL": "https://e071-196-22-131-250.ngrok-free.app",
      "ResultURL": "https://e071-196-22-131-250.ngrok-free.app",
      "occasion": "tst" 
    }