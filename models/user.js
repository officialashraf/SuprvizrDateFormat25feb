import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({

  fullname: {
    type: String,

  },

  mobile: {
    type: String,
    required: true,

  },


  otp: {
    type: String,
    default: 'null',
  },

  latitude: {
    type: String,
    default: '',
  },

  longitude: {
    type: String,
    default: '',
  },

  status: {
    type: String,
    enum: ['1', '0'], // Assuming status can be 'active : 1' or 'inactive : 0'
    default: '0', // Default status is 'active : 1'
  },
}, { versionKey: false });

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;
