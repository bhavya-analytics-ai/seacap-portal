import puppeteer from "puppeteer";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(v) {
  const s = String(v ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt ?? "");
  }
}

function field(label, value) {
  return `
    <div class="row">
      <div class="row-label">${escapeHtml(label)}</div>
      <div class="row-value">${escapeHtml(value || "")}</div>
    </div>
  `;
}

function section(title, bodyHtml) {
  return `
    <div class="section">
      <div class="section-title">${escapeHtml(title)}</div>
      <div class="section-body">${bodyHtml}</div>
    </div>
  `;
}

function buildHtml(data) {

    const logoPath = path.join(__dirname, "../assets/seacap-logo.svg");

const headerLogo = `
<img class="logo" src="file://${logoPath}" alt="Seacap Logo" />
`;

  const termsText = process.env.PDF_TERMS_TEXT || "PASTE_TERMS_LATER";
  console.log("PDF_TERMS_TEXT:", process.env.PDF_TERMS_TEXT);
  const createdAt = formatDate(data.createdAt);

  const businessGrid = `
    <div class="grid">
      ${field("Business Name", data.business.businessName)}
      ${field("DBA", data.business.dba)}
      ${field("Address", data.business.address)}
      ${field("City", data.business.city)}
      ${field("State", data.business.state)}
      ${field("Zip", data.business.zip)}
      ${field("EIN", data.business.ein)}
      ${field("Website", data.business.website)}
      ${field("Business Start Date", data.business.startDate)}
    </div>
  `;

  const ownerGrid = `
    <div class="grid">
      ${field("Owner Name", data.owner.ownerName)}
      ${field("Title", data.owner.ownerTitle)}
      ${field("Ownership %", data.owner.ownership)}
      ${field("FICO", data.owner.fico)}
      ${field("Owner Address", data.owner.ownerAddress)}
      ${field("Owner City", data.owner.ownerCity)}
      ${field("Owner State", data.owner.ownerState)}
      ${field("Owner Zip", data.owner.ownerZip)}
      ${field("DOB", data.owner.dob)}
      ${field("SSN (Last 4)", data.owner.ssnLast4)}
    </div>
  `;

  
  const partnerGrid = `
    <div class="grid">
      ${field("Partner Name", data.partner.partnerName)}
      ${field("Title", data.partner.partnerTitle)}
      ${field("Ownership %", data.partner.partnerOwnership)}
      ${field("Partner DOB", data.partner.partnerDOB)}
      ${field("Partner SSN (Last 4)", data.partner.partnerSSNLast4)}
    </div>
  `;
  const partnerSection =
  Number(data.owner.ownership) < 51
    ? section("Partner Information", partnerGrid)
    : "";

  const signatureBlock = `
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signature</div>

      <div class="signature-row">
        <div>
          <div class="line"></div>
          <div class="line-label">Printed Name</div>
        </div>

        <div>
          <div class="line"></div>
          <div class="line-label">Date</div>
        </div>
      </div>
    </div>

    <div class="terms">
      <div class="terms-title">Terms & Conditions</div>
      <div class="terms-text">${escapeHtml(termsText)}</div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Seacap Funding Application</title>

        <style>
          @page {
            size: A4;
            margin: 18mm;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #111;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 18px;
          }

          .logo {
  height: 40px;
  width: auto;
}

          .logo-text {
            font-size: 24px;
            font-weight: 700;
          }

          .title-wrap {
            text-align: right;
          }

          .title {
            font-size: 22px;
            font-weight: 700;
          }

          .meta {
            font-size: 11px;
            margin-top: 4px;
          }

          .section {
            margin-top: 16px;
          }

          .section-title {
            font-weight: 700;
            background: #f1f1f1;
            border: 1px solid #000;
            padding: 8px 10px;
          }

          .section-body {
            border: 1px solid #000;
            border-top: none;
            padding: 12px;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 20px;
          }

          .row {
            display: flex;
            border-bottom: 1px solid #ddd;
            padding: 4px 0;
          }

          .row-label {
            width: 45%;
            font-weight: 600;
            color: #333;
          }

          .row-value {
            width: 55%;
          }

          .signature-box {
            margin-top: 20px;
          }

          .signature-line {
            border-bottom: 2px solid #000;
            height: 30px;
          }

          .signature-label {
            font-size: 11px;
            margin-top: 4px;
            margin-bottom: 18px;
          }

          .signature-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .line {
            border-bottom: 1px solid #000;
            height: 20px;
          }

          .line-label {
            font-size: 11px;
            margin-top: 4px;
          }

          .terms {
            margin-top: 20px;
            border: 1px solid #000;
          }

          .terms-title {
            background: #f1f1f1;
            padding: 8px 10px;
            font-weight: 700;
            border-bottom: 1px solid #000;
          }

          .terms-text {
            padding: 10px;
            font-size: 9px;
            line-height: 1.3;
            white-space: pre-wrap;
          }

          .footer-note {
            margin-top: 16px;
            font-size: 10px;
            color: #555;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div>${headerLogo}</div>

          <div class="title-wrap">
            <div class="title">Funding Application</div>
            <div class="meta">
              <div><b>Application #:</b> ${escapeHtml(data.applicationNumber)}</div>
              <div><b>Created:</b> ${escapeHtml(createdAt)}</div>
            </div>
          </div>
        </div>

        ${section("Business Information", businessGrid)}
        ${section("Owner Information", ownerGrid)}
        ${partnerSection}
        ${section("Terms & Signature", signatureBlock)}

        <div class="footer-note">
          Email and phone numbers are intentionally excluded from this PDF.
        </div>
      </body>
    </html>
  `;
}

export async function generateApplicationPdfBuffer(data) {
  const html = buildHtml(data);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "18mm",
        right: "18mm",
        bottom: "18mm",
        left: "18mm",
      },
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
