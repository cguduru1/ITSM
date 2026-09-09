import { useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

export default function AssetQR() {
  const { id } = useParams();
  const [qr, setQr] = useState("");

  useEffect(() => {
    api.get(`/assets/${id}/qr`).then((res) => setQr(res.data.qr));
  }, [id]);

  return (
    <div className="page">
      <h1>Asset QR Code</h1>
      <img src={qr} alt="QR Code" />
    </div>
  );
}
