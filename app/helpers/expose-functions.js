const { postAddCreator } = require("../api/interface");

async function addExposeFunction({ page, config, sessionId }) {
  await page.exposeFunction("sendCreatorData", async (creator) => {
    await postAddCreator(creator, {
      headers: {
        Cookie: "connect.sid=" + sessionId,
      },
    });
  });
}

module.exports = addExposeFunction;
