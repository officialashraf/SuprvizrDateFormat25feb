const licenceModel = require('../models/licenceModel');
const employeeModel = require('../models/employeeModel');
const vendorModel = require('../models/vendorModel');

const multer = require('multer');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/licenseDocs");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("licenceDocument");

module.exports = {

    insertLicense: async (req, res) => {
        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {
                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {
                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }

                const { vendorId, licenceName, type, licenceNumber, contactPerson, licenceIssueDate, mobileNumber, licenceExpireDate } = req.body;

                if (!mobileNumber || !licenceExpireDate ) {
                    return res.status(400).json({ error: 'Mobile and license expire date is required!' });
                }


                // Check if file was provided
                let uploadedFile = '';

                if (!req.file) {

                    uploadedFile = '';

                } else {

                    //uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
                    uploadedFile = "licenseDocs/" + req.file.filename;

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

                const newLicense = new licenceModel({
                    vendorId,
                    licenceName,
                    licenceNumber,
                    contactPerson,
                    mobileNumber,
                    type,
                    licenceIssueDate,
                    licenceExpireDate,
                    createdBy,
                    createdAt: currentDate,
                    licenceDocument: uploadedFile,
                    status: 1,

                });

                await newLicense.save();

                res.status(201).json({ message: 'License created successfully' });

            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating license' });
        }


    },



    //For listLicensebyVendor List api for vendor
    listLicensebyVendor: async (req, res) => {

        try {

            const { vendorId } = req.params;
            //getlist admin and emp both
            const employees = await employeeModel.find({ vendorId: vendorId });
            const employeeIds = employees.map(employee => employee._id);

            const licenceList = await licenceModel.find({
                vendorId: { $in: [vendorId, ...employeeIds] }
            });


            if (!licenceList || licenceList.length === 0) { 
                return res.status(404).json({ message: 'License not found', list:[] });
            }

            res.status(200).json(licenceList);

        } catch (error) {
            console.error('Error fetching in license:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    //editLicense Edit
    editLicense: async (req, res) => {

        try {

            const { licenseId } = req.params;

            // Find the task by ID
            const licenceGet = await licenceModel.findById(licenseId);

            if (!licenceGet) {
                return res.status(404).json({ message: 'License not found' });
            }

            res.status(200).json(licenceGet);


        } catch (error) {
            console.error('Error for geting License:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    },


    //updateLicense Update
    updateLicense: async (req, res) => {

        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {

                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {

                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }

                const { licenseId, licenceName, licenceNumber, contactPerson, licenceIssueDate, mobileNumber, licenceExpireDate } = req.body;

                if (!mobileNumber || !licenceExpireDate ) {
                    return res.status(400).json({ error: 'Mobile and expire date is required!' });
                }

                const licenses = await licenceModel.findById(licenseId);

                if (!licenses) {
                    return res.status(400).json({ error: 'License not found', list: [] });
                }

                // Check if file was provided
                let uploadedFile = '';

                if (req.file) {
                    uploadedFile = "licenseDocs/" + req.file.filename;

                }

                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

                licenses.licenceName = licenceName || licenses.licenceName;
                licenses.licenceNumber = licenceNumber || licenses.licenceNumber;
                licenses.mobileNumber = mobileNumber || licenses.mobileNumber;
                licenses.contactPerson = contactPerson || licenses.contactPerson;
                licenses.licenceIssueDate = licenceIssueDate || licenses.licenceIssueDate;
                licenses.licenceExpireDate = licenceExpireDate || licenses.licenceExpireDate;
                licenses.createdAt = currentDate || licenses.createdAt;
                licenses.licenceDocument = uploadedFile || licenses.licenceDocument;

                await licenses.save();
                res.status(200).json({ message: 'License successfully updated' });

            });


        } catch (error) {
            console.error('Error for update the License:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

    // deleteLicense Delete
    deleteLicense: async (req, res) => {

        try {

            const { licenseId } = req.params;

            // Check if exists
            const existingLicense = await licenceModel.findById(licenseId);

            if (!existingLicense) {
                return res.status(404).json({ message: 'License not found' });
            }

            // Perform the deletion
            await licenceModel.findByIdAndDelete(licenseId);

            // Send a success response
            res.status(200).json({ message: 'License deleted successfully' });
        } catch (error) {
            console.error('Error for License Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    },

};
//module.exports end