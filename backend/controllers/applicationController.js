import Application from "../models/Application.js";
import { generateApplicationPdfBuffer } from "../services/pdfService.js";
import { sendApplicationEmail } from "../services/emailService.js";

function last4(value) {
  if (!value) return "";
  const s = String(value).replace(/\D/g, "");
  if (s.length < 4) return "";
  return s.slice(-4);
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj?.[k] ?? "";
  return out;
}

function sanitizeForPdf(applicationDoc) {
  const business = pick(applicationDoc.business, [
    "businessName",
    "dba",
    "address",
    "city",
    "state",
    "zip",
    "ein",
    "website",
    "startDate"
  ]);

  const owner = pick(applicationDoc.owner, [
    "ownerName",
    "ownerTitle",
    "ownership",
    "fico",
    "ownerAddress",
    "ownerCity",
    "ownerState",
    "ownerZip",
    "dob"
  ]);

  const partner = pick(applicationDoc.partner, [
    "partnerName",
    "partnerTitle",
    "partnerOwnership",
    "partnerDOB"
  ]);

  const signature = pick(applicationDoc.signature, ["signature", "signatureDate"]);

  const ownerSsnLast4 = last4(applicationDoc.owner?.ssn);
  const partnerSsnLast4 = last4(applicationDoc.partner?.partnerSSN);

  return {
    applicationId: String(applicationDoc._id),
    applicationNumber: applicationDoc.applicationNumber,
    createdAt: applicationDoc.createdAt,
    business,
    owner: { ...owner, ssnLast4: ownerSsnLast4 },
    partner: { ...partner, partnerSSNLast4: partnerSsnLast4 },
    signature
  };
}

export async function submitApplication(req, res) {
  try {
    const { business, owner, partner, signature } = req.body || {};
    if (Number(owner?.ownership) < 51) {
  if (!partner?.partnerName) {
    return res.status(400).json({
      ok: false,
      error: "Partner information required when ownership is below 51%"
    });
  }
}

    if (!business || !owner || !partner || !signature) {
      return res.status(400).json({
        ok: false,
        error: "Missing required objects: business, owner, partner, signature"
      });
    }

    const temp = new Application({
  business,
  owner,
  partner,
  signature
});

    const shortId = temp._id.toString().slice(-6);
    temp.applicationNumber = `SEA-${new Date().getFullYear()}-${shortId}`;
    const saved = await temp.save();

    console.log("Application saved:", saved.applicationNumber);

    const pdfData = sanitizeForPdf(saved);
    const pdfBuffer = await generateApplicationPdfBuffer(pdfData);

    await sendApplicationEmail({
      to: process.env.MAIL_TO,
      from: process.env.MAIL_FROM,
      subject: process.env.MAIL_SUBJECT,
      pdfBuffer,
      filename: `Seacap_Funding_Application_${pdfData.applicationNumber}.pdf`,
      meta: { applicationNumber: pdfData.applicationNumber, createdAt: pdfData.createdAt }
    });

    return res.json({
      ok: true,
      applicationId: pdfData.applicationId,
      applicationNumber: pdfData.applicationNumber
    });
  } catch (err) {
    console.error("submitApplication error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}

export async function getApplications(req, res) {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    return res.json({
      ok: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    console.error("getApplications error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

export async function getApplicationById(req, res) {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        ok: false,
        error: "Application not found"
      });
    }

    return res.json({
      ok: true,
      data: application
    });

  } catch (err) {
    console.error("getApplicationById error:", err);
    return res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
}