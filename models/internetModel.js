import mongoose from "mongoose";

// Define the user schema
const internetSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  internetDate: {
    type: String,
    required: true,
  },

  internetLat: {
    type: String,
    required: true,
  },

  internetLong: {
    type: String,
    required: true,
  },

  internetAddress: {
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
internetSchema.index({ userId: 1 });


// Create the User model
const Internet = mongoose.model('Internet', internetSchema);

export default Internet;
