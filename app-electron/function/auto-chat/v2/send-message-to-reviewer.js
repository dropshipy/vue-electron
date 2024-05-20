const {
  waitForLocalStorageData,
  getLocalStorageData,
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
    sendMessageIndex < listReviewer.length &&
    remainingToken >= 1
  ) {
    const resChat = await postShopeeMessage({
      payload: {
        to_id: listReviewer[sendMessageIndex].userid,
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
