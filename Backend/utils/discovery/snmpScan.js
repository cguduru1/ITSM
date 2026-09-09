import snmp from "snmp-native";

export async function snmpScan(ip) {
  return new Promise(resolve => {
    const session = new snmp.Session({ host: ip, community: "public" });

    session.get({ oid: [1,3,6,1,2,1,1,1,0] }, (err, data) => {
      if (err) return resolve(null);

      resolve({
        sysDescr: data[0]?.value?.toString(),
        type: "Network Device"
      });
    });
  });
}
