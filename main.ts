import { Message, ScanStatus, WechatyBuilder, log } from "wechaty";
import qrcodeTerminal from "qrcode-terminal";
import schedule from "node-schedule";
import { runHtml, getInstance } from "./get-house";

const bot = WechatyBuilder.build({
  name: "ccy-bot", // 名字随意
});

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");
    log.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

async function onMessage(msg: Message) {
  const text = msg.text();
  console.log("text", text);
}

async function onLogin(user: any) {
  console.log(`${user}登录了`);
  const room = await bot.Room.find({ topic: "机器小老弟" });
  // 创建实例
  const instance = getInstance(
    (res = []) => {
      res.forEach((item) => {
        room?.say?.(JSON.stringify(item));
      });
    },
    (err) => {
      console.log("err :>> ", err);
      room?.say?.("抓取任务失败:" + JSON.stringify(err));
    }
  );
  // 定义规则
  const rule = new schedule.RecurrenceRule();
  // 设置执行时间在每个小时的0和30分钟
  rule.minute = [10, 30];
  // 创建定时任务
  schedule.scheduleJob(rule, () => {
    runHtml(instance);
  });
}

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("message", onMessage);

bot
  .start()
  .then(() => {
    console.log("开始登录微信");
  })
  .catch((err) => console.log(err));
