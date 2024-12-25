
import jwt from "jsonwebtoken"
import * as uuidv4 from 'uuid'
import WebSocket, { WebSocketServer } from 'ws';
let wss;

export  const  initializeSocket=(server)=> {
   wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized.");

  wss.on('connection', (ws, req) => {
    // Extract token from query parameters
    const token = req.url.split('token=')[1]; 
    

    if (!token) {
      console.log('No token provided');
      ws.close(4001, 'Unauthorized: No token provided'); 
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY); 
      console.log('Decoded Token:', decoded);

      // Attach user info to WebSocket connection
      ws.user = decoded;

      const clientId = uuidv4();
      ws.clientId = clientId;
      console.log('Client connected with clientId:', clientId);

      ws.on('message', (message) => {
        console.log('Received message:', message.toString());
      });

      ws.send('Hello from WebSocket Server');
      
      ws.on('close', () => {
        console.log("Client disconnected.", clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    } catch (err) {
      console.error('JWT Verification failed:', err);
      ws.close(4002, 'Unauthorized: Invalid or expired token');
    }
  });

  wss.on('listening', () => {
    console.log('WebSocket server is listening on ws://localhost:4001');
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    process.exit(1);
  });

}
// Function to broadcast location updates
 export const broadcastLocationUpdate = (locationUpdate) => {
  console.log('Broadcasting location update:', locationUpdate);

  if (wss && wss.clients) {
    console.log("wss clients",wss.clients.size)
      wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                  event: 'location_update',
                  data: locationUpdate,
              })
            );
            // console.log("client send", client.send(data)) 
          }
      });
  } else {
      console.error('No active WebSocket clients to broadcast.');
  }
};






