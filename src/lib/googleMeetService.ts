import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface MeetingDetails {
  summary: string;
  description: string;
  startDateTime: string; // ISO format: "2025-12-03T10:00:00+05:30"
  endDateTime: string;   // ISO format: "2025-12-03T11:00:00+05:30"
  attendees: string[];   // Array of email addresses
  timeZone?: string;
}

interface GoogleMeetResponse {
  success: boolean;
  meetLink?: string;
  eventId?: string;
  error?: string;
}

// Create OAuth2 client
const createOAuth2Client = (): OAuth2Client | null => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    console.warn('Google OAuth not configured. Missing environment variables.');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
};

// Generate a Google Meet link using Google Calendar API
export async function generateGoogleMeetLink(details: MeetingDetails): Promise<GoogleMeetResponse> {
  try {
    const oauth2Client = createOAuth2Client();

    if (!oauth2Client) {
      console.error('Google OAuth client not configured');
      return {
        success: false,
        error: 'Google Calendar API not configured',
      };
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create calendar event with Google Meet
    const event = {
      summary: details.summary,
      description: details.description,
      start: {
        dateTime: details.startDateTime,
        timeZone: details.timeZone || 'Asia/Kolkata',
      },
      end: {
        dateTime: details.endDateTime,
        timeZone: details.timeZone || 'Asia/Kolkata',
      },
      attendees: details.attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // Unique ID for the meet
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email notifications to all attendees
      requestBody: event,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    if (!meetLink) {
      return {
        success: false,
        error: 'Failed to generate Google Meet link',
      };
    }

    return {
      success: true,
      meetLink,
      eventId: response.data.id || undefined,
    };
  } catch (error: any) {
    console.error('Error generating Google Meet link:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Google Meet event',
    };
  }
}

// Generate meet link for a session booking
export async function generateSessionMeetLink(
  sessionTitle: string,
  sessionDescription: string,
  scheduledDate: Date,
  duration: number, // in minutes
  studentEmail: string,
  facultyEmail: string,
  facultyNotes?: string
): Promise<GoogleMeetResponse> {
  try {
    // Calculate start and end times
    const startDateTime = scheduledDate.toISOString();
    const endDate = new Date(scheduledDate.getTime() + duration * 60000);
    const endDateTime = endDate.toISOString();

    // Prepare meeting details
    const meetingDetails: MeetingDetails = {
      summary: sessionTitle,
      description: `${sessionDescription}\n\n${facultyNotes ? `Faculty Notes: ${facultyNotes}` : ''}`,
      startDateTime,
      endDateTime,
      attendees: [studentEmail, facultyEmail],
      timeZone: 'Asia/Kolkata',
    };

    return await generateGoogleMeetLink(meetingDetails);
  } catch (error: any) {
    console.error('Error generating session meet link:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate meet link',
    };
  }
}

// Alternative: Generate a simple meet link without calendar integration
// This is a fallback option if Google Calendar API is not configured
export function generateSimpleMeetLink(): string {
  // Generate a random meet code (10 characters: 3-4-3 format)
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
}

// Update or cancel a Google Meet event
export async function cancelGoogleMeetEvent(eventId: string): Promise<boolean> {
  try {
    const oauth2Client = createOAuth2Client();

    if (!oauth2Client) {
      console.error('Google OAuth client not configured');
      return false;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all', // Notify all attendees
    });

    console.log(`Google Meet event ${eventId} cancelled successfully`);
    return true;
  } catch (error) {
    console.error('Error cancelling Google Meet event:', error);
    return false;
  }
}

// Update Google Meet event (for rescheduling)
export async function updateGoogleMeetEvent(
  eventId: string,
  newStartDateTime: string,
  newEndDateTime: string,
  newDescription?: string
): Promise<GoogleMeetResponse> {
  try {
    const oauth2Client = createOAuth2Client();

    if (!oauth2Client) {
      console.error('Google OAuth client not configured');
      return {
        success: false,
        error: 'Google Calendar API not configured',
      };
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    const updatedEvent = {
      ...event.data,
      start: {
        dateTime: newStartDateTime,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: newEndDateTime,
        timeZone: 'Asia/Kolkata',
      },
      description: newDescription || event.data.description,
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
      requestBody: updatedEvent,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      meetLink: meetLink || undefined,
      eventId: response.data.id || undefined,
    };
  } catch (error: any) {
    console.error('Error updating Google Meet event:', error);
    return {
      success: false,
      error: error.message || 'Failed to update Google Meet event',
    };
  }
}
