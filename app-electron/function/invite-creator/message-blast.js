const { searchCreatorSnackbar } = require("../../helpers/snackbar");
const { postAddCreator, postGetCreatorList, checkSubscriptionCreator } = require("../../api/interface");
const { dialog } = require("electron");
const { waitForTimeout, withTimeout } = require("../../helpers/utils");

async function messageBlast({
  page,
  requestData,
  config,
  categorySetting,
  authBotRes,
  browser,
  subscriptionId,
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
      console.log('hit get creator')
      let setPayload = { ...payload, offset: 1, limit: 20 };
      const getCreatorList = await postGetCreatorList(endpoint, setPayload, {
        headers: header,
      });

      let creatorCounter = 0;
      let creator = getCreatorList.data.data.list;
      if (creator.length > 0) {
        while (creator.length > creatorCounter && loopCount >= iteration) {
          try {
            const affiliateId = creator[creatorCounter].affiliate_id;
            const username = creator[creatorCounter].username;

            searchCreatorSnackbar({ page, username });

            const res = await withTimeout(
              checkSubscriptionCreator(
                subscriptionId,
                {
                  params: {
                    affiliateId,
                    username,
                  },
                }
              ), 6000
            )
            if(res === false) {
              creatorCounter++;
              continue;
            }
            
            const isInSubs = res.data.message

            if (isInSubs) {
              console.log(`skip creator ${username}, ${affiliateId}`);

              const response = await page.evaluate(async ({ affiliateId }) => {
                const res = await fetch(
                  "https://seller.shopee.co.id/api/v3/affiliateplatform/creator/detail",
                  {
                    method: "POST",
                    credentials: "include", // biar session Shopee kepake
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      affiliate_id: Number(affiliateId),
                      category_sort_type: 1,
                      data_period: 30,
                      show_meta_link: 0,
                    }),
                  }
                );

                return res.json();
              }, { affiliateId });

              const data = response.data;
              const categoryAffiliate = data.profile.promote_category_ids;

              const creatorPayload = {
                username: data.profile.username,
                displayName: data.profile.display_name,
                affiliateId: data.profile.affiliate_id,
                totalFollower: data.key_metrics.total_follower_count,
                socialMedias: JSON.stringify(data.profile.social_media_details),
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

              const tagNames = categoryAffiliate.map((categoryAffiliate) => {
                const foundCategory = categoryShopee.find(
                  (category) => category.category_id === categoryAffiliate
                );
                return foundCategory ? foundCategory.tag_name : null;
              });
              tagNames.forEach((tagName) => {
                if (tagName !== null) {
                  creatorPayload.relatedCategoris.push(tagName);
                }
              });

              await postAddCreator(subscriptionId, creatorPayload, {
                headers: {
                  Cookie: "connect.sid=" + authBotRes.sessionId,
                },
              });

              creatorCounter++;
              continue;
            }
         

            let chatList = null;
            let totalPostCreator = 1;

            page.on("response", async (response) => {
              if (
                response
                  .url()
                  .includes(
                    "https://seller.shopee.co.id/api/v3/affiliateplatform/creator/detail"
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
                  postAddCreator(
                    subscriptionId,
                    creatorPayload                  
                  );
                  //total post creator for handle bug puppeteer
                  totalPostCreator++;
                }
              }

              if (response.url().includes(`/messages?shop_id=`)) {
                const responseData = (await response.json()) || [];
                chatList = responseData.map((x) => x.content?.text);
              }
            });

            await page.goto(
              `https://seller.shopee.co.id/portal/web-seller-affiliate/kol_marketplace/detail?affiliate_id=${affiliateId}`,
              {
                waitUntil: "networkidle2",
                timeout: 0,
              }
            );

            const buttonChat =
              "button.eds-react-button.src-components-KOLMarketplace-UserInfo---chat-button--7HREW.eds-react-button--normal";
            await page.waitForSelector(buttonChat);
            await page.click(buttonChat);

            let textArea = null
            try{
              textArea =
                "#sidebar-minichat-list > div.WGDkm_RPQw > div.Mj9lh6KccD.yLzxr6DkWa > div.QDLp_uN4bC > div > div > div > div.X6NljyWyEg > div > textarea";
              await page.waitForSelector(textArea, { timeout: 8000 });
            } catch (error) {
              console.log(error)
              creatorCounter++;
              continue;
            }
            
            let isAlreadySent = false;

            while (chatList === null) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            console.group(
              `\n---  Message Creator: ${creator[creatorCounter].username} ---`
            );
            console.log("Chat List: ", chatList);
            console.log("New Message: ", JSON.stringify(replyMessage));

            if (chatList.length > 0) {
              isAlreadySent = chatList.includes(replyMessage);
            }

            console.log("Is Already Sent: ", isAlreadySent);
            console.groupEnd("\n");

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
            await waitForTimeout(2000);
          } catch (error) {
            console.log(error);
          }
          iteration++;
          creatorCounter++;
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
