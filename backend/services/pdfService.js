import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Load logo as base64 at startup
// Logo 1 (dark green #3B645F) — crisp on white PDF backgrounds
// TO SWAP: drop a new SVG/PNG into assets/ and update the filename below
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, "../assets/seacap-logo.svg");
    const raw = fs.readFileSync(logoPath);
    const b64 = raw.toString("base64");
    const mime = logoPath.endsWith(".png") ? "image/png" : "image/svg+xml";
    return `data:${mime};base64,${b64}`;
  } catch (err) {
    console.warn("Logo not found, PDF will render without it:", err.message);
    return "";
  }
}

// ── Helpers
function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dt) {
  if (!dt) return "—";
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return String(dt);
  }
}

function fmt(v) {
  const s = String(v ?? "").trim();
  return s || "—";
}

function fieldRow(label, value) {
  return `
    <tr>
      <td class="f-label">${esc(label)}</td>
      <td class="f-value">${esc(fmt(value))}</td>
    </tr>`;
}

function fieldsTable(fields) {
  return `<table class="fields-table">${fields.map(f => fieldRow(f.label, f.value)).join("")}</table>`;
}

function section(title, bodyHtml, tinted = false) {
  return `
    <div class="section${tinted ? " section-tinted" : ""}">
      <div class="section-head">
        <div class="section-accent"></div>
        <span class="section-title">${title}</span>
      </div>
      <div class="section-body">${bodyHtml}</div>
    </div>`;
}

// ── Main HTML builder
function buildHtml(data, logoSrc) {
  const createdAt  = formatDate(data.createdAt);
  const hasPartner = Number(data.owner?.ownership ?? 100) < 51;
  const sigDate    = formatDate(data.signature?.signatureDate || data.signature?.date || new Date());
  const termsText  = process.env.PDF_TERMS_TEXT || "";

  const businessFields = [
    { label: "Legal Company Name",  value: data.business.businessName },
    { label: "Doing Business As",   value: data.business.dba },
    { label: "Business Address",    value: data.business.address },
    { label: "City",                value: data.business.city },
    { label: "State",               value: data.business.state },
    { label: "ZIP Code",            value: data.business.zip },
    { label: "Tax ID / EIN",        value: data.business.ein },
    { label: "Website",             value: data.business.website },
    { label: "Business Start Date", value: formatDate(data.business.startDate) },
    { label: "Advance Requested",   value: data.business.advanceAmount ? `$${Number(data.business.advanceAmount).toLocaleString()}` : "" },
  ];

  const ownerFields = [
    { label: "Full Name",     value: data.owner.ownerName },
    { label: "Title",         value: data.owner.ownerTitle },
    { label: "Ownership %",   value: data.owner.ownership ? `${data.owner.ownership}%` : "" },
    { label: "FICO Score",    value: data.owner.fico },
    { label: "Home Address",  value: data.owner.ownerAddress },
    { label: "City",          value: data.owner.ownerCity },
    { label: "State",         value: data.owner.ownerState },
    { label: "ZIP Code",      value: data.owner.ownerZip },
    { label: "Date of Birth", value: formatDate(data.owner.dob) },
    { label: "SSN (Last 4)",  value: data.owner.ssnLast4 ? `···· ${data.owner.ssnLast4}` : "" },
  ];

  const partnerFields = hasPartner ? [
    { label: "Partner Name",  value: data.partner.partnerName },
    { label: "Title",         value: data.partner.partnerTitle },
    { label: "Ownership %",   value: data.partner.partnerOwnership ? `${data.partner.partnerOwnership}%` : "" },
    { label: "Date of Birth", value: formatDate(data.partner.partnerDOB) },
    { label: "SSN (Last 4)",  value: data.partner.partnerSSNLast4 ? `···· ${data.partner.partnerSSNLast4}` : "" },
  ] : [];

  const applicantSig = data.signature?.applicant
    ? `<img src="${data.signature.applicant}" class="sig-img" alt="Applicant Signature" />`
    : `<div class="sig-empty">No signature captured</div>`;

  const partnerSig = hasPartner
    ? (data.signature?.partner
        ? `<img src="${data.signature.partner}" class="sig-img" alt="Partner Signature" />`
        : `<div class="sig-empty">No signature captured</div>`)
    : `<div class="sig-empty">Not applicable</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Seacap Funding Application — ${esc(data.applicationNumber)}</title>
  <style>
    /*
     * FONTS — Cormorant Garamond ≈ Beliau | DM Sans ≈ Canaro Book
     * These load from Google Fonts via Puppeteer on your machine (internet required).
     * TO SWAP to real fonts: replace @import with @font-face + base64 font data.
     */
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 10.5px;
      color: #0D2223;
      background: #fff;
      line-height: 1.6;
    }

    /* ── HEADER ── */
    .header {
      background: #195455;
      padding: 14px 18mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo { height: 30px; width: auto; }

    .header-right { text-align: right; }

    .header-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.02em;
    }

    .header-meta {
      font-size: 9px;
      color: #648F89;
      margin-top: 5px;
      letter-spacing: 0.03em;
    }

    .header-meta strong { color: #fff; font-weight: 500; }

    .badge {
      display: inline-block;
      background: rgba(0,0,0,0.2);
      color: #C7D8CD;
      font-size: 7px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 8px;
      vertical-align: middle;
    }

    /* ── GRADIENT STRIPE ── */
    .stripe {
      height: 3px;
      background: linear-gradient(to right, #195455, #648F89, #C7D8CD, transparent);
    }

    /* ── PAGE BODY ── */
    .page { padding: 14px 18mm 18mm 18mm; }

    /* ── INTRO ── */
    .intro {
      font-size: 9px;
      color: #648F89;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #C7D8CD;
      line-height: 1.6;
    }

    /* ── TWO-COL ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
    }

    /* ── SECTION ── */
    .section { margin-bottom: 12px; }

    .section-tinted {
      background: #EBF2F0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .section-head {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 7px;
    }

    .section-accent {
      width: 3px;
      height: 14px;
      background: #195455;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .section-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #195455;
    }

    /* ── FIELDS TABLE ── */
    .fields-table { width: 100%; border-collapse: collapse; }
    .fields-table tr { border-bottom: 1px solid #E0E8E6; }
    .fields-table tr:last-child { border-bottom: none; }

    .f-label {
      font-size: 8.5px;
      font-weight: 500;
      color: #648F89;
      padding: 4px 10px 4px 0;
      width: 40%;
      vertical-align: top;
      white-space: nowrap;
    }

    .f-value {
      font-size: 10px;
      font-weight: 400;
      color: #0D2223;
      padding: 4px 0;
    }

    /* ── DIVIDER ── */
    .divider { border: none; border-top: 1px solid #C7D8CD; margin: 10px 0; }

    /* ── TERMS ── */
    .terms-body {
      font-size: 8px;
      color: #648F89;
      line-height: 1.6;
      white-space: pre-wrap;
      padding: 10px 12px;
      background: #F4F8F7;
      border: 1px solid #C7D8CD;
      border-left: 3px solid #195455;
      border-radius: 4px;
    }

    /* ── SIGNATURES ── */
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 8px;
    }

    .sig-box {
      border: 1px solid #C7D8CD;
      border-top: 3px solid #195455;
      border-radius: 6px;
      padding: 10px 12px;
      background: #FAFCFC;
    }

    .sig-label {
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #648F89;
      margin-bottom: 6px;
    }

    .sig-img {
      width: 100%;
      max-height: 52px;
      object-fit: contain;
      object-position: left center;
    }

    .sig-empty {
      height: 42px;
      display: flex;
      align-items: center;
      font-size: 9px;
      color: #C7D8CD;
      font-style: italic;
    }

    .sig-date {
      font-size: 8.5px;
      color: #648F89;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #E0E8E6;
    }

    .sig-date strong { color: #0D2223; font-weight: 500; }

    /* ── FOOTER ── */
    .footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      padding: 7px 18mm;
      background: #195455;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.05em;
    }

    .footer-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 11px;
      font-weight: 600;
      color: #C7D8CD;
      letter-spacing: 0.12em;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    ${logoSrc ? `<img class="logo" src="${logoSrc}" alt="Seacap" />` : `<span style="color:#648F89;font-family:Georgia,serif;font-size:18px;font-weight:600;">SEACAP</span>`}
    <div class="header-right">
      <div class="header-title">Funding Application</div>
      <div class="header-meta">
        Application #: <strong>${esc(data.applicationNumber)}</strong>
        &nbsp;·&nbsp;
        Date: <strong>${createdAt}</strong>
        <span class="badge">Confidential</span>
      </div>
    </div>
  </div>

  <!-- Gradient stripe -->
  <div class="stripe"></div>

  <!-- Page body -->
  <div class="page">

    <div class="intro">
      Thank you for placing your trust in Seacap Business Funding. Please review the information below carefully — this document constitutes your official funding application.
    </div>

    <!-- Business + Owner -->
    <div class="two-col">
      ${section("Business Information", fieldsTable(businessFields))}
      ${section("Owner Information", fieldsTable(ownerFields))}
    </div>

    <!-- Partner (tinted background, only if ownership < 51%) -->
    ${hasPartner ? section("Partner Information", fieldsTable(partnerFields), true) : ""}

    <hr class="divider" />

    <!-- Terms -->
    ${termsText ? `
      ${section("Terms &amp; Authorization", `<div class="terms-body">${termsText.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>`)}
      <hr class="divider" />
    ` : ""}

    <!-- Signatures -->
    ${section("Digital Signatures", `
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-label">Applicant Signature</div>
          ${applicantSig}
          <div class="sig-date">Signed: <strong>${sigDate}</strong></div>
        </div>
        <div class="sig-box">
          <div class="sig-label">${hasPartner ? "Partner Signature" : "Partner Signature"}</div>
          ${partnerSig}
          ${hasPartner ? `<div class="sig-date">Signed: <strong>${sigDate}</strong></div>` : ""}
        </div>
      </div>
    `)}

  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-brand">SEACAP</span>
    <span>BUSINESS FUNDING APPLICATION</span>
    <span>${esc(data.applicationNumber)}</span>
  </div>

</body>
</html>`;
}

// ── Export
export async function generateApplicationPdfBuffer(data) {
  if (!data || !data.applicationNumber) {
    throw new Error("Invalid PDF data — missing applicationNumber");
  }

  const logoSrc = getLogoBase64();
  const html    = buildHtml(data, logoSrc);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Disable unnecessary resources to reduce PDF size and render time
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "media", "font"].includes(type) && !req.url().startsWith("data:")) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "20mm", left: "0" },
    });

    if (!buffer || buffer.length < 1000) {
      throw new Error("PDF generation produced an empty or invalid buffer");
    }

    console.log(`PDF generated: ${data.applicationNumber} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return buffer;

  } finally {
    await browser.close();
  }
}