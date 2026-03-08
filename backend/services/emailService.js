import nodemailer from "nodemailer";

function hasRealSmtp() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function getTransporter() {
  if (hasRealSmtp()) {
    const port   = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  transporter._ethereal = true;
  return transporter;
}

// ── Email 1: Company notification with PDF attached
export async function sendApplicationEmail({ to, from, subject, pdfBuffer, filename, meta }) {
  const transporter = await getTransporter();

  const mailTo      = to   || process.env.MAIL_TO   || "bhavyapandya55@gmail.com";
  const mailFrom    = from || process.env.MAIL_FROM  || '"Seacap Portal" <portal@seacapusa.com>';
  const mailSubject = subject || `New Seacap Funding Application — ${meta?.applicationNumber || ""}`;

  const info = await transporter.sendMail({
    from:    mailFrom,
    to:      mailTo,
    subject: mailSubject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0D2223; padding: 24px 32px;">
          <h2 style="color: #fff; margin: 0; font-size: 20px;">New Funding Application Received</h2>
        </div>
        <div style="padding: 24px 32px; background: #f9f9f9;">
          <p style="color: #333; font-size: 14px; margin: 0 0 16px;">
            A new funding application has been submitted via the Seacap portal.
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #648F89; font-size: 13px; width: 40%;">Application #</td>
              <td style="padding: 8px 0; color: #0D2223; font-weight: 600; font-size: 13px;">${meta?.applicationNumber || ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #648F89; font-size: 13px;">Business Name</td>
              <td style="padding: 8px 0; color: #0D2223; font-size: 13px;">${meta?.businessName || ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #648F89; font-size: 13px;">Submitted At</td>
              <td style="padding: 8px 0; color: #0D2223; font-size: 13px;">${new Date(meta?.createdAt || Date.now()).toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #9EAAA8; font-size: 12px; margin-top: 20px;">
            The complete application PDF is attached to this email.
          </p>
        </div>
        <div style="background: #0D2223; padding: 14px 32px; text-align: center;">
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} SeacapUSA. All Rights Reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename:    filename || "Seacap_Funding_Application.pdf",
      content:     pdfBuffer,
      contentType: "application/pdf",
    }],
  });

  if (transporter._ethereal) {
    console.log("Ethereal preview:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("Company email sent:", info.messageId);
  }
}

// ── Email 2: Applicant confirmation
export async function sendApplicantConfirmationEmail({ to, from, applicantName, businessName, applicationNumber }) {
  const transporter = await getTransporter();

  const mailFrom = from || process.env.MAIL_FROM || '"Seacap" <portal@seacapusa.com>';

  const info = await transporter.sendMail({
    from:    mailFrom,
    to,
    subject: `Your Seacap Application Has Been Received — ${applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

        <div style="background: #0D2223; padding: 28px 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 600;">
            Application Received
          </h1>
          <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 6px 0 0;">
            Seacap Business Funding
          </p>
        </div>

        <div style="padding: 32px; background: #ffffff;">
          <p style="color: #0D2223; font-size: 15px; margin: 0 0 20px;">
            Hi ${applicantName},
          </p>
          <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
            Thank you for submitting your funding application for <strong>${businessName}</strong>.
            We have received your application and our team will review it shortly.
          </p>

          <div style="background: #F7FAFA; border: 1px solid #E0E6E5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #648F89; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 8px;">
              Application Details
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #648F89; font-size: 13px; width: 40%;">Application #</td>
                <td style="padding: 6px 0; color: #0D2223; font-weight: 600; font-size: 13px;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #648F89; font-size: 13px;">Business</td>
                <td style="padding: 6px 0; color: #0D2223; font-size: 13px;">${businessName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #648F89; font-size: 13px;">Submitted</td>
                <td style="padding: 6px 0; color: #0D2223; font-size: 13px;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              </tr>
            </table>
          </div>

          <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 8px;">
            A Seacap representative will be in touch with you within 1–2 business days.
            If you have any questions in the meantime, please don't hesitate to reach out.
          </p>

          <p style="color: #444; font-size: 14px; margin: 20px 0 0;">
            <a href="tel:18336663454" style="color: #195455; font-weight: 600; text-decoration: none;">
              (833) 666-3454
            </a>
          </p>
        </div>

        <div style="background: #0D2223; padding: 20px 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} SeacapUSA. All Rights Reserved.
            </p>
            <p style="margin: 0;">
              <a href="https://seacapusa.com/privacy" style="color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none; margin-left: 12px;">Privacy</a>
              <a href="https://seacapusa.com/terms" style="color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none; margin-left: 12px;">Terms</a>
            </p>
          </div>
        </div>

      </div>
    `,
  });

  if (transporter._ethereal) {
    console.log("Ethereal preview (applicant):", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("Applicant confirmation sent:", info.messageId);
  }
}
