const fetch = require('node-fetch');
async function deliver(pickupLocation, deliveryLocation, timeToDeliver, uniqueIdentifier, classOfTransaction, url) {
    try {
        // Construct the payload
        const payload = {
            pickupLocation: pickupLocation,
            deliveryLocation: deliveryLocation,
            timeToDeliver: timeToDeliver,
            uniqueIdentifier: uniqueIdentifier,
            classOfTransaction: classOfTransaction
        };

        // Make a POST request using fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if needed
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Handle the response data as needed
        console.log('Delivery request successful:', data);
        return data;
    } catch (error) {
        // Handle errors during the fetch operation
        console.error('Error during delivery request:', error);
        throw error; // Re-throw the error to propagate it further if needed
    }
}

module.exports = deliver