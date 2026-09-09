import React from "react";
import { Box, Grid, Paper, Typography, Link } from "@mui/material";

export default function AssetOverviewTab({ asset, procurement }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Overview</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{asset.description || "No description."}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Metadata</Typography>
              <Typography variant="body2">Manufacturer: {asset.product?.manufacturer || "—"}</Typography>
              <Typography variant="body2">Model: {asset.product?.modelName || asset.modelId || "—"}</Typography>
              <Typography variant="body2">Serial: {asset.serialNumber || "—"}</Typography>
              <Typography variant="body2">Location: {asset.locationId || "—"}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Procurement</Typography>
            <Typography variant="body2">PO: {procurement?.poNumber ? <Link href={`/procurement/${procurement.poNumber}`}>{procurement.poNumber}</Link> : "—"}</Typography>
            <Typography variant="body2">Invoice: {procurement?.invoiceNumber || "—"}</Typography>
            <Typography variant="body2">Vendor: {procurement?.vendorId || "—"}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
