import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, TextField } from "@mui/material";
import api from "../../api/apiClient.js";

export default function RecommendationsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handler, setHandler] = useState("");

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    setLoading(true);
    try {
      const res = await api.get("/api/recommendations?unhandled=true");
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  async function handleAction(id, action) {
    if (!handler) {
      alert("Enter your name/email in the Handler field before marking handled.");
      return;
    }
    try {
      await api.post(`/api/recommendations/${id}/handle`, { action, handledBy: handler });
      fetch();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed");
    }
  }

  async function runSnapshot() {
    try {
      await api.post("/api/recommendations/snapshot", { limit: 100 });
      fetch();
      alert("Snapshot created");
    } catch (err) {
      alert("Snapshot failed");
    }
  }

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">AI Recommendations Admin</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <TextField size="small" placeholder="Your name/email" value={handler} onChange={(e) => setHandler(e.target.value)} />
          <Button variant="contained" onClick={runSnapshot}>Run Snapshot</Button>
          <Button variant="outlined" onClick={fetch}>Refresh</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Reasons</TableCell>
              <TableCell>Snapshot</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r.assetId}</TableCell>
                <TableCell>{r.score}</TableCell>
                <TableCell><Chip label={r.severity} color={r.severity === "high" ? "error" : r.severity === "medium" ? "warning" : "default"} /></TableCell>
                <TableCell>{(r.reasons || []).join("; ")}</TableCell>
                <TableCell><pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(r.snapshot || {}, null, 2)}</pre></TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="error" onClick={() => handleAction(r._id, "approve-replace")}>Approve Replace</Button>
                  <Button size="small" sx={{ ml: 1 }} onClick={() => handleAction(r._id, "schedule-maintenance")}>Schedule Maint.</Button>
                  <Button size="small" sx={{ ml: 1 }} onClick={() => handleAction(r._id, "ignore")}>Ignore</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && !loading && (
              <TableRow><TableCell colSpan={6}><Typography align="center" sx={{ p: 2 }}>No unhandled recommendations</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
