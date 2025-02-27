import mongoose from "mongoose";

// Define the user schema
const trackSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,

    },
    
    taskId: {
        type: String,
        // required: true,
        default:0,

    },
    attendceId: {
        type: String,
        // required: true,
        default:0,

    },

    internetId: {
        type: String,
        default:0,
        // required: true,
    },
    gpsId: {
        type: String,
        default:0,
        // required: true,
    },
    loginId: {
        type: String,
        default:0,
        // required: true,
    },
    logoutId: {
        type: String,
        default:0,
        // required: true,
    },
    userType: {
        type: String,
        required: true,

    },

    lat: {
        type: String,
        required: true,

    },


    long: {
        type: String,
        required: true,

    },

    status: {
        type: String,
        required: true,

    },

    createdAt: {
        type: Number,
       required:true,
    },


}, { versionKey: false });

// Create the asset model
const track = mongoose.model('track', trackSchema);

export default track;
