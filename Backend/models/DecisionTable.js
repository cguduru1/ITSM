// models/DecisionTable.js
import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  action: { type: String, required: true },
  outcome: { type: String, required: true }
});

const decisionTableSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default Table" },
    rules: [ruleSchema],
    tenant: { type: String, default: "default" }
  },
  { timestamps: true }
);

const DecisionTable = mongoose.model("DecisionTable", decisionTableSchema);
export default DecisionTable;
