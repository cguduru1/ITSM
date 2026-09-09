// itsm-backend/controllers/ciStreamController.js
import CI from "../models/CI.js";

export const streamCiHealth = (req, res) => {
  // 1. Establish SSE HTTP streaming headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // Keep connection open by telling browser to retry every 5 seconds if disconnected
  res.write("retry: 5000\n\n");

  console.log("🔌 Live Client attached to CMDB infrastructure stream");

  // 2. Open a MongoDB Change Stream watching the CI collection
  // fullDocument: "updateLookup" ensures we get the entire updated document, not just diffs
  const changeStream = CI.watch([], { fullDocument: "updateLookup" });

  // 3. Listen for database updates
  changeStream.on("change", (changeEvent) => {
    const { operationType, fullDocument } = changeEvent;

    if (operationType === "update" || operationType === "replace") {
      // Structure the data packet efficiently for the frontend map
      const streamPayload = {
        _id: fullDocument._id,
        name: fullDocument.name,
        metrics: fullDocument.metrics,
        healthStatus: fullDocument.healthStatus,
        lastErrorLog: fullDocument.lastErrorLog,
      };

      // SSE requires data to be prefixed with 'data: ' and end with two newlines
      res.write(`data: ${JSON.stringify(streamPayload)}\n\n`);
    }
  });

  // 4. Handle unexpected connection drops or stream pipeline errors
  changeStream.on("error", (err) => {
    console.error("MongoDB Change Stream error encountered:", err);
  });

  // 5. Clean up when a technician closes the browser tab or navigates away
  req.on("close", () => {
    console.log("❌ Client disconnected from CMDB infrastructure stream");
    changeStream.close();
  });
};
