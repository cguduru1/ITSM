from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/suggest")
def suggest():
    cis = request.json["cis"]
    suggestions = []

    for ci in cis:
        name = ci["name"].lower()
        services = ci.get("services", [])

        # Rule 1: App → DB
        if "nginx" in services or "node" in services:
            for other in cis:
              if "mysql" in other.get("services", []):
                suggestions.append({
                    "sourceId": ci["_id"],
                    "targetId": other["_id"],
                    "type": "depends_on",
                    "confidence": 0.92
                })

        # Rule 2: Server → App
        if ci["type"] == "Server":
            for other in cis:
                if other["type"] == "Application":
                    suggestions.append({
                        "sourceId": ci["_id"],
                        "targetId": other["_id"],
                        "type": "hosts",
                        "confidence": 0.85
                    })

    return jsonify(suggestions)

if __name__ == "__main__":
    app.run(port=5003)
