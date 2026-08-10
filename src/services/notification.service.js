import { messaging } from "../config/firebase.js";

export const sendNotification = async ({ token, title, body, data = {} }) => {
  if (!token) {
    throw new Error("FCM token is missing");
  }

  const message = {
    token,

    notification: {
      title,
      body,
    },

    data,
  };

  const response = await messaging.send(message);

  console.log("FCM notification sent:", response);

  return response;
};
