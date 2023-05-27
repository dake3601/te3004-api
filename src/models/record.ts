import mongoose from 'mongoose';

interface IRecord {
  timestamp: Date,
  direction: string,
  setSpeed: mongoose.Types.Decimal128,
  voltage: mongoose.Types.Decimal128,
  current: mongoose.Types.Decimal128,
  speed: mongoose.Types.Decimal128
}

// Record Schema
const recordSchema = new mongoose.Schema<IRecord>({
  timestamp: {
    type: Date,
    required: true
  },
  direction: String,
  setSpeed: mongoose.Types.Decimal128,
  voltage: mongoose.Types.Decimal128,
  current: mongoose.Types.Decimal128,
  speed: mongoose.Types.Decimal128
});


// Convert Decimal128 to JSON
const decimal2JSON = (obj: {
  setSpeed: string,
  voltage: string,
  current: string,
  speed: string
}) => {
  obj.setSpeed = obj.setSpeed.toString();
  obj.voltage = obj.voltage.toString();
  obj.current = obj.current.toString();
  obj.speed = obj.speed.toString();
};


recordSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    decimal2JSON(returnedObject);
  }
});

const Record = mongoose.model<IRecord>('Record', recordSchema);

export default Record;
