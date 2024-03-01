const https = require('https');
const querystring = require('querystring');

const sendSMS = (msg) => {
    // Check if message is empty
    if (!msg || msg.trim() === '') {
      return Promise.reject(new Error('Message must not be empty'));
    }
  // Get the SMS data
  //movetech
  /*const smsData = {
    username: 'thindi',
    api_key: "Q1Hy6MU4B8nwOJOIZ3vzBrgTo0yO7gjSt02MFMes0TUJUMrZCh",
    sender: 'SMARTLINK',
    to: '254717616430',
    message: 'This is my first message with SMSGateway.Center',
    msgtype: "5",
    dlr: "0"
  };*/
  //celcom
  const smsData = {
    partnerID : 36,
    apikey : "1f97c55104c0c4089ca033d78a48bd9b",
    shortcode : "Celcom_API",
    mobile : "254717616430", // Bulk messages can be comma separated
    message : `${msg}`
  };


  // Convert SMS data to URL-encoded string
  const postData = querystring.stringify(smsData);

  // Options for the HTTPS request
  const options = {
    method: 'POST',
    hostname: 'isms.celcomafrica.com',
    port: 443, // Use 443 for HTTPS
    path: '/api/services/sendsms',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  // Create and return a promise for better handling
  return new Promise((resolve, reject) => {
    // Create the request
    const req = https.request(options, (res) => {
      let responseData = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        resolve(responseData);
      });
    });

    // Handle errors
    req.on('error', (error) => {
      reject(error);
    });

    // Write data to request body
    req.write(postData);

    // End the request
    req.end();
  });
};

module.exports = sendSMS;
