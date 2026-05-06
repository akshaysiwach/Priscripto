import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const isCloudinaryConfigured = () =>
    Boolean(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY);

const removeTempFile = async (path) => {
    if (!path) return;
    try {
        await fs.unlink(path);
    } catch {
        // Multer temp cleanup is best effort only.
    }
};

const uploadProfileImage = async (imageFile) => {
    if (!imageFile) return null;

    if (isCloudinaryConfigured()) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        await removeTempFile(imageFile.path);
        return imageUpload.secure_url;
    }

    const imageBuffer = await fs.readFile(imageFile.path);
    await removeTempFile(imageFile.path);
    return `data:${imageFile.mimetype};base64,${imageBuffer.toString("base64")}`;
};

export { uploadProfileImage };
