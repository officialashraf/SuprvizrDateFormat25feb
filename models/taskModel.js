import mongoose from "mongoose";

// Define the user schema
const taskSchema = new mongoose.Schema({

  vendorId: {
    type: String,
    default: '',

  },

  userId: {
    type: String,
    default: '',
  },
  clientId: {
    type: String,
    default: '',
  },

  clientName: {
    type: String,
    default: '',
  },

  clientEmail: {
    type: String,
    default: '',
  },


  clientMobile: {
    type: String,
  },

  empName: {
    type: String,

  },


  taskName: {
    type: String,
    required: true,
  },

  taskDate: {
    type: Number
  },

  taskEndDate: {
    type: Number
  },

  address: {
    type: String,
    default: '',
  },

  created: {
    type: Number,
    required: true,
  },

  createdBy: {
    type: String,
    default: '',
  },

  type: {
    type: String,
    default: '',

  },

  taskDocument: {
    type: String,
    default: '',
  },
  taskImage: {
    type: String,
    default: '',
  },

  documentNotes: {
    type: String,
    default: '',
  },


  taskNotes: {
    type: String,
    default: '',
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: '0',
    },
    coordinates: {
      type: [Number],
      default: '0',
    },
  },

  taskAddress: {
    type: String,
    default: '',
  },

  status: {
    type: String,
    enum: ['1', '0'],
    default: '0',
  },
}, { versionKey: false });

// Create the User model
const Task = mongoose.model('Task', taskSchema);

export default  Task;
