import mongoose from "mongoose";

// Define the user schema
const attendanceSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  attnedanceDate: {
    type:Number,
    required: true,
  },

  attnedanceLat: {
    type: String,
    required: true,
  },

  attnedanceLong: {
    type: String,
    required: true,
  },

  attnedanceAddress: {
    type: String,
    default: '',
  },

  createdAt: {
    type: Number,
    default: '',
    index: true, // Index added for createdAt field
  },

  status: {
    type: String,
    enum: ['IN', 'OUT'],
    default: 'IN',
  },
}, { versionKey: false });

// Index added for userId field
attendanceSchema.index({ userId: 1 });


// Create the User model
const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
