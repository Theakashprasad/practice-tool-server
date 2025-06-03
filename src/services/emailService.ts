import { google } from 'googleapis';
import nodemailer, { Transporter } from 'nodemailer';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const createTransporter = async (): Promise<Transporter> => {
    const accessToken = await oauth2Client.getAccessToken();
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GOOGLE_EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken.token
        }
    } as any);
};

export const sendInvitationEmail = async (to: string, invitationLink: string) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: process.env.GOOGLE_EMAIL,
            to,
            subject: 'Invitation to Join Our Platform',
            html: `
                <h2>You've been invited to join our platform!</h2>
                <p>Click the link below to accept your invitation and create your account:</p>
                <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                <p>This invitation will expire in 24 hours.</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}; 