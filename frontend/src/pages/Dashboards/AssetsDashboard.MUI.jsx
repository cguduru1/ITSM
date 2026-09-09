// src/pages/Dashboards/AssetsDashboard.MUI.jsx
import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import apiClient from "../api/apiClient";


const COLORS = ["#0b5fff", "#10b981", "#f59e0b", "#ef4444", "#6b7280", "#8b5cf6"];

export default function AssetsDashboard() {
  const [statusData, setStatusData] = useState([]);
  const [bookSeries, setBookSeries] = useState([]);
  const [warrantyBuckets, setWarrantyBuckets] = useState([]);
  const [licenseUtil, setLicenseUtil] = useState([]);
  const [period, setPeriod] = useState("12m"); // filter example

  useEffect(() => {
    fetchAll();
  }, [period]);

  async function fetchAll() {
    try {
      const [statusRes, bookRes, warrantyRes, licenseRes] = await Promise.all([
        api.get("/api/aggregations/assets/status"),
        api.get("/api/aggregations/assets/book-monthly", { params: { period } }),
        api.get("/api/aggregations/assets/warranty-buckets"),
        api.get("/api/aggregations/licenses/utilization")
      ]);
      setStatusData(statusRes.data || []);
      setBookSeries(bookRes.data || []);
      setWarrantyBuckets(warrantyRes.data || []);
      setLicenseUtil(licenseRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
  }

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Assets Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Assets by Status</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} label>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Total Book Value Over Time</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                  <MenuItem value="6m">6 months</MenuItem>
                  <MenuItem value="12m">12 months</MenuItem>
                  <MenuItem value="24m">24 months</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={bookSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalBookValue" stroke="#0b5fff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Warranty Expiry Buckets</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={warrantyBuckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">License Utilization</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={licenseUtil}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="licenseName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="allocated" stackId="a" fill="#ef4444" />
                <Bar dataKey="totalSeats" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
