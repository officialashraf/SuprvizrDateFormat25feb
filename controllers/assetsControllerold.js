const assetsModel = require('../models/assetsModel');
const employeeModel = require('../models/employeeModel');
const vendorModel = require('../models/vendorModel');

const multer = require('multer');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/assetsDocs");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("assetsDocument");

module.exports = {

    insertAsset: async (req, res) => {
        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {
                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {
                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }

                const { vendorId, type, assetName, vendorName, model, mobileNumber, lastServiceDate, nextServiceDate } = req.body;

                if (!mobileNumber || !nextServiceDate ) {
                    return res.status(400).json({ error: 'Mobile and next service date is required!' });
                }


                // Check if file was provided
                let uploadedFile = '';

                if (!req.file) {

                    uploadedFile = '';

                } else {

                    //uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
                    uploadedFile = "assetsDocs/" + req.file.filename;

                }


                // check sendor admin or employee
                let createdBy = '';

                if (type === 'vendor') {

                    const vendorExisting = await vendorModel.findOne({ _id: vendorId });

                    createdBy = vendorExisting.vendorName;

                } else if (type === 'employee') {

                    const vendorExisting = await employeeModel.findOne({ _id: vendorId });
                    createdBy = vendorExisting.fullname;

                }



                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

                const newAssets = new assetsModel({
                    vendorId,
                    assetName,
                    vendorName,
                    model,
                    mobileNumber,
                    type,
                    lastServiceDate,
                    nextServiceDate,
                    createdBy,
                    createdAt: currentDate,
                    assetsDocument: uploadedFile,
                    status: 1,

                });

                await newAssets.save();

                res.status(201).json({ message: 'Asset created successfully' });

            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating reimbrushment' });
        }


    },



    //For listAssetbyVendor List api for vendor
    listAssetbyVendor: async (req, res) => {

        try {

            const { vendorId } = req.params;
            //getlist admin and emp both
            const employees = await employeeModel.find({ vendorId: vendorId });
            const employeeIds = employees.map(employee => employee._id);

            const assetsList = await assetsModel.find({
                vendorId: { $in: [vendorId, ...employeeIds] }
            });


            if (!assetsList || assetsList.length === 0) { // Check if reimbrushment array is empty
                return res.status(404).json({ message: 'Asset not found', list:[] });
            }

            res.status(200).json(assetsList);

        } catch (error) {
            console.error('Error fetching all assets:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    //editAsset Edit
    editAsset: async (req, res) => {

        try {

            const { assetId } = req.params;

            // Find the task by ID
            const assetsGet = await assetsModel.findById(assetId);

            if (!assetsGet) {
                return res.status(404).json({ message: 'Asset not found' });
            }

            res.status(200).json(assetsGet);


        } catch (error) {
            console.error('Error for geting Assets:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    },


    //updateAsset Update
    updateAsset: async (req, res) => {

        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {

                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {

                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }


                const { assetId, type, assetName, vendorName, model, mobileNumber, lastServiceDate, nextServiceDate } = req.body;

                if (!mobileNumber || !nextServiceDate ) {
                    return res.status(400).json({ error: 'Mobile and next service date is required!' });
                }

                const assets = await assetsModel.findById(assetId);

                if (!assets) {
                    return res.status(400).json({ error: 'Asset not found' });
                }

                // Check if file was provided
                let uploadedFile = '';

                if (req.file) {
                    uploadedFile = "assetsDocs/" + req.file.filename;

                }

                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

                assets.assetName = assetName || assets.assetName;
                assets.vendorName = vendorName || assets.vendorName;
                assets.mobileNumber = mobileNumber || assets.mobileNumber;
                assets.model = model || assets.model;
                assets.lastServiceDate = lastServiceDate || assets.lastServiceDate;
                assets.nextServiceDate = nextServiceDate || assets.nextServiceDate;
                assets.createdAt = currentDate || assets.createdAt;
                assets.assetsDocument = uploadedFile || assets.assetsDocument;

                await assets.save();
                res.status(200).json({ message: 'Asset successfully updated' });

            });


        } catch (error) {
            console.error('Error for update the Asset:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    // deleteAsset Delete
    deleteAsset: async (req, res) => {

        try {

            const { assetId } = req.params;

            // Check if the task exists
            const existingAssets = await assetsModel.findById(assetId);

            if (!existingAssets) {
                return res.status(404).json({ message: 'Assets not found' });
            }

            // Perform the deletion
            await assetsModel.findByIdAndDelete(assetId);

            // Send a success response
            res.status(200).json({ message: 'Assets deleted successfully' });
        } catch (error) {
            console.error('Error for Assets Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

};
//module.exports end