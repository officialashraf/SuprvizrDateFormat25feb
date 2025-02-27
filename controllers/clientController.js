import clientModel from '../models/clientModel.js';
import employeeModel from '../models/employeeModel.js';
import vendorModel from '../models/vendorModel.js';

import {isValidEmail,isValidMobile} from '../services/userService.js';

import multer from 'multer';
import path from 'path';
import moment from 'moment-timezone';


// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/clientDoc");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage }).single("clientDocument");



    //For create api using vendor
     export const createClient = async (req, res) => {

        try {

            // Handle file upload using multer middleware
            upload(req, res, async function (err) {

                // upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading.
                    console.error(err);
                    res.status(500).json({ error: "An error occurred during file upload." });
                } else if (err) {
                    // An unknown error occurred when uploading.
                    console.error(err);
                    res.status(500).json({ error: "An unknown error occurred during file upload." });
                }

                const { clientFullName, clientEmail, clientMobile, clientCompany, clientAddress, clientCity, clientState, clientCountry, clientZip, lat, long, vendorId, type } = req.body;

                // if (!clientFullName || !clientEmail || !clientMobile || !clientCompany || !clientAddress || !clientCity || !clientState || !clientCountry || !clientZip || !lat || !long || !vendorId || !type) {
                //     return res.status(400).json({ error: 'One or more fields are empty' });
                // }

                if (!clientFullName || !clientMobile) {
                    return res.status(400).json({ error: 'Client name or mobile number is required!' });
                }
                // Check if file was provided
                const latitude = parseFloat(lat);
                const longitude = parseFloat(long);
            
                if (isNaN(latitude) || isNaN(longitude)) {
                    return res.status(400).json({ error: 'Latitude and Longitude must be valid numbers' });
                }

                let uploadedFile = '';

                if (!req.file) {

                    uploadedFile = '';

                } else {

                    //uploadedFile = process.env.BASE_URL + "/" + req.file.path.replace(/\\/g, "/");
                    uploadedFile = "clientDoc/" + req.file.filename;

                }

                const existingEmail = await clientModel.findOne({ clientEmail });
                const existingMobile = await clientModel.findOne({ clientMobile });

                let createdBy = '';
                let createdByImg = '';
                if (type == 'vendor') {

                    const existingvendor = await vendorModel.findOne({ _id: vendorId });
                    console.log("existingVendor", existingvendor)
                    createdBy = existingvendor.vendorName;
                    createdByImg = existingvendor.empImg;
                } else if (type == 'employee') {
                     
                    const existingEmp = await employeeModel.findOne({ _id: vendorId });
                    console.log(existingEmp)
                   createdBy = existingEmp.fullname;
                   createdByImg = existingEmp.empImg;
                //    createdBy = "ashraf" 
                //    //**It is not acces existingEmp.fullnam or emImp
                    

                }

                if (clientEmail && !await isValidEmail(clientEmail)) {
                    return res.status(400).json({ message: 'Invalid email address' });
                }
                if (!await isValidMobile(clientMobile)) {
                    return res.status(400).json({ message: 'Invalid mobile number' });
                }

                if (clientEmail && existingEmail) {
                    return res.status(400).json({ message: 'Email already exists' });
                }

                if (existingMobile) {
                    return res.status(400).json({ message: 'Mobile already exists' });
                }


                const myDate = new Date();
                const currentDateIST = myDate.getTime();
                const currentDate = currentDateIST;


                const newClient = new clientModel({
                    clientFullName,
                    clientEmail,
                    clientMobile,
                    clientCompany,
                    clientAddress,
                    clientCity,
                    clientState,
                    clientCountry,
                    clientZip,
                    vendorId,
                    createdBy,
                    createdByImg,
                    type,
                    clientLocation: {
                        type: 'Point',
                        coordinates: [latitude, longitude],
                    },
                    created: currentDate,
                    clientDocument: uploadedFile,

                });

                await newClient.save();

                res.status(201).json({ message: 'Client created successfully' ,clientId: newClient._id});

            }); //multer

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error in creating Client' });
        }


    };



    //For clientList api for admin
    // clientList = async (req, res) => {

    //     try {

    //         const { vendorId } = req.params;

    //         // Fetching employees with the given vendorId
    //         const employees = await employeeModel.find({ vendorId: vendorId });
    //         const employeeIds = employees.map(employee => employee._id);

    //         // const clientList = await clientModel.find({
    //         //     vendorId: { $in: [vendorId, ...employeeIds] }
    //         // });

    //         const clientList = await clientModel.find({
    //             vendorId: { $in: [vendorId, ...employeeIds] }
    //         }).sort({ created: -1 });


    //         // Check if clientList array is empty
    //         if (!clientList || clientList.length === 0) {
    //             return res.status(404).json({ message: 'clientList not found' });
    //         }

    //         res.status(200).json(clientList);

    //     } catch (error) {
    //         console.error('Error fetching client:', error);
    //         res.status(500).json({ message: 'Internal Server Error', error });
    //     }

    // },

    // export const  clientList = async (req, res) => {
    //     try {
    //         const { vendorId } = req.params;
    
    //         // Fetch employees with the specified vendorId
    //         const employees = await employeeModel.find({ vendorId });
    //         const employeeIds = employees.map(employee => employee._id);
    
    //         // Find clients linked to vendorId or any of the employeeIds, sorted by creation date
    //         const clientList = await clientModel.find({
    //             vendorId: { $in: [vendorId, ...employeeIds] }
    //         })
    //         //.sort({ created: -1 });
    
    //         // If clientList is empty, return 404
    //         if (clientList.length === 0) {
    //             return res.status(404).json({ message: 'No clients found' });
    //         }
    
    //         res.status(200).json(clientList);
    //     } catch (error) {
    //         console.error('Error fetching clients:', error);
    //         res.status(500).json({ message: 'Internal Server Error', error });
    //     }
    // };

    export const clientList = async (req, res) => {
        try {
            const { userId, userType } = req.params; // userType will tell us if the requester is a vendor or employee.
    
            // Check if the user is a vendor or employee
            if (userType === 'vendor') {
                // Fetch employees linked to this vendor
                const employees = await employeeModel.find({ vendorId: userId });
                //const employeeIds = employees.map(employee => employee._id);
    
                // Fetch clients for the vendor or its employees
                const clientList = await clientModel.find({
                    $or: [
                        { vendorId: userId }
                    ]
                });
    
                // Return client list or 404 if empty
                if (clientList.length === 0) {
                    return res.status(404).json({ message: 'No clients found for the vendor.' });
                }
    
                return res.status(200).json(clientList);
            } else if (userType === 'employee') {
                // Fetch clients for the specific employee
                const clientList = await clientModel.find({ vendorId: userId });
    
                // Return client list or 404 if empty
                if (clientList.length === 0) {
                    return res.status(404).json({ message: 'No clients found for the employee.' });
                }
    
                return res.status(200).json(clientList);
            } else {
                // Invalid userType
                return res.status(400).json({ message: 'Invalid userType. Must be "vendor" or "employee".' });
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    };
    

    //For clientDetails
    export const  clientDetails = async (req, res) => {

        try {

            const { clientId } = req.params;


            const clientDetails = await clientModel.findById(clientId);

            if (!clientDetails) {
                return res.status(404).json({ message: 'Client not found' });
            }

            res.status(200).json(clientDetails);

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };


//     //For updateClient update
//     export const updateClients = async (req, res) => {

//         try {

//             // Handle file upload using multer middleware
//             upload(req, res, async function (err) {

//                 // upload(req, res, async (err) => {
//                 if (err instanceof multer.MulterError) {
//                     // A Multer error occurred when uploading.
//                     console.error(err);
//                     res.status(500).json({ error: "An error occurred during file upload." });
//                 } else if (err) {
//                     // An unknown error occurred when uploading.
//                     console.error(err);
//                     res.status(500).json({ error: "An unknown error occurred during file upload." });
//                 }


//                 const { clientId, clientFullName, clientEmail, clientMobile, clientCompany, clientAddress, clientCity, clientState, clientCountry, clientZip, lat, long, vendorId, type } = req.body;

//                 if (!clientFullName || !clientMobile) {
//                     return res.status(400).json({ error: 'Client name or mobile number is required!' });
//                 }

//                 // Check if file was provided

//                 let uploadedFile = '';

//                 if (req.file) {

//                     uploadedFile = "clientDoc/" + req.file.filename;

//                 }



//                 const Client = await clientModel.findById(clientId);
// console.log('Client', Client)
//                 if (clientEmail && !await isValidEmail(clientEmail)) {
//                     return res.status(400).json({ message: 'Invalid email address' });
//                 }
//                 if (!await isValidMobile(clientMobile)) {
//                     return res.status(400).json({ message: 'Invalid mobile number' });
//                 }

// console.log("client",clientMobile)
//                 //already check mobile for client
//                 if (clientMobile !== Client.clientMobile) {

//                     const existingMobile = await clientModel.findOne({ clientMobile });


//                     if (existingMobile && existingMobile._id.toString() !== clientId) {
//                         return res.status(400).json({ message: 'Mobile number already exists for another client' });
//                     }
//                 }


//                 //already check email for client
//                 if (clientEmail !== Client.clientEmail) {

//                     const existingEmail = await clientModel.findOne({ clientEmail });


//                     if (clientEmail && existingEmail && existingEmail._id.toString() !== clientId) {
//                         return res.status(400).json({ message: 'Email Id already exists for another client' });
//                     }
//                 }


//                 let createdBy = '';
//                 let createdByImg = '';
//                 console.log("id", vendorId)
//                 if (type == 'vendor') {

//                     const existingvendor = await vendorModel.findOne({ _id: vendorId });
//                     console.log("existingvendor",existingvendor); 
//                     createdBy = existingvendor.vendorName;
//                     createdByImg = existingvendor.empImg;
                    
//                 } else if (type == 'employee') {

//                     const existingemployee = await employeeModel.findOne({ _id: vendorId });
//                     console.log("existingemployee",existingemployee);
//                     createdBy = existingemployee.fullname;
//                     createdByImg = existingemployee.empImg;
//                     //createdBy = "ashraf" **it is not accesible by this

//                 }

//                 const myDate = new Date();
//                 const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
//                 const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

//                 // Update profile fields
//                 Client.clientFullName = clientFullName || Client.clientFullName;
//                 Client.clientEmail = clientEmail || Client.clientEmail;
//                 Client.clientMobile = clientMobile || Client.clientMobile;
//                 Client.clientCompany = clientCompany || Client.clientCompany;
//                 Client.clientAddress = clientAddress || Client.clientAddress;

//                 Client.clientCity = clientCity || Client.clientCity;
//                 Client.clientState = clientState || Client.clientState;
//                 Client.clientCountry = clientCountry || Client.clientCountry;
//                 Client.clientZip = clientZip || Client.clientZip;

//                 Client.clientLocation.coordinates[0] = lat || Client.clientLocation.coordinates[0];
//                 Client.clientLocation.coordinates[1] = long || Client.clientLocation.coordinates[1];

//                 Client.clientDocument = uploadedFile || Client.clientDocument;
//                 Client.vendorId = vendorId || Client.vendorId;
//                 Client.type = type || Client.type;
//                 Client.createdBy = createdBy || Client.createdBy;
//                 Client.createdByImg = createdByImg || Client.createdByImg;

//                 await Client.save();

//                 res.status(200).json({ message: 'Client updated successfully' });
//             }); //multer
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Internal Server Error' });
//         }

//     };



export  const updateClients = async (req, res) => {
    try {
        // Handle file upload using multer middleware
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error(err);
                return res.status(500).json({ error: "An error occurred during file upload." });
            } else if (err) {
                console.error(err);
                return res.status(500).json({ error: "An unknown error occurred during file upload." });
            }

            const { clientId, clientFullName, clientEmail, clientMobile, clientCompany, clientAddress, clientCity, clientState, clientCountry, clientZip, lat, long, vendorId, type } = req.body;
console.log(req.body)
            if (!clientFullName || !clientMobile) {
                return res.status(400).json({ error: 'Client name or mobile number is required!' });
            }

            // Check if file was provided
            let uploadedFile = '';
            if (req.file) {
                uploadedFile = "clientDoc/" + req.file.filename;
            }
               
            const Client = await clientModel.findById(clientId);
            if (!Client) {
                return res.status(404).json({ error: 'Client not found' });
            }

            if (clientEmail && !await isValidEmail(clientEmail)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!await isValidMobile(clientMobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }

            // Check existing mobile for client
            if (clientMobile !== Client.clientMobile) {
                const existingMobile = await clientModel.findOne({ clientMobile });
                if (existingMobile && existingMobile._id.toString() !== clientId) {
                    return res.status(400).json({ message: 'Mobile number already exists for another client' });
                }
            }

            // Check existing email for client
            if (clientEmail !== Client.clientEmail) {
                const existingEmail = await clientModel.findOne({ clientEmail });
                if (clientEmail && existingEmail && existingEmail._id.toString() !== clientId) {
                    return res.status(400).json({ message: 'Email Id already exists for another client' });
                }
            }

            let createdBy = '';
            let createdByImg = '';

            if (type == 'vendor') {
                const existingvendor = await vendorModel.findOne({ _id: vendorId });
                if (!existingvendor) {
                    return res.status(404).json({ message: 'Vendor not found' });
                }
                createdBy = existingvendor.vendorName;
                createdByImg = existingvendor.empImg;
            } else if (type == 'employee') {
                const existingemployee = await employeeModel.findOne({ _id: vendorId });
                console.log("employee",existingemployee, vendorId)
                if (!existingemployee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }
                createdBy = existingemployee.fullname;
                createdByImg = existingemployee.empImg;
            }

            const myDate = new Date();
            const currentDateIST = myDate.getTime();
            const currentDate = currentDateIST;

            // Update profile fields
            Client.clientFullName = clientFullName || Client.clientFullName;
            Client.clientEmail = clientEmail || Client.clientEmail;
            Client.clientMobile = clientMobile || Client.clientMobile;
            Client.clientCompany = clientCompany || Client.clientCompany;
            Client.clientAddress = clientAddress || Client.clientAddress;
            Client.clientCity = clientCity || Client.clientCity;
            Client.clientState = clientState || Client.clientState;
            Client.clientCountry = clientCountry || Client.clientCountry;
            Client.clientZip = clientZip || Client.clientZip;
            Client.clientLocation.coordinates[0] = lat || Client.clientLocation.coordinates[0];
            Client.clientLocation.coordinates[1] = long || Client.clientLocation.coordinates[1];
            Client.clientDocument = uploadedFile || Client.clientDocument;
            Client.vendorId = vendorId || Client.vendorId;
            Client.type = type || Client.type;
            Client.createdBy = createdBy || Client.createdBy;
            Client.createdByImg = createdByImg || Client.createdByImg;
            Client.updatedAt = currentDate || Client.updatedAt;// Save UTC date


            await Client.save();

            res.status(200).json({ message: 'Client updated successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



    //Client delete
    export const  clientDelete = async (req, res) => {

        try {

            const { clientId } = req.params;

            // Check if the task exists
            const existingClient = await clientModel.findById(clientId);

            if (!existingClient) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // Perform the deletion
            await clientModel.findByIdAndDelete(clientId);

            // Send a success response
            res.status(200).json({ message: 'Client deleted successfully' });
        } catch (error) {
            console.error('Error for Client Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

