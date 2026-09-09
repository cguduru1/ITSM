import React, { useEffect, useState } from "react";
import KBPanel from "./KBPanel";
// import api from "../../api/api";
import apiClient from "../api/apiClient";


export default function KBMyContributions() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/kb/my-contributions").then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <KBPanel title="My Contributions">
      <div className="kb-contrib-section">
        <h3>Created</h3>
        <ul>{data.created.map(a => <li key={a._id}>{a.title}</li>)}</ul>

        <h3>Updated</h3>
        <ul>{data.updated.map(a => <li key={a._id}>{a.title}</li>)}</ul>

        <h3>Versions</h3>
        <ul>{data.versions.map(v => (
          <li key={v._id}>v{v.version} — {v.articleId.title}</li>
        ))}</ul>

        <h3>Approvals</h3>
        <ul>{data.approvals.map(a => (
          <li key={a._id}>{a.articleTitle}</li>
        ))}</ul>
      </div>
    </KBPanel>
  );
}
