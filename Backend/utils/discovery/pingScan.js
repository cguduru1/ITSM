import ping from "net-ping";

export async function pingScan(ipList) {
  const session = ping.createSession();
  const results = [];

  for (const ip of ipList) {
    const alive = await new Promise(resolve => {
      session.pingHost(ip, (err) => resolve(!err));
    });

    results.push({ ip, alive });
  }

  return results.filter(r => r.alive);
}
