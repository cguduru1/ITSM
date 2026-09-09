import Notification from "../models/Notification.js";

export async function sendNotification(userId, title, message) {
  await Notification.create({ userId, title, message });
}
