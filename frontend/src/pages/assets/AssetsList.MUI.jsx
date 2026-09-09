import React, { useEffect, useState } from "react";
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DrawerMUI from "../../components/Drawer.MUI";
import AssetWorkspaceMUI from "./AssetWorkspace.MUI";
import { getAssets } from "../../api/assetApi";

export default function AssetsListMUI() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  useEffect(() => {
    let mounted = true;
    getAssets().then(r => { if (mounted) setAssets(r.data || []); }).catch(() => setAssets([])).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function openWorkspace(assetId) {
    setSelectedAssetId(assetId);
    setDrawerOpen(true);
  }

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Assets</Typography>
        <Button variant="contained" href="/procurement/new">Create PO</Button>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Book Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {assets.map(a => (
              <TableRow key={a.assetId} hover>
                <TableCell>{a.assetTag}</TableCell>
                <TableCell>{a.assetName}</TableCell>
                <TableCell>{a.modelId}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{a.currentBookValue != null ? a.currentBookValue.toLocaleString() : "—"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openWorkspace(a.assetId)}><VisibilityIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <DrawerMUI open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerOpen && <AssetWorkspaceMUI />}
      </DrawerMUI>
    </Box>
  );
}
