// webhook.js
import express from "express";
import line from "@line/bot-sdk";

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
    // 替換為你自己的使用者 ID 或群組 ID
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

export default app;
