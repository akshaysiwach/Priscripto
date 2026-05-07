import mongoose from "mongoose";

const videoRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    creatorType: { type: String, enum: ["patient", "doctor"], required: true },
    offer: { type: Object, default: null },
    answer: { type: Object, default: null },
    offerCandidates: { type: [Object], default: [] },
    answerCandidates: { type: [Object], default: [] },
    status: { type: String, default: "waiting" },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
  { minimize: false }
);

const videoRoomModel = mongoose.models.videoroom || mongoose.model("videoroom", videoRoomSchema);
export default videoRoomModel;
