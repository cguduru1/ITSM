import ping from "net-ping";

export async function pingHost(ip) {
  return new Promise((resolve) => {
    const session = ping.createSession();
    session.pingHost(ip, (error, target) => {
      if (error) {
        resolve({ ip: target, alive: false });
      } else {
        resolve({ ip: target, alive: true });
      }
    });
  });
}
