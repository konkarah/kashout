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