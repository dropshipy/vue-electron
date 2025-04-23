const { dialog } = require("electron");
const { waitForTimeout, clickByText } = require("../../helpers/utils");

const filterDropdownSelector = "div.eds-react-select__suffix"; // got 5 element

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

    const filterDropdown = await page.$$(filterDropdownSelector);

    if (followerCount !== "Semua" || !followerCount) {
      try {
        await page.waitForTimeout(500);
        await filterDropdown[0].click();
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
        await filterDropdown[1].click();
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
        await filterDropdown[2].click();
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
