import arp from "node-arp";

export function getMac(ip) {
  return new Promise((resolve) => {
    arp.getMAC(ip, (err, mac) => {
      resolve({ ip, mac: mac || null });
    });
  });
}
