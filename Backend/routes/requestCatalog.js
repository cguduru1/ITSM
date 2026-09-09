import express from "express";
import RequestCatalogItem from "../models/RequestCatalogItem.js";
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();

router.get(
  "/",
  requirePermission("ticket", "view"),
  async (req, res) => {
    const items = await RequestCatalogItem.find().lean();
    res.json(items);
  }
);

export default router;
