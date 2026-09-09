import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function NewTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/api/tickets", {
        title,
        description,
        category,
        priority
      });

      alert("Ticket created successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
    } catch (err) {
      console.error(err);
      alert("Failed to create ticket");
    }
  };

  return (
    <MainLayout>
      <div className="new-ticket-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Create New Ticket</h1>
          <p className="page-subtitle">Submit an issue or request for IT support</p>
        </div>

        {/* Form */}
        <form className="ticket-form-card" onSubmit={submit}>
          
          <label>Title</label>
          <input
            placeholder="Enter ticket title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Description</label>
          <textarea
            placeholder="Describe the issue or request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Access Request">Access Request</option>
          </select>

          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <button type="submit" className="btn-primary">
            Create Ticket
          </button>
        </form>

      </div>
    </MainLayout>
  );
}
