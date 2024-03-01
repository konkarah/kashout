const mongoose = require('mongoose')

const completed = new mongoose.Schema({
    mpesaTrx: {
        type: String,
    },
    originatorID: {
        type: String,
        required: true
    },
    amount: {
        type: String
    },
    recipient: {
        type: String
    }
})

module.exports = mongoose.model('completed', completed)