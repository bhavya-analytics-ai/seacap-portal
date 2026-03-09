import Application from "../models/Application.js";
import { generateApplicationPdfBuffer } from "../services/pdfService.js";
import { sendApplicationEmail, sendApplicantConfirmationEmail } from "../services/emailService.js";

// ─────────────────────────────────────────────────────────────────
// SUPABASE UPLOAD STUB
// ─────────────────────────────────────────────────────────────────
// STEP 1: Create a free account at https://supabase.com
// STEP 2: Create a new project, then go to Storage → Create a bucket
//         Name it: seacap-applications (or whatever you want)
// STEP 3: Go to Project Settings → API
//         Copy "Project URL"      → paste as SUPABASE_URL in .env
//         Copy "anon public" key  → paste as SUPABASE_ANON_KEY in .env
//         Set bucket name         → SUPABASE_BUCKET=seacap-applications in .env
// STEP 4: Run: npm install @supabase/supabase-js
// STEP 5: Uncomment the import and the upload block below
// ─────────────────────────────────────────────────────────────────
// import { createClient } from "@supabase/supabase-js";

async function uploadToSupabase(pdfBuffer, filename) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_BUCKET) {
    console.log("Supabase not configured — skipping upload");
    return null;
  }
  try {
    // Uncomment when ready:
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // const { data, error } = await supabase.storage
    //   .from(SUPABASE_BUCKET)
    //   .upload(`applications/${filename}`, pdfBuffer, {
    //     contentType: "application/pdf",
    //     upsert: false,
    //   });
    // if (error) throw error;
    // console.log("Supabase upload success:", data.path);
    // return data.path;
    console.log("Supabase credentials found but SDK not yet installed — skipping");
    return null;
  } catch (err) {
    console.warn("Supabase upload failed (non-fatal):", err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// ONEDRIVE UPLOAD STUB
// ─────────────────────────────────────────────────────────────────
// STEP 1: Go to https://portal.azure.com
// STEP 2: Search "App registrations" → New registration
//         Name it anything, select "Single tenant"
// STEP 3: After creating, copy:
//         "Application (client) ID" → ONEDRIVE_CLIENT_ID in .env
//         "Directory (tenant) ID"   → ONEDRIVE_TENANT_ID in .env
// STEP 4: Go to Certificates & Secrets → New client secret
//         Copy the VALUE (not the ID)  → ONEDRIVE_CLIENT_SECRET in .env
// STEP 5: Go to API Permissions → Add → Microsoft Graph → Files.ReadWrite.All
// STEP 6: Set folder name → ONEDRIVE_FOLDER=SeacapApplications in .env
// STEP 7: Run: npm install @azure/msal-node node-fetch
// STEP 8: Uncomment the upload block below
// ─────────────────────────────────────────────────────────────────
async function uploadToOneDrive(pdfBuffer, filename) {
  const { ONEDRIVE_CLIENT_ID, ONEDRIVE_CLIENT_SECRET, ONEDRIVE_TENANT_ID, ONEDRIVE_FOLDER } = process.env;
  if (!ONEDRIVE_CLIENT_ID || !ONEDRIVE_CLIENT_SECRET || !ONEDRIVE_TENANT_ID) {
    console.log("OneDrive not configured — skipping upload");
    return null;
  }
  try {
    // Uncomment when ready:
    // const { ConfidentialClientApplication } = await import("@azure/msal-node");
    // const msalClient = new ConfidentialClientApplication({
    //   auth: {
    //     clientId:     ONEDRIVE_CLIENT_ID,
    //     clientSecret: ONEDRIVE_CLIENT_SECRET,
    //     authority:    `https://login.microsoftonline.com/${ONEDRIVE_TENANT_ID}`,
    //   },
    // });
    // const tokenRes = await msalClient.acquireTokenByClientCredential({
    //   scopes: ["https://graph.microsoft.com/.default"],
    // });
    // const folder = ONEDRIVE_FOLDER || "SeacapApplications";
    // const res = await fetch(
    //   `https://graph.microsoft.com/v1.0/me/drive/root:/${folder}/${filename}:/content`,
    //   {
    //     method: "PUT",
    //     headers: {
    //       Authorization: `Bearer ${tokenRes.accessToken}`,
    //       "Content-Type": "application/pdf",
    //     },
    //     body: pdfBuffer,
    //   }
    // );
    // if (!res.ok) throw new Error(`OneDrive upload failed: ${res.statusText}`);
    // console.log(`OneDrive upload success: ${folder}/${filename}`);
    // return `${folder}/${filename}`;
    console.log("OneDrive credentials found but SDK not yet installed — skipping");
    return null;
  } catch (err) {
    console.warn("OneDrive upload failed (non-fatal):", err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// EMAIL SETUP (in your .env file)
// ─────────────────────────────────────────────────────────────────
// MAIL_TO=bhavyapandya55@gmail.com        ← email where you receive applications
// MAIL_FROM="Seacap Portal" <portal@seacapusa.com>
//
// If using Gmail SMTP:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your@gmail.com
//   SMTP_PASS=xxxx xxxx xxxx xxxx   ← App Password (not your real password)
//   Get it at: https://myaccount.google.com/apppasswords
//
// If using a custom domain (e.g. portal@seacapusa.com):
//   Ask your domain host (GoDaddy/Namecheap/etc) for SMTP credentials
//   Or use a service like Resend (https://resend.com) or SendGrid (https://sendgrid.com)
// ─────────────────────────────────────────────────────────────────

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
    owner:   { ...owner,   ssnLast4:        ownerSsnLast4 },
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

    const ownershipPct = parseFloat(String(owner?.ownership || "0"));
    console.log("Ownership %:", ownershipPct);
    console.log("Partner data received:", JSON.stringify(partner));

    if (ownershipPct < 51) {
      const hasPartnerData =
        partner &&
        typeof partner === "object" &&
        (partner.name || partner.partnerName) &&
        Object.keys(partner).filter(k => partner[k] && String(partner[k]).trim()).length >= 2;

      if (!hasPartnerData) {
        return res.status(400).json({
          ok: false,
          error: "Partner information is required when ownership is below 51%"
        });
      }
    }

    const temp = new Application({
      business,
      owner,
      partner: partner || {},
      signature
    });

    const shortId = temp._id.toString().slice(-6).toUpperCase();
    temp.applicationNumber = `SEA-${new Date().getFullYear()}-${shortId}`;

    const saved = await temp.save();
    console.log(`✓ Application saved: ${saved.applicationNumber}`);

    const pdfData = sanitizeForPdf(saved);
    let pdfBuffer;

    try {
      pdfBuffer = await generateApplicationPdfBuffer(pdfData);
      if (!pdfBuffer || pdfBuffer.length < 1000) {
        throw new Error("PDF buffer is empty or too small");
      }
      console.log(`✓ PDF generated: ${pdfData.applicationNumber} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr.message);
      return res.status(500).json({
        ok: false,
        error: "Application saved but PDF generation failed. Please contact support.",
        applicationNumber: pdfData.applicationNumber,
      });
    }

    const filename = `Seacap_Application_${pdfData.applicationNumber}.pdf`;

    uploadToSupabase(pdfBuffer, filename).catch(() => {});
    uploadToOneDrive(pdfBuffer, filename).catch(() => {});

    try {
      await sendApplicationEmail({
        to:      process.env.MAIL_TO,
        from:    process.env.MAIL_FROM,
        subject: `New Funding Application — ${pdfData.applicationNumber}`,
        pdfBuffer,
        filename,
        meta: {
          applicationNumber: pdfData.applicationNumber,
          createdAt:         pdfData.createdAt,
          businessName:      business.businessName || "",
        }
      });
      console.log(`✓ Company email sent: ${pdfData.applicationNumber}`);
    } catch (emailErr) {
      console.error("Company email failed (non-fatal):", emailErr.message);
    }

    if (business.email) {
      try {
        await sendApplicantConfirmationEmail({
          to:                business.email,
          from:              process.env.MAIL_FROM,
          applicantName:     owner.ownerName || owner.name || "Applicant",
          businessName:      business.businessName || "",
          applicationNumber: pdfData.applicationNumber,
        });
        console.log(`✓ Applicant email sent: ${business.email}`);
      } catch (emailErr) {
        console.error("Applicant email failed (non-fatal):", emailErr.message);
      }
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