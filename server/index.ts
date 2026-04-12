import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import donorRoutes from "./routes/donors";
import requestRoutes from "./routes/requests";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notifications";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to MongoDB
  connectDB().catch((error) => {
    console.log("Failed to connect to MongoDB initially:", error);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Donor routes
  app.use("/api/donors", donorRoutes);

  // Request routes
  app.use("/api/requests", requestRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Notification routes
  app.use("/api/notifications", notificationRoutes);

  return app;
}
