const mongoose = require('mongoose');

// Record Schema 
const recordSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
  },
  direction: String,
  setSpeed: mongoose.Types.Decimal128,
  voltage: mongoose.Types.Decimal128,
  current: mongoose.Types.Decimal128,
  speed: mongoose.Types.Decimal128,
});

const decimal2JSON = (v, i, prev) => {
  if (v !== null && typeof v === 'object') {
    if (v.constructor.name === 'Decimal128')
      prev[i] = v.toString();
    else
      Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
  }
};

recordSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    decimal2JSON(returnedObject);
  }
})

module.exports = mongoose.model('Record', recordSchema)