const mongoose = require('mongoose');

const trxSchema = new mongoose.Schema({
  cltphone: {
    type: String,
    required: true,
  },
  recphone: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  timeout: {
    type: Date,
    default: Date.now,
  },
  courierId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('trx', trxSchema)
