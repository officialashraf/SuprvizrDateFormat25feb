import mongoose from "mongoose";

// Define the logout schema
const logoutSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  logoutDate: {
    type: String,
    required: true,
  },

  logoutLat: {
    type: String,
    required: true,
  },

  logoutLong: {
    type: String,
    required: true,
  },

  logoutAddress: {
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
    enum: ['Logout'],
    default: 'Logout',
  },
}, { versionKey: false });

// Index added for userId field
logoutSchema.index({ userId: 1 });


// Create the User model
const Logout = mongoose.model('logout', logoutSchema);

export default Logout;
