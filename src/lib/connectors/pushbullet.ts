import axios from "axios";
import { pushbullet } from "../config-manager";
import assert from "assert";

const pushbulletUrl = "https://api.pushbullet.com/v2/pushes";

export const sendPushNotification = async (title: string, message: string) => {
  const { apiToken, targetDevice } = pushbullet.get();
  assert(apiToken && targetDevice, "Pushbullet is not configured correctly");
  const response = await axios.post(
    pushbulletUrl,
    {
      type: "note",
      title,
      body: message,
      target_device_iden: targetDevice,
    },
    {
      headers: {
        "Access-Token": apiToken,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 200) return true;
  else {
    throw new Error(`Failed to send push notification; http response status: ${response.status}`);
  }
};
