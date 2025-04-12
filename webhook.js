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

app.use(express.json());

// 接收來自策略的推播請求
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

// 確認 webhook 正常工作
app.get("/health", (req, res) => {
  res.send("LINE Bot Webhook is running ✅");
});

// 用於 debug：取得 userId 或 groupId
// LINE Webhook 專用：必須保留 raw body 才能驗證簽章
app.post(
  "/callback",
  bodyParser.raw({ type: "*/*" }),
  line.middleware(config),
  async (req, res) => {
    const events = req.body.events || JSON.parse(req.body.toString()).events;
    if (events.length > 0) {
      const event = events[0];
      const sourceType = event.source.type;
      const sourceId =
        sourceType === "user" ? event.source.userId : event.source.groupId;

      console.log("📌 來源類型:", sourceType);
      console.log("🆔 對應 ID:", sourceId);

      await client.replyMessage(event.replyToken, {
        type: "text",
        text: `🆔 你的 ${sourceType} ID 是：\\n${sourceId}`,
      });
    }
    res.sendStatus(200);
  }
);


export default app;
