import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// TEST CONNECTION
cloudinary.api.ping((error, result) => {

  if (error) {
    console.error("Cloudinary connection failed:", error);
  } else {
    console.log("Cloudinary connected successfully");
  }

});

export default cloudinary;
