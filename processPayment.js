const unirest = require('unirest');

function performPaymentRequest() {
  return new Promise((resolve, reject) => {
    unirest.post('https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest')
      .headers({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer JKThGOWODxitm0STphAf7BXH7YQI',
      })
      .send({
        "OriginatorConversationID": "ca18bd8f-cab2-4da3-91d6-8a6e26c34dc6",
        "InitiatorName": "testapi",
        "SecurityCredential": "jT3Uq3kWJiHJxNMn9DeJvcH3I81EeE15zv8ZxsxwjrPvq+PnQDxM9LziZy4pID45Fo5LrZWsUtut8yfpiIcNYXY2wRMiSPNdlixRq5/oDoUJoQlNiaxvs6opV3GH0C7mxNwnKA2G0yqWtOLrT7AaIIXM1VjcrM4EaN1Ebtl8VJWrbWEs3dpRf7VBlOz8tU8q171/m7vuMm2CZivaL97DnpAQgNDL6fPZa1lRe2dbfMdUlb5zH+VWPmmLKTvEZoG4vHjAkwprN0O4ndXpOuCZ6ptWCXwTnpqlmHeQYNv25oZtUyTR/h52LM1MPNm/58AK6crrivpJQ4vgQwzWyqn3+Q==",
        "CommandID": "BusinessPayment",
        "Amount": 10,
        "PartyA": 600990,
        "PartyB": 254717616430,
        "Remarks": "Test remarks",
        "QueueTimeOutURL": "https://e071-196-22-131-250.ngrok-free.app",
        "ResultURL": "https://e071-196-22-131-250.ngrok-free.app",
        "Occasion": "",
      })
      .end(response => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.raw_body);
        }
      });
  });
}

module.exports = performPaymentRequest;
