import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    roomType: { type: String, default: "doctor-patient" },
    lastMessage: { type: String, default: "" },
    lastSender: { type: String, default: "" },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
  { minimize: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "chatroom", required: true },
    senderId: { type: String, required: true },
    senderType: { type: String, enum: ["patient", "doctor", "bot"], default: "patient" },
    message: { type: String, required: true },
    createdAt: { type: Number, default: Date.now },
  },
  { minimize: false }
);

const chatRoomModel = mongoose.models.chatroom || mongoose.model("chatroom", chatRoomSchema);
const chatMessageModel = mongoose.models.chatmessage || mongoose.model("chatmessage", chatMessageSchema);

export { chatRoomModel, chatMessageModel };
