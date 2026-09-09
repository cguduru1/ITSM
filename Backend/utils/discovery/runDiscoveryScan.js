import { pingScan } from "./pingScan.js";
import { portScan } from "./portScan.js";
import { snmpScan } from "./snmpScan.js";
import { sshFingerprint } from "./sshFingerprint.js";
import arp from "node-arp";

export async function runDiscoveryScan() {
  const ipRange = [
    "10.0.0.5",
    "10.0.0.10",
    "10.0.0.20",
    "10.0.0.30",
    "10.0.0.40"
  ];

  // Step 1: Ping Sweep
  const aliveHosts = await pingScan(ipRange);

  const results = [];

  for (const host of aliveHosts) {
    const ip = host.ip;

    // Step 2: Port Scan
    const ports = await portScan(ip);

    // Step 3: SNMP Scan
    const snmpInfo = await snmpScan(ip);

    // Step 4: SSH Fingerprint
    const sshInfo = await sshFingerprint(ip);

    // Step 5: MAC Address
    const mac = await new Promise(resolve => {
      arp.getMAC(ip, (err, mac) => resolve(mac || null));
    });

    results.push({
      ip,
      ports,
      mac,
      snmp: snmpInfo,
      ssh: sshInfo,
      hostname: sshInfo?.os ? `linux-${ip}` : `device-${ip}`,
      os: sshInfo?.os || snmpInfo?.sysDescr || "Unknown",
      services: ports.map(p => {
        if (p === 22) return "ssh";
        if (p === 80) return "http";
        if (p === 443) return "https";
        if (p === 3306) return "mysql";
        return `port-${p}`;
      })
    });
  }

  return results;
}
