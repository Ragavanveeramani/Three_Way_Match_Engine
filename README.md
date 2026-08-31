Three-Way Match Engine
An automated reconciliation system built to streamline accounts payable by performing automated three-way matching across Purchase Orders (PO), Goods Receipt Notes (GRN), and Invoices. The system parses uploaded document PDFs using Gemini AI, flags item discrepancies, and presents reconciliation statuses on an intuitive dashboard.

Key Features
AI-Powered Document Parsing: Automatically extracts metadata and line-item details from uploaded PDF documents.

Automated Reconciliation: Reconciles quantities and unit prices across POs, GRNs, and Invoices.

Line Item Discrepancy Grid: Highlights price mismatches and quantity overages/shortages with clear visual status indicators.

Interactive Document Viewer: Displays parsed metadata alongside embedded PDF previews for quick verification.

PO Search & Filter: Quick lookup by PO number to view real-time reconciliation progress and document histories.

Tech Stack
Frontend: Next.js (App Router), React, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

AI & Parsing: Gemini AI API

Authentication: JWT (Bearer token validation)

Project Structure
Three_Way_Match_Engine/
├── backend/            # Express REST API, Mongoose models, and matching engine logic
└── frontend/           # Next.js App Router UI
├── app/            # Dashboard page routing & layouts
└── components/     # DocumentTab, LineItemGrid, SummaryTab, FileUpload components

Getting Started
Prerequisites
Node.js (v18+ recommended)

MongoDB (running locally on mongodb://localhost:22222 or a MongoDB Atlas URI)

Backend Setup
Navigate to the backend directory:
cd backend

Install dependencies:
npm install

Create a .env file in the backend directory:
PORT=5000
MONGO_URI=mongodb://localhost:22222/three_way_match_db
GEMINI_API_KEY=your_gemini_api_key_here

Start the backend server:
npm start

Frontend Setup
Navigate to the frontend directory:
cd frontend

Install dependencies:
npm install

Create a .env.local file in the frontend directory:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

Run the development server:
npm run dev

Open http://localhost:3000 in your browser.

Workflow
Upload Documents: Use the upload form to attach PO, GRN, and Invoice PDFs.

Search PO: Enter a PO Number in the search bar to load document summaries and line-item details.

Inspect Mismatches: Switch tabs between Summary, Purchase Order, Delivery (GRN), and Invoices to review matching results and embedded PDF previews.