import http from 'http'
import app from './app.js'
import connectDB from './config/database.js'
import {initializeSocket}  from './socket.js';

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
 initializeSocket(server);
 
 
// Start the server
const port = process.env.PORT || 9011;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

