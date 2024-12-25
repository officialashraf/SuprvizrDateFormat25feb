import  reimbrushmentModel  from '../models/reimbrushmentModel.js';
import  employeeModel  from '../models/employeeModel.js';
import  vendorModel  from '../models/vendorModel.js';
import  {broadcastLocationUpdate}  from '../socket.js'

import  multer  from 'multer';
import  path  from 'path';
import  axios  from 'axios';
import  moment  from 'moment-timezone';
import  fs  from 'fs';





  export const  createReimbrushment = async (req, res) => {
        try {
    
          let uploadedFile = '';

          if (req.files['reimbursementDoc'] && req.files['reimbursementDoc'].length > 0) {
            const taskDocumentFile = req.files['reimbursementDoc'][0]; // Assuming maxCount is 1
            uploadedFile = "reimbursementDoc/"+taskDocumentFile.filename;
          }

          const { vendorId, reimbDate, reimbType, notes, amount, type } = req.body;


        //   if (!reimbType || !amount ) {
        //       return res.status(400).json({ error: 'reimbrushment type and amount is required' });
        //   }

          // check sendor admin or employee
          let createdBy = '';

          if (type === 'vendor') {
            const vendorExisting = await vendorModel.findOne({ _id: vendorId });
            createdBy = vendorExisting ? vendorExisting.vendorName : '';
        } else if (type === 'employee') {
            const employeeExisting = await employeeModel.findOne({ _id: vendorId });
            createdBy = employeeExisting ? employeeExisting.fullname : '';
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
          res.status(201).json({ message: 'Reimbursement created successfully' });
    
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Reimbursement creation failed' });
        }
    
    
      };


    //For reimbrushment List api
    export const reimbrushmentList = async (req, res) => {
        try {
            const { page, filterDate, vendorId, type, filterType } = req.body;
        
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = 10; // Default to 10 items per page
        
            let reimbrushment = [];
            let query = {};
        
            if (type === 'employee') {
                // Employee can only see their own data
                query.vendorId = vendorId;
            }
            
            if (type === 'vendor') {
                // Vendor can see all data associated with their vendorId and their employees
                const employees = await employeeModel.find({ vendorId: vendorId });
                const employeeIds = employees.map(employee => employee._id);
                // Merge vendorId and employeeIds since they are stored in the same column
                query.vendorId = { $in: [vendorId, ...employeeIds] };
            }
        
            if (filterDate) {
                query.reimbDate = filterDate;
            }

            // Filter by status if filterType is provided
            if (filterType !== undefined) {
                if (filterType === 'all') {
                    // Do nothing, as 'all' implies no filtering by status
                } else if (filterType === 'pending') {
                    query.status = 0; // 0 = pending
                } else if (filterType === 'approved') {
                    query.status = 1; // 1 = approved
                } else if (filterType === 'rejected') {
                    query.status = 2; // 2 = rejected
                }
            }
        
            // Count total documents matching the query
            const totalCount = await reimbrushmentModel.countDocuments(query);
        
            // Retrieve the paginated list
            reimbrushment = await reimbrushmentModel.find(query)
                .sort({ createdAt: -1 }) // Sort by creation date, descending
                .skip((currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage);
        


            // Modify fields in the fetched documents
            reimbrushment = reimbrushment.map(item => {
                // Modify the status field to a more readable format
                let statusText = '';
                switch(item.status) {
                    case '0':
                        statusText = 'Pending';
                        break;
                    case '1':
                        statusText = 'Approved';
                        break;
                    case '2':
                        statusText = 'Rejected';
                        break;
                    default:
                        statusText = '-';
                }

                 let reimbrushmentDocument =  process.env.IMAGE_BASE_URL+item.reimbrushmentDocument;

                return {
                    _id:item._id,
                    vendorId : item.vendorId,
                    status : item.status,
                    reimbType:item.reimbType,
                    notes:item.notes,   // Add a new field for the status text
                    createdBy:vendorId == item.vendorId ? 'You' :item.createdBy,   // Add a new field for the status text
                    statusText,   // Add a new field for the status text
                    amount: `INR ${item.amount}`, // Format the amount with a dollar sign
                    reimbDate: item.reimbDate ? new Date(item.reimbDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                    documentImg:item.reimbrushmentDocument !='' ? reimbrushmentDocument:''
                };
            });

            if (!reimbrushment || reimbrushment.length === 0) {
                return res.status(200).json({
                    message: 'No Reimbursements found',
                    response: {
                        reimbrushment: [],
                        pagination: {
                            totalCount: 0,
                            totalPages: 0,
                            currentPage: 0,
                            perPage: 0
                        }
                    }
                });
            }
        
            const response = {
                reimbrushment,
                pagination: {
                    totalCount: totalCount,
                    totalPages: Math.ceil(totalCount / itemsPerPage),
                    currentPage: currentPage,
                    perPage: itemsPerPage
                }
            };
        
            res.status(200).json({ message: 'Success', response });
        
        } catch (error) {
            console.error('Error fetching reimbursements:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      
    };


        //For reimbrushment List api
        export const  reimbrushmentLista = async (req, res) => {
            try {

                const { page, filterDate, vendorId, type, filterType,perPage } = req.body;
            
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(perPage) || 20000; // Default to 10 items per page
            
                let reimbrushment = [];
                let query = {};
            
                if (type === 'employee') {
                    // Employee can only see their own data
                    query.vendorId = vendorId;
                }
                
                if (type === 'vendor') {
                    // Vendor can see all data associated with their vendorId and their employees
                    const employees = await employeeModel.find({ vendorId: vendorId });
                    const employeeIds = employees.map(employee => employee._id);
                    // Merge vendorId and employeeIds since they are stored in the same column
                    query.vendorId = { $in: [vendorId, ...employeeIds] };
                }
            
                if (filterDate) {
                    query.reimbDate = filterDate;
                }
    
                // Filter by status if filterType is provided
                if (filterType !== undefined) {
                    if (filterType === 'all') {
                        // Do nothing, as 'all' implies no filtering by status
                    } else if (filterType === 'pending') {
                        query.status = 0; // 0 = pending
                    } else if (filterType === 'approved') {
                        query.status = 1; // 1 = approved
                    } else if (filterType === 'rejected') {
                        query.status = 2; // 2 = rejected
                    }
                }
            
                // Count total documents matching the query
                const totalCount = await reimbrushmentModel.countDocuments(query);
            
                // Retrieve the paginated list
                reimbrushment = await reimbrushmentModel.find(query)
                    .sort({ createdAt: -1 }) // Sort by creation date, descending
                    .skip((currentPage - 1) * itemsPerPage)
                    .limit(itemsPerPage);
            
    
    
                // Modify fields in the fetched documents
                reimbrushment = reimbrushment.map(item => {
                    // Modify the status field to a more readable format
                    let statusText = '';
                    switch(item.status) {
                        case '0':
                            statusText = 'Pending';
                            break;
                        case '1':
                            statusText = 'Approved';
                            break;
                        case '2':
                            statusText = 'Rejected';
                            break;
                        default:
                            statusText = '-';
                    }
    
                     let reimbrushmentDocument =  process.env.IMAGE_BASE_URL+item.reimbrushmentDocument;
    
                    return {
                        _id:item._id,
                        vendorId : item.vendorId,
                        status : item.status,
                        reimbType:item.reimbType,
                        notes:item.notes,   // Add a new field for the status text
                        createdBy:vendorId == item.vendorId ? 'You' :item.createdBy,   // Add a new field for the status text
                        statusText,   // Add a new field for the status text
                        amount: `INR ${item.amount}`, // Format the amount with a dollar sign
                        reimbDate: item.reimbDate ? new Date(item.reimbDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                        documentImg:item.reimbrushmentDocument !='' ? reimbrushmentDocument:''
                    };
                });
    
                if (!reimbrushment || reimbrushment.length === 0) {
                    return res.status(200).json({
                        message: 'No Reimbursements found',
                        response: {
                            reimbrushment: [],
                            pagination: {
                                totalCount: 0,
                                totalPages: 0,
                                currentPage: 0,
                                perPage: 0
                            }
                        }
                    });
                }
            
                const response = {
                    reimbrushment,
                    pagination: {
                        totalCount: totalCount,
                        totalPages: Math.ceil(totalCount / itemsPerPage),
                        currentPage: currentPage,
                        perPage: itemsPerPage
                    }
                };
            
                res.status(200).json({ message: 'Success', response });
            
            } catch (error) {
                console.error('Error fetching reimbursements:', error);
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
          
        };
    
    //reimbrushment Edit
    export const reimbrushmentEdit = async (req, res) => {

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

    //For getReimbursementSums  api
    export const getReimbursementSums = async (req, res) => {
        try {
            const { vendorId, type, filterDate } = req.body;
    
            let matchQuery = {};
    
            if (type === 'employee') {
                matchQuery.vendorId = vendorId;
            } else if (type === 'vendor') {
                // Vendor can see all data associated with their vendorId and their employees
                const employees = await employeeModel.find({ vendorId: vendorId });
                const employeeIds = employees.map(employee => employee._id);
                matchQuery.vendorId = { $in: [vendorId, ...employeeIds] };
            }
    
            if (filterDate) {
                matchQuery.reimbDate = filterDate;
            }
    
            // Aggregation pipeline
            const result = await reimbrushmentModel.aggregate([
                { $match: matchQuery },
                {
                    $addFields: {
                        amount: {
                            $convert: {
                                input: "$amount",  // Input is the amount field
                                to: "double",      // Convert to double
                                onError: 0,        // If there's an error (e.g., empty string), set amount to 0
                                onNull: 0          // If the value is null, set amount to 0
                            }
                        }
                    }
                    
                    // $addFields: {
                    //     amount: { $toDouble: "$amount" } // Convert amount from string to number
                    // }
                },
                {
                    $group: {
                        _id: null,
                        all: { $sum: '$amount' },
                        pending: { $sum: { $cond: [{ $eq: ['$status', '0'] }, '$amount', 0] } },
                        approved: { $sum: { $cond: [{ $eq: ['$status', '1'] }, '$amount', 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ['$status', '2'] }, '$amount', 0] } }
                    }
                }
            ]);
    
            const sums = result[0] || {
                all: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };
            const sumdata = {
                  all: `INR ${sums.all.toFixed(2)}`,
                  pending: `INR ${sums.pending.toFixed(2)}`,
                  approved: `INR ${sums.approved.toFixed(2)}`,
                  rejected: `INR ${sums.rejected.toFixed(2)}`,
              };
               broadcastLocationUpdate(sumdata)  
              

            res.status(200).json({
                message: 'Sum of amounts fetched successfully',
                data: {
                    all: `INR ${sums.all.toFixed(2)}`,
                    pending: `INR ${sums.pending.toFixed(2)}`,
                    approved: `INR ${sums.approved.toFixed(2)}`,
                    rejected: `INR ${sums.rejected.toFixed(2)}`
                }
            });
    
        } catch (error) {
            console.error('Error fetching reimbursement sums:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    };

    //reimbrushment Update
    export const reimbrushmentUpdate = async (req, res) => {

    try {
        let uploadedFile = '';

        if (req.files['reimbursementDoc'] && req.files['reimbursementDoc'].length > 0) {
            const taskDocumentFile = req.files['reimbursementDoc'][0]; // Assuming maxCount is 1
            uploadedFile = "reimbursementDoc/" + taskDocumentFile.filename;
        }

        const { reimbId, vendorId, reimbDate, reimbType, notes, amount, type } = req.body;

        // if (!reimbId) {
        //     return res.status(400).json({ error: 'Reimbursement ID is required' });
        // }

        // if (!reimbType || !amount) {
        //     return res.status(400).json({ error: 'Reimbursement type and amount are required' });
        // }

        // Check sender admin or employee
        let createdBy = '';

        if (type === 'vendor') {
            const vendorExisting = await vendorModel.findOne({ _id: vendorId });
            createdBy = vendorExisting ? vendorExisting.vendorName : '';
        } else if (type === 'employee') {
            const employeeExisting = await employeeModel.findOne({ _id: vendorId });
            createdBy = employeeExisting ? employeeExisting.fullname : '';
        }

        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

        // Retrieve the existing reimbursement record
        const existingReimb = await reimbrushmentModel.findById(reimbId);

        if (!existingReimb) {
            return res.status(404).json({ error: 'Reimbursement not found' });
        }

        // Determine the file name to use
        const existingFileName = existingReimb.reimbrushmentDocument;
        const newFileName = uploadedFile ? uploadedFile : existingFileName;

        // Define the directory for file uploads
        const uploadDir = path.join(__dirname, '..', 'public', 'reimbursementDoc');

        // If a new file is uploaded, delete the old file
        if (uploadedFile && existingFileName && existingFileName !== uploadedFile) {
            const oldFilePath = path.join(uploadDir, path.basename(existingFileName));

            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error('Error deleting old file:', err);
                }
            });
        }

        // Update existing reimbursement
        const updatedReimb = await reimbrushmentModel.findByIdAndUpdate(
            reimbId,
            {
                vendorId,
                reimbDate,
                reimbType,
                notes,
                amount,
                type,
                createdBy,
                updatedAt: currentDate, // Track the last update time
                reimbrushmentDocument: newFileName // Update with new file name or keep existing one
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Reimbursement updated successfully', data: updatedReimb });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Reimbursement update failed', error: error.message });
    }

    };

    // reimbrushment Delete
    export const  reimbrushmentDelete = async (req, res) => {

        try {
            const { reimbId } = req.params;
    
            // Check if the reimbursement exists
            const existingReimbrushment = await reimbrushmentModel.findById(reimbId);
    
            if (!existingReimbrushment) {
                return res.status(404).json({ message: 'Reimbursement not found' });
            }
    
            // Define the directory for file uploads
            const uploadDir = path.join(__dirname, '..', 'public', 'reimbursementDoc');
    
            // Delete the associated file if it exists
            const existingFileName = existingReimbrushment.reimbrushmentDocument;
            if (existingFileName) {
                const filePath = path.join(uploadDir, path.basename(existingFileName));
    
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
    
            // Perform the deletion of the reimbursement record
            await reimbrushmentModel.findByIdAndDelete(reimbId);
    
            // Send a success response
            res.status(200).json({ message: 'Reimbursement deleted successfully' });
        } catch (error) {
            console.error('Error for Reimbursement Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }

    };


    //reimbrushment updateStatus  
    export const updateStatus = async (req, res) => {

        try {
            const { reimbId, status } = req.body;
        
            if (!reimbId) {
                return res.status(400).json({ error: 'Reimbursement ID is required' });
            }
            if (status === undefined) {
                return res.status(400).json({ error: 'Status is required' });
            }

            if (status != 1 && status != 2 ) {
                return res.status(400).json({ error: 'Invalid status. Please pass 1 (Approved), or 2 (Rejected) only.' });
            }
            // Retrieve the existing reimbursement record
            const existingReimb = await reimbrushmentModel.findById(reimbId);
        
            if (!existingReimb) {
                return res.status(404).json({ error: 'Reimbursement not found' });
            }
        
            // Update the status and save
            existingReimb.status = status;
            await existingReimb.save();
        
            // Determine status text
            const statusText = status == '1' ? 'approved' : 'rejected';
            res.status(200).json({ message: `Reimbursement ${statusText} successfully` });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Reimbursement update failed', error: error.message });
        }
    };


