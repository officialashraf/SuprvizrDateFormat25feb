import mongoose from 'mongoose';

// Define the admin schema
const adminSchema = new mongoose.Schema({

  username: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  }, 
  role:{
    type: String,
    default:'admin'
  }

}, { versionKey: false });

// Create the Admin model
 const adminModel = mongoose.model('Admin', adminSchema);
 export default adminModel

