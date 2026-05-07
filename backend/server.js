import express from "express"
import cors from 'cors'
import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import seedDemoData from "./utils/seedDemoData.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import chatRouter from "./routes/chatRoute.js"
import videoRouter from "./routes/videoRoute.js"




const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://frontend-two-gamma-lovhdr0zt8.vercel.app", "https://priscripto-admin-five.vercel.app"],
    methods: ["GET", "POST"]
  }
})
const port = process.env.PORT || 4000
await connectDB()
await connectCloudinary()
await seedDemoData()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/chat", chatRouter)
app.use("/api/video", videoRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    const { roomId, message, senderId, senderType, createdAt } = data
    socket.to(roomId).emit('receiveMessage', {
      message,
      senderId,
      senderType,
      createdAt: createdAt || Date.now(),
    })
  })

  // Handle video signaling
  socket.on('videoOffer', (data) => {
    const { roomId, offer } = data
    socket.to(roomId).emit('videoOffer', offer)
  })

  socket.on('videoAnswer', (data) => {
    const { roomId, answer } = data
    socket.to(roomId).emit('videoAnswer', answer)
  })

  socket.on('iceCandidate', (data) => {
    const { roomId, candidate } = data
    socket.to(roomId).emit('iceCandidate', candidate)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(port, () => console.log(`Server started on PORT:${port}`))
