// itsm-backend/models/Ticket.js
import mongoose from "mongoose";

const options = { discriminatorKey: "ticketType", timestamps: true };

const WorkNoteSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  authorName: { type: String, default: "" },
  type: { type: String, enum: ["internal", "client"], default: "internal" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ------------------------------------------------------------
// BASE TICKET SCHEMA
// ------------------------------------------------------------
const baseTicketSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  title: { type: String, trim: true },
  shortDescription: { type: String, required: true, maxlength: 160 },
  description: { type: String, default: ""},

  status: {
    type: String,
    enum: ["New", "In Progress", "On Hold", "Resolved", "Closed","Assess", "Authorize", "Scheduled", "Implement", "Review"],
    default: "New",
    required: true,
  },

  state: { type: String }, // Legacy/alias support for frontend/route policy checks

  // Unified Priority Field
  priority: {
  type: String,
  enum: ["1 - Critical", "2 - High", "3 - Medium", "4 - Low", "P1", "P2", "P3", "P4"  ], // Added "Medium"
  default: "3 - Medium" // Fixed fallback to match frontend schema tokens
},

  // Ticket Classifications & Requesters
  type: {
    type: String,
    enum: ["Incident", "ServiceRequest", "Problem", "Change"],
    default: "Incident"
  },
  
  channel: { type: String, default: "Portal" },
  
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requesterName: { type: String, default: "" },

  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assigneeName: { type: String, default: "" },

   impact: { 
    type: String, 
    enum: ["High", "Medium", "Low"], 
    default: "Medium",
    set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v // Forces "medium" -> "Medium"
  },
  urgency: { 
    type: String, 
    enum: ["High", "Medium", "Low"], 
    default: "Medium",
    set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v // Forces "medium" -> "Medium"
  },
  group: { type: String, default: "General Support" },

  // SLA Management
  slaResponseDue: { type: Date },
  slaResolutionDue: { type: Date },
  slaResponseMet: { type: Boolean, default: null },
  slaResolutionMet: { type: Boolean, default: null },
  slaPaused: { type: Boolean, default: false },

  // CMDB Links
  ciId: { type: mongoose.Schema.Types.ObjectId, ref: "CI" },
  ciName: { type: String, default: "" },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "CI" },
  serviceName: { type: String, default: "" },

  // Knowledge & Collaboration
  suggestedKbIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeArticle" }],
  workNotes: [WorkNoteSchema],

  // Problem Linkage
  parentProblemId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  linkedIncidentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],

  isMajorIncident: { type: Boolean, default: false },
  tenant: { type: String, default: "default" }
}, options);

// Auto-generate ticket numbers & keep status/state in sync
baseTicketSchema.pre("save", function () {
  if (!this.number) {
    const prefix = this.type === "ServiceRequest" ? "SR" : "INC";
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(100 + Math.random() * 900);
    this.number = `${prefix}-${timestamp}${randomDigits}`;
  }
  
  // Sync state and status fields
  if (this.status && !this.state) this.state = this.status;
  if (this.state && !this.status) this.status = this.state;
  
});

export const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", baseTicketSchema);


// ------------------------------------------------------------
// 1. IT SERVICE DESK (INCIDENT FORM)
// ------------------------------------------------------------
export const ITIncident = Ticket.discriminators?.ITIncident || Ticket.discriminator(
  "ITIncident",
  new mongoose.Schema({
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    configurationItem: { type: mongoose.Schema.Types.ObjectId, ref: "CMDB_CI", required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    impact: { 
      type: String, 
      enum: ["High", "Medium", "Low"], 
      required: true,
      set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v 
    },
    urgency: { 
      type: String, 
      enum: ["High", "Medium", "Low"], 
      required: true,
      set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v 
    },
    priority: { type: String, required: true }, // Auto-calculated via Matrix
    assignmentGroup: { type: String }, // Mandatory when state != 'New'
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolution: {
      code: {
        type: String,
        enum: ["Solved (Permanently)", "Solved (Workaround)", "Duplicate", "Not Solved"],
      },
      notes: { type: String },
    },
  })
);

// ------------------------------------------------------------
// 2. HR ONBOARDING (SCOPED FORM)
// ------------------------------------------------------------
export const HROnboarding = Ticket.discriminators?.HROnboarding || Ticket.discriminator(
  "HROnboarding",
  new mongoose.Schema({
    newHireName: { type: String, required: true },
    targetStartDate: { type: Date, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    hiringManager: { type: String, required: true },
    impact: { 
      type: String, 
      enum: ["High", "Medium", "Low"], 
      required: true,
      set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v 
    },
    urgency: { 
      type: String, 
      enum: ["High", "Medium", "Low"], 
      required: true,
      set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v 
    },
    employmentType: { type: String, enum: ["Full-Time", "Contractor", "Intern"], required: true },
    jobTitle: { type: String, required: true },
    backgroundCheckStatus: {
      type: String,
      enum: ["Pending", "Passed", "Flagged"],
      default: "Pending",
    },
    fulfillmentTasks: [
      {
        name: { type: String }, // e.g., "IT Provisioning", "Facilities Badge"
        completed: { type: Boolean, default: false },
      },
    ],
  })
);

// ------------------------------------------------------------
// 3. FACILITIES MAINTENANCE (WORK ORDER FORM)
// ------------------------------------------------------------
export const FacilitiesWorkOrder = Ticket.discriminators?.FacilitiesWorkOrder || Ticket.discriminator(
  "FacilitiesWorkOrder",
  new mongoose.Schema({
    location: { type: String, required: true },
    floorSuiteRoom: { type: String, required: true },
    maintenanceType: {
      type: String,
      enum: ["Electrical", "Plumbing", "HVAC", "Structural", "Custodial"],
      required: true,
    },
    assetAffected: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    hazardsIdentified: { type: Boolean, default: false },
    schedulingWindow: {
      start: { type: Date },
      end: { type: Date },
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTech: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  })
);