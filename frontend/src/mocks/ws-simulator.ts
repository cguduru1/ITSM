export function startWsSimulator() {
  // simple interval that triggers a custom event
  setInterval(() => {
    const event = new CustomEvent("ws:asset:updated", {
      detail: { id: "asset_001", fieldsChanged: ["status"], updatedAt: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }, 15000);
}
