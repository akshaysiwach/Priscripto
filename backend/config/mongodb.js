import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

    mongoose.connection.on('connected', () => console.log("Database Connected"))
    await mongoose.connect(`${mongoUri}/prescripto`)

}

export default connectDB;
