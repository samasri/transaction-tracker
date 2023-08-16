import axios from "axios";
import config from "./config-with-env";

const pushbulletUrl = "https://api.pushbullet.com/v2/pushes";

const apiToken = config.get("pushBullet.apiToken");
const targetDevice = config.get("pushBullet.targetDevice");

export const sendPushNotification = async (title: string, message: string) => {
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
    throw new Error(
      `Failed to send push notification; http response status: ${response.status}`
    );
  }
};
