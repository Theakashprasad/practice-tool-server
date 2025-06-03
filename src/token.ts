import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
   process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/rag" // redirect URI for manual testing
);

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("Authorize this app by visiting this URL:", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the code from that page here: ", (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err || !token) {
      console.error("Error retrieving access token", err);
      return;
    }
    console.log("Your refresh token is:", token.refresh_token);
  });
});
