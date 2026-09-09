import FinancialLifecycle from "../models/FinancialLifecycle.js";
import NotificationService from "../lib/notificationService.js"; // implement email/slack

export default async function warrantyNotifier() {
  const soon = new Date();
  soon.setDate(soon.getDate() + 30); // 30 days ahead
  const expiring = await FinancialLifecycle.find({ warrantyExpiryDate: { $lte: soon, $gte: new Date() } }).lean();
  for (const f of expiring) {
    await NotificationService.send({
      subject: `Warranty expiring for asset ${f.assetId}`,
      message: `Warranty for asset ${f.assetId} expires on ${f.warrantyExpiryDate}. Vendor: ${f.vendorId}.`
    });
  }
}
