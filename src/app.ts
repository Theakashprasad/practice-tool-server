import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoute from "./routes/authRoutes";
import invitationRoute from "./routes/invitationRoutes";
import userRoute from "./routes/userRoutes";
import chatRoute from "./routes/chatRoutes";
import practiceRoute from "./routes/practiceRoutes";
import clientGroupRoute from "./routes/clientGroupRoutes";
import clientRoutes from "./routes/clients";
// import industryRoutes from './routes/industries';
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./config/passport"; // Import Passport config
import { ChatCleanupService } from "./services/chatCleanupService";
import { CronScheduler } from "./services/cronScheduler";
import { chatSessions } from "./controllers/chatController"; // Import the shared chatSessions map
import serviceTypeRoutes from "./routes/serviceTypes";
import servicesSubscribedRoutes from "./routes/servicesSubscribed";
import contactRoutes from "./routes/contacts";
import linkRoutes from "./routes/links";
import industryRoutes from "./routes/industryRoutes";
import { createServer } from "http";
import { SocketService } from "./services/socketService";
import driveRoutes from "./routes/driveRoutes";
import retrievalRoutes from "./routes/retrievalRoutes";
import toolRoutes from "./routes/toolRoutes";

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_URL ="https://http://69.62.83.80:5000";



const app = express();
const httpServer = createServer(app);

// Configure CORS 
app.use(
  cors({
    origin: CLIENT_URL,    
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Initialize Socket.IO service with CORS configuration
const socketService = new SocketService(httpServer, CLIENT_URL);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoute);
app.use("/api/invitation", invitationRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/practices", practiceRoute);
app.use("/api/client-groups", clientGroupRoute);
app.use("/api/clients", clientRoutes);
app.use("/api/industries", industryRoutes);
app.use("/api/service-types", serviceTypeRoutes);
app.use("/api/services-subscribed", servicesSubscribedRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/rag", driveRoutes);
app.use("/api/rag", retrievalRoutes);
app.use("/api/tools", toolRoutes);
app.use('/api/test',(req,res)=>{
  res.send('hello')
})
// Initialize cleanup service and scheduler
const cleanupService = new ChatCleanupService(chatSessions);
const cronScheduler = new CronScheduler(cleanupService);

// app.get('/', (req, res) => {
//   res.send('<a href="/api/auth/google">Login with Google</a>');
// });

const startServer = async () => {
  await connectDB();

  // Start the cleanup schedule after DB connection is established
  cronScheduler.startCleanupSchedule();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

export { app, socketService };
