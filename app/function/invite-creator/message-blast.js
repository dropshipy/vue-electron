const { postGetCreatorList } = require("../../api/interface");
const { postAddCreator } = require("../../api/interface");

async function messageBlast({
  page,
  requestData,
  config,
  categorySetting,
  authBotRes,
}) {
  const { replyMessage } = config.configMessageBlast;
  const loopCount = config.configMessageBlast.iteration;
  const payload = JSON.parse(requestData.requestPostData);
  const endpoint = requestData?.url;
  const header = requestData?.requestHeaders;
  let iteration = 1;
  const categoryShopee = categorySetting.reqCategories[0];

  try {
    while (loopCount >= iteration) {
      let setPayload = { ...payload, offset: 1, limit: 20 };
      const getCreatorList = await postGetCreatorList(endpoint, setPayload, {
        headers: header,
      });
      let creatorCounter = 0;
      let creator = getCreatorList.data.data.list;
      if (creator.length > 0) {
        while (creator.length > creatorCounter && loopCount >= iteration) {
          try {
            await page.goto(
              `https://seller.shopee.co.id/portal/web-seller-affiliate/kol_marketplace/detail?affiliate_id=${creator[creatorCounter].affiliate_id}&show_back=1`,
              {
                waitUntil: "networkidle2",
                timeout: 0,
              }
            );
            let totalPostCreator = 1;
            page.on("response", async (response) => {
              if (
                response
                  .url()
                  .includes(
                    "https://seller.shopee.co.id/api/v1/affiliateplatform/creator/detail"
                  )
              ) {
                if (totalPostCreator == 1) {
                  const responseData = await response.json();
                  const data = responseData.data;
                  const categoryAffiliate = data.profile.promote_category_ids;
                  const creatorPayload = {
                    username: data.profile.username,
                    displayName: data.profile.display_name,
                    affiliateId: data.profile.affiliate_id,
                    totalFollower: data.key_metrics.total_follower_count,
                    socialMedias: JSON.stringify(
                      data.profile.social_media_details
                    ),
                    relatedCategoris: [],
                    orderRange: data.key_metrics.order_range,
                    email: data.profile.contact_info.email,
                    phoneNumber: data.profile.contact_info.phone,
                  };

                  const tagNames = categoryAffiliate.map(
                    (categoryAffiliate) => {
                      const foundCategory = categoryShopee.find(
                        (category) => category.category_id === categoryAffiliate
                      );
                      return foundCategory ? foundCategory.tag_name : null;
                    }
                  );
                  tagNames.forEach((tagName, index) => {
                    if (tagName !== null) {
                      creatorPayload.relatedCategoris.push(tagName);
                    }
                  });
                  await postAddCreator(creatorPayload, {
                    headers: {
                      Cookie: "connect.sid=" + authBotRes.sessionId,
                    },
                  });
                  //total post creator for handle bug puppeteer
                  totalPostCreator++;
                }
              }
            });
            const buttonChat =
              "#root > div.affiliate-layout > div.affiliate-layout-content.affiliate-layout-content-full > div > div > div > div.marketplace-detail_U9pYf > div.affiliate-content-1264.affiliate-content-detail.userinfo-card_OvP4e > div.right-wrap_EpKO4 > div > span.chat-button_7HREW";
            await page.click(buttonChat);

            const textArea =
              "#shopee-mini-chat-embedded > div.UvGSSkd1qQ > div.Z8RjJZsXy1 > div.C8Jzw7jkTU > div.Mj9lh6KccD > div.QDLp_uN4bC > div > div > div > div.X6NljyWyEg > div > textarea";
            await page.waitForSelector(textArea);
            let isAlreadySent = false;
            await page
              .evaluate(async (text) => {
                const divs = document.querySelectorAll(
                  "div.QwyBL5p0DA.o_JQY9VDe5"
                );
                const targetDiv = Array.from(divs).find((div) =>
                  div.innerText.includes(text)
                );
                if (targetDiv) {
                  return true;
                }
                return false;
              }, replyMessage)
              .then((result) => {
                isAlreadySent = result;
              });
            if (!isAlreadySent) {
              await page.type(textArea, replyMessage, {
                delay: 100,
              });
              console.log(
                iteration,
                creator[creatorCounter].username,
                " ~ ",
                "berhasil dikirim"
              );
            }
            await page.keyboard.press("Enter");
            await page.waitForTimeout(2000);
            iteration++;
            creatorCounter++;
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log("Creator Tidak Ditemukan");
      }
    }
    await page.evaluate(() => {
      window.alert("Program Shopee Blast Telah Selesai");
    });
    await Browser.close();
  } catch (error) {}
}
module.exports = { messageBlast };
