const { postGetCreatorList } = require("../../api/interface");
const { postAddCreator } = require("../../api/interface");
const { dialog } = require("electron");
const { deleteNewLineAndSpaces, clickByText } = require("../../helpers/utils");

async function messageBlast({
  page,
  requestData,
  config,
  categorySetting,
  authBotRes,
  browser,
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
                    soldProductCount: data.sales_metrics.sold_range,
                    saleCount: data.sales_metrics.gmv_range.map((el) => {
                      if (el !== -1) el = el / 100_000;
                      return el;
                    }),
                    maleAudience: getPercentageOfAudienceByGender(
                      data?.audience_genders,
                      "male"
                    ),
                    femaleAudience: getPercentageOfAudienceByGender(
                      data?.audience_genders,
                      "female"
                    ),
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
              "#root > div.affiliate-layout > div.affiliate-layout-content.affiliate-layout-content-full > div > div > div > div.marketplace-detail_U9pYf > div.affiliate-content-1264.affiliate-content-detail.userinfo-card_OvP4e > div.right-wrap_EpKO4 > div > button.eds-react-button.chat-button_7HREW.eds-react-button--normal";
            await page.click(buttonChat);
            const textArea =
              "#shopee-mini-chat-embedded > div > div.ZbkI8cjmb1 > div > div.Z8RjJZsXy1 > div.C8Jzw7jkTU > div.Mj9lh6KccD > div.QDLp_uN4bC > div > div > div > div.X6NljyWyEg > div > textarea";
            await page.waitForSelector(textArea);
            let isAlreadySent = false;

            const chatHistoryBubble = "div.w2C67vtnXi";
            try {
              await page.waitForSelector(chatHistoryBubble, { timeout: 1000 });
            } catch (error) {
              isAlreadySent = false;
            }
            // await page
            //   .evaluate(async (text) => {
            //     const divs = document.querySelectorAll("div.w2C67vtnXi");

            //     // const targetDiv = Array.from(divs).find((div) =>
            //     //   div.innerText.includes(messageContent)
            //     // );
            //     const targetDiv = Array.from(divs).some((div) =>
            //       div.textContent.includes(text)
            //     );
            //     if (targetDiv) {
            //       return true;
            //     }
            //     return false;
            //   }, replyMessage)
            //   .then((result) => {
            //     isAlreadySent = result;
            //   });

            let retrieveTextFromPreviousChat;

            const isTextFound = await page.evaluate((searchText) => {
              const elements = document.querySelectorAll("div.w2C67vtnXi");
              const result = [];
              for (let i = 0; i < elements.length; i++) {
                const element = elements[i];

                if (element.childNodes.length > 0) {
                  for (let j = 0; j < element.childNodes.length; j++) {
                    const childNode = element.childNodes[j];
                    result.push(childNode.textContent);
                  }
                }
              }
              return result;
            }, replyMessage);

            retrieveTextFromPreviousChat = await isTextFound;

            // handle if the same message has already been sent

            if (retrieveTextFromPreviousChat.length > 0) {
              retrieveTextFromPreviousChat = retrieveTextFromPreviousChat.map(
                (teks) => deleteNewLineAndSpaces(teks)
              );
              const invitationMessage = deleteNewLineAndSpaces(replyMessage);

              const checkWhetherItHasBeenSent =
                retrieveTextFromPreviousChat.includes(invitationMessage);

              if (checkWhetherItHasBeenSent) {
                isAlreadySent = true;
              }
            }

            if (!isAlreadySent) {
              const messageLines = replyMessage.split("\n");
              // Type each line without pressing Enter
              for (const line of messageLines) {
                await page.type(textArea, line);

                // Simulate "Shift + Enter" for the line break
                await page.keyboard.down("Shift");
                await page.keyboard.press("Enter");
                await page.keyboard.up("Shift");
              }
              // await page.type(textArea, messageLines);
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
        await page.evaluate(() => {
          window.alert("Creator Tidak Ditemukan");
        });
        console.log("Creator Tidak Ditemukan");
        return;
      }
    }
    await page.evaluate(() => {
      window.alert("Program Telah Selesai");
    });
    await browser.close();
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}

const getPercentageOfAudienceByGender = (audiences, gender) => {
  const genderTypeMap = {
    male: 1,
    female: 2,
  };

  const audience = audiences.find(
    ({ gender_type }) => gender_type === genderTypeMap[gender]
  );
  return audience ? audience.gender_ratio * 100 : 0;
};

module.exports = { messageBlast };
