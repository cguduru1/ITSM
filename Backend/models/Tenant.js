import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    // Trial mode
    trial: { type: Boolean, default: true },
    trialExpiresOn: { type: Date, default: null },

    // Feature toggles
    features: {
      itIncident: { type: Boolean, default: true },
      hrOnboarding: { type: Boolean, default: true },
      facilities: { type: Boolean, default: true },
      assets: { type: Boolean, default: true },
      changes: { type: Boolean, default: true },
      cmdb: { type: Boolean, default: true },
      catalog: { type: Boolean, default: true },
    },

    // Auto-Increment Counters per module
    counters: {
      incident: { type: Number, default: 1000 },
      hrOnboarding: { type: Number, default: 1000 },
      facilities: { type: Number, default: 1000 },
    },

    // Branding
    branding: {
      logoUrl: String,
      primaryColor: { type: String, default: "#1f2937" },
      secondaryColor: { type: String, default: "#3b82f6" },
    },

    // SLA defaults
    slaDefaults: {
      critical: { type: Number, default: 4 },
      high: { type: Number, default: 8 },
      medium: { type: Number, default: 24 },
      low: { type: Number, default: 48 },
    }
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
