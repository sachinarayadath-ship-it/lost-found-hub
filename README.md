# LostFound+

LostFound+ is a centralized digital platform for reporting, tracking, and recovering lost and found items within a community or organization. Built with a React frontend and Node.js / Express.js / MongoDB backend.

## Tech Stack
- **Frontend**: React, Vite, Redux Toolkit, React Router, Axios, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, Multer file upload

## Features
- **User Roles**: Regular User and Admin/Moderator
- **Home & Landing Page**: Hero section, quick stats, search bar, CTA buttons for reporting items
- **Authentication**: JWT-based login/register with bcrypt password hashing
- **Browse & Search**: Grid/list of items, search bar, category & location filters, pagination
- **Item Details**: Full item info, status badge, claim submission, discussion threads
- **User Dashboard**: My Reports and My Claims tracking
- **Notifications**: System and status updates
- **Admin Panel**: Moderation queue, user management, MongoDB aggregation analytics

## Running Locally

### 1. Backend Setup
```bash
cd server
npm install
node seed.js
npm run dev
```
The Express backend will run on `http://localhost:5000/api`.

### 2. Frontend Setup
```bash
npm install
npm run dev
```
The React frontend will run on `http://localhost:5173`.
