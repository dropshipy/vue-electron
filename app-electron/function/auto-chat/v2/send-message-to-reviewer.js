const {
  waitForLocalStorageData,
  getLocalStorageData,
  waitForTimeout,
} = require("../../../helpers/utils");

const { postShopeeMessage, patchUseToken } = require("../../../api/interface");
const { showSnackbar } = require("../../../helpers/snackbar");

async function sendMessageToReviewer({
  page,
  headers,
  template,
  listReviewer,
  iteration,
  shop_id,
  loopCount,
  authBotRes,
  remainingToken,
}) {
  let filteredListViewer = listReviewer.filter((item, index, array) => {
    return index === array.findIndex((obj) => obj.userId === item.userId);
  });

  if (filteredListViewer.length == 0) {
    return { loopCount: 1000 };
  }

  await waitForLocalStorageData(page, "mini-session");

  const miniSessionData = await getLocalStorageData(page, "mini-session");
  if (miniSessionData) {
    const token = JSON.parse(miniSessionData)?.token;
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
  } else {
    throw new Error("Token tidak ditemukan");
  }

  let sendMessageIndex = 0;

  while (
    iteration >= loopCount &&
    sendMessageIndex < filteredListViewer.length &&
    remainingToken >= 1
  ) {
    const resChat = await postShopeeMessage({
      payload: {
        to_id: filteredListViewer[sendMessageIndex].userid,
        shop_id,
        content: {
          text: template,
        },
      },
      headers,
    });
    if (resChat.status == 200) {
      const resUseToken = await patchUseToken({
        headers: {
          Cookie: "connect.sid=" + authBotRes.sessionId,
        },
      });
      await waitForTimeout(1000);
      await showSnackbar({
        page,
        message: `Berhasil mengirim pesan ke: ${listReviewer[sendMessageIndex].author_username}`,
      });
      if (resUseToken.status == 201) {
        const { data } = resUseToken.data;
        remainingToken = data.remainingToken;
      }
    }
    loopCount++;
    sendMessageIndex++;
  }
  return { loopCount };
}

module.exports = sendMessageToReviewer;
