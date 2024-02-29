const http = require('http');
const https = require('https');

function deliver(pickupLocation, deliveryLocation, timeToDeliver, uniqueIdentifier, classOfTransaction, url) {
    // Construct the payload
    const payload = {
        pickupLocation: pickupLocation,
        deliveryLocation: deliveryLocation,
        timeToDeliver: timeToDeliver,
        uniqueIdentifier: uniqueIdentifier,
        classOfTransaction: classOfTransaction
    };

    const postData = JSON.stringify(payload);

    // Determine the protocol based on the URL
    const protocol = url.startsWith('https://') ? https : http;

    // Options for the request
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
        }
    };

    // Create the request
    const req = protocol.request(url, options, (res) => {
        if (res.statusCode === 200) {
            console.log('Delivery request sent successfully');
        } else {
            console.error('Delivery request failed with status:', res.statusCode);
        }
    });

    // Handle errors
    req.on('error', (error) => {
        console.log('Error sending delivery request:', error.message);
    });

    // Write data to request body
    req.write(postData);

    // End the request
    req.end();
}

module.exports = deliver;
