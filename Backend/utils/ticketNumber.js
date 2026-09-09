import Tenant from "../models/Tenant.js";

export async function generateTicketNumber(tenantCode, ticketType) {
  const prefixMap = {
    ITIncident: "INC",
    HROnboarding: "ONB",
    FacilitiesWorkOrder: "WO",
  };

  const counterKeyMap = {
    ITIncident: "counters.incident",
    HROnboarding: "counters.hrOnboarding",
    FacilitiesWorkOrder: "counters.facilities",
  };

  const prefix = prefixMap[ticketType] || "TICK";
  const fieldToIncrement = counterKeyMap[ticketType];

  // Atomically increment the counter on the tenant document
  const updatedTenant = await Tenant.findOneAndUpdate(
    { code: tenantCode.toUpperCase() },
    { $inc: { [fieldToIncrement]: 1 } },
    { new: true }
  );

  const counterVal = updatedTenant.counters[ticketType === "ITIncident" ? "incident" : ticketType === "HROnboarding" ? "hrOnboarding" : "facilities"];
  
  return `${prefix}${counterVal}`;
}