import mongoose from "mongoose";

// Define the licenceSchema
const licenseSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        required: true,
    },

    userId: {
        type: String,
        default: '',
      },

    licenseName: {
        type: String,
        default: '',

    },

    licenseNumber: {
        type: String,
        default: '',

    },

    contactPerson: {
        type: String,
        default: '',
    },

    mobileNumber: {
        type: String,
        default: '',
    },

    licenseIssueDate: {
        type: String,
        default: '',
    },

    licenseExpireDate: {
        type: String,
        default: '',
    },

    licenseDocument: {
        type: String,
        default: '',
    },
    licenseImage: {
        type: String,
        default: '',
    },

    createdBy: {
        type: String,
        default: '',

    },


    createdAt: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: '',

    },

    status: {
        type: String,
        enum: ['1', '0'],
        default: '0',
    },
}, { versionKey: false });

// Create the license model
const license = mongoose.model('license', licenseSchema);

 export default license;
