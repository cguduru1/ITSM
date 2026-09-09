import React from "react";
import { Box, Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function AssetAuditTab({ audits = [] }) {
  if (!audits || !audits.length) return <Typography>No audit entries</Typography>;

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Audit Trail</Typography>
        <List>
          {audits.map(a => (
            <ListItem key={a._id} alignItems="flex-start">
              <ListItemText
                primary={`${a.actionType} — ${a.changedBy} • ${new Date(a.changedAt).toLocaleString()}`}
                secondary={<pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{a.newValue || a.oldValue}</pre>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
