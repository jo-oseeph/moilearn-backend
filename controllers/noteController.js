import Note from "../models/Note.js";
import cloudinary from "./../utils/cloudinary.js";
import { PDFDocument } from "pdf-lib";
import { v4 as uuid } from "uuid";


// helper function
// converts image buffer to PDF buffer
const convertImageToPDF = async (imageBuffer, mimetype) => {

  const pdfDoc = await PDFDocument.create();

  let image;

  // detect type
  if (mimetype === "image/png") {
    image = await pdfDoc.embedPng(imageBuffer);
  } else {
    image = await pdfDoc.embedJpg(imageBuffer);
  }

  const page = pdfDoc.addPage([image.width, image.height]);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;

};




// Upload note or past paper
export const uploadNote = async (req, res) => {

  try {

    const {
      school,
      year,
      semester,
      courseCode,
      courseTitle,
      category,
    } = req.body;

    const file = req.file;

    if (!file)
      return res.status(400).json({
        message: "No file uploaded",
      });



    let finalBuffer;
    let finalMime = "application/pdf";



    // LOGIC 1
    // if uploaded file is image → convert to pdf

    if (file.mimetype.startsWith("image/")) {

      finalBuffer = await convertImageToPDF(
        file.buffer,
        file.mimetype
      );

    }


    // LOGIC 2
    // if already pdf → use as is

    else if (file.mimetype === "application/pdf") {

      finalBuffer = file.buffer;

    }

    else {

      return res.status(400).json({
        message: "Only image or PDF allowed",
      });

    }




    // upload to cloudinary

    const uploadResult =
      await cloudinary.uploader.upload_stream(
        {

          resource_type: "raw",

          folder: `moilearn/${category}`,

          public_id: `${courseCode}_${uuid()}`,

          format: "pdf",

        },


        async (error, result) => {

          if (error)
            return res.status(500).json({
              message: "Cloudinary upload failed",
            });



          // save in mongodb

          const note = new Note({

            uploader: req.user._id,

            school,

            year,

            semester,

            courseCode,

            courseTitle,

            category,

            fileUrl: result.secure_url,

            mimeType: finalMime,

          });

          await note.save();



          return res.status(201).json({

            message: "Uploaded successfully",

            note,

          });

        }

      );



    uploadResult.end(finalBuffer);



  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Internal Server Error",
    });

  }

};




// Download

import fetch from "node-fetch"; // make sure to install: npm i node-fetch@2

export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note || note.status !== "approved")
      return res.status(404).json({ message: "File not found" });

    // Increment download count
    note.downloadsCount += 1;
    await note.save();

    // Fetch the file from Cloudinary
    const response = await fetch(note.fileUrl);

    if (!response.ok)
      return res.status(500).json({ message: "Failed to fetch file from storage" });

    const buffer = await response.buffer(); // get file as buffer

    // Extract clean filename
    const filename = `${note.courseCode}_${note.courseTitle}.pdf`.replace(/\s+/g, "_");

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", note.mimeType || "application/pdf");
    res.setHeader("Content-Length", buffer.length);

    // Send file buffer to frontend
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




// preview

export const previewNote = async (req, res) => {

  try {

    const note = await Note.findById(req.params.id);

    if (!note || note.status !== "approved")
      return res.status(404).json({
        message: "File not found",
      });



    return res.redirect(note.fileUrl);

  }

  catch {

    res.status(500).json({
      message: "Internal Server Error",
    });

  }

};




// remaining functions unchanged


export const getApprovedNotes = async (req, res) => {

  const notes =
    await Note.find({
      status: "approved",
    });

  res.json(notes);

};



export const getMyUploads = async (req, res) => {

  const notes =
    await Note.find({
      uploader: req.user._id,
    });

  res.json(notes);

};
