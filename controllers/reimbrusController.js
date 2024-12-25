import reimbrushmentModel from '../models/reimbrushmentModel.js';
import employeeModel from '../models/employeeModel.js';
import vendorModel from '../models/vendorModel.js';

import multer from 'multer';
import path from 'path';
import axios from 'axios';
import moment from 'moment-timezone';

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/reimbrushDocs");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("reimbrushmentDocument");



    export const createReimbrushment = async (req, res) => {
        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {
                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {
                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }

                const { vendorId, reimbDate, reimbType, notes, amount, type } = req.body;


                // Check if any of the properties is empty or false 
                // if (!vendorId || !reimbDate || !reimbType || !notes || !amount || !type) {
                //     return res.status(400).json({ error: 'One or more fields are empty' });
                // }

                if (!reimbType || !amount ) {
                    return res.status(400).json({ error: 'reimbrushment type and amount is required' });
                }


                // Check if file was provided
                let uploadedFile = '';

                if (!req.file) {

                    uploadedFile = '';

                } else {

                    uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
                   // uploadedFile = "reimbrushDocs/" + req.file.filename;

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

                const newReimb = new reimbrushmentModel({
                    vendorId,
                    reimbDate,
                    reimbType,
                    notes,
                    amount,
                    type,
                    createdBy,
                    createdAt: currentDate,
                    reimbrushmentDocument: uploadedFile,

                });

                await newReimb.save();

                res.status(201).json({ message: 'Reimbrushment created successfully' });

            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating reimbrushment' });
        }


    };



    //For reimbrushment List api
    export const reimbrushmentList = async (req, res) => {

        try {

            const { vendorId } = req.params;


            //getlist admin and emp both
            const employees = await employeeModel.find({ vendorId: vendorId });
            const employeeIds = employees.map(employee => employee._id);

            const reimbrushment = await reimbrushmentModel.find({
                vendorId: { $in: [vendorId, ...employeeIds] }
            });


            if (!reimbrushment || reimbrushment.length === 0) { // Check if reimbrushment array is empty
                return res.status(404).json({ message: 'Reimbrushment not found' });
            }

            res.status(200).json(reimbrushment);

        } catch (error) {
            console.error('Error fetching all reimbrushment:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

    //reimbrushment Edit
    export const  reimbrushmentEdit = async (req, res) => {

        try {

            const { reimbId } = req.params;

            // Find the task by ID
            const reimbrushment = await reimbrushmentModel.findById(reimbId);

            if (!reimbrushment) {
                return res.status(404).json({ message: 'Reimbrushment not found' });
            }

            res.status(200).json(reimbrushment);


        } catch (error) {
            console.error('Error for geting Reimbrushment:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    };


    //reimbrushment Update
    export const reimbrushmentUpdate = async (req, res) => {

        try {

            upload(req, res, async function (err) {

                if (err instanceof multer.MulterError) {

                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {

                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }


                const { reimbDate, reimbType, notes, amount, reimbId } = req.body;


                // if (!reimbDate || !reimbType || !notes || !amount || !reimbId) {
                //     return res.status(400).json({ error: 'One or more fields are empty' });
                // }

                if (!reimbType || !amount ) {
                    return res.status(400).json({ error: 'reimbrushment type and amount is required' });
                }

                const reimbrushment = await reimbrushmentModel.findById(reimbId);

                if (!reimbrushment) {
                    return res.status(400).json({ error: 'Reimbrushment id not found' });
                }

                // Check if file was provided
                let uploadedFile = '';

                if (req.file) {
                    uploadedFile = "reimbrushDocs/" + req.file.filename;

                }

                const myDate = new Date();
                const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
                const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


                reimbrushment.reimbDate = reimbDate || reimbrushment.reimbDate;
                reimbrushment.reimbType = reimbType || reimbrushment.reimbType;
                reimbrushment.notes = notes || reimbrushment.notes;
                reimbrushment.amount = amount || reimbrushment.amount;
                reimbrushment.createdAt = currentDate || reimbrushment.createdAt;
                reimbrushment.reimbrushmentDocument = uploadedFile || reimbrushment.reimbrushmentDocument;

                await reimbrushment.save();
                res.status(200).json({ message: 'Reimbrushment successfully updated' });

            });


        } catch (error) {
            console.error('Error for update the Reimbrushment:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

    // reimbrushment Delete
    export const reimbrushmentDelete = async (req, res) => {

        try {

            const { reimbId } = req.params;

            // Check if the task exists
            const existingReimbrushment = await reimbrushmentModel.findById(reimbId);

            if (!existingReimbrushment) {
                return res.status(404).json({ message: 'Reimbrushment not found' });
            }

            // Perform the deletion
            await reimbrushmentModel.findByIdAndDelete(reimbId);

            // Send a success response
            res.status(200).json({ message: 'Reimbrushment deleted successfully' });
        } catch (error) {
            console.error('Error for Reimbrushment Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

