
 import express from 'express'; 
 import bodyParser from 'body-parser';
 import cors from 'cors';
 import dotenv from 'dotenv';
 import adminRoute from './routes/adminRoute.js';
 import vendorRoute from './routes/vendorRoute.js';
 import EmpRoutes from './routes/employeeRoute.js';
 import userRoutes from './routes/userRoutes.js';
 import attendenceRoute from './routes/attendenceRoute.js';
 import taskRoutes from './routes/taskRoutes.js';
 import clientRoutes from './routes/clientRoutes.js';
 import reimbrushRoute from './routes/reimbrushRoute.js';
 import assetsRoute from './routes/assetsRoute.js';
 import licenseRoute from './routes/licenseRoute.js';
 import polylineRoute from './routes/polylineRoute.js';
dotenv.config({path:'./config/.env'});

const baseRoute = '/api';
// const userRoutes = require('./routes/userRoutes');
// const attendenceRoute = require('./routes/attendenceRoute');
// const taskRoutes = require('./routes/taskRoutes');
// const clientRoutes = require('./routes/clientRoutes');

// const reimbrushRoute = require('./routes/reimbrushRoute');
// const assetsRoute = require('./routes/assetsRoute');
// const licenseRoute = require('./routes/licenseRoute');
// const polylineRoute = require('./routes/polylineRoute');


const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Base route
app.get(baseRoute, (req, res) => {
  res.send(`
    <h1 style="text-align:center">Hello, Node Js </h1>
    <img src="./images/node.png" alt="Hello Image" width="100%" height="100%">
  `);
});

// Define routes
 app.use(`${baseRoute}/user`, userRoutes);
app.use(`${baseRoute}/attendance`, attendenceRoute);
 app.use(`${baseRoute}/task`, taskRoutes);
app.use(`${baseRoute}/client`, clientRoutes);
 app.use(`${baseRoute}/employee`, EmpRoutes);
 app.use(`${baseRoute}/vendor`, vendorRoute);
 app.use(`${baseRoute}/reimbursement`, reimbrushRoute);
 app.use(`${baseRoute}/assets`, assetsRoute);
 app.use(`${baseRoute}/license`, licenseRoute);
 app.use(`${baseRoute}/polyline`, polylineRoute);

app.use(`${baseRoute}/admin`, adminRoute);


 export default app;
