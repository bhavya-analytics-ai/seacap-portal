# Seacap Funding Application Portal — Backend

## Overview

This backend powers the Seacap funding application portal.

It receives application data from the frontend, stores it in MongoDB, generates a PDF funding application document, and emails the PDF to the company.

The backend also exposes API endpoints to retrieve submitted applications.

---

# Tech Stack

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| Node.js       | Backend runtime           |
| Express.js    | API framework             |
| MongoDB Atlas | Database                  |
| Mongoose      | MongoDB ORM               |
| Puppeteer     | PDF generation            |
| Nodemailer    | Email delivery            |
| dotenv        | Environment configuration |

---

# Project Structure

```
backend
│
├── config
│   └── db.js
│
├── controllers
│   └── applicationController.js
│
├── models
│   └── Application.js
│
├── routes
│   └── applicationRoutes.js
│
├── services
│   ├── pdfService.js
│   └── emailService.js
│
├── assets
│   └── seacap-logo.svg
│
├── server.js
└── .env
```

---

# System Architecture

```
Frontend Form
      │
      ▼
POST /api/application
      │
      ▼
Backend Controller
      │
      ├── MongoDB Save
      │
      ├── PDF Generation (Puppeteer)
      │
      └── Email Sending (Nodemailer)
      │
      ▼
Company receives application PDF
```

---

# Core Features

## Application Submission

Applications are submitted through:

```
POST /api/application
```

The backend performs the following steps:

1. Validate request body
2. Generate application number
3. Save application to MongoDB
4. Generate funding application PDF
5. Send PDF via email
6. Return API response

Example response:

```json
{
  "ok": true,
  "applicationId": "69aa2c203a1f7843ac771906",
  "applicationNumber": "SEA-2026-00028"
}
```

---

# Application Number System

Each submission generates a human-readable number.

Example:

```
SEA-2026-00001
SEA-2026-00002
SEA-2026-00003
```

Format:

```
SEA-{YEAR}-{SEQUENCE}
```

This makes applications easier to reference compared to MongoDB IDs.

---

# Conditional Partner Logic

The partner section appears only when ownership is below 51%.

Rule:

```
Ownership < 51 → Partner Information Required
Ownership ≥ 51 → Partner Section Hidden
```

This logic is enforced in the PDF generation.

---

# PDF Generation

PDF applications are generated using Puppeteer.

The PDF includes:

* Business Information
* Owner Information
* Partner Information (conditional)
* Terms and Signature

Security considerations:

* Email and phone numbers are **not included in the PDF**
* Only the **last 4 digits of SSN** are displayed

---

# Email Automation

Once the PDF is generated, the system sends an email with the PDF attached.

Development mode uses **Ethereal email preview links**.

Example attachment:

```
Seacap_Funding_Application_SEA-2026-00028.pdf
```

---

# API Endpoints

| Method | Endpoint               | Description                     |
| ------ | ---------------------- | ------------------------------- |
| POST   | `/api/application`     | Submit funding application      |
| GET    | `/api/applications`    | Retrieve all applications       |
| GET    | `/api/application/:id` | Retrieve a specific application |

---

# Example API Usage

### Get all applications

```
GET /api/applications
```

Response:

```json
{
  "ok": true,
  "count": 28,
  "data": [...]
}
```

---

### Get one application

```
GET /api/application/:id
```

Example:

```
GET /api/application/69aa2c203a1f7843ac771906
```

---

# Environment Variables

Example `.env` configuration:

```
MONGO_URI=your_mongodb_connection

MAIL_TO=example@email.com
MAIL_FROM="Seacap Portal <portal@seacap.com>"
MAIL_SUBJECT=New Seacap Funding Application Submitted

PDF_TERMS_TEXT=Funding application terms and conditions text
```

---

# Running the Backend

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Server runs at:

```
http://localhost:5001
```

---

# Backend Workflow

```
Frontend Form
     │
     ▼
POST /api/application
     │
     ▼
MongoDB Save
     │
     ▼
PDF Generation
     │
     ▼
Email Delivery
     │
     ▼
API Response
```

---

# Current Status

The backend currently supports:

✔ Application submission
✔ MongoDB storage
✔ Conditional partner logic
✔ Human-readable application numbers
✔ PDF generation
✔ Email delivery
✔ Application retrieval endpoints


git checkout v1.0-stable