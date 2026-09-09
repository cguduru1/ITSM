import React from "react";
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function AssetFinancialTab({ financial }) {
  if (!financial) return <Typography>No financial data available.</Typography>;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Financial Summary</Typography>
        <Typography>Purchase Date: {financial.purchaseDate ? new Date(financial.purchaseDate).toLocaleDateString() : "—"}</Typography>
        <Typography>Purchase Cost: {financial.purchaseCost != null ? financial.purchaseCost.toLocaleString() : "—"}</Typography>
        <Typography>Residual Value: {financial.residualValue != null ? financial.residualValue.toLocaleString() : "—"}</Typography>
        <Typography>Depreciation Method: {financial.depreciationMethod || "—"}</Typography>
        <Typography>Current Book Value: {financial.currentBookValue != null ? financial.currentBookValue.toLocaleString() : "—"}</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Depreciation Schedule</Typography>
        {financial.depreciationSchedule?.length ? (
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Period</TableCell><TableCell>Depreciation</TableCell><TableCell>Book Value</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {financial.depreciationSchedule.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>{r.depreciation.toLocaleString()}</TableCell>
                  <TableCell>{r.bookValue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <Typography>No schedule available.</Typography>}
      </Paper>
    </Box>
  );
}
