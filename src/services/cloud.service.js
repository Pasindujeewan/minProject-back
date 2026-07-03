import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder,
      access_mode: "public",
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new ApiError(
      500,
      "Failed to upload file to Cloudinary",
      "CLOUDINARY_UPLOAD_ERROR",
    );
  }
};
