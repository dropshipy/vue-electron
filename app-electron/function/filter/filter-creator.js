const { dialog } = require("electron");
const { waitForTimeout, clickByText } = require("../../helpers/utils");

// selector in affialter market place page
const followerCountDropdown =
  "#web-seller-affiliate > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.src-components-Layout-Content---affiliate-content--KabK_.responsive-layout-container > div > div > div.ka-wrapper > div > div.src-components-KOLMarketplace---kolWrapper--1gPmp > div.affiliate-content.filter-wrapper > div > form > div > div > div.src-components-common-KOLFiltersGroup---kolFilterItems--2xgsU > div.undefined.src-components-common-KOLFiltersGroup---follower--1gwlP > div.src-components-common-KOLFiltersGroup---filter-group-content--2MODZ > div.src-components-common-KOLFiltersGroup---filter-item--LYwhQ.src-components-common-KOLFiltersGroup---inlineLabel--1VSdK.undefined > div > div > div";
const followerAgeDropdown =
  "#web-seller-affiliate > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.src-components-Layout-Content---affiliate-content--KabK_.responsive-layout-container > div > div > div.ka-wrapper > div > div.src-components-KOLMarketplace---kolWrapper--1gPmp > div.affiliate-content.filter-wrapper > div > form > div > div > div.src-components-common-KOLFiltersGroup---kolFilterItems--2xgsU > div.undefined.src-components-common-KOLFiltersGroup---follower--1gwlP > div.src-components-common-KOLFiltersGroup---filter-group-content--2MODZ > div.src-components-common-KOLFiltersGroup---filter-item--LYwhQ.src-components-common-KOLFiltersGroup---customizeInlineLabel--19Qy4.src-components-common-KOLFiltersGroup---ageSelect--1PZWZ > div > div > div > div > div.trigger.trigger--normal";
const followerGenderDropdown =
  "#web-seller-affiliate > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.src-components-Layout-Content---affiliate-content--KabK_.responsive-layout-container > div > div > div.ka-wrapper > div > div.src-components-KOLMarketplace---kolWrapper--1gPmp > div.affiliate-content.filter-wrapper > div > form > div > div > div.src-components-common-KOLFiltersGroup---kolFilterItems--2xgsU > div.undefined.src-components-common-KOLFiltersGroup---follower--1gwlP > div.src-components-common-KOLFiltersGroup---filter-group-content--2MODZ > div.src-components-common-KOLFiltersGroup---filter-item--LYwhQ.src-components-common-KOLFiltersGroup---customizeInlineLabel--19Qy4.src-components-common-KOLFiltersGroup---genderSelect--1P-dr > div";

async function filterCreator({ page, config }) {
  const { category, socialMedias, followerCount, followerAge, followerGender } =
    config.configMessageBlast;

  try {
    if (socialMedias !== "Semua" || !socialMedias) {
      try {
        await clickByText(page, socialMedias);
      } catch (error) {
        console.log(error);
      }
    }
    if (category.length > 0) {
      try {
        if (category[0] !== "Semua") {
          await clickByText(page, "Lebih Banyak");
          await page.waitForTimeout(1000);
          await clickByText(page, category);
        }
      } catch (error) {
        console.log(error);
      }
    }

    await clickByText(page, "Tampilkan Semua Filter");
    await page.waitForTimeout(1000);

    if (followerCount !== "Semua" || !followerCount) {
      try {
        await page.waitForTimeout(500);
        await page.click(followerCountDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((followerCount) => {
          const divs = document.querySelectorAll(".eds-react-select-option");
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
        await page.waitForTimeout(500);
        await page.click(followerAgeDropdown);
        await page.waitForTimeout(2000);
        await page.evaluate((text) => {
          const divs = document.querySelectorAll(".eds-react-select-option");
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
        await page.waitForTimeout(500);
        await page.click(followerGenderDropdown);
        await page.waitForTimeout(2000);

        let buttonGenderSelector = ".select-gender-button-any";
        if (followerGender !== "Semua") {
          if (followerGender === "Perempuan") {
            buttonGenderSelector = ".select-gender-button-female";
          } else {
            buttonGenderSelector = ".select-gender-button-male";
          }
        }

        const btn = await page.$(buttonGenderSelector);
        await btn.click();
      } catch (error) {
        console.log(error);
      }
    }
    await clickByText(page, "Ajukan");
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.log(error);
  }
}

module.exports = { filterCreator };
