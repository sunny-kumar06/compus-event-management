const Notification = require("../models/Notification");

const createNotification = async ({ recipient, title, message, type = "system", link = "" }) => {
  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      isRead: false
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

const notifyMultipleUsers = async (userIds, { title, message, type = "system", link = "" }) => {
  try {
    const docs = userIds.map((userId) => ({
      recipient: userId,
      title,
      message,
      type,
      link,
      isRead: false
    }));
    return await Notification.insertMany(docs);
  } catch (error) {
    console.error("Error creating batch notifications:", error);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyMultipleUsers
};
