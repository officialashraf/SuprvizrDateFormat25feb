
//import CONSTANTS from '../utils/constants.js';
//import userService  from '../services/userService.js';
import moment  from 'moment-timezone';
import polyline  from '../models/polylineModel.js';




    //Login for vendor using mobile number
   export const submitpolyline = async (req, res) => {

        try {
            const { vendorId, type, lat, long } = req.body;

            const newPolyline = new polyline({
                userId: vendorId,
                userType: type,
                lat: lat,
                long: long,
                createdAt: new Date()
            });
    
            await newPolyline.save();
            res.status(201).json({ message: 'Polyline added successfully', data: newPolyline });
        } catch (error) {
            res.status(500).json({ message: 'Error inserting data', error: error.message });
        }
    };


    // getpolyline
    export const  getpolyline = async (req, res) => {
        
          try {
        let { filterDate, vendorId } = req.body;

        // Default to today's date in UTC if filterDate is not provided or is blank
        if (!filterDate) {
            filterDate = moment().format('YYYY-MM-DD');
        }

        // Convert filterDate to start and end dates in UTC
        const startDateUTC = moment.utc(filterDate).startOf('day').toDate();
        const endDateUTC = moment.utc(filterDate).endOf('day').toDate();

        console.log("Start Date (UTC):", startDateUTC);
        console.log("End Date (UTC):", endDateUTC);
        console.log("Vendor ID:", vendorId);

        // Retrieve selected polyline data based on date range and vendorId
        const polylineData = await polyline.find({
            createdAt: {
                $gte: startDateUTC,
                $lt: endDateUTC
            },
            userId: vendorId
        }).select('userId lat long createdAt');


        res.status(200).json({ data: polylineData, message: 'Polyline fetched successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
        
    };







