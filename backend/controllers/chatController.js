import { chatRoomModel, chatMessageModel } from "../models/chatModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";

const createChatRoomPatient = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.json({ success: false, message: "Doctor id required" });
    }

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let room = await chatRoomModel.findOne({ userId, docId: doctorId });
    if (!room) {
      room = await chatRoomModel.create({ userId, docId: doctorId, lastMessage: "", lastSender: "" });
    }

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getPatientRooms = async (req, res) => {
  try {
    const userId = req.body.userId;
    const rooms = await chatRoomModel.find({ userId }).sort({ updatedAt: -1 });

    const populated = await Promise.all(
      rooms.map(async (room) => {
        const doctor = await doctorModel.findById(room.docId).select("name email image speciality");
        return {
          ...room.toObject(),
          doctor,
        };
      })
    );

    return res.json({ success: true, rooms: populated });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getPatientMessages = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { roomId } = req.params;
    const room = await chatRoomModel.findById(roomId);
    if (!room || room.userId !== userId) {
      return res.json({ success: false, message: "Room not found" });
    }

    const messages = await chatMessageModel.find({ roomId }).sort({ createdAt: 1 });
    return res.json({ success: true, messages, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const sendMessagePatient = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { roomId, message } = req.body;
    if (!message || !roomId) {
      return res.json({ success: false, message: "Missing message or room" });
    }

    const room = await chatRoomModel.findById(roomId);
    if (!room || room.userId !== userId) {
      return res.json({ success: false, message: "Room not found" });
    }

    const chat = await chatMessageModel.create({ roomId, senderId: userId, senderType: "patient", message });
    room.lastMessage = message;
    room.lastSender = "patient";
    room.updatedAt = Date.now();
    await room.save();

    return res.json({ success: true, chat });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const createChatRoomDoctor = async (req, res) => {
  try {
    const doctorId = req.body.docId;
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "Patient id required" });
    }

    const patient = await userModel.findById(userId);
    if (!patient) {
      return res.json({ success: false, message: "Patient not found" });
    }

    let room = await chatRoomModel.findOne({ userId, docId: doctorId });
    if (!room) {
      room = await chatRoomModel.create({ userId, docId: doctorId, lastMessage: "", lastSender: "" });
    }

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getDoctorRooms = async (req, res) => {
  try {
    const doctorId = req.body.docId;
    const rooms = await chatRoomModel.find({ docId: doctorId }).sort({ updatedAt: -1 });

    const populated = await Promise.all(
      rooms.map(async (room) => {
        const patient = await userModel.findById(room.userId).select("name email image");
        return {
          ...room.toObject(),
          patient,
        };
      })
    );

    return res.json({ success: true, rooms: populated });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getDoctorMessages = async (req, res) => {
  try {
    const doctorId = req.body.docId;
    const { roomId } = req.params;
    const room = await chatRoomModel.findById(roomId);
    if (!room || room.docId !== doctorId) {
      return res.json({ success: false, message: "Room not found" });
    }

    const messages = await chatMessageModel.find({ roomId }).sort({ createdAt: 1 });
    return res.json({ success: true, messages, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const sendMessageDoctor = async (req, res) => {
  try {
    const doctorId = req.body.docId;
    const { roomId, message } = req.body;
    if (!message || !roomId) {
      return res.json({ success: false, message: "Missing message or room" });
    }

    const room = await chatRoomModel.findById(roomId);
    if (!room || room.docId !== doctorId) {
      return res.json({ success: false, message: "Room not found" });
    }

    const chat = await chatMessageModel.create({ roomId, senderId: doctorId, senderType: "doctor", message });
    room.lastMessage = message;
    room.lastSender = "doctor";
    room.updatedAt = Date.now();
    await room.save();

    return res.json({ success: true, chat });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const generateBotReply = (message, role) => {
  const text = message.toLowerCase();

  if (text.includes("book") || text.includes("appointment")) {
    return "You can book a doctor appointment from the doctors page or review your existing appointments in My Appointments.";
  }

  if (text.includes("price") || text.includes("fee") || text.includes("cost")) {
    return "Doctor fees vary by speciality. Use the appointment form to see pricing and available slots.";
  }

  if (text.includes("hello") || text.includes("hi")) {
    return role === "doctor"
      ? "Hello Doctor! How can I assist you with your dashboard or appointments today?"
      : "Hello! I'm your patient assistant. How can I help you today?";
  }

  if (text.includes("video") || text.includes("call")) {
    return "You can start a video call from the Video Call page. Create a room and share the room ID with the other person.";
  }

  if (text.includes("help") || text.includes("support")) {
    return "I can help with appointment status, profile updates, and navigating the patient/doctor dashboard.";
  }

  return role === "doctor"
    ? "I can help answer questions about your patients, appointments, and video call setup. What would you like to do next?"
    : "I can help guide you through booking appointments, chatting with your doctor, or starting a video call.";
};

const chatBotPatient = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ success: false, message: "Message required" });
    }
    const reply = generateBotReply(message, "patient");
    return res.json({ success: true, reply });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const chatBotDoctor = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ success: false, message: "Message required" });
    }
    const reply = generateBotReply(message, "doctor");
    return res.json({ success: true, reply });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  createChatRoomPatient,
  getPatientRooms,
  getPatientMessages,
  sendMessagePatient,
  createChatRoomDoctor,
  getDoctorRooms,
  getDoctorMessages,
  sendMessageDoctor,
  chatBotPatient,
  chatBotDoctor,
};
