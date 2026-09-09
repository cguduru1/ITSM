  import dotenv from "dotenv";
  dotenv.config();

  import express from "express";
  import mongoose from "mongoose";
  import cors from "cors";
  import { createServer } from "http";
  import { Server } from "socket.io";
  import helmet from "helmet";
  import cookieParser from "cookie-parser";
  import morgan from "morgan";
  import rateLimit from "express-rate-limit";
  import jwt from "jsonwebtoken";
  import bcrypt from "bcryptjs";

  //Middleware
  import verifyToken  from "./middleware/auth.js";
  import asyncUserMiddleware from "./middleware/asyncUserMiddleware.js";
  import currentUser from "./middleware/currentUser.js";
  import auth from "./auth.js";
  import { authorize } from "./authorize.js";
  import { trialCheck } from "./middleware/trial.js";
  // import { requireAuth } from "./routes/auth.routes.js";

  // Models
  import User from "./models/User.js";
  import { Ticket } from "./models/Ticket.js";
  import Tenant from "./models/Tenant.js"; 
  import AssetMaster from "./models/AssetMaster.js";


  // Public Routes
  import usersRouter from "./routes/users.js";
  import authRoutes from "./routes/auth.routes.js";

  // PROTECTED ROUTES
  import meRouter from "./routes/me.js";

  // Admin
  import userPreferencesRouter from './routes/userPreferences.js';
  import adminRoutes from "./routes/admin.js";
  import adminSettingsRoutes from "./routes/adminSettings.js";
  import adminRoles from "./routes/adminRoles.js";
  import dashboardRoutes from "./routes/dashboard.js";

  //Ticket
  import ticketRoutes from "./routes/ticket.js";
  import requestCatalogRoutes from "./routes/requestCatalog.js";

  //Assets
  import assetRoutes from "./routes/assetRoutes.js";
  import aiRoutes from "./routes/ai.js";
  import recRoutes from "./routes/recommendations.js";
  import aggregationsRouter from "./routes/aggregations.js";
  import routes from "./routes/index.js";
  import poRoutes from "./routes/purchaseOrder.js";
  import assetAuditRouter from "./routes/assetAudit.js";

  //Change
  import changeRoutes from "./routes/change.routes.js";
  import changeImpactRoutes from "./routes/change.impact.routes.js";
  import changeCalendarRoutes from "./routes/change.calendar.routes.js";
  import changeSlaRoutes from "./routes/change.sla.routes.js";
  import changeHeatmapRoutes from "./routes/change.heatmap.routes.js";
  import changeReportRoutes from "./routes/change.report.routes.js";
  import healthRoutes from "./routes/health.routes.js";
  import relationRoutes from "./routes/relations.routes.js";
  import impactRoutes from "./routes/impact.routes.js";
  import anomalyRoutes from "./routes/anomaly.routes.js";
  import changeRiskRoutes from "./routes/changeRisk.routes.js";
  import changesRoutes from "./routes/changes.js";
  // import changes from "./routes/changes.js";
  import Change from "./models/Change.js";
  import ChangeRequest from "./models/ChangeRequest.js";
  import meetingsRoutes from "./routes/meetings.js";
  import CABMeeting from "./models/CABMeeting.js";
  import decisionTablesRouter from "./routes/decisionTables.js";
  import ciMappingsRouter from "./routes/ciMappings.js";
  import devOpsModelsRouter from "./routes/devOpsModels.js";
  import emergencyChangesRouter from "./routes/emergencyChanges.js";
 
  //CMBD
  import cmdbRoutes from "./routes/cmdb.routes.js";
  import cmdbDashboardRoutes from "./routes/cmdb.dashboard.routes.js";
  import cmdbRelationshipRoutes from "./routes/cmdb.relationship.routes.js";
  import discoveryRoutes from "./routes/discovery.routes.js";
  import cmdbChatbotRoutes from "./routes/cmdbChatbot.routes.js";
  import analyticsRouter from "./routes/analytics.js";

  // Knowledge Base
  import kbRoutes from "./routes/knowledge.js";
  import kbOpsRoutes from "./routes/kbOps.js";
  // import KBAnalyticsPanel from "./components/kb/KBAnalyticsPanel.jsx";
  // import KBCategoryHealth from "./components/kb/KBCategoryHealth.jsx";
  // import KBAIInsights from "./components/kb/KBAIInsights.jsx";
  // import KBWorkflowQueue from "./components/kb/KBWorkflowQueue.jsx";
  // import KBVersionPanel from "./components/kb/KBVersionPanel.jsx";
  // import KBAttachmentManager from "./components/kb/KBAttachmentManager.jsx";
  // import KBExpiryMonitor from "./components/kb/KBExpiryMonitor.jsx";
  // import KBMyContributions from "./components/kb/KBMyContributions.jsx";

  // Chatbot

  // AI & Analytics Modules
  import { registerChatbotRoutes } from "./ai/chatbot.js";
  import { registerAnalyticsRoutes } from "./analytics/analytics.js";
  import { registerForecastRoute } from "./analytics/forecast.js";
  import { registerHeatmapRoute } from "./analytics/heatmap.js";
  import { registerExecutiveRoute } from "./analytics/executive.js";
  import { registerExportRoute } from "./analytics/export.js";

  // Miscellaneous
  import "./cron/archiveHRDocs.js";
  import "./jobs/anomalyCron.js";
  import "./jobs/changeRiskCron.js";
  import { startRecommendationsJob } from "./jobs/recommendationsJob.js";
  import { startDepreciationSnapshotJob } from "./jobs/depreciationSnapshotJob.js";

  // Utils
  import { predictSLA } from "./utils/sla.js";
  import { autoAssign }  from "./utils/assign.js";

  // ------------------------------------------------------------
  // App & HTTP Setup
  // ------------------------------------------------------------
  const app = express();
  const httpServer = createServer(app);
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  // ------------------------------------------------------------
  // 1. GLOBAL CORS CONFIGURATION (MUST BE APPLIED FIRST)
  // ------------------------------------------------------------
  const corsOptions = {
    origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:4000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
      "X-Requested-With",
    ],
  };

  // 1. CORS FIRST
  app.use(cors(corsOptions));

  // app.use((req, res, next) => {
  //   if (req.method === "OPTIONS") {
  //     return res.sendStatus(204);
  //   }
  //   next();
  // });

  // ------------------------------------------------------------
  // OTHER GLOBAL MIDDLEWARES
  // ------------------------------------------------------------
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet({ crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));
  app.use(morgan("dev"));

//  // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));


// Routes
// Get all meetings
// app.get("/api/meetings", async (req, res) => {
//   const meetings = await CABMeeting.find().sort({ date: 1 });
//   res.json(meetings);
// });

// // Create new meeting
// app.post("/api/meetings", async (req, res) => {
//   const meeting = new CABMeeting(req.body);
//   await meeting.save();
//   res.json(meeting);
// });

// // Update meeting (e.g., reschedule or sign‑off)
// app.put("/api/meetings/:id", async (req, res) => {
//   const meeting = await CABMeeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(meeting);
// });

// // Delete meeting
// app.delete("/api/meetings/:id", async (req, res) => {
//   await CABMeeting.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

// app.listen(4000, () => console.log("CAB API running on port 4000"));

  // 3. Rate Limiter (Skipped for preflight OPTIONS requests)
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    skip: (req) => req.method === "OPTIONS",
  });
  app.use(limiter);

  // ------------------------------------------------------------
  // SOCKET.IO SETUP
  // ------------------------------------------------------------
  const io = new Server(httpServer, {path: '/realtime', cors: corsOptions,});
  io.on("connection", (socket) => {console.log("Socket connected:", socket.id);});

  // Attach io to req object for route-level broadcasts
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // ------------------------------------------------------------
  // HEALTH CHECK
  // ------------------------------------------------------------
  app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
  app.use("/api/meetings", meetingsRoutes);

  // ------------------------------------------------------------
  // 1. PUBLIC ROUTES (UNPROTECTED)
  // ------------------------------------------------------------
  // Allows both /auth/login and /api/auth/login to resolve publicly
  app.use("/auth", authRoutes);
  app.use("/api/auth", authRoutes); 
  app.use("/api/users", usersRouter);
  // app.use("/api/purchase-orders", requireAuth, purchaseOrderRouter);

  // ------------------------------------------------------------
  // MFA & Refresh Token
  // ------------------------------------------------------------
  app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.mfaCode || !user.mfaExpires) {
      return res.status(400).json({ error: "MFA not initiated" });
    }

    if (user.mfaCode !== otp || new Date() > user.mfaExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    const access = generateAccessToken(user);
    const refresh = generateRefreshToken(user);

    res.json({
      message: "MFA verified",
      access,
      refresh,
      role: user.role,
      department: user.department,
      tenant: user.tenant
    });
  });

  app.post("/api/refresh", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "No refresh token" });

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET || "default_refresh_secret_123");
      const user = await User.findById(decoded.id);
      if (!user) return res.status(400).json({ error: "User not found" });

      const access = generateAccessToken(user);
      res.json({ access });
    } catch {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  });

  // ------------------------------------------------------------
  // 2. PROTECTED MIDDLEWARE (ALL ROUTES BELOW REQUIRE TOKEN)
  // ------------------------------------------------------------
  app.use(verifyToken);
  app.use(asyncUserMiddleware);
  app.use(currentUser);
  app.use(trialCheck);

  // ------------------------------------------------------------
  // DASHBOARD STATS ROUTE (REQUIRED BY FRONTEND)
  // ------------------------------------------------------------

  // 1. Helper function using aggregation to fetch all counts in a SINGLE database query
   async function getDashboardStats() {

    const [result] = await Ticket.aggregate([

      {
        $facet: {
          total: [{ $count: "count" }],
          open: [
            { $match: { status: { $in: ["New", "In Progress", "On Hold"] } } },
            { $count: "count" }
          ],
          closed: [
            { $match: { status: { $in: ["Resolved", "Closed"] } } },
            { $count: "count" }
          ],
          breached: [
            { $match: { slaResolutionDue: { $lt: new Date() }, status: { $ne: "Closed" } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    return {
      total: result?.total[0]?.count || 0,
      open: result?.open[0]?.count || 0,
      closed: result?.closed[0]?.count || 0,
      breached: result?.breached[0]?.count || 0
    };
  } 

  /* -----------------------------
    REST ENDPOINT
  ------------------------------ */
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await getDashboardStats();
      return res.json(stats);
      console.log(AssetMaster.collection.name)
    } catch (err) {
      console.error("Dashboard stats error:", err);
      return res.status(500).json({ error: "Dashboard stats failed" });
    }
  });

  // ------------------------------------------------------------
  // PROTECTED ROUTES
  // ------------------------------------------------------------
  app.use("/api/me", meRouter);
  app.use('/api/me', userPreferencesRouter);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/settings", adminSettingsRoutes);
  app.use('/api/admin/roles', adminRoles);
  app.use("/dashboard", dashboardRoutes);

  app.use("/api/assets", assetRoutes);
  app.use("/api/tickets/analytics", verifyToken, ticketRoutes);
  app.use("/api/tickets", verifyToken, ticketRoutes); 

  app.use("/api/ai", aiRoutes);
  app.use("/api/aggregationsRouter", aggregationsRouter);
  app.use("/api/recommendations", recRoutes);
  app.use("/api/purchase-orders", poRoutes);
  app.use("/api/audit", assetAuditRouter);

  // app.use('/api/changes', changes);
  app.use("/api/changes", changeRoutes);
  app.use("/api/change-impact", changeImpactRoutes);
  app.use("/api/change-calendar", changeCalendarRoutes);
  app.use("/api/change-sla", changeSlaRoutes);
  app.use("/api/change-heatmap", changeHeatmapRoutes);
  app.use("/api/change-report", changeReportRoutes);
  app.use("/api/discovery", discoveryRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/relations", relationRoutes);
  app.use("/api/impact", impactRoutes);
  app.use("/api/anomaly", anomalyRoutes);
  app.use("/api/change-risk", changeRiskRoutes);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/changes", changesRoutes);
  app.use("/api/decision-tables", decisionTablesRouter);
  app.use("/api/ci-mappings", ciMappingsRouter);
  app.use("/api/devops-models", devOpsModelsRouter);
  app.use("/api/emergency-changes", emergencyChangesRouter);

  app.use("/api/cmdb", cmdbRoutes);
  app.use("/api/cmdb-dashboard", cmdbDashboardRoutes);
  app.use("/api/cmdb-rel", cmdbRelationshipRoutes);
  app.use("/api/cmdb-chatbot", cmdbChatbotRoutes);

  app.use("/api/kb", kbRoutes);

  // Asset Master, Product Catalog, Financial, etc.
  app.use("/api", routes);

  // ------------------------------------------------------------
  // ADMIN USER CREATION
  // ------------------------------------------------------------
  app.post("/api/users", authorize("user:manage"), async (req, res) => {
    const { name, email, password, role, department, tenant } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "user",
      department: department || "general",
      tenant: tenant || "default"
    });

    await user.save();
    res.json({ message: "User created", user });
  });

  // ------------------------------------------------------------
  // 6. MODULE ROUTES REGISTRATION
  // ------------------------------------------------------------
  registerChatbotRoutes(app);
  registerAnalyticsRoutes(app);
  registerForecastRoute(app);
  registerHeatmapRoute(app);
  registerExecutiveRoute(app);
  registerExportRoute(app);

  /* -----------------------------
    REAL-TIME BROADCASTER LOOP
  ------------------------------ */
  let isBroadcasting = false;

  setInterval(async () => {
    // Prevent overlapping executions if a query takes longer than 4 seconds
    if (isBroadcasting) return;
    isBroadcasting = true;

    try {
      const stats = await getDashboardStats();
      io.emit("dashboard:update", stats);
    } catch (err) {
      console.error("Socket broadcast error:", err);
    } finally {
      isBroadcasting = false;
    }
  }, 4000);

  // ------------------------------------------------------------
  // Global Error Handler (MUST BE LAST APP MIDDLEWARE)
  // ------------------------------------------------------------
  app.use((err, req, res, next) => {
    console.error("🔥 BACKEND CRASH ERROR:", err.stack || err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // ------------------------------------------------------------
  // DATABASE & SERVER INITIALIZATION
  // ------------------------------------------------------------
  const connectDB = async () => {
    try {
      let uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itsm";

      if (!uri.includes("retryWrites")) {
        uri += uri.includes("?") ? "&retryWrites=false" : "?retryWrites=false";
      }

      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  };

  // Start DB connection FIRST, then start listening on httpServer
  const startServer = async () => {
    await connectDB();

  // Clear native collection schema validators that block document inserts
    try {
      await mongoose.connection.db.command({ collMod: "changes", validator: {}, validationLevel: "off" });
      await mongoose.connection.db.command({ collMod: "changerequests", validator: {}, validationLevel: "off" });
      console.log("🧹 Collection validators cleared successfully");
    } catch (err) {}

    try {
      const hasCollection = await mongoose.connection.db.listCollections({ name: "softwarelicenses" }).hasNext();
      if (hasCollection) {
        await mongoose.connection.collection("softwarelicenses").dropIndexes();
        console.log("🧹 SoftwareLicense indexes cleared successfully");
      }
    } catch (err) {}

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  };

//   const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`CAB API running on port ${PORT}`));

  startServer();
  startRecommendationsJob();
  startDepreciationSnapshotJob();

  // ------------------------------------------------------------
  // TOKEN HELPERS & Websockets
  // ------------------------------------------------------------
  function generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        tenant: user.tenant
      },
      process.env.ACCESS_SECRET || process.env.JWT_SECRET || "default_access_secret_123",
      { expiresIn: "15m" }
    );
  }

  function generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET || "default_refresh_secret_123",
      { expiresIn: "7d" }
    );
  }

  console.log("ROUTE CHECK 2 >>>", {
    adminRoutes: typeof adminRoutes,
    kbRoutes: typeof kbRoutes,
    adminSettingsRoutes: typeof adminSettingsRoutes,
    cmdbRoutes: typeof cmdbRoutes,
    cmdbDashboardRoutes: typeof cmdbDashboardRoutes,
    cmdbRelationshipRoutes: typeof cmdbRelationshipRoutes,
    assetRoutes: typeof assetRoutes,
    changeRoutes: typeof changeRoutes
  });

  // ------------------------------------------------------------
  // TICKET CREATION
  // ------------------------------------------------------------
  app.post("/api/tickets", auth, authorize("ticket:create"), async (req, res) => {
    const { title, description, lat, lng } = req.body;
    const { classifyIssue } = require("./ai/chatbot");

    const ai = classifyIssue(description);
    const sla = predictSLA(ai.priority, ai.category);
    const assignedTo = autoAssign(ai.category, req.user.department);

    const ticket = new Ticket({
      title,
      description,
      createdBy: req.user.name,
      category: ai.category,
      priority: ai.priority,
      slaTarget: sla,
      assignedTo,
      tenant: req.user.tenant,
      department: req.user.department,
      location: lat && lng ? { lat, lng } : undefined
    });

    ticket.computeSLABreach();
    await ticket.save();

    res.status(201).json(ticket);
  });


  // ------------------------------------------------------------
  // TICKET LISTING (RBAC)
  // ------------------------------------------------------------
  app.get("/api/tickets", auth, async (req, res) => {
    const { role, name, department, tenant } = req.user;
    let query = { tenant };

    if (role === "admin") {
      // full access
    } else if (role === "agent") {
      query = {
        tenant,
        $or: [{ assignedTo: name }, { department }, { createdBy: name }]
      };
    } else {
      query = { tenant, createdBy: name };
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  });


