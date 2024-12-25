import mongoose from "mongoose";

// Define the user schema
const assetsSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        default: '',

    },

    userId: {
        type: String,
        default: '',

    },

    assetName: {
        type: String,
        default: '',

    },

    vendorName: {
        type: String,
        default: '',

    },

    model: {
        type: String,
        default: '',
    },

    mobileNumber: {
        type: String,
        default: '',
    },

    lastServiceDate: {
        type: String,
        default: '',
    },

    nextServiceDate: {
        type: String,
        default: '',
    },


    assetsDocument: {
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

// Create the asset model
const asset = mongoose.model('asset', assetsSchema);

export default asset;
