const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const app = express();
require("dotenv").config();

const corsOptions = {
  origin: process.env.REACT_APP_FRONTEND_URL, // Allow only your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoute);

mongoose
  .connect(process.env.REACT_APP_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Sucessfull");
  })
  .catch((err) => {
    console.log(err.message);
  });
const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: process.env.REACT_APP_FRONTEND_URL,
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});
