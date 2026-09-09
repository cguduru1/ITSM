import React from "react";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SidebarMUI from "../components/Sidebar.MUI";
import { useNavigate } from "react-router-dom";

export default function MainLayoutMUI({ children }) {
  const nav = useNavigate();
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" noWrap component="div">ITSM</Typography>
        </Toolbar>
      </AppBar>

      <SidebarMUI onNavigate={(path) => nav(path)} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
