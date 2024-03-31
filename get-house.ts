import Crawler, { CrawlerRequestResponse } from "crawler";
import { JsonDB, Config } from "node-json-db";

const db = new JsonDB(new Config("houseIdDateBase", true, false, "/"));

function runHtml(c: Crawler) {
  c.queue(
    "https://cd.zu.ke.com/zufang/huayang/in1rt200600000001l2brp2500erp4000/?showMore=1"
  );
}

function getInstance(
  successFn = (res: any[]) => {},
  errorFn = (res: any) => {}
) {
  return new Crawler({
    rateLimit: 1000,
    callback: async (
      error: Error,
      res: CrawlerRequestResponse,
      done: () => void
    ) => {
      if (error) {
        console.log(error);
        errorFn(JSON.stringify(error));
      } else {
        const $ = res.$;
        try {
          const list: any[] = [];
          $("div.content__list--item").each((index, item) => {
            const $item = $(item);
            const id = $item.attr("data-house_code");
            const title = $item
              .find(".content__list--item--aside")
              .attr("title");
            const link = `https://cd.zu.ke.com${$item
              .find(".content__list--item--aside")
              .attr("href")}`;
            const price = $item.find(".content__list--item-price em").text();
            const area =
              $item
                .find(".content__list--item--des")
                .text()
                .match(/\d+\.\d+㎡/) || [];
            const img = $item
              .find(".content__list--item--aside img")
              .attr("src");
            list.push({
              id,
              title,
              price,
              link,
              area: area[0],
              img,
            });
          });

          // 获取ids
          const ids = (await db.getData("/ids")) || [];
          const idsLength = ids.length;

          // 根据ids过滤list
          const filterList = list.filter((item) => {
            return !ids.includes(item.id);
          });

          console.log("filterList", filterList);

          // 推送list消息
          successFn(filterList);

          // 存储新的id
          for (let i = 0; i < filterList.length; i++) {
            await db.push(`/ids[${idsLength + i}]`, filterList[i].id);
          }
        } catch (e) {
          console.log(e);
          errorFn(JSON.stringify(e));
          done();
        }
      }
      done();
    },
  });
}

const c = getInstance();
runHtml(c);

export { runHtml, getInstance };
