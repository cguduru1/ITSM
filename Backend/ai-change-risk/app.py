from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/risk")
def risk():
    data = request.json

    impacted = data.get("impacted", 0)
    anomalies = data.get("anomalies", 0)
    health = data.get("health", 100)
    priority = data.get("priority", "Medium")
    relations = data.get("relations", 0)

    score = 0

    # Impacted CIs
    score += impacted * 10

    # Anomalies increase risk heavily
    score += anomalies * 15

    # Poor health increases risk
    score += max(0, 100 - health)

    # Relationship blast radius
    score += relations * 5

    # Priority weighting
    if priority == "High":
        score += 20
    elif priority == "Medium":
        score += 10

    # Normalize
    score = min(score, 100)

    # Risk Level
    if score < 25:
        level = "Low"
    elif score < 50:
        level = "Medium"
    elif score < 75:
        level = "High"
    else:
        level = "Critical"

    return jsonify({
        "riskScore": score,
        "riskLevel": level
    })

if __name__ == "__main__":
    app.run(port=5006)
