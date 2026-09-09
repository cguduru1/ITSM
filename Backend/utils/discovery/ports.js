import tcpPortUsed from "tcp-port-used";

export async function scanPorts(ip, ports = [22, 80, 443, 3306]) {
  const results = [];

  for (const port of ports) {
    const inUse = await tcpPortUsed.check(port, ip);
    results.push({ port, open: inUse });
  }

  return results;
}
