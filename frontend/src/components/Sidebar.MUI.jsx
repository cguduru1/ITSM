import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { key: "assets", label: "Assets", icon: <InventoryIcon />, path: "/assets" },
  { key: "procurement", label: "Procurement", icon: <ReceiptLongIcon />, path: "/procurement" },
  { key: "licenses", label: "Licenses", icon: <PeopleIcon />, path: "/licenses" },
  { key: "settings", label: "Settings", icon: <SettingsIcon />, path: "/settings" }
];

export default function SidebarMUI({ open = true, onNavigate }) {
  return (
    <Drawer variant="permanent" open={open} PaperProps={{ sx: { width: 240 } }}>
      <Toolbar />
      <List>
        {navItems.map(item => (
          <ListItemButton key={item.key} onClick={() => onNavigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
