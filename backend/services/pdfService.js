import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function esc(v) {
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
    return new Date(dt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  } catch { return String(dt ?? ""); }
}

// Single field row — label left, value right
function row(label, value) {
  const val = esc(value || "—");
  return `
    <tr>
      <td class="f-label">${esc(label)}</td>
      <td class="f-value">${val}</td>
    </tr>
  `;
}

// Section with teal accent bar
function section(title, bodyHtml) {
  return `
    <div class="section">
      <div class="section-head">
        <div class="section-accent"></div>
        <span class="section-title">${esc(title)}</span>
      </div>
      <div class="section-body">${bodyHtml}</div>
    </div>
  `;
}

// Two-column table of fields
function twoColTable(fields) {
  // fields = array of {label, value}
  // pair them up into rows of 2
  const rows = []
  for (let i = 0; i < fields.length; i += 2) {
    const a = fields[i]
    const b = fields[i + 1]
    rows.push(`
      <tr>
        <td class="f-label">${esc(a.label)}</td>
        <td class="f-value">${esc(a.value || "—")}</td>
        ${b ? `<td class="f-label">${esc(b.label)}</td><td class="f-value">${esc(b.value || "—")}</td>` : `<td></td><td></td>`}
      </tr>
    `)
  }
  return `<table class="fields-table">${rows.join("")}</table>`
}

function buildHtml(data) {
  const logoPath   = path.join(__dirname, "../assets/seacap-logo.svg");
  const logoSrc    = `file://${logoPath}`;
  const termsText  = process.env.PDF_TERMS_TEXT || "";
  const createdAt  = formatDate(data.createdAt);
  const hasPartner = Number(data.owner.ownership) < 51;

  // ── Business fields
  const businessFields = [
    { label: "Legal Company Name",   value: data.business.businessName },
    { label: "Doing Business As",    value: data.business.dba },
    { label: "Address",              value: data.business.address },
    { label: "City",                 value: data.business.city },
    { label: "State",                value: data.business.state },
    { label: "Zip",                  value: data.business.zip },
    { label: "Tax ID / EIN",         value: data.business.ein },
    { label: "Website",              value: data.business.website },
    { label: "Business Start Date",  value: data.business.startDate },
    { label: "Advance Requested",    value: data.business.advanceAmount ? `$${Number(data.business.advanceAmount).toLocaleString()}` : "" },
  ]

  // ── Owner fields
  const ownerFields = [
    { label: "Full Name",        value: data.owner.ownerName },
    { label: "Title",            value: data.owner.ownerTitle },
    { label: "Ownership %",      value: data.owner.ownership ? `${data.owner.ownership}%` : "" },
    { label: "FICO Score",       value: data.owner.fico },
    { label: "Address",          value: data.owner.ownerAddress },
    { label: "City",             value: data.owner.ownerCity },
    { label: "State",            value: data.owner.ownerState },
    { label: "Zip",              value: data.owner.ownerZip },
    { label: "Date of Birth",    value: data.owner.dob },
    { label: "SSN (Last 4)",     value: data.owner.ssnLast4 ? `···· ${data.owner.ssnLast4}` : "" },
  ]

  // ── Partner fields
  const partnerFields = hasPartner ? [
    { label: "Partner Name",     value: data.partner.partnerName },
    { label: "Title",            value: data.partner.partnerTitle },
    { label: "Ownership %",      value: data.partner.partnerOwnership ? `${data.partner.partnerOwnership}%` : "" },
    { label: "Date of Birth",    value: data.partner.partnerDOB },
    { label: "SSN (Last 4)",     value: data.partner.partnerSSNLast4 ? `···· ${data.partner.partnerSSNLast4}` : "" },
  ] : []

  // ── Signature image (base64 from canvas)
  const sigImg = data.signature?.applicant
    ? `<img src="${data.signature.applicant}" class="sig-img" alt="Signature" />`
    : `<div class="sig-empty">No signature captured</div>`

  const partnerSigImg = hasPartner && data.signature?.partner
    ? `<img src="${data.signature.partner}" class="sig-img" alt="Partner Signature" />`
    : hasPartner ? `<div class="sig-empty">No signature captured</div>` : ""

  const sigDate = data.signature?.signatureDate
    ? formatDate(data.signature.signatureDate)
    : formatDate(new Date())

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Seacap Funding Application — ${esc(data.applicationNumber)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

    @page {
      size: A4;
      margin: 14mm 16mm;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.5;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 2px solid #195455;
    }

    .logo { height: 36px; width: auto; }

    .header-right { text-align: right; }

    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: #195455;
      letter-spacing: -0.3px;
    }

    .header-meta {
      font-size: 10px;
      color: #648F89;
      margin-top: 3px;
    }

    .header-meta span { font-weight: 600; color: #0D2223; }

    /* ── Intro line ── */
    .intro {
      font-size: 10.5px;
      color: #648F89;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E8EDEC;
    }

    /* ── Two-column layout for Business + Owner ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    /* ── Section ── */
    .section {
      margin-bottom: 14px;
    }

    .section-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .section-accent {
      width: 3px;
      height: 14px;
      background-color: #195455;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #195455;
    }

    /* ── Fields table ── */
    .fields-table {
      width: 100%;
      border-collapse: collapse;
    }

    .fields-table tr {
      border-bottom: 1px solid #EEF2F2;
    }

    .fields-table tr:last-child {
      border-bottom: none;
    }

    .f-label {
      font-size: 9.5px;
      font-weight: 500;
      color: #648F89;
      padding: 5px 10px 5px 0;
      width: 26%;
      vertical-align: top;
      white-space: nowrap;
    }

    .f-value {
      font-size: 10.5px;
      font-weight: 400;
      color: #0D2223;
      padding: 5px 16px 5px 0;
      width: 24%;
    }

    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px solid #E8EDEC;
      margin: 14px 0;
    }

    /* ── Signature section ── */
    .sig-section {
      margin-bottom: 14px;
    }

    .sig-grid {
      display: grid;
      grid-template-columns: ${hasPartner ? "1fr 1fr" : "1fr"};
      gap: 20px;
      margin-top: 10px;
    }

    .sig-box {
      border: 1px solid #E0E6E5;
      border-radius: 6px;
      padding: 10px 12px;
      background: #FAFCFC;
    }

    .sig-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8A9E9C;
      margin-bottom: 6px;
    }

    .sig-img {
      width: 100%;
      max-height: 60px;
      object-fit: contain;
      object-position: left center;
    }

    .sig-empty {
      height: 50px;
      display: flex;
      align-items: center;
      font-size: 10px;
      color: #C7D8CD;
      font-style: italic;
    }

    .sig-date {
      font-size: 9.5px;
      color: #648F89;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #E8EDEC;
    }

    .sig-date span { font-weight: 600; color: #0D2223; }

    /* ── Terms ── */
    .terms-section {
      margin-top: 14px;
    }

    .terms-body {
      font-size: 8.5px;
      color: #648F89;
      line-height: 1.6;
      white-space: pre-wrap;
      padding: 10px 12px;
      background: #F7FAFA;
      border: 1px solid #E8EDEC;
      border-radius: 6px;
      margin-top: 8px;
    }

    /* ── Footer ── */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px 16mm;
      border-top: 1px solid #E8EDEC;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #B0BBBA;
      background: #fff;
    }

    .footer-brand { font-weight: 600; color: #195455; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="Seacap" />
    <div class="header-right">
      <div class="header-title">Funding Application</div>
      <div class="header-meta">
        Application #: <span>${esc(data.applicationNumber)}</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Date: <span>${createdAt}</span>
      </div>
    </div>
  </div>

  <!-- Intro -->
  <div class="intro">
    Thank you for placing your trust in Seacap. Please review the information below carefully before signing.
  </div>

  <!-- Business + Owner side by side -->
  <div class="two-col">
    ${section("Business Information", twoColTable(businessFields))}
    ${section("Owner Information", twoColTable(ownerFields))}
  </div>

  <!-- Partner (conditional) -->
  ${hasPartner ? section("Partner Information", twoColTable(partnerFields)) : ""}

  <hr class="divider" />

  <!-- Terms -->
  ${termsText ? `
    <div class="terms-section">
      ${section("Terms of Use", `<div class="terms-body">${esc(termsText)}</div>`)}
    </div>
    <hr class="divider" />
  ` : ""}

  <!-- Digital Signatures -->
  <div class="sig-section">
    ${section("Digital Signature", `
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-label">Applicant Signature</div>
          ${sigImg}
          <div class="sig-date">Date: <span>${sigDate}</span></div>
        </div>
        ${hasPartner ? `
        <div class="sig-box">
          <div class="sig-label">Partner Signature</div>
          ${partnerSigImg}
          <div class="sig-date">Date: <span>${sigDate}</span></div>
        </div>` : ""}
      </div>
    `)}
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-brand">SEACAP</span>
    <span>FUNDING APPLICATION</span>
    <span>Confidential — ${esc(data.applicationNumber)}</span>
  </div>

</body>
</html>`
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
      margin: { top: "14mm", right: "16mm", bottom: "18mm", left: "16mm" },
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
