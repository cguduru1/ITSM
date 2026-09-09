// itsm-backend/controllers/kbController.js

export const getAttachments = async (req, res) => {
  try {
    return res.status(200).json([
      { id: "att-1", name: "HR_Policy_2024.pdf", size: "1.2 MB", type: "document" },
      { id: "att-2", name: "Troubleshooting.png", size: "450 KB", type: "image" }
    ]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attachments", error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    // Replace with your Mongoose model lookup:
    // const article = await KnowledgeArticle.findById(id);
    // if (!article) return res.status(404).json({ message: "Article not found" });
    return res.status(200).json({ _id: id, title: "Sample Article" });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving article", error: error.message });
  }
};