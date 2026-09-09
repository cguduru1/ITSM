import License from "../models/License.js";

export async function licenseCompliance() {
  try {
    const licenses = await License.find();
    return licenses;
  } catch (err) {
    console.error("LICENSE COMPLIANCE ERROR:", err);
    return [];
  }
}

export async function checkLicenseCompliance(asset) {
  try {
    const license = await License.findOne({ software: asset.name });

    if (!license) return { asset: asset.name, status: "No License Found" };

    const compliant = license.usedSeats <= license.totalSeats;

    return {
      asset: asset.name,
      compliant,
      usedSeats: license.usedSeats,
      totalSeats: license.totalSeats
    };
  } catch (err) {
    console.error("CHECK LICENSE ERROR:", err);
  }
}
