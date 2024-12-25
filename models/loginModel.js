import mongoose from "mongoose";

// Define the login schema
const loginSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  loginDate: {
    type: String,
    required: true,
  },

  loginLat: {
    type: String,
    required: true,
  },

  loginLong: {
    type: String,
    required: true,
  },

  loginAddress: {
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
    enum: ['Login'],
    default: 'Login',
  },
}, { versionKey: false });

// Index added for userId field
loginSchema.index({ userId: 1 });


// Create the User model
const Login = mongoose.model('login', loginSchema);

export default Login;
