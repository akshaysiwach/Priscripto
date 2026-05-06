import crypto from "crypto";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/demoCredentials.js";

const signToken = (payload) => jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

const verifyToken = (token) => jwt.verify(token, jwtSecret);

const createPasswordResetToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    return {
        rawToken,
        hashedToken,
        expiresAt: Date.now() + 1000 * 60 * 30,
    };
};

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export {
    signToken,
    verifyToken,
    createPasswordResetToken,
    hashResetToken,
};
