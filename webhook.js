// webhook.js
import express from "express";
import line from "@line/bot-sdk";
import bodyParser from "body-parser";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// LINE Webhook 路由
app.post(
  "/callback",
  line.middleware(config),
  async (req, res) => {
    try {
      const events = req.body.events;

      if (events.length > 0) {
        const event = events[0];
        const sourceType = event.source.type;
        const sourceId =
          sourceType === "user" ? event.source.userId : event.source.groupId;

        console.log("📌 來源類型:", sourceType);
        console.log("🆔 對應 ID:", sourceId);

        // 回覆用戶 ID 資訊
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: `🆔 你的 ${sourceType} ID 是：\n${sourceId}`,
        });
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Error handling LINE webhook:", error);
      res.sendStatus(500);
    }
  }
);

// 其他路由使用 JSON parser
app.use(express.json());

// 接收策略推播訊息
app.post("/push", async (req, res) => {
  const { message } = req.body;
  try {
    const targetId = process.env.LINE_TARGET_ID;
    await client.pushMessage(targetId, {
      type: "text",
      text: message,
    });
    res.status(200).send("Message sent");
  } catch (error) {
    console.error("LINE Bot push error:", error);
    res.status(500).send("Failed to send LINE message");
  }
});

// 健康檢查路由
app.get("/health", (req, res) => {
  res.send("LINE Bot Webhook is running ✅");
});

export default app;