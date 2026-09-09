import React, { useState } from "react";
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { revokeAllocation } from "../../api/assetApi";

export default function AssetAllocationsTab({ allocations = [], assetId }) {
  const [items, setItems] = useState(allocations || []);

  async function handleRevoke(allocationId) {
    if (!window.confirm("Revoke this allocation?")) return;
    try {
      await revokeAllocation(allocationId);
      setItems(items.filter(a => a.allocationId !== allocationId));
      alert("Allocation revoked");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed to revoke");
    }
  }

  if (!items.length) return <Typography>No allocations</Typography>;

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Allocations</Typography>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>License</TableCell><TableCell>User</TableCell><TableCell>Assigned At</TableCell><TableCell>Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {items.map(a => (
              <TableRow key={a.allocationId}>
                <TableCell><a href={`/licenses/${a.licenseId}`}>{a.licenseName || a.licenseId}</a></TableCell>
                <TableCell>{a.assignedTo || "—"}</TableCell>
                <TableCell>{a.assignedAt ? new Date(a.assignedAt).toLocaleString() : "—"}</TableCell>
                <TableCell><Button color="error" onClick={() => handleRevoke(a.allocationId)}>Revoke</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
