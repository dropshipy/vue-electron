const { waitForTimeout } = require("../../helpers/utils");

// selector in affialter market place page
const categoryDropdown =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(1) > div.filter-group-content_Xfj27 > div:nth-child(1) > div > div > div > div";
const chevronCategory =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(1) > div.filter-group-content_Xfj27 > div:nth-child(1) > div > div > div > div > div.trigger.trigger--normal.multiple.shopee-react-popover-open > div.shopee-react-select__suffix > i.shopee-react-select__expend-btn.expend-btn.expand.shopee-react-icon.seller-icon-arrow-down-bold.shopee-seller-iconfont";

const mediaSocialDropdown =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(1) > div.filter-group-content_Xfj27 > div:nth-child(2) > div > div > div > div > div.trigger.trigger--normal";

const followerCountDropdown =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(2) > div.filter-group-content_Xfj27 > div:nth-child(1) > div > div > div > div > div.trigger.trigger--normal > div.shopee-react-select__suffix > i.shopee-react-select__expend-btn.expend-btn.shopee-react-icon.seller-icon-arrow-down-bold.shopee-seller-iconfont";
const followerAgeDropdown =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(2) > div.filter-group-content_Xfj27 > div:nth-child(2) > div > div > div > div";
const followerGenderDropdown =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.kol-filter-items > div:nth-child(2) > div.filter-group-content_Xfj27 > div:nth-child(3) > div > div > div > div";
const searchButtonFilter =
  "#root > div.affiliate-layout.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed > div.affiliate-content_va84a > div > div > div.ka-wrapper > div > div:nth-child(1) > div > form > div.filter-actions_dHTx2 > button.shopee-react-button.shopee-react-button--primary.shopee-react-button--normal";

async function filterCreator({ page, config }) {
  const { category, socialMedias, followerCount, followerAge, followerGender } =
    config.configMessageBlast;
  console.log({ config });
  try {
    if (category !== "Semua" || !category) {
      try {
        await page.waitForSelector(categoryDropdown);
        await page.click(categoryDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((texts) => {
          const divs = document.querySelectorAll(".shopee-react-select-option");

          texts.forEach((text) => {
            const targetDiv = Array.from(divs).find((div) =>
              div.innerText.includes(text)
            );

            if (targetDiv) {
              targetDiv.click();
            } else {
              console.error("Div not found with text:", text);
            }
          });
        }, category);
        await page.click(chevronCategory);
      } catch (error) {
        console.log(error);
      }
    }
    if (socialMedias !== "Semua" || !socialMedias) {
      try {
        await page.click(mediaSocialDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((socialMedias) => {
          const divs = document.querySelectorAll(".shopee-react-select-option");
          const targetDiv = Array.from(divs).find((div) =>
            div.innerText.includes(socialMedias)
          );

          if (targetDiv) {
            targetDiv.click();
          } else {
            console.error("Div not found with text:", socialMedias);
          }
        }, socialMedias);
        // await page.click(mediaSocialDropdown);
        // await page.waitForTimeout(2000);
        // await page.evaluate((texts) => {
        //   const divs = document.querySelectorAll(".shopee-react-select-option");

        //   texts.forEach((text) => {
        //     const targetDiv = Array.from(divs).find((div) =>
        //       div.innerText.includes(text)
        //     );

        //     if (targetDiv) {
        //       targetDiv.click();
        //     } else {
        //       console.error("Div not found with text:", text);
        //     }
        //   });
        // }, socialMedias);
      } catch (error) {
        console.log(error);
      }
    }
    if (followerCount !== "Semua" || !followerCount) {
      try {
        await page.click(followerCountDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((followerCount) => {
          const divs = document.querySelectorAll(".shopee-react-select-option");
          const targetDiv = Array.from(divs).find((div) =>
            div.innerText.includes(followerCount)
          );

          if (targetDiv) {
            targetDiv.click();
          } else {
            console.error("Div not found with text:", followerCount);
          }
        }, followerCount);
      } catch (error) {
        console.log(error);
      }
    }
    if (followerAge !== "Semua" || !followerAge) {
      try {
        await page.click(followerAgeDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((text) => {
          const divs = document.querySelectorAll(".shopee-react-select-option");
          const targetDiv = Array.from(divs).find((div) =>
            div.innerText.includes(text)
          );

          if (targetDiv) {
            targetDiv.click();
          } else {
            console.error("Div not found with text:", text);
          }
        }, followerAge);
      } catch (error) {
        console.log(error);
      }
    }
    if (followerGender !== "Semua" || !followerGender) {
      try {
        await page.click(followerGenderDropdown);
        await page.waitForTimeout(2000);
        const [buttonGender] = await page.$x(
          `//span[contains(., '${followerGender}')]`
        );
        await buttonGender.click();
      } catch (error) {
        console.log(error);
      }
    }
    await page.click(searchButtonFilter);
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.log(error);
  }
}

module.exports = { filterCreator };
