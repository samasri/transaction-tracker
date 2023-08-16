import { displaySpendings } from "./spendings-logger";
import { sendPushNotification } from "./utils/pushbullet-send";

export const sendNotification = async () => {
  const { startDate, endDate, txTotal, balance } = await displaySpendings(
    false
  );
  await sendPushNotification(
    `Spendings`,
    `Cycle: ${startDate} --> ${endDate}\nSo far, you've spent: ${balance.toFixed(
      2
    )}$ (${txTotal.toFixed(2)}$ before SplitWise calculation)`
  );
};
