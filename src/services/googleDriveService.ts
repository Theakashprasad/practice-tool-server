import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();



export const getOAuthClient = () => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    });
    return oauth2Client;
  };

export const listDriveFiles = async () => {
  const auth = getOAuthClient();
  console.log("auth",auth);
  
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "mimeType='application/pdf'", // or 'text/plain', etc.
    fields: 'files(id, name)',
  });

  return res.data.files || [];
};

export const downloadFileContent = async (fileId: string): Promise<string> => {
  const auth = getOAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return new Promise((resolve, reject) => {
    let data = '';
    res.data.on('data', chunk => (data += chunk));
    res.data.on('end', () => resolve(data));
    res.data.on('error', err => reject(err));
  });
};
