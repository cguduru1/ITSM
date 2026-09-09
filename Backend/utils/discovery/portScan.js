import tcpPortUsed from "tcp-port-used";

export async function portScan(ip, ports = [22, 80, 443, 3306, 8080]) {
  const openPorts = [];

  for (const port of ports) {
    const inUse = await tcpPortUsed.check(port, ip).catch(() => false);
    if (inUse) openPorts.push(port);
  }

  return openPorts;
}
