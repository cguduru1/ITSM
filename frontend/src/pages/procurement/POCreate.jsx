// src/pages/Procurement/POCreate.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { Link } from "react-router-dom";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 
import { getPOById, createPO, updatePO, getCatalog } from "../../api/assetApi";

const defaultItem = () => ({ modelId: "", quantity: 1, unitCost: 0, assetName: "", warrantyMonths: 12 });

export default function POCreate() {
  const { id } = useParams();
  const isEditMode = !!id;
  const nav = useNavigate();

  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      poNumber: "",
      vendorId: "",
      requestedBy: "",
      receivingLocation: "",
      invoiceNumber: "",
      items: [defaultItem()] 
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // 🛠️ FIX 1: Fetch Catalog (Runs always on page load)
  useEffect(() => {
    let mounted = true;
    getCatalog()
      .then((r) => {
        console.log("Catalog raw API response:", r);
        if (mounted) {
          const rawData = r?.data !== undefined ? r.data : r;
          const list = Array.isArray(rawData) 
            ? rawData 
            : rawData?.catalog || rawData?.items || rawData?.data || [];
          setCatalog(list);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch catalog:", err);
        if (mounted) setCatalog([]);
      });

    return () => { mounted = false; };
  }, []);

  // 🛠️ FIX 2: Fetch Mongoose PO Record (Isolated - Runs ONLY during Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;

    setLoading(true);
    getPOById(id)
      .then((data) => {
        const poData = data.data || data;
        // Hydrate React Hook Form with database document properties
        reset({
          poNumber: poData.poNumber || "",
          vendorId: poData.vendorId?._id || poData.vendorId || "", 
          requestedBy: poData.requestedBy?._id || poData.requestedBy || "",
          receivingLocation: poData.receivingLocation || "",
          invoiceNumber: poData.invoiceNumber || "",
          // ✅ FIX: Fallback to [defaultItem()] if items array is empty
          items: poData.items && poData.items.length > 0
            ? poData.items.map((item) => ({
                modelId: item.modelId?._id || item.modelId || "",
                quantity: item.quantity || 1,
                unitCost: item.unitCost || 0,
                assetName: item.assetName || "",
                warrantyMonths: item.warrantyMonths ?? 12
              }))
            : [defaultItem()]
        });
      })
      .catch((err) => {
        console.error("Error fetching record values:", err);
        setServerError("Failed to load purchase order data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isEditMode, reset]);

  // 🛠️ FIX 3: Submission Router logic branches correctly
  const onSubmit = async (data) => {
    console.log("Submitting PO payload:", data);
    setServerError(null);
    setSaving(true);
    try {
      const payload = {
        poNumber: data.poNumber,
        vendorId: data.vendorId,
        requestedBy: data.requestedBy,
        receivingLocation: data.receivingLocation,
        invoiceNumber: data.invoiceNumber,
        items: (data.items || []).map((it) => ({
          modelId: it.modelId,
          quantity: Number(it.quantity) || 1,
          unitCost: Number(it.unitCost) || 0,
          assetName: it.assetName || undefined,
          warrantyMonths: Number(it.warrantyMonths) || 12
        }))
      };

     if (isEditMode) {
        await updatePO(id, payload);
        alert("Purchase Order updated successfully");
      } else {
        await createPO(payload);
        alert("Purchase Order created successfully");
      }
      reset();
      nav("/procurement");
    } catch (err) {
      console.error("PO Save failed:", err);
      setServerError(err?.response?.data?.message || err?.message || "Failed to save PO");
    } finally {
      setSaving(false);
    }
  };

  const onError = (formErrors) => {
  console.warn("Form validation failed:", formErrors);
};

  if (loading) return <div className="quantum-card quantum-info">Loading record data...</div>;

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
        <h1>{isEditMode ? "✏️ Edit Purchase Order" : "📝 Create Purchase Order"}</h1>
        <Link to="/procurement" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard 
        </Link>
      </div>

      {/* Form */}
    <form onSubmit={handleSubmit(onSubmit, onError)} className="quantum-form">
      <div className="quantum-card quantum-form-body">
        {/* Top fields */}
        <div className="quantum-grid quantum-grid-3 mb-4">
          <div>
            <label className="quantum-label">PO Number</label>
            <input
              className="quantum-input"
              {...register("poNumber", { required: "PO Number is required" })}
            />
            {errors.poNumber && (
              <p className="quantum-error">{errors.poNumber.message}</p>
            )}
          </div>

          <div>
            <label className="quantum-label">Vendor</label>
            <input className="quantum-input" {...register("vendorId")} />
          </div>

          <div>
            <label className="quantum-label">Requested By</label>
            <input className="quantum-input" {...register("requestedBy")} />
          </div>

          <div>
            <label className="quantum-label">Receiving Location</label>
            <input className="quantum-input" {...register("receivingLocation")} />
          </div>

          <div>
            <label className="quantum-label">Invoice Number</label>
            <input className="quantum-input" {...register("invoiceNumber")} />
          </div>
        </div>

         {/* Items Section */}
        <section>
          <h3 className="quantum-heading">Items</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="quantum-grid quantum-grid-6 quantum-item-row mb-2"
              style={{
                background: index % 2 === 0 ? "#1e293b" : "#0f172a",
                padding: "12px",
                borderRadius: "6px"
              }}
            >
              <div>
                <label className="quantum-label">Model *</label>
                {catalog.length > 0 ? (
                  <select
                    className="quantum-input"
                    {...register(`items.${index}.modelId`, { required: "Model is required" })}
                  >
                    <option value="">Select model</option>
                    {catalog.map((c, i) => {
                      const id = c._id || c.id || c.modelId || i;
                      const name = c.modelName || c.name || c.title || c.model || `Model #${id}`;
                      const brand = c.manufacturer || c.vendor || "";
                      return (
                        <option key={id} value={id}>
                          {brand ? `${brand} - ` : ""}{name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    className="quantum-input"
                    placeholder="Type Model ID or Name"
                    {...register(`items.${index}.modelId`, { required: "Model is required" })}
                  />
                )}
                {errors.items?.[index]?.modelId && (
                  <p className="quantum-error">{errors.items[index].modelId.message}</p>
                )}
              </div>

              <div>
                <label className="quantum-label">Quantity</label>
                <input
                  className="quantum-input"
                  type="number"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    min: { value: 1, message: "Min 1" }
                  })}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="quantum-error">{errors.items[index].quantity.message}</p>
                )}
              </div>

              <div>
                <label className="quantum-label">Unit Cost</label>
                <input
                  className="quantum-input"
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitCost`, {
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be >= 0" }
                  })}
                />
                {errors.items?.[index]?.unitCost && (
                  <p className="quantum-error">{errors.items[index].unitCost.message}</p>
                )}
              </div>

              <div>
                <label className="quantum-label">Asset Name</label>
                <input
                  className="quantum-input"
                  {...register(`items.${index}.assetName`)}
                  placeholder="Optional asset name"
                />
              </div>

              <div>
                <label className="quantum-label">Warranty (Months)</label>
                <input
                  className="quantum-input"
                  type="number"
                  min="0"
                  {...register(`items.${index}.warrantyMonths`, { valueAsNumber: true })}
                  placeholder="12"
                />
              </div>

              <div>
                <button
                  type="button"
                  className="quantum-btn quantum-btn-danger mt-4"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mb-4">
            <button
              type="button"
              className="quantum-btn quantum-btn-secondary"
              onClick={() => append(defaultItem())}
            >
              + Add Item
            </button>
          </div>
        </section>

        {/* Server error */}
        {serverError && <div className="quantum-error mb-3">{serverError}</div>}

        {/* Actions */}
        <div className="quantum-form-actions">
          {/* 🚀 Dynamic Submit Button Label Configuration */}
          <button
            type="submit"
            className="quantum-btn quantum-btn-primary"
            disabled={saving}
          >
            {saving ? (isEditMode ? "Saving…" : "Creating…") : (isEditMode ? "Save Changes" : "Create PO")}
          </button>
          <button
            type="button"
            className="quantum-btn quantum-btn-secondary"
            onClick={() => nav("/procurement")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  </div>
);
}