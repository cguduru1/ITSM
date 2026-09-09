import cron from "node-cron";
import KnowledgeArticle from "../models/KnowledgeArticle.js";

cron.schedule("0 2 * * *", async () => {
  // Runs daily at 2 AM
  const now = new Date();

  await KnowledgeArticle.updateMany(
    {
      category: "HR",
      expiryDate: { $lt: now },
      status: "Published"
    },
    { status: "Archived" }
  );

  console.log("Archived expired HR documents");
});
