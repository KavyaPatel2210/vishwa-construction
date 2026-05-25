# Vishwa Construction Billing System

A complete production-ready MERN Stack PWA for construction invoice management.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (running locally or MongoDB Atlas)

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
```

### 3. Configure Environment
Edit `server/.env` and set your MongoDB connection:
```
MONGO_URI=mongodb://localhost:27017/vishwa_construction
JWT_SECRET=your_secret_key_here
```

### 4. Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
Backend runs on: http://localhost:5000

### 5. Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:5173

## Default Account Setup
On first signup, use these values (pre-filled):
- **Company**: Vishwa Construction
- **Contractor**: Rashminkumar R Patel
- **PAN**: BMVPP3612B
- **Address**: A-19, Avdhoot Nagar Society-1, Bholav, Bharuch-392001

## Features
- ✅ JWT Authentication (Signup/Login/Logout)
- ✅ Customer Management (Add/Edit/Delete/Search)
- ✅ Invoice Creation with auto bill numbering per customer
- ✅ PDF Download & Print
- ✅ WhatsApp Sharing
- ✅ Invoice History with filters
- ✅ Dashboard with stats
- ✅ GST Support toggle
- ✅ Dark Mode
- ✅ Profile Settings with Logo & Signature
- ✅ PWA (Install on mobile)
- ✅ Duplicate Invoice
- ✅ Paid/Pending status

## Tech Stack
- **Backend**: Node.js + Express + MongoDB + JWT
- **Frontend**: React + Vite + Tailwind CSS
- **PDF**: jsPDF + html2canvas
- **PWA**: vite-plugin-pwa
