from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np

app = Flask(__name__)

clf = IsolationForest(contamination=0.15)

@app.post("/classify")
def classify():
    devices = request.json["devices"]
    output = []

    for d in devices:
        features = np.array([
            len(d.get("hostname", "")),
            len(d.get("os", "")),
            len(d.get("services", []))
        ]).reshape(1, -1)

        anomaly = clf.predict(features)[0] == -1

        # Simple CI type classifier
        if "mysql" in d.get("services", []):
            ciType = "Database"
        elif "nginx" in d.get("services", []):
            ciType = "Application"
        elif len(d.get("services", [])) == 0:
            ciType = "Unknown"
        else:
            ciType = "Server"

        output.append({
            "ip": d["ip"],
            "hostname": d["hostname"],
            "os": d.get("os"),
            "services": d.get("services", []),
            "classifiedType": ciType,
            "anomaly": anomaly
        })

    return jsonify(output)

if __name__ == "__main__":
    app.run(port=5001)
