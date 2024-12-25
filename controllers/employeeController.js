

  import employeeModel  from '../models/employeeModel.js';
  import attendanceModel  from '../models/attendanceModel.js';
  import taskModel  from '../models/taskModel.js';
  import clientModel  from '../models/clientModel.js';
  import vendorModel  from '../models/vendorModel.js';
  import trackModel  from '../models/trackModel.js';
 import internetModel  from '../models/internetModel.js';
 import  gpsModel  from '../models/gpsModel.js';
 import loginModel  from '../models/loginModel.js';
 import logoutModel  from '../models/logoutModel.js';
 import {broadcastLocationUpdate}  from '../socket.js'

//const {CONSTANTS } from  '../utils/constants.js';


import {generateOTP , isValidEmail,isValidMobile,isValidPassword, parseCoordinates,calculateDistanceAndDuration}  from '../services/userService.js';
import jwt  from 'jsonwebtoken';

import moment  from 'moment';
import { sendOTP, sendEmployeeMsg }  from '../services/msgService.js';


    //For create employee api
   export const createEmp = async (req, res) => {
        try {
            const { fullname, mobile, userType, machineNumber, workLocation, vendorId } = req.body;

            if (!fullname || !mobile || !userType || !vendorId) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Check if the mobile already exists
            const existingMobile = await employeeModel.findOne({ mobile });
            const existingMobile_vendor = await vendorModel.findOne({ vendorMobile: mobile });

            let companyName = '';

            const vendorExists = await vendorModel.findById(vendorId);

            if (vendorExists) {
                companyName = vendorExists.vendorCompany;
            }
            //  else {
            //     companyName = vendorExists.vendorCompany;
            // }

            if (!await isValidMobile(mobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }

            if (existingMobile) {
                return res.status(400).json({ message: 'Mobile already exists' });
            }

            if (existingMobile_vendor) {
                return res.status(400).json({ message: 'Mobile already exists in vendor panel' });

            }

            // Create a new user
            const newUser = new employeeModel({ fullname, mobile, userType, machineNumber, workLocation, vendorId, companyName });

            // Save the user to the database
            await newUser.save();

            await sendEmployeeMsg(mobile);

            res.status(201).json({ message: 'Employee added successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };






    //getEmployee details
    export const getEmployee = async (req, res) => {
        try {
            const { userId } = req.params;

            // Find the user by ID
            const emp = await employeeModel.findById(userId, '-otp');

            if (!emp) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            res.status(200).json(emp);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };


    export const getEmpList = async (req, res) => {
        try {
            const { vendorId } = req.params;
            const { empName } = req.query;

            // const employees = await employeeModel.find({ vendorId: vendorId }, '-otp');
            // if (!employees || employees.length === 0) { // Check if employees array is empty
            //     return res.status(404).json({ message: 'Employees not found' });
            // }
            // res.status(200).json(employees);

            let query = { vendorId: vendorId };

            if (empName) {
                query.fullname = { $regex: empName, $options: 'i' }; // Case-insensitive search
            }

            // Find employees matching the query
            // const employees = await employeeModel.find(query, '-otp');
            const employees = await employeeModel.find(query, '-otp').sort({ _id: 1 });

            if (!employees || employees.length === 0) { // Check if employees array is empty
                return res.status(404).json({ message: 'Employees not found' });
            }

            res.status(200).json({
                totalemployess: employees.length,
                employees
            });


        } catch (error) {
            console.error('Error fetching all employees:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };



    //filterEmpType  filter
    export const filterEmpType = async (req, res) => {
        try {
            const myDate = new Date();
            const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
            const providedDate = currentDateIST.format('YYYY-MM-DD');

            const { vendorId, userType, attandance_status } = req.body;


            if (!vendorId || !userType || !attandance_status) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Find the employees by vendorId and userType
            let empList = '';
            if (attandance_status == 'all') {
                empList = await employeeModel.find({ vendorId: vendorId, userType: userType }, '-otp')
                    .sort({ _id: -1 });
            } else {

                empList = await employeeModel.find({ vendorId: vendorId, userType: userType, attendanceStatus: attandance_status }, '-otp')

            }

            if (!empList || empList.length === 0) {
                return res.status(404).json({ message: 'No employees found' });
            }

            res.status(200).json(empList);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };



    //updateEmployee data

    export const updateEmployee = async (req, res) => {

        try {

            const { userId } = req.params;

            const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

            if (!fullname || !mobile) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            // Find the user by ID
            const employee = await employeeModel.findById(userId);

            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }



            if (!await isValidMobile(mobile)) {
                return res.status(400).json({ message: 'Invalid mobile number' });
            }


            // If the mobile number is updated, check if it already exists for another user
            if (mobile !== employee.mobile) {
                const existingMobile = await employeeModel.findOne({ mobile });

                if (existingMobile && existingMobile._id.toString() !== userId) {
                    return res.status(400).json({ message: 'Mobile number already exists for another employee' });
                }
            }

            // Update profile fields
            employee.fullname = fullname || employee.fullname;
            employee.mobile = mobile || employee.mobile;
            employee.userType = userType || employee.userType;
            employee.machineNumber = machineNumber || employee.machineNumber;
            employee.workLocation = workLocation || employee.workLocation;


            // Save the updated user to the database
            await employee.save();

            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    //employee Login
    export const employeeLogin = async (req, res) => {

        try {
            const { mobileNumber } = req.body;

            const mobileNumberRegex = /^\d{10}$/;

            if (!mobileNumberRegex.test(mobileNumber)) {
                return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
            }

            const employee = await employeeModel.findOne({ mobile: mobileNumber });
            const otpCode = await generateOTP();
            // const otpCode = "1234";

            if (!employee) {

                return res.status(404).json({ message: 'Mobile number not found in database.' });

            } else {

                const userId = employee._id;
                const update = { otp: otpCode };

                const result = await employeeModel.updateOne({ _id: userId }, update);

                if (result.matchedCount === 1) {

                    await sendOTP(mobileNumber, otpCode);

                    console.log('OTP updated successfully');

                } else {

                    console.log('employee not found or OTP not updated');
                }

                res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

    //verify otp
    export const verifyOTP = async (req, res) => {
        try {
            const { otp, mobile } = req.body;


            if (!otp || !mobile) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const storedOTP = await employeeModel.findOne({ mobile });

            if (!storedOTP) {
                return res.status(400).json({ message: 'Mobile Number Not Found' });
            }

            if (otp !== storedOTP.otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            // Payload for JWT
            const payload = {
                userId: storedOTP._id,
                userRole: storedOTP.role, // Ensure role is stored in DB  
            };

            // Generate JWT token
            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '14d' }); // Secret key must match
            console.log(token)
            res.status(200).json({
                message: 'OTP verification successful',
                token, // Send token in response
                employee: storedOTP,
            });
        }


        // //update user status
        // const filter = { mobile: mobile };
        // const update = { status: 1 };

        // try {
        //     const result = await employeeModel.updateOne(filter, update);
        //     console.log(result.matchedCount === 1 ? 'Status updated successfully' : 'Error in Status updating!');
        // } catch (error) {
        //     console.error('Error updating OTP:', error);
        // }

        // // Generate a JWT token
        // const token = jwt.sign({ userId: storedOTP._id, mobile: storedOTP.mobile }, 'yourSecretKey', {
        //     expiresIn: '1h', // Token expiration time
        // });



        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to verify OTP' });
        }
    };
    //verify otp with latlong 
    // verifyOTP = async (req, res) => {
    //     try {
    //         const { otp, mobile,lat,long } = req.body;


    //         if (!otp || !mobile ) {
    //             return res.status(400).json({ error: 'One or more fields are empty' });
    //         }

    //         const storedOTP = await employeeModel.findOne({ mobile });

    //         if (!storedOTP) {
    //             return res.status(400).json({ message: 'Mobile Number Not Found' });
    //         }


    //         if (otp === storedOTP.otp) {

    //             //update user status
    //             const filter = { mobile: mobile };
    //             const update = { status: 1 };

    //             try {
    //                 const result = await employeeModel.updateOne(filter, update);
    //                 console.log(result.matchedCount === 1 ? 'Status updated successfully' : 'Error in Status updating!');
    //             } catch (error) {
    //                 console.error('Error updating OTP:', error);
    //             }

    //             // Generate a JWT token
    //             const token = jwt.sign({ userId: storedOTP._id, mobile: storedOTP.mobile }, 'yourSecretKey', {
    //                 expiresIn: '1h', // Token expiration time
    //             });

    //              //
    //              storedOTP.loginStatus = 'Login';
    //              await storedOTP.save();
    //              const myDate = new Date();
    //              const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
    //              const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
    //              const createdAt = currentDateIST.format('YYYY-MM-DD');

    //              const locationGet = await getLocation(lat, long);

    //                  // Save gps record
    //                  const savedLogin = new loginModel({
    //                      userId:storedOTP._id,
    //                      type:CONSTANTS.login,
    //                      loginDate: currentDate,
    //                      loginLat: lat,
    //                      loginLong: long,
    //                      loginAddress: locationGet,
    //                      createdAt: createdAt,
    //                  });

    //                  await savedLogin.save();
    //                  // Save track log
    //                  let status = 'Login';
    //                  const newTrack = new trackModel({
    //                      userId:storedOTP._id,
    //                      userType: CONSTANTS.typeEmployee,
    //                      status,
    //                      taskId: 0, 
    //                      lat,
    //                      long,
    //                      loginId: savedLogin._id, // Using the _id of savedLogout
    //                      createdAt: currentDate,
    //                  });
    //                  await newTrack.save();
    //          //



    //             res.status(200).json({ message: 'OTP verification successful', employee: storedOTP });
    //         } else {
    //             res.status(400).json({ message: 'Invalid OTP' });
    //         }

    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Failed to verify OTP' });
    //     }
    // },


    //Employee Tracking Data
    // getEmpTrack = async (req, res) => {
    //     try {

    //         const userId = req.params.userId;

    //         const employee = await employeeModel.findById(userId, '-otp');
    //         if (!employee) {
    //             return res.status(404).json({ error: 'Employee not found' });
    //         }

    //         const attendance = await attendanceModel.find({ userId: userId }).sort({ attnedanceDate: 1 });

    //         const tasks = await taskModel.find({ userId, status: 1 });

    //         const taskCount = tasks.length; // Count of tasks


    //         //get distance lat long start 
    //         var distance;
    //         var duration;

    //         const getCheckInOrigin = await attendanceModel.find({ userId: userId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
    //         const getCheckOutOrigin = await attendanceModel.find({ userId: userId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

    //         const checkInRecord = attendance.find(record => record.status === "IN");
    //         const checkOutRecord = attendance.find(record => record.status === "OUT");


    //         if (checkInRecord && checkOutRecord && tasks.length == 0) {

    //             const originLat = getCheckInOrigin[0].attnedanceLat;
    //             const originLong = getCheckInOrigin[0].attnedanceLong;

    //             const destinationLat = getCheckOutOrigin[0].attnedanceLat;
    //             const destinationLong = getCheckOutOrigin[0].attnedanceLong;

    //             const locationInLatLong = originLat + ',' + originLong;
    //             const locationOutLatLong = destinationLat + ',' + destinationLong;

    //             const originCoords = await parseCoordinates(locationInLatLong);
    //             const destinationCoords = await parseCoordinates(locationOutLatLong);

    //             const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

    //             distance = result.data.rows[0].elements[0].distance.text;
    //             duration = result.data.rows[0].elements[0].duration.text;

    //         } else {

    //             let startTaskLat, startTaskLong, endTaskLat, endTaskLong;
    //             for (let i = 0; i < tasks.length; i++) {
    //                 const task = tasks[i];
    //                 const taskLocation = task.location;

    //                 if (i === 0) {
    //                     // Save the start task coordinates
    //                     startTaskLat = taskLocation.coordinates[0];
    //                     startTaskLong = taskLocation.coordinates[1];
    //                 } else if (i === tasks.length - 1) {
    //                     // Save the end task coordinates
    //                     endTaskLat = taskLocation.coordinates[0];
    //                     endTaskLong = taskLocation.coordinates[1];
    //                 }

    //                 const originLat = (i === 0) ? checkInRecord.attnedanceLat : tasks[i - 1].location.coordinates[0];
    //                 const originLong = (i === 0) ? checkInRecord.attnedanceLong : tasks[i - 1].location.coordinates[1];
    //                 const destinationLat = taskLocation.coordinates[0];
    //                 const destinationLong = taskLocation.coordinates[1];

    //                 const locationInLatLong = originLat + ',' + originLong;
    //                 const locationOutLatLong = destinationLat + ',' + destinationLong;

    //                 const originCoords = await parseCoordinates(locationInLatLong);
    //                 const destinationCoords = await parseCoordinates(locationOutLatLong);

    //                 const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

    //                 totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
    //                 totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
    //             }


    //             distance = 0;
    //             duration = 0;
    //         }
    //         //end loc

    //         const response = {
    //             employee: employee,
    //             employeeAttendance: attendance,
    //             employeeTasks: tasks,
    //             origin: {
    //                 distance: distance,
    //                 duration: duration,
    //                 taskCount: taskCount
    //             }
    //         };

    //         res.status(200).json(response);


    //     } catch (error) {
    //         console.error('Error fetching employee--tracking-related data:', error);
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },



    export const getEmpTrack = async (req, res) => {
        try {


            const { userId, filterDate } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'User id is empty' });
            }


            // const userId = req.params.userId;

            const employee = await employeeModel.findById(userId, '-otp');
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            // const attendance = await attendanceModel.find({ userId: userId }, '-attnedanceAddress').sort({ attnedanceDate: 1 });
            const attendance = await attendanceModel.find({ userId: userId, createdAt: filterDate }, '-attnedanceAddress').sort({ attnedanceDate: 1 });
            const tasks = await taskModel.find({ userId, status: 1 }, '-taskAddress');
            const taskCount = tasks.length; // Count of tasks


            //get distance lat long start 
            let totalDistance = 0;
            let totalDuration = 0;

            const getCheckInOrigin = await attendanceModel.find({ userId: userId, status: "IN" }).sort({ attnedanceDate: -1 }).limit(1);
            const getCheckOutOrigin = await attendanceModel.find({ userId: userId, status: "OUT" }).sort({ attnedanceDate: -1 }).limit(1);

            const checkInRecord = attendance.find(record => record.status === "IN");
            const checkOutRecord = attendance.find(record => record.status === "OUT");


            // Calculate distance and duration for single task

            if (checkInRecord && tasks.length == 0) {

                if (checkOutRecord) {
                    const originLat = getCheckInOrigin[0].attnedanceLat;
                    const originLong = getCheckInOrigin[0].attnedanceLong;

                    const destinationLat = getCheckOutOrigin[0].attnedanceLat;
                    const destinationLong = getCheckOutOrigin[0].attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await parseCoordinates(locationInLatLong);
                    const destinationCoords = await parseCoordinates(locationOutLatLong);

                    const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance = result.data.rows[0].elements[0].distance.text;
                    totalDuration = result.data.rows[0].elements[0].duration.text;
                } else {
                    totalDistance = 0;
                    totalDuration = 0;

                }

            } else if (checkInRecord && tasks.length === 1) {

                const taskLocation = tasks[0].location;

                // console.log(taskLocation.coordinates[0]);

                const originLat = checkInRecord.attnedanceLat;
                const originLong = checkInRecord.attnedanceLong;
                const destinationLat = taskLocation.coordinates[0];
                const destinationLong = taskLocation.coordinates[1];

                const locationInLatLong = originLat + ',' + originLong;
                const locationOutLatLong = destinationLat + ',' + destinationLong;

                const originCoords = await parseCoordinates(locationInLatLong);
                const destinationCoords = await parseCoordinates(locationOutLatLong);

                const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

                totalDistance = parseFloat(result.data.rows[0].elements[0].distance.text);
                totalDuration = parseFloat(result.data.rows[0].elements[0].duration.text);

                // If there's a check-out record, calculate distance and duration from task to check-out
                if (checkOutRecord) {
                    const originLat = taskLocation.coordinates[0];
                    const originLong = taskLocation.coordinates[1];
                    const destinationLat = checkOutRecord.attnedanceLat;
                    const destinationLong = checkOutRecord.attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await parseCoordinates(locationInLatLong);
                    const destinationCoords = await parseCoordinates(locationOutLatLong);

                    const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }
            } else {
                // Calculate distance and duration for each task
                let startTaskLat, startTaskLong, endTaskLat, endTaskLong;
                for (let i = 0; i < tasks.length; i++) {
                    const task = tasks[i];
                    const taskLocation = task.location;

                    if (i === 0) {
                        // Save the start task coordinates
                        startTaskLat = taskLocation.coordinates[0];
                        startTaskLong = taskLocation.coordinates[1];
                    } else if (i === tasks.length - 1) {
                        // Save the end task coordinates
                        endTaskLat = taskLocation.coordinates[0];
                        endTaskLong = taskLocation.coordinates[1];
                    }

                    const originLat = (i === 0) ? checkInRecord.attnedanceLat : tasks[i - 1].location.coordinates[0];
                    const originLong = (i === 0) ? checkInRecord.attnedanceLong : tasks[i - 1].location.coordinates[1];
                    const destinationLat = taskLocation.coordinates[0];
                    const destinationLong = taskLocation.coordinates[1];

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await parseCoordinates(locationInLatLong);
                    const destinationCoords = await parseCoordinates(locationOutLatLong);

                    const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }

                // If there's a check-out record, calculate distance and duration from last task to check-out
                if (checkOutRecord) {
                    const originLat = endTaskLat;
                    const originLong = endTaskLong;
                    const destinationLat = checkOutRecord.attnedanceLat;
                    const destinationLong = checkOutRecord.attnedanceLong;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await parseCoordinates(locationInLatLong);
                    const destinationCoords = await parseCoordinates(locationOutLatLong);

                    const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

                    totalDistance += parseFloat(result.data.rows[0].elements[0].distance.text);
                    totalDuration += parseFloat(result.data.rows[0].elements[0].duration.text);
                }
            }

            //end loc

            const response = {
                employee: employee,
                employeeAttendance: attendance,
                employeeTasks: tasks,
                origin: {
                    distance: totalDistance,
                    duration: totalDuration,
                    taskCount: taskCount
                }
            };
            const locationUpdate = {
                userId: userId,
                totalDistance: totalDistance,
                totalDuration: totalDuration,
                tasks: tasks,
                taskCount: taskCount,
                employee: employee
            };
    
            // Call the broadcast function here
            broadcastLocationUpdate(locationUpdate); 

            res.status(200).json(response);


        } catch (error) {
            console.error('Error fetching employee--tracking-related data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };


    //delete employee
    export const empDelete = async (req, res) => {

        try {

            const { userId } = req.params;

            // Check if the task exists
            const existingemp = await employeeModel.findById(userId);

            if (!existingemp) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            // Perform the deletion
            await employeeModel.findByIdAndDelete(userId);

            // Send a success response
            res.status(200).json({ message: 'Employee deleted successfully' });
        } catch (error) {
            console.error('Error for Employee Delete:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };



    //CurrentLocation
    export const currentLocation = async (req, res) => {
        try {
            const { userId, lat, long, batteryStatus } = req.body;

            if (!userId || !lat || !long) {
                return res.status(400).json({ error: 'One or more fields are empty' });
            }

            const employee = await employeeModel.findById(userId, '-otp');
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            employee.latitude = lat || employee.latitude;
            employee.longitude = long || employee.longitude;
            employee.batteryStatus = batteryStatus || employee.batteryStatus;

            await employee.save();
            console.log('employeme', employee)
            //WebSocket clients
          
            const locationUpdate = {
                userId: employee._id,
                latitude: employee.latitude,
                longitude: employee.longitude,
                batteryStatus: employee.batteryStatus,
            };

            broadcastLocationUpdate(locationUpdate)
           
           


            res.status(200).json({ message: 'Current location updated successfully' });

        } catch (error) {
            console.error('Error fetching employee current location', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    //cleint list for employee
    export const clientList = async (req, res) => {

        try {

            const { userId } = req.params;

            const clientList = await clientModel.find({ vendorId: userId });

            // Check if clientList array is empty
            if (!clientList || clientList.length === 0) {
                return res.status(404).json({ message: 'client List not found' });
            }

            res.status(200).json(clientList);

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

    //task list for employee
    export const taskList = async (req, res) => {

        try {

            const { userId } = req.params;
            //find data from employee id 
            const taskList = await taskModel.find({ vendorId: userId }, '-taskAddress');

            if (!taskList || taskList.length === 0) { // Check if Task array is empty
                return res.status(404).json({ message: 'Task not found' });
            }

            res.status(200).json(taskList);

        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }

    };

    export const trackEmpRecord = async (req, res) => {
        try {
            const { userId, filterDate, page, perPage } = req.body;
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(perPage) || 10; // Default to 10 items per page

            if (!userId) {
                return res.status(400).json({ error: 'User id is empty' });
            }

            const employee = await employeeModel.findById(userId, '-otp');

            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            let query = { userId: userId };

            // task count
            let query2 = { userId: userId, status: 1 };

            if (filterDate) {
                const startDate = new Date(filterDate);
                startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
                const endDate = new Date(filterDate);
                endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

                query.createdAt = {
                    $gte: startDate,
                    $lt: endDate
                };

                query2.taskEndDate = {
                    $gte: startDate,
                    $lt: endDate
                };

            }

            const tasksCount = await taskModel.find(query2, '-taskAddress');
            const taskCount = tasksCount.length; // Count of tasks
            // task count


            const totalCount = await trackModel.countDocuments(query); // Total count of documents

            const trackData = await trackModel.find(query)
                .sort({ createdAt: 1 })
                .skip((currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage);

            if (!trackData || trackData.length === 0) {
                return res.status(404).json({
                    message: "No Data Found", response: {
                        employee, track: [], origin: { distance: 0, duration: 0, taskCount: 0 }, totalCount: 0, pagination: {
                            filterDate: filterDate,
                            totalCount: 0,
                            totalPages: 0,
                            currentPage: 0,
                            perPage: 0
                        }
                    }
                });
            }

            let mergedDetails = [];

            for (let i = 0; i < trackData.length; i++) {
                const trackd = trackData[i];
                const userType = trackd.userType;
                const userId = trackd.userId;
                const status = trackd.status;
                const taskId = trackd.taskId;
                const attendceId = trackd.attendceId;
                const internetId = trackd.internetId;
                const gpsId = trackd.gpsId;
                const loginId = trackd.loginId;
                const logoutId = trackd.logoutId;

                if (userId && userType === 'employee' && attendceId != '0') {
                    const attDetailIn = await attendanceModel.findOne({ _id: attendceId });
                    if (attDetailIn) {
                        mergedDetails.push(attDetailIn);
                    }
                }

                if (taskId && taskId != '0') {
                    const taskData = await taskModel.findOne({ _id: taskId });

                    if (taskData) {
                        const formattedTask = {
                            ...taskData.toObject(),
                            taskDate: moment(taskData.taskDate).format('YYYY-MM-DD hh:mm A'),
                            taskEndDate: (taskData.taskEndDate != null && taskData.taskEndDate != '') ? moment(taskData.taskEndDate).format('YYYY-MM-DD hh:mm A') : ''
                        };

                        mergedDetails.push(formattedTask);
                    }
                }

                if (userId && userType === 'employee' && internetId != '0') {
                    const internetRecord = await internetModel.findOne({ _id: internetId });
                    if (internetRecord) {
                        mergedDetails.push(internetRecord);
                    }
                }

                if (userId && userType === 'employee' && gpsId != '0') {
                    const gpsRecord = await gpsModel.findOne({ _id: gpsId });
                    if (gpsRecord) {
                        mergedDetails.push(gpsRecord);
                    }
                }

                if (userId && userType === 'employee' && loginId != '0') {
                    const loginRecord = await loginModel.findOne({ _id: loginId });
                    if (loginRecord) {
                        mergedDetails.push(loginRecord);
                    }
                }

                if (userId && userType === 'employee' && logoutId != '0') {
                    const logoutRecord = await logoutModel.findOne({ _id: logoutId });
                    if (logoutRecord) {
                        mergedDetails.push(logoutRecord);
                    }
                }

                // if (userId && userType === 'employee' && attendceId != '0') {
                //     const attDetailout = await attendanceModel.findOne({ _id: attendceId });
                //     if (attDetailout) {
                //         mergedDetails.push(attDetailout);
                //     }
                // }
            }

            let totalDistance = 0;
            let totalDuration = 0;

            if (trackData.length > 0) {
                for (let i = 0; i < trackData.length - 1; i++) {
                    const originLat = trackData[i].lat;
                    const originLong = trackData[i].long;
                    const destinationLat = trackData[i + 1].lat;
                    const destinationLong = trackData[i + 1].long;

                    const locationInLatLong = originLat + ',' + originLong;
                    const locationOutLatLong = destinationLat + ',' + destinationLong;

                    const originCoords = await parseCoordinates(locationInLatLong);
                    const destinationCoords = await parseCoordinates(locationOutLatLong);

                    const resultDistance = await calculateDistanceAndDuration(originCoords, destinationCoords);

                    if (
                        resultDistance &&
                        resultDistance.data &&
                        resultDistance.data.rows &&
                        resultDistance.data.rows.length > 0 &&
                        resultDistance.data.rows[0].elements &&
                        resultDistance.data.rows[0].elements.length > 0 &&
                        resultDistance.data.rows[0].elements[0].distance &&
                        resultDistance.data.rows[0].elements[0].distance.text &&
                        resultDistance.data.rows[0].elements[0].duration &&
                        resultDistance.data.rows[0].elements[0].duration.text
                    ) {
                        totalDistance += parseFloat(resultDistance.data.rows[0].elements[0].distance.text);
                        totalDuration += parseFloat(resultDistance.data.rows[0].elements[0].duration.text);
                    }
                }
            }

            const response = {
                employee: employee,
                track: mergedDetails,
                origin: {
                    distance: totalDistance,
                    duration: totalDuration,
                    taskCount: taskCount  // Update with your logic for task count
                },
                pagination: {
                    filterDate: filterDate,
                    totalCount: totalCount,
                    totalPages: Math.ceil(totalCount / itemsPerPage),
                    currentPage: currentPage,
                    perPage: itemsPerPage
                }
            };
            const locationUpdate = {
                userId: employee._id,
                distance: totalDistance,
                duration: totalDuration,
                taskCount: taskCount 
            };
            
            broadcastLocationUpdate(locationUpdate);

            return res.status(200).json({ message: "Success", response });
        } catch (error) {
            console.error('Error fetching related data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };




