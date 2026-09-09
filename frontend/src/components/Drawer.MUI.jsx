import React from "react";
import { Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function DrawerMUI({ open, onClose, width = 640, children }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width } }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </Drawer>
  );
}
