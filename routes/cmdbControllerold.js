exports.getGraph = async (req, res) => {
  try {
    const cis = await CMDB.find().populate("dependencies dependents");

    const nodes = cis.map(ci => ({
      id: ci._id,
      label: ci.name,
      status: ci.operational_status
    }));

    const links = [];

    cis.forEach(ci => {
      ci.dependencies.forEach(dep => {
        links.push({
          source: ci._id,
          target: dep._id
        });
      });
    });

    res.json({ nodes, links });
  } catch (err) {
    res.status(500).json({ error: "Graph load failed" });
  }

  exports.getRelationships = async (req, res) => {
  try {
    const ci = await CMDB.findById(req.params.id)
      .populate("dependencies dependents related_assets related_changes");

    res.json({
      dependencies: ci.dependencies,
      dependents: ci.dependents,
      assets: ci.related_assets,
      changes: ci.related_changes
    });
  } catch (err) {
    res.status(500).json({ error: "Relationship load failed" });
  }
};

exports.calculateImpact = async (req, res) => {
  try {
    const { ciId } = req.body;

    const ci = await CMDB.findById(ciId)
      .populate("dependencies dependents related_assets related_changes");

    const impactScore =
      (ci.dependencies.length * 2) +
      (ci.dependents.length * 3) +
      (ci.related_assets.length * 1) +
      (ci.related_changes.length * 2);

    const risk =
      impactScore > 15 ? "High" :
      impactScore > 8 ? "Medium" : "Low";

    res.json({
      ci: ci.name,
      impactScore,
      risk,
      affected: {
        dependencies: ci.dependencies,
        dependents: ci.dependents,
        assets: ci.related_assets,
        changes: ci.related_changes
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Impact analysis failed" });
  }
};

};
