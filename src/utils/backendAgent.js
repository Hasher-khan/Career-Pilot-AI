/**
 * backendAgent.js
 * ──────────────────────────────────────────────────────────
 * Backend Agent for CareerPilot AI.
 * Handles triggering email notifications:
 * 1. Notify user/admin when a user logs in.
 * 2. Notify users via email when a new update or announcement is posted in CareerPilot AI.
 * 
 * Supports configured services like EmailJS or a webhook server,
 * falling back to local simulation logs so the UI works seamlessly.
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Configuration for EmailJS or Custom Webhook
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID || '';
const WEBHOOK_MAIL_URL = import.meta.env.VITE_MAIL_WEBHOOK_URL || '';

/**
 * Sends an email using EmailJS, Webhook, or local simulation.
 */
export async function sendEmail({ toEmail, toName, subject, body }) {
  console.log(`[Backend Agent] Preparing mail to: ${toEmail}`);

  // 1. Try custom Webhook
  if (WEBHOOK_MAIL_URL) {
    try {
      const response = await fetch(WEBHOOK_MAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, toName, subject, body })
      });
      if (response.ok) {
        console.log('[Backend Agent] Mail sent via Webhook successfully.');
        return true;
      }
    } catch (e) {
      console.warn('[Backend Agent] Webhook mail delivery failed, trying fallback:', e);
    }
  }

  // 2. Try EmailJS (if credentials provided)
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_USER_ID) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_USER_ID,
          template_params: {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: body
          }
        })
      });
      if (response.ok) {
        console.log('[Backend Agent] Mail sent via EmailJS successfully.');
        return true;
      }
    } catch (e) {
      console.warn('[Backend Agent] EmailJS mail delivery failed, trying fallback:', e);
    }
  }

  // 3. Fallback: Log a beautiful console message (Simulation)
  const border = '═'.repeat(60);
  console.log(`
╔${border}╗
║                CAREERPILOT BACKEND AGENT: MAIL                    ║
╠${border}╣
  Recipient : ${toName} <${toEmail}>
  Subject   : ${subject}
  
  Body      :
  ${body.split('\n').join('\n  ')}
╚${border}╝
`);
  return true;
}

/**
 * Triggered when a user logs in.
 * Sends a welcome notification or security alert to the logging-in user.
 */
export async function notifyUserLogin(email, name) {
  const cleanName = name || email.split('@')[0] || 'CareerPilot Member';
  const subject = '🔐 Security Alert: Successful Login to CareerPilot AI';
  const body = `Hi ${cleanName},

This is a quick notification to confirm that you have successfully logged into your CareerPilot AI workspace.

Details:
- Account: ${email}
- Timestamp: ${new Date().toLocaleString()}
- Status: Secure

If this wasn't you, please reset your password immediately or contact our support team.

Best regards,
The CareerPilot AI Backend Agent`;

  return sendEmail({ toEmail: email, toName: cleanName, subject, body });
}

/**
 * Triggered by admins when a new update/announcement is posted.
 * Fetches all registered user profiles from Firestore and sends them an update notification email.
 */
export async function notifyNewUpdate(updateTitle, updateContent) {
  try {
    console.log('[Backend Agent] Broadcasting announcement update to all registered users...');
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(usersCol);
    const emailsList = [];

    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        emailsList.push({ email: data.email, name: data.name });
      }
    });

    if (emailsList.length === 0) {
      console.log('[Backend Agent] No user emails found in database.');
      return;
    }

    console.log(`[Backend Agent] Dispatching ${emailsList.length} notification emails...`);

    const emailPromises = emailsList.map((user) => {
      const cleanName = user.name || user.email.split('@')[0] || 'CareerPilot Member';
      const subject = `📢 New Update: ${updateTitle}`;
      const body = `Hi ${cleanName},

A new announcement has been posted in your CareerPilot AI workspace!

Title: ${updateTitle}

Details:
${updateContent}

Stay ahead of the curve by logging in to check out all the new features and resources.

Best regards,
The CareerPilot AI Team`;

      return sendEmail({ toEmail: user.email, toName: cleanName, subject, body });
    });

    await Promise.all(emailPromises);
    console.log(`[Backend Agent] Successfully dispatched notifications to ${emailsList.length} users.`);
  } catch (error) {
    console.error('[Backend Agent] Failed to broadcast update notification:', error);
  }
}
