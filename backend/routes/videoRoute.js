import express from "express";
import {
  createVideoRoomPatient,
  createVideoRoomDoctor,
  getVideoRoom,
  saveOffer,
  saveAnswer,
  saveCandidate,
} from "../controllers/videoController.js";
import authUser from "../middleware/authUser.js";
import authDoctor from "../middleware/authDoctor.js";

const videoRouter = express.Router();

videoRouter.post("/create", authUser, createVideoRoomPatient);
videoRouter.post("/doctor/create", authDoctor, createVideoRoomDoctor);
videoRouter.get("/room/:roomId", getVideoRoom);
videoRouter.post("/offer", authUser, saveOffer);
videoRouter.post("/answer", authUser, saveAnswer);
videoRouter.post("/candidate", authUser, saveCandidate);

export default videoRouter;
