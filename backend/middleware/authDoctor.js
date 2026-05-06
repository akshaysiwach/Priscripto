import { verifyToken } from "../utils/auth.js";

const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.json({ success: false, message: "Not authorized. Login again." });
        }

        const tokenDecode = verifyToken(dtoken);
        if (tokenDecode.role !== "doctor") {
            return res.json({ success: false, message: "Doctor access only" });
        }

        req.body.docId = tokenDecode.id;
        req.doctor = tokenDecode;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authDoctor;
