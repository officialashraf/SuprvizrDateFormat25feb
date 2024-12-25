import mongoose from "mongoose";

// Define the user schema
const gpsSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  gpsDate: {
    type: String,
    required: true,
  },

  gpsLat: {
    type: String,
    required: true,
  },

  gpsLong: {
    type: String,
    required: true,
  },

  gpsAddress: {
    type: String,
    default: '',
  },

  createdAt: {
    type: String,
    default: '',
    index: true, // Index added for createdAt field
  },

  status: {
    type: String,
    enum: ['ON', 'OFF'],
    default: 'ON',
  },
}, { versionKey: false });

// Index added for userId field
gpsSchema.index({ userId: 1 });


// Create the User model
const Gps = mongoose.model('Gps', gpsSchema);

export default Gps;
