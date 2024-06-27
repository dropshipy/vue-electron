const {
  waitForLocalStorageData,
  getLocalStorageData,
  waitForTimeout,
} = require("../../../helpers/utils");

const { postShopeeMessage, patchUseToken } = require("../../../api/interface");
const { showSnackbar } = require("../../../helpers/snackbar");

const { interceptSendProduct } = require("./intercept-send-product");

const ElectronStore = require("electron-store");
const store = new ElectronStore();

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
  isSendProduct,
  productName,
}) {
  let filteredListViewer = listReviewer.filter(
    (item, index, array) =>
      array.findIndex((obj) => obj.userid === item.userid) === index
  );

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
    // list of reviews that have been sent messages

    const listFromStorage = store.get("listReviewsHaveBeenSentMessages");

    let getlList = listFromStorage ? JSON.parse(listFromStorage) : [];

    const reviewerId = filteredListViewer[sendMessageIndex].userid;

    if (!getlList.includes(reviewerId)) {
      const resChat = await postShopeeMessage({
        payload: {
          to_id: reviewerId,
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
        getlList.push(reviewerId);
        store.set("listReviewsHaveBeenSentMessages", JSON.stringify(getlList));

        await showSnackbar({
          page,
          message: `Berhasil mengirim pesan ke: ${filteredListViewer[sendMessageIndex].author_username}`,
        });

        if (isSendProduct) {
          await interceptSendProduct({
            page,
            productName,
            author_username:
              filteredListViewer[sendMessageIndex].author_username,
          });
        }

        await waitForTimeout(1000);

        if (resUseToken.status == 201) {
          const { data } = resUseToken.data;
          remainingToken = data.remainingToken;
        }
      }
    } else {
      await showSnackbar({
        page,
        message: `Sudah pernah mengirim pesan ke: ${filteredListViewer[sendMessageIndex].author_username}`,
      });
      await waitForTimeout(1500);
    }
    loopCount++;
    sendMessageIndex++;
  }
  return { loopCount };
}

module.exports = sendMessageToReviewer;
