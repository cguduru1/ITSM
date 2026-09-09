import { Client } from "ssh2";

export async function sshFingerprint(ip) {
  return new Promise(resolve => {
    const conn = new Client();

    conn.on("ready", () => {
      conn.exec("uname -a", (err, stream) => {
        if (err) return resolve(null);

        let output = "";
        stream.on("data", d => output += d.toString());
        stream.on("close", () => {
          conn.end();
          resolve({
            os: output.includes("Linux") ? "Linux" : "Unknown",
            type: "Server"
          });
        });
      });
    }).connect({
      host: ip,
      username: "root",
      password: "yourpassword"
    });
  });
}
