const https = require('https')
//safaricom generate auth-token
function safaricomauth(){

    let auth = new Buffer.from("pCCNeic90GTcWbs0AvIN1YL9BhrrWz6N:KL9Guw9PgUMZsRDD").toString('base64');

    var settings = {
        hostname: 'sandbox.safaricom.co.ke',
        path: 443,
        path: '/oauth/v1/generate?grant_type=client_credentials',
        method: 'GET',
        headers: {
            "Authorization": "Basic " + auth,
        },
    };
    const req = https.request(settings, res => {
        console.log(`statusCode: ${res.statusCode}`)
        
    
        res.on('data', d => {
        process.stdout.write(d)
        let accesstoken = JSON.parse(d).access_token;
        console.log(accesstoken);
        })
    })
    
    req.on('error', error => {
        console.error(error)
    }) 
    req.end()
}

safaricomauth()

/*function safregisterurl(accesstoken){
    var https = require('follow-redirects').https;
    var fs = require('fs');

    var options = {
    'method': 'POST',
    'hostname': 'sandbox.safaricom.co.ke',
    'path': '/mpesa/c2b/v1/registerurl',
    'headers': {
        'Authorization': 'Bearer '+accesstoken,
        'Content-Type': 'application/json',
    },
    'maxRedirects': 20
    };

    var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    });

    res.on("error", function (error) {
        console.error(error);
    });
    });

    var postData = JSON.stringify({
    "ShortCode": "",
    "ResponseType": "",
    "ConfirmationURL": "",
    "ValidationURL": ""
    });

    req.write(postData);

    req.end();
}*/

module.exports = safaricomauth;
//module.exports = safregisterurl;