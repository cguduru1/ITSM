import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssetWorkspace, printAssetTag } from "../../api/assetApi";
import {
  Box, Paper, Grid, Typography, Button, Chip, Tabs, Tab, CircularProgress
} from "@mui/material";
import AssetOverviewTab from "./AssetOverviewTab.MUI";
import AssetFinancialTab from "./AssetFinancialTab.MUI";
import AssetAllocationsTab from "./AssetAllocationsTab.MUI";
import AssetAuditTab from "./AssetAuditTab.MUI";

export default function AssetWorkspaceMUI() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAssetWorkspace(id)
      .then(r => { if (mounted) setData(r.data); })
      .catch(err => { setError(err?.response?.data?.error || err?.message || "Failed to load"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  if (!data || !data.asset) return <Box p={4}><Typography>No asset found</Typography></Box>;

  const { asset, financial, allocations, audits, procurement } = data;

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h5">{asset.assetName || asset.assetTag}</Typography>
            <Typography variant="body2" color="text.secondary">
              {asset.modelId} • {asset.serialNumber || "—"}
            </Typography>
            <Box mt={1}>
              <Chip label={asset.status || "Unknown"} color={asset.status === "Retired" ? "default" : "primary"} />
              {procurement?.poNumber && (
                <Button size="small" sx={{ ml: 1 }} onClick={() => nav(`/procurement/${procurement.poNumber}`)}>
                  PO {procurement.poNumber}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item>
            <Typography variant="caption" display="block">Book Value</Typography>
            <Typography variant="h6">{financial?.currentBookValue != null ? financial.currentBookValue.toLocaleString() : "—"}</Typography>
          </Grid>

          <Grid item>
            <Button variant="contained" sx={{ mr: 1 }} onClick={() => nav(`/assets/${asset.assetId}/edit`)}>Edit</Button>
            <Button variant="outlined" sx={{ mr: 1 }} onClick={() => printAssetTag(asset.assetId)}>Print Tag</Button>
            <Button variant="contained" color="secondary" onClick={() => nav(`/assets/${asset.assetId}/retire`)}>Retire</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="Asset tabs">
          <Tab label="Overview" />
          <Tab label="Financial" />
          <Tab label="Allocations" />
          <Tab label="Audit" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 0 && <AssetOverviewTab asset={asset} procurement={procurement} />}
          {tab === 1 && <AssetFinancialTab financial={financial} asset={asset} />}
          {tab === 2 && <AssetAllocationsTab allocations={allocations} assetId={asset.assetId} />}
          {tab === 3 && <AssetAuditTab audits={audits} assetId={asset.assetId} />}
        </Box>
      </Paper>
    </Box>
  );
}
