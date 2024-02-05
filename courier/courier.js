function deliver(pickupLocation, deliveryLocation, timeToDeliver, uniqueIdentifier, classOfTransaction, url) {
    // Construct the payload
    const payload = {
        pickupLocation: pickupLocation,
        deliveryLocation: deliveryLocation,
        timeToDeliver: timeToDeliver,
        uniqueIdentifier: uniqueIdentifier,
        classOfTransaction: classOfTransaction
    };

    // Make a POST request using fetch
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data as needed
        console.log('Delivery request successful:', data);
    })
    .catch(error => {
        // Handle errors during the fetch operation
        console.error('Error during delivery request:', error);
    });
}

