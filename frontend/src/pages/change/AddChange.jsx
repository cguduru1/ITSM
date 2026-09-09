import React from "react";
import { useForm } from "react-hook-form";
import api from "../../api/apiClient";
import "../../styles/changeQuantum.css";

export default function AddChange() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: "", description: "", model: "normal", ciIds: [], scheduledStart: "", scheduledEnd: "" }
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/changes", data);
      alert("Change created");
      // navigate or refresh list
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  };

  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Create Change</h2>
        <p className="muted">Add a new change request using the enhanced change model</p>
      </div>

      <form className="quantum-page-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="quantum-card">
          <label>Title</label>
          <input {...register("title", { required: "Title is required" })} />
          {errors.title && <div className="error">{errors.title.message}</div>}
        </div>

        <div className="quantum-card">
          <label>Description</label>
          <textarea {...register("description", { required: "Description required" })} rows={4} />
        </div>

        <div className="quantum-card">
          <label>Model</label>
          <select {...register("model")}>
            <option value="normal">Normal</option>
            <option value="standard">Standard</option>
            <option value="emergency">Emergency</option>
            <option value="devops">DevOps</option>
          </select>
        </div>

        <div className="quantum-card">
          <label>Scheduled Start</label>
          <input type="datetime-local" {...register("scheduledStart")} />
          <label>Scheduled End</label>
          <input type="datetime-local" {...register("scheduledEnd")} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button className="quantum-btn" type="submit" disabled={isSubmitting}>Create Change</button>
        </div>
      </form>
    </div>
  );
}
