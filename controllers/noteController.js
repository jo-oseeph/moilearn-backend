import Note from "../models/Note.js";
import cloudinary from "./../utils/cloudinary.js";
import { PDFDocument } from "pdf-lib";
import { v4 as uuid } from "uuid";



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

const files = req.files;

if (!files || files.length === 0)
return res.status(400).json({
message: "No files uploaded",
});

const mergedPdf = await PDFDocument.create();


// PROCESS EACH FILE
for (const file of files) {

let filePdf;

try {


// IMAGE → convert to PDF first
if (file.mimetype.startsWith("image/")) {

const imgPdfBytes =
await convertImageToPDF(
file.buffer,
file.mimetype
);

filePdf =
await PDFDocument.load(imgPdfBytes);

}


// PDF → load directly
else if (file.mimetype === "application/pdf") {

filePdf =
await PDFDocument.load(file.buffer);

}


else {

return res.status(400).json({
message:
"Only image and PDF allowed",
});

}


// copy pages
const pages =
await mergedPdf.copyPages(
filePdf,
filePdf.getPageIndices()
);

pages.forEach(page =>
mergedPdf.addPage(page)
);


}

catch (error) {

console.error(
"File processing error:",
error
);

return res.status(500).json({
message:
"Error processing uploaded file",
});

}

}



// FINAL MERGED PDF
const finalBuffer =
await mergedPdf.save();




// UPLOAD TO CLOUDINARY
const uploadStream =
cloudinary.uploader.upload_stream(
{
resource_type: "raw",
folder: `moilearn/${category}`,
public_id:
`${courseCode}_${uuid()}`,
format: "pdf",
},

async (error, result) => {

if (error) {

console.error(error);

return res.status(500).json({
message:
"Cloudinary upload failed",
});

}


const note = new Note({

uploader: req.user._id,

school,

year,

semester,

courseCode,

courseTitle,

category,

fileUrl:
result.secure_url,

mimeType:
"application/pdf",

});


await note.save();


return res.status(201).json({

message:
"Uploaded successfully",

note,

});

}

);


uploadStream.end(finalBuffer);


}

catch (err) {

console.error(err);

res.status(500).json({
message:
"Internal Server Error",
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
