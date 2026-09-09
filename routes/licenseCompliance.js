export const licenseCompliance = async () => {
  const assets = await Asset.find({ type: "Software" });

  return assets.map((a) => ({
    software: a.name,
    owner: a.owner,
    compliant: a.tags.includes("Licensed")
  }));
};
