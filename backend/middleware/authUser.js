import { verifyToken } from "../utils/auth.js";

const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not authorized. Login again." });
        }

        const tokenDecode = verifyToken(token);
        if (tokenDecode.role !== "patient") {
            return res.json({ success: false, message: "Patient access only" });
        }

        req.body.userId = tokenDecode.id;
        req.user = tokenDecode;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authUser;
