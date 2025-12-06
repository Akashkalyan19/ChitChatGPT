// ------------------- Importing Modules -------------------

const express = require('express');
const auth_router = require("./routes/auth");
const room_router = require("./routes/room");
const dotenv = require("dotenv");
const cors = require("cors");
const { authenticate } = require('./middlewares/authenticate');
const {createServer} = require('http');
const { Server } = require('socket.io');
const setupSocketEvents = require('./socket');
 
// ------------- Configuration ------------------

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const server = createServer(app);
const io = new Server(server, {
  cors: {
      origin: '*',
  }
});
setupSocketEvents(io);
const port = process.env.PORT || 8000;

// -------------- End-Points -------------
app.use('/auth', auth_router);

app.use('/room', authenticate, room_router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
