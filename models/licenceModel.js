import mongoose from "mongoose";

// Define the licenceSchema
const licenceSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        required: true,

    },

    userId: {
        type: String,
        default: '',
      },

    licenceName: {
        type: String,
        required: true,

    },

    licenceNumber: {
        type: String,
        required: true,

    },

    contactPerson: {
        type: String,
        required: true,
    },

    mobileNumber: {
        type: String,
        required: true,
    },

    licenceIssueDate: {
        type: String,
        required: true,
    },

    licenceExpireDate: {
        type: String,
        required: true,
    },

    licenceDocument: {
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

// Create the Licence model
const Licence = mongoose.model('licence', licenceSchema);

export default Licence;
