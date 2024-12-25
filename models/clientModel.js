import mongoose from "mongoose";

// Define the user schema
const clientSchema = new mongoose.Schema({

    vendorId: {
        type: String,

    },

    clientFullName: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        default: '',
    },
    clientMobile: {
        type: String,
        required: true,
    },

    clientCompany: {
        type: String,
        default: '',
    },

    clientAddress: {
        type: String,
        default: '',
    },

    clientCity: {
        type: String,
        default: '',
    },

    clientState: {
        type: String,
        default: '',
    },

    clientCountry: {
        type: String,
        default: '',
    },


    clientZip: {
        type: String,
        default: '',
    },

    clientDocument: {
        type: String,
        default: '',
    },

    createdBy: {
        type: String,
        default: '',
    },

    createdByImg: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: '',

    },

    created: {
        type: String,
        default: '',
    },

    clientLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { versionKey: false });

// Create the User model
const client = mongoose.model('client', clientSchema);

 export default client;
