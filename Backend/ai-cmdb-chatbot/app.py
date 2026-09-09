from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/nlp")
def nlp():
    text = request.json.get("text", "").lower()

    # Intent detection
    if "critical ci" in text or "show me all critical" in text:
        return jsonify({"intent": "list_critical_cis"})

    if "blast radius" in text or "impact of change" in text:
        return jsonify({"intent": "blast_radius"})

    if "why is" in text and "anomaly" in text:
        return jsonify({"intent": "explain_anomaly"})

    if "predict risk" in text and "changes" in text:
        return jsonify({"intent": "bulk_risk"})

    return jsonify({"intent": "unknown"})
    

if __name__ == "__main__":
    app.run(port=5007)
