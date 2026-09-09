import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotification(event, payload) {
  let mailOptions = {};

  switch (event) {
    case "IT_TICKET_CREATED":
      mailOptions = {
        to: payload.callerEmail,
        subject: `Incident ${payload.number} has been created`,
        html: `<p>Your ticket has been created.</p>
               <p><b>Short Description:</b> ${payload.shortDescription}</p>
               <p><a href="${process.env.FRONTEND_URL}/portal/tickets/${payload.id}">View Ticket in Portal</a></p>`,
      };
      break;

    case "IT_TICKET_RESOLVED":
      mailOptions = {
        to: payload.callerEmail,
        subject: `Incident ${payload.number} has been resolved`,
        html: `<p><b>Resolution Notes:</b> ${payload.resolutionNotes}</p>
               <p><a href="${process.env.FRONTEND_URL}/portal/tickets/${payload.id}/reopen">Reopen Ticket</a> (Active for 3 days)</p>`,
      };
      break;

    case "HR_ONBOARDING_INITIALIZED":
      mailOptions = {
        to: payload.managerEmail,
        subject: `Onboarding Pipeline Started: ${payload.newHireName}`,
        html: `<p>Onboarding case initialized for ${payload.newHireName}.</p>
               <p><a href="${process.env.FRONTEND_URL}/hr/onboarding/${payload.id}">View Task Checklist</a></p>`,
      };
      break;

    case "FACILITIES_DISPATCHED":
      mailOptions = {
        to: payload.techEmail,
        subject: `New Work Order Dispatched: Location ${payload.location}`,
        html: `<p>Work Order <b>${payload.number}</b> assigned.</p>
               <p><b>Hazards Flagged:</b> ${payload.hazardsIdentified ? "YES" : "NO"}</p>`,
      };
      break;

    default:
      return;
  }

  return await transporter.sendMail(mailOptions);
}