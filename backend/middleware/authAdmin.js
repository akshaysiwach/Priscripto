import { verifyToken } from "../utils/auth.js";

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: "Not authorized. Login again." });
        }

        const tokenDecode = verifyToken(atoken);
        if (tokenDecode.role !== "admin") {
            return res.json({ success: false, message: "Admin access only" });
        }

        req.admin = tokenDecode;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authAdmin;
