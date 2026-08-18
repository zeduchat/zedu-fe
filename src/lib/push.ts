import webPush from "web-push";

// push from the BE -
// webPush.setVapidDetails(
//   "mailto:alayosingers@gmail.com",
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
// );

export async function sendPushNotification(subscription: any, payload: any) {
  await webPush.sendNotification(subscription, JSON.stringify(payload));
}
