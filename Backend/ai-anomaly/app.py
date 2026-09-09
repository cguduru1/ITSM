from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/anomaly")
def anomaly():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400
    
    cpu = data.get("cpu", 0)
    memory = data.get("memory", 0)
    errors = data.get("errors", 0)

    # Simple anomaly rules (upgrade to ML later)
    is_anomaly = (cpu > 90) or (memory > 95) or (errors > 50)

    return jsonify({"isAnomaly": is_anomaly})

if __name__ == "__main__":
    # app.run(port=5005)
    pass
