from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/score")
def score():
    data = request.json
    cpu = data.get("cpu", 0)        # 0–100
    memory = data.get("memory", 0)  # 0–100
    incidents = data.get("incidents", 0)

    # Simple scoring logic (you can replace with ML later)
    score = cpu * 0.4 + memory * 0.3 + incidents * 10

    if score < 40:
        status = "Healthy"
    elif score < 70:
        status = "Warning"
    else:
        status = "Critical"

    return jsonify({"score": score, "status": status})

if __name__ == "__main__":
    app.run(port=5002)
