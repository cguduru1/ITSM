export function trialCheck(req, res, next) {
  try {
    const tenant = req.user?.tenantData;

    if (!tenant) {
      req.trialMode = false;
      req.tenantFeatures = {};
      return next(); // CRITICAL: Call next() and return
    }

    // Auto-expire trial
    if (
      tenant.trial &&
      tenant.trialExpiresOn &&
      new Date() > new Date(tenant.trialExpiresOn)
    ) {
      tenant.trial = false;
      tenant.save?.().catch(() => {});
    }

    req.trialMode = Boolean(tenant.trial);
    req.tenantFeatures = tenant.features || {};

    return next(); // CRITICAL: Call next() to pass control to the route
  } catch (err) {
    console.error("Trial check middleware error:", err);
    // Continue execution rather than breaking the request pipeline on trial failure
    req.trialMode = false;
    req.tenantFeatures = {};
    return next();
  }
}