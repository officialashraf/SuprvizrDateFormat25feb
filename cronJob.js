import cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config({path:'./config/config.env'});

 const baseUrl = process.env.BASE_URL;

// const baseUrl = 'http://localhost:4001/' 
// const baseUrl = http://matchitsports.com:4001/  #stage
//const baseUrl = 'http://203.161.63.242:4001';..

const logFilePath = path.join(__dirname, 'cronjob.log');

// Function to log messages to the log file
 export const logMessage = (message) => {
    const timestamp = new Date().toISOString();

    const currentDateIST = moment.tz(new Date(), 'Asia/Kolkata');
    const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
    const logEntry = `[${currentDate}] ${message}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};


const endpointPath = '/api/attendance/autolog';
// Define the task to be executed
export const task = async () => {
    try {
        // Make the API GET request
        const response = await axios.get(baseUrl + endpointPath);
        console.log('API request successful:', response.data);
    } catch (error) {
        console.error('Error making API request:', error);
    }
};

// Schedule the attendance for auto logout to run at 11:59 every day
cron.schedule('59 23 * * *', task);
console.log('Attendance for auto logout to run at 11:59 every day.');
