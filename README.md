# Seacap Portal - Business Funding Application

A full-stack business funding application portal built for **SeacapUSA**. Applicants complete a multi-step form, digitally sign, and receive instant confirmation - while the Seacap team gets a branded PDF via email.

---

## Features

- **Multi-step application form** - Business, Owner, Partner, Signature
- **Smart routing** - Partner step only appears when ownership is below 51%
- **Floating label inputs** - Clean, modern UX matching Seacap brand
- **Draw signature** - Canvas-based digital signature pad (no typing)
- **US phone formatting** - Auto-formats to `(555) 123-4567` as you type
- **Email validation** - Inline error messages on blur
- **Animated loading + success screen** - Premium submission experience
- **PDF generation** - Branded two-column PDF with embedded signature images
- **Dual email system** - Company gets PDF attachment, applicant gets confirmation
- **MongoDB** - All applications stored with auto-generated application numbers

---

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Lucide React icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Puppeteer (PDF generation)
- Nodemailer (email delivery)

---

## Project Structure

```
seacap-portal/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Application.jsx       # Main page — stepper + routing
│   │   ├── components/
│   │   │   ├── Stepper.jsx           # Progress indicator
│   │   │   ├── BusinessForm.jsx      # Step 1
│   │   │   ├── OwnerForm.jsx         # Step 2
│   │   │   ├── PartnerForm.jsx       # Step 3 (conditional)
│   │   │   └── SignatureForm.jsx     # Step 4 — draw signature + submit
│   │   └── index.css                 # Global styles + Seacap brand tokens
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   └── applicationController.js  # Submit, get all, get by ID
│   ├── services/
│   │   ├── pdfService.js             # Puppeteer PDF generation
│   │   └── emailService.js           # Company + applicant emails
│   ├── models/
│   │   └── Application.js            # Mongoose schema
│   ├── routes/
│   │   └── applicationRoutes.js      # API routes
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   └── server.js                     # Express entry point
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Gmail or SMTP account for emails

### 1. Clone the repo

```bash
git clone https://github.com/bhavya-analytics-ai/seacap-portal.git
cd seacap-portal
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

MAIL_FROM="Seacap Portal <portal@seacapusa.com>"
MAIL_TO=company@seacapusa.com

PDF_TERMS_TEXT=Your terms and conditions text here...
```

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5001`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/application` | Submit a new application |
| `GET` | `/api/application` | Get all applications |
| `GET` | `/api/application/:id` | Get application by ID |

---

## Business Logic

- If **ownership % ≥ 51%** → Partner step is skipped
- If **ownership % < 51%** → Partner information is required
- SSN is stored but only **last 4 digits** appear in the PDF
- Signatures are captured as **base64 images** from canvas and embedded in the PDF
- Application numbers are auto-generated: `SEA-2026-XXXXXX`

---

## Email Flow

1. **Company email** — Sent to Seacap team with full PDF attached
2. **Applicant email** — Confirmation sent to the business email with application number and next steps

---

## Brand

Built to match the **Seacap brand guidelines**:
- Primary: `#195455` Sea Green
- Dark: `#0D2223` Slate
- Secondary: `#648F89` Ocean Mist
- Fonts: Cormorant Garamond (headings) · Outfit (body)

---

## License

Private — built for SeacapUSA. All rights reserved.
