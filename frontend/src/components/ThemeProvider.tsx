import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";

const ThemeContext = createContext({ theme: "light", setTheme: (t: string) => {} });

export const useAppTheme = () => useContext(ThemeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    // persist to server (mock)
    fetch("/api/users/me/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme })
    }).catch(() => {});
  }, [theme]);

  const muiTheme = createTheme({
    palette: { mode: theme === "dark" ? "dark" : "light", primary: { main: "#0B5FFF" } }
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
