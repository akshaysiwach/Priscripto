import { randomUUID } from "crypto";
import videoRoomModel from "../models/videoRoomModel.js";

const createVideoRoomPatient = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { doctorId } = req.body;
    if (!doctorId) return res.json({ success: false, message: "Doctor id required" });

    const roomId = randomUUID();
    const room = await videoRoomModel.create({
      roomId,
      patientId: userId,
      doctorId,
      creatorType: "patient",
      status: "waiting",
    });

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const createVideoRoomDoctor = async (req, res) => {
  try {
    const doctorId = req.body.docId;
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: "Patient id required" });

    const roomId = randomUUID();
    const room = await videoRoomModel.create({
      roomId,
      patientId: userId,
      doctorId,
      creatorType: "doctor",
      status: "waiting",
    });

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getVideoRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await videoRoomModel.findOne({ roomId });
    if (!room) return res.json({ success: false, message: "Room not found" });
    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const saveOffer = async (req, res) => {
  try {
    const { roomId, offer } = req.body;
    if (!roomId || !offer) return res.json({ success: false, message: "Missing room or offer" });

    const room = await videoRoomModel.findOne({ roomId });
    if (!room) return res.json({ success: false, message: "Room not found" });

    room.offer = offer;
    room.status = "offer-created";
    room.updatedAt = Date.now();
    await room.save();

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const saveAnswer = async (req, res) => {
  try {
    const { roomId, answer } = req.body;
    if (!roomId || !answer) return res.json({ success: false, message: "Missing room or answer" });

    const room = await videoRoomModel.findOne({ roomId });
    if (!room) return res.json({ success: false, message: "Room not found" });

    room.answer = answer;
    room.status = "answered";
    room.updatedAt = Date.now();
    await room.save();

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const saveCandidate = async (req, res) => {
  try {
    const { roomId, candidate, side } = req.body;
    if (!roomId || !candidate || !side) return res.json({ success: false, message: "Missing candidate data" });

    const room = await videoRoomModel.findOne({ roomId });
    if (!room) return res.json({ success: false, message: "Room not found" });

    if (side === "offer") {
      room.offerCandidates = room.offerCandidates || [];
      room.offerCandidates.push(candidate);
    } else {
      room.answerCandidates = room.answerCandidates || [];
      room.answerCandidates.push(candidate);
    }

    room.updatedAt = Date.now();
    await room.save();

    return res.json({ success: true, room });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  createVideoRoomPatient,
  createVideoRoomDoctor,
  getVideoRoom,
  saveOffer,
  saveAnswer,
  saveCandidate,
};
