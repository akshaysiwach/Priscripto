import express from "express";
import {
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
} from "../controllers/chatController.js";
import authUser from "../middleware/authUser.js";
import authDoctor from "../middleware/authDoctor.js";

const chatRouter = express.Router();

chatRouter.post("/room", authUser, createChatRoomPatient);
chatRouter.get("/rooms", authUser, getPatientRooms);
chatRouter.get("/messages/:roomId", authUser, getPatientMessages);
chatRouter.post("/message", authUser, sendMessagePatient);
chatRouter.post("/bot", authUser, chatBotPatient);

chatRouter.post("/doctor/room", authDoctor, createChatRoomDoctor);
chatRouter.get("/doctor/rooms", authDoctor, getDoctorRooms);
chatRouter.get("/doctor/messages/:roomId", authDoctor, getDoctorMessages);
chatRouter.post("/doctor/message", authDoctor, sendMessageDoctor);
chatRouter.post("/doctor/bot", authDoctor, chatBotDoctor);

export default chatRouter;
