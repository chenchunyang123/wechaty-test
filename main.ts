import schedule from "node-schedule";
import { runHtml, getInstance } from "./get-house";
import axios from "axios";

const sendMsg = async (content: any) => {
  await axios.get("https://www.pushplus.plus/send", {
    params: {
      token: "6d0976ee3868450ebba21251d7dc7e5b",
      title: "贝壳租房上新监控",
      content,
    },
  });
  await axios.get("https://www.pushplus.plus/send", {
    params: {
      token: "4713c796d54e42a7bbcbe95aa14369cc",
      title: "贝壳租房上新监控",
      content,
    },
  });
};

// 创建实例
const instance = getInstance(
  (res = []) => {
    if (res.length) {
      const content = res
        .map((item, index) => {
          return `<div> 
          <h4>第${index + 1}个</h4>
          <div>${item?.title} ${item.area}</div>
          <div>价格：${item.price}</div>
          <a href="${item.link}">查看详情</a>
          <div style="width: 100%; border-top: 1px solid black; margin-bottom: 10px" />
        </div>`;
        })
        .join("");
      sendMsg(content);
    } else {
      sendMsg("没有新房源上线");
    }
  },
  (err) => {
    console.log("err :>> ", err);
    // room?.say?.("抓取任务失败:" + JSON.stringify(err));
    sendMsg("抓取任务失败: " + JSON.stringify(err));
  }
);
// 定义规则
const rule = new schedule.RecurrenceRule();
// 设置执行时间在每个小时的0和30分钟
rule.minute = [0, 30];
// 设置执行时间在早上8点到晚上12点
rule.hour = [new schedule.Range(8, 0)];
// 创建定时任务
schedule.scheduleJob(rule, () => {
  runHtml(instance);
});
