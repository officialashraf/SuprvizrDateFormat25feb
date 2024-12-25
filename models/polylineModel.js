
import mongoose from "mongoose";

// Define the user schema
const polylineSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,

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
    createdAt: {
        type: Date,
        required: true,
    },


}, { versionKey: false });

// Create the polyline model
const polyline = mongoose.model('polyline', polylineSchema);

export default polyline;
