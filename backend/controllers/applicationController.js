import Application from "../models/Application.js";
import { generateApplicationPdfBuffer } from "../services/pdfService.js";
import { sendApplicationEmail, sendApplicantConfirmationEmail } from "../services/emailService.js";

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
    "businessName", "dba", "address", "city", "state", "zip",
    "ein", "website", "startDate", "advanceAmount"
  ]);

  const owner = pick(applicationDoc.owner, [
    "ownerName", "ownerTitle", "ownership", "fico",
    "ownerAddress", "ownerCity", "ownerState", "ownerZip", "dob"
  ]);

  // ── Fix: frontend sends partner.name, partner.title etc
  // normalize to partnerName, partnerTitle etc for PDF
  const partner = {
    partnerName:      applicationDoc.partner?.name      || applicationDoc.partner?.partnerName      || "",
    partnerTitle:     applicationDoc.partner?.title     || applicationDoc.partner?.partnerTitle     || "",
    partnerOwnership: applicationDoc.partner?.ownership || applicationDoc.partner?.partnerOwnership || "",
    partnerDOB:       applicationDoc.partner?.dob       || applicationDoc.partner?.partnerDOB       || "",
  };

  const signature = pick(applicationDoc.signature, ["applicant", "partner", "signatureDate", "date"]);

  const ownerSsnLast4   = last4(applicationDoc.owner?.ssn);
  const partnerSsnLast4 = last4(applicationDoc.partner?.ssn || applicationDoc.partner?.partnerSSN);

  return {
    applicationId:     String(applicationDoc._id),
    applicationNumber: applicationDoc.applicationNumber,
    createdAt:         applicationDoc.createdAt,
    business,
    owner:   { ...owner,   ssnLast4:       ownerSsnLast4 },
    partner: { ...partner, partnerSSNLast4: partnerSsnLast4 },
    signature,
  };
}

export async function submitApplication(req, res) {
  try {
    const { business, owner, partner, signature } = req.body || {};

    if (!business || !owner || !signature) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: business, owner, signature"
      });
    }

    // ── Partner required if ownership < 51%
    // frontend sends partner.name so check both variants
    const ownershipPct = Number(owner?.ownership);
    if (ownershipPct < 51) {
      const hasPartnerName = partner?.name || partner?.partnerName;
      if (!hasPartnerName) {
        return res.status(400).json({
          ok: false,
          error: "Partner information is required when ownership is below 51%"
        });
      }
    }

    const temp = new Application({ business, owner, partner: partner || {}, signature });
    const shortId = temp._id.toString().slice(-6);
    temp.applicationNumber = `SEA-${new Date().getFullYear()}-${shortId.toUpperCase()}`;
    const saved = await temp.save();

    console.log("Application saved:", saved.applicationNumber);

    const pdfData   = sanitizeForPdf(saved);
    const pdfBuffer = await generateApplicationPdfBuffer(pdfData);
    const filename  = `Seacap_Funding_Application_${pdfData.applicationNumber}.pdf`;

    // ── Email 1: Company notification with PDF
    await sendApplicationEmail({
      to:        process.env.MAIL_TO,
      from:      process.env.MAIL_FROM,
      subject:   `New Funding Application — ${pdfData.applicationNumber}`,
      pdfBuffer,
      filename,
      meta: {
        applicationNumber: pdfData.applicationNumber,
        createdAt:         pdfData.createdAt,
        businessName:      business.businessName || "",
      }
    });

    // ── Email 2: Applicant confirmation (if email provided)
    if (business.email) {
      await sendApplicantConfirmationEmail({
        to:                business.email,
        from:              process.env.MAIL_FROM,
        applicantName:     owner.name || owner.ownerName || "Applicant",
        businessName:      business.businessName || "",
        applicationNumber: pdfData.applicationNumber,
      });
    }

    return res.json({
      ok:                true,
      applicationId:     pdfData.applicationId,
      applicationNumber: pdfData.applicationNumber,
    });

  } catch (err) {
    console.error("submitApplication error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}

export async function getApplications(req, res) {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    return res.json({ ok: true, count: applications.length, data: applications });
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
      return res.status(404).json({ ok: false, error: "Application not found" });
    }
    return res.json({ ok: true, data: application });
  } catch (err) {
    console.error("getApplicationById error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
