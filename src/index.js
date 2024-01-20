const express = require('express');
const {MongoClient} = require('mongodb');
const http = require('http');
const cors = require('cors');

const app = express();
const uri = "mongodb+srv://EMate_tester:3mate@testemate.y2iovys.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const server = http.createServer(app);

// const socketIO = require('socket.io');
// const io = socketIO(server);
const activeSockets = new Map();
var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

try {
  // Connect to the MongoDB cluster
  client.connect();

  // Make the appropriate DB calls
  listDatabases(client);
  console.log('connected to mongo db')

} catch (e) {
  console.error(e);
}

// Middleware
app.use(cors());
app.use(express.json());

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

// API route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.on('connection', (socket) => {
  // console.log(`Socket ${socket.id} connected`);

  socket.on('sendMessage', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
  activeSockets.set(socket.id, socket);

  socket.on('disconnect', () => {
    activeSockets.delete(socket.id);
  });

  socket.on('searchForPartner', () => {
    const availableSockets = Array.from(activeSockets.values()).filter(
      (s) => s.id !== socket.id
    );

    if (availableSockets.length > 0) {
      const partnerSocket = availableSockets[Math.floor(Math.random() * availableSockets.length)];
      const partnerId = partnerSocket.id;
      
      // Notify both users that they are paired
      socket.emit('pairing', { partnerId });
      partnerSocket.emit('pairing', { partnerId: socket.id });

      // Remove both users from the active sockets map
      activeSockets.delete(socket.id);
      activeSockets.delete(partnerId);
    } else {
      // If no partner is found, notify the user
      socket.emit('noPartnerFound');
    }
  });

});