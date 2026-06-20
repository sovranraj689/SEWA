import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const REQUIRED_ENV = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `\n❌ CLOUDINARY CONFIG ERROR — missing env vars: ${missing.join(", ")}\n` +
    `   Set these in Render → your backend service → Environment tab.\n`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const designStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "swatiarts/designs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
  },
});

const orderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "swatiarts/orders",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    transformation: [{ width: 1200, quality: "auto" }],
  },
});

export const uploadDesignImage = multer({
  storage: designStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadOrderImage = multer({
  storage: orderStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export { cloudinary };