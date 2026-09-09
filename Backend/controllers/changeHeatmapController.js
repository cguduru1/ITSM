import Change from "../models/Change.js";

  export async function getHeatmap(req, res) {
  try {
    const changes = await Change.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: "Heatmap generation failed" });
  }
};
