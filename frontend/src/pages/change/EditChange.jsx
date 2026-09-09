import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/changeQuantum.css";

export default function EditChange() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    api.get(`/changes/${id}`).then(res => reset(res.data)).catch(err => console.error(err));
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      await api.put(`/changes/${id}`, data);
      alert("Updated");
      navigate("/workspace/change");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Edit Change</h2>
      </div>

      <form className="quantum-page-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="quantum-card">
          <label>Title</label>
          <input {...register("title", { required: "Title required" })} />
          {errors.title && <div className="error">{errors.title.message}</div>}
        </div>

        <div className="quantum-card">
          <label>Description</label>
          <textarea {...register("description")} rows={4} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button className="quantum-btn" type="submit" disabled={isSubmitting}>Save</button>
        </div>
      </form>
    </div>
  );
}
