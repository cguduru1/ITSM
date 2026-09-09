from flask import Flask, request, jsonify

app = Flask(__name__)

def traverse_graph(ci_id, cis):
    # Build adjacency list
    adj = {}
    for ci in cis:
        adj[str(ci["_id"])] = [str(rel["target"]) for rel in ci.get("relationships", [])]

    visited = set()
    stack = [ci_id]
    impacted = []

    while stack:
        current = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        impacted.append(current)
        for neighbor in adj.get(current, []):
            stack.append(neighbor)

    return impacted[1:]  # exclude root itself

@app.post("/impact")
def impact():
    data = request.json
    ci_id = data["ciId"]
    cis = data["cis"]

    impacted_ids = traverse_graph(ci_id, cis)
    # Simple risk: number of impacted CIs * 10
    risk = len(impacted_ids) * 10

    return jsonify({
        "impacted": impacted_ids,
        "risk": risk
    })

if __name__ == "__main__":
    app.run(port=5004)
