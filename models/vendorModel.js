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
         default: 'employee'
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
        type: String,
        default: '',
    },

    agoDate: {
        type: String,
        default: '',
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
        type: Date,
        default: '',
      },
    subEndDate: {
        type: Date,
        default: '',
    },
    subscriptions: [
        {
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
        },
    ],
    
}, { versionKey: false });

// Create the User model
const vendor = mongoose.model('vendor', vendorSchema);

export default vendor;