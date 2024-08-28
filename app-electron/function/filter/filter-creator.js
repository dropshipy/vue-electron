const { dialog } = require("electron");
const { waitForTimeout, clickByText } = require("../../helpers/utils");

// selector in affialter market place page
const followerCountDropdown =
  "#root > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.affiliate-content_va84a.responsive-layout-container > div > div > div.ka-wrapper > div > div > div.affiliate-content.filter-wrapper > div > form > div > div > div.kolFilterItems_1b1wf > div.undefined.follower_1gYUW > div.filter-group-content_Xfj27 > div.filter-item_CKEyJ.inlineLabel_jgJDm.undefined > div > div > div > div > div.trigger.trigger--normal > div.eds-react-select__suffix";
const followerAgeDropdown =
  "#root > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.affiliate-content_va84a.responsive-layout-container > div > div > div.ka-wrapper > div > div > div.affiliate-content.filter-wrapper > div > form > div > div > div.kolFilterItems_1b1wf > div.undefined.follower_1gYUW > div.filter-group-content_Xfj27 > div.filter-item_CKEyJ.customizeInlineLabel_UD2W9.ageSelect_T7473 > div > div > div > div > div.trigger.trigger--normal > div.eds-react-select__suffix";
const followerGenderDropdown =
  "#root > div.affiliate-layout.affiliate-responsive-layout-wrapper.show-header-cnsc > div.affiliate-layout-content.affiliate-layout-content-not-collapsed.affiliate-responsive-layout-content > div.affiliate-content_va84a.responsive-layout-container > div > div > div.ka-wrapper > div > div > div.affiliate-content.filter-wrapper > div > form > div > div > div.kolFilterItems_1b1wf > div.undefined.follower_1gYUW > div.filter-group-content_Xfj27 > div.filter-item_CKEyJ.customizeInlineLabel_UD2W9.genderSelect_Zi-UJ > div > div > div > div > div.trigger > div.eds-react-select__suffix";

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
          const divs = document.querySelectorAll(".select-option_Tv9b8");
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
