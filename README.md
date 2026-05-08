# Moilearn Backend

## Description

Moilearn is a full-stack academic resource sharing platform built to help university students access past papers, notes, and learning materials in a fast, organized, and scalable way.

The platform currently focuses on Moi University and allows students to upload, preview, search, and download academic resources while administrators manage approvals and moderation.

## Features
Student Features
Upload past papers 
Upload multiple files at once
Support for:
PDF
Images 
Search notes by:
Course code
Course title
School
Exam year
Preview notes before downloading
Download notes
View download and preview counts
Authentication and authorization
Personal uploads tracking

## Admin Features
Admin dashboard
Approve uploaded notes
Reject notes
Delete notes permanently
Preview pending notes before approval
Manage approved/rejected/pending resources
View platform statistics


## Tech Stack

## Frontend
React.js
React Router
CSS3
React Icons
Lucide React

## Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
File & Cloud Services
Cloudinary
Multer
PDF-lib

## Deployment
Vercel (Frontend)
Render (Backend)
MongoDB Atlas

## Project Structure
moilearn/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── config/
│
└── README.md
## Authentication

Moilearn uses JWT-based authentication with role-based authorization.
Roles include:
User
Admin

Protected routes ensure secure access to uploads, moderation, and admin operations.

##  Installation & Setup
1. Clone Repository
git clone....
cd moilearn
2. Install Dependencies
Frontend
cd frontend
npm install
Backend
cd backend
npm install
⚙️ Environment Variables

Create a .env file inside the backend directory.

PORT=5000

MONGO_URI=...

JWT_SECRET=...

CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=....
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

## Running the Project
Backend
npm run server
Frontend
npm start

## API Routes
Notes Routes
GET	/api/notes	Get approved notes
POST	/api/notes/upload	Upload note
GET	/api/notes/:id/download	Download note
GET	/api/notes/:id/preview	Preview note
GET	/api/notes/my-uploads	Get user uploads

## Admin Routes

GET	/api/admin/notes/pending	Pending notes
PUT	/api/admin/notes/:id/approve	Approve note
PUT	/api/admin/notes/:id/reject	Reject note
DELETE	/api/admin/notes/:id	Delete note
GET	/api/admin/dashboard	Dashboard stats

## Current Goals
Expand beyond Moi University
AI-powered smart uploads
OCR extraction for automatic metadata detection
AI search and recommendations
Advanced analytics dashboard
Mobile app integration 

## Future AI Features

Planned AI integrations include:

Automatic course code detection
OCR text extraction from uploaded papers
Smart categorization
AI-powered search
Recommended resources
Summarization of notes
Similar paper suggestions

## Deployment
Frontend

Deployed on Vercel

Backend

Deployed on Render

Database

MongoDB Atlas

## Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

fork -> clone -> create branch -> commit -> push -> pull request

## Developer

Joseph Situma
Full Stack MERN Developer

JavaScript
React.js
Node.js
MongoDB
Express.js