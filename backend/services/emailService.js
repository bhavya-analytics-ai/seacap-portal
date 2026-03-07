import nodemailer from "nodemailer";

function hasRealSmtp() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendApplicationEmail({ to, from, subject, pdfBuffer, filename, meta }) {
  let transporter;
  let usingEthereal = false;

  if (hasRealSmtp()) {
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    usingEthereal = true;
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const mailTo = to || process.env.MAIL_TO || "bhavyapandya55@gmail.com";
  const mailFrom = from || process.env.MAIL_FROM || '"Seacap Portal" <portal@seacap.com>';
  const mailSubject = subject || process.env.MAIL_SUBJECT || "New Seacap Funding Application Submitted";

  const info = await transporter.sendMail({
    from: mailFrom,
    to: mailTo,
    subject: mailSubject,
    text: `New funding application submitted.\nApplication ID: ${meta?.applicationId || ""}\nCreated: ${meta?.createdAt || ""}\nPDF attached.`,
    attachments: [
      {
        filename: filename || "Seacap_Funding_Application.pdf",
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  });

  if (usingEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Ethereal email preview URL:", previewUrl);
  } else {
    console.log("Email sent via SMTP:", info.messageId);
  }
}