import mongoose from "mongoose";

// Define the reimbrushSchema
const reimbrushSchema = new mongoose.Schema({

    vendorId: {
        type: String,
        default: '',
    },

    userId: {
        type: String,
        default: '',
      },

    reimbDate: {
        type: String,
        default: '',

    },

    reimbType: {
        type: String,
        default: '',
    },

    notes: {
        type: String,
        default: '',
    },

    amount: {
        type: String,
        default: '',
    },


    reimbrushmentDocument: {
        type: String,
        default: '',
    },

    createdAt: {
        type: String,
        default: '',
    },
    
    updatedAt: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: '',

    },

    createdBy: {
        type: String,
        default: '',

    },

    status: {
        type: String,
        enum: ['0', '1', '2'],
        default: '0',
        //0 = pending, 1 = approved, 2  = reject
    },
}, { versionKey: false });

// Create the reimbrushment model
const reimbrushment = mongoose.model('reimbrushment', reimbrushSchema);

export default reimbrushment;

