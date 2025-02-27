import mongoose from "mongoose";

// Define the user schema
const empSchema = new mongoose.Schema({


    vendorId: {
        type: String,
    },

    fullname: {
        type: String,
    },


    mobile: {
        type: String,
        required: true,
    },


    companyName: {
        type: String,
    },


    userType: {
        type: String,
        required: true,

    },

    machineNumber: {
        type: String,
        default: '',

    },

    workLocation: {
        type: String,
        default: '',

    },

    agoDate: {
        type: Number,
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

    empImg: {
        type: String,
        default: '',
    },
    role: { 
        type: String,
         default: 'employee'
     },

    status: {
        type: String,
        enum: ['1', '0'], // Assuming status can be 'active : 1' or 'inactive : 0'
        default: '1', // Default status is 'active : 1'
    },
}, { versionKey: false });

// Create the User model
const Employee = mongoose.model('Employee', empSchema);
export default Employee;
