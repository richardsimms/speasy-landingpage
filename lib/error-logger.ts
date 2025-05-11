import fetch from 'node-fetch';

type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

interface ErrorLogPayload {
  level: ErrorLevel;
  source: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Logs an error to the console and sends it to the configured notification channel
 * (Slack webhook or email)
 */
export async function logError(
  source: string,
  message: string,
  details?: any,
  level: ErrorLevel = 'error'
) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${level.toUpperCase()}] [${source}] ${message}`;
  
  switch (level) {
    case 'info':
      console.info(formattedMessage, details || '');
      break;
    case 'warning':
      console.warn(formattedMessage, details || '');
      break;
    case 'error':
    case 'critical':
      console.error(formattedMessage, details || '');
      break;
  }

  if (level === 'warning' || level === 'error' || level === 'critical') {
    await sendToNotificationChannel({
      level,
      source,
      message,
      details,
      timestamp
    });
  }
}

/**
 * Sends error information to the configured notification channel
 * (Slack webhook or email)
 */
async function sendToNotificationChannel(payload: ErrorLogPayload) {
  const slackWebhookUrl = process.env.ERROR_NOTIFICATION_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('No notification webhook URL configured. Set ERROR_NOTIFICATION_WEBHOOK_URL environment variable to enable notifications.');
    return;
  }

  try {
    const slackPayload = formatSlackMessage(payload);
    
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error(`Failed to send notification: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Formats the error payload for Slack webhook
 */
function formatSlackMessage(payload: ErrorLogPayload) {
  const { level, source, message, details, timestamp } = payload;
  
  const color = level === 'critical' ? '#FF0000' : 
                level === 'error' ? '#FF9900' : 
                level === 'warning' ? '#FFCC00' : '#36C5F0';
  
  return {
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${level.toUpperCase()}: ${source}`,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:* ${message}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time:* ${timestamp}`
            }
          },
          details ? {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Details:*\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``
            }
          } : null
        ].filter(Boolean)
      }
    ]
  };
}
