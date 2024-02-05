const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  courierId: {
    type: String,
    required: true,
  },
  courierLogo: {
    type: String,
    required: true,
  },
  courierName: {
    type: Number,
    required: true,
  },
  courierAddress: {
    type: String,
    required: true,
  },
  courierPhone: {
    type: String,
    required: true,
  },
  courierWebsite: {
    type: Date,
    default: Date.now,
  },
  courierCallBack: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('courier', courierSchema)
