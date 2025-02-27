import mongoose from "mongoose";

// Define the user schema
const vendorSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        default: '',
    },
    vendorEmail: {
        type: String,
        default: '',
    },
    vendorMobile: {
        type: String,
        required: true,
    },
    role: { 
        type: String,
         default: 'vendor'
     },
    vendorCompany: {
        type: String,
        default: '',
    },

    vandorLat: {
        type: String,
        default: '',
    },

    vandorLong: {
        type: String,
        default: '',
    },

    vandorOtp: {
        type: String,
        default: '',
    },

    vandorCreated: {
        type:Number,
       required:true,
    },

    agoDate: {
        type: Number
    },

    attendanceStatus: {
        type: String,
        default: '',
    },

    internetStatus: {
        type: String,
        default: '',
    },
    batteryStatus: {
        type: String,
        default: '',
    },
    loginStatus: {
        type: String,
        default: '',// Login, Logout
    },
    gpsStatus: {
        type: String,
        default: '',
    },

    empImg: {
        type: String,
        default: '',
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    subStartDate: {
        type: Number,
       required:true
      },
    subEndDate: {
        type: Number,
       required:true
    },
    subscriptions: [
        {
          startDate: {
            type:Number,
            required: true,
          },
          endDate: {
            type: Number,
            required: true,
          },
        },
    ],
    
}, { versionKey: false });

// Create the User model
const vendor = mongoose.model('vendor', vendorSchema);

export default vendor;
