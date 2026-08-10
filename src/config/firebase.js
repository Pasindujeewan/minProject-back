import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    "./remindly-c967f-firebase-adminsdk-fbsvc-a580caee7b.json",
    "utf8",
  ),
);

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

export const messaging = getMessaging(firebaseApp);
