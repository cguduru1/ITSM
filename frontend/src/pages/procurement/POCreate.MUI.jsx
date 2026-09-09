import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Box, Paper, Grid, TextField, Button, MenuItem, Typography } from "@mui/material";
import { createPO, getCatalog } from "../../api/assetApi";
import { useNavigate } from "react-router-dom";

const defaultItem = () => ({ modelId: "", quantity: 1, unitCost: 0, assetName: "", warrantyExpiryDate: "" });

export default function POCreateMUI() {
  const nav = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const { control, register, handleSubmit } = useForm({
    defaultValues: { poNumber: "", vendorId: "", requestedBy: "", receivingLocation: "", invoiceNumber: "", items: [defaultItem()] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    getCatalog().then(r => setCatalog(r.data || [])).catch(() => setCatalog([]));
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await createPO(data);
      nav("/procurement");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed to create PO");
    } finally { setSaving(false); }
  };

  return (
    <Box p={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Create Purchase Order</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField fullWidth label="PO Number" {...register("poNumber")} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Vendor" {...register("vendorId")} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Requested By" {...register("requestedBy")} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Receiving Location" {...register("receivingLocation")} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Invoice Number" {...register("invoiceNumber")} /></Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="subtitle1">Items</Typography>
            {fields.map((field, index) => (
              <Grid container spacing={2} key={field.id} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`items.${index}.modelId`}
                    control={control}
                    render={({ field }) => (
                      <TextField select fullWidth label="Model" {...field}>
                        <MenuItem value="">Select model</MenuItem>
                        {catalog.map(c => <MenuItem key={c.modelId} value={c.modelId}>{c.manufacturer} {c.modelName}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Quantity" {...register(`items.${index}.quantity`)} /></Grid>
                <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Unit Cost" {...register(`items.${index}.unitCost`)} /></Grid>
                <Grid item xs={12} md={3}><TextField fullWidth label="Asset Name (optional)" {...register(`items.${index}.assetName`)} /></Grid>
                <Grid item xs={12} md={1}><Button color="error" onClick={() => remove(index)}>Remove</Button></Grid>
              </Grid>
            ))}

            <Box mt={2}><Button onClick={() => append(defaultItem())}>Add Item</Button></Box>
          </Box>

          <Box mt={3} display="flex" gap={2}>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? "Creating…" : "Create PO"}</Button>
            <Button variant="outlined" onClick={() => nav("/procurement")}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
