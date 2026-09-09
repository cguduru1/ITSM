// src/components/kb/KBPanel.jsx
import React from "react";
import { motion } from "framer-motion";

export default function KBPanel({ children, title }) {
  return (
    <motion.div
      className="kb-panel quantum"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1 }
      }}
    >
      {title && <h2>{title}</h2>}
      {children}
    </motion.div>
  );
}
