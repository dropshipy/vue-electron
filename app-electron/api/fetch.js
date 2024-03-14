const {
  getUserConfigBySubscriptionId,
  getUserMessageBlastConfigBySubscriptionId,
} = require("./interface.js");

async function getReplyReviewsConfig({ sessionId, subscriptionId }) {
  try {
    const res = await getUserConfigBySubscriptionId({
      headers: {
        Cookie: "connect.sid=" + sessionId,
      },
      params: {
        subscriptionId: subscriptionId,
      },
    });
    const data = res?.data;
    if (data?.id) {
      const config = {
        loginMethod: data.loginMethod,
        loopCount: data.iteration,
        replyMessage: data.replyMessage,
        productName: data.productName,
        ratingComment: data.ratingComment,
      };

      return config;
    } else {
      throw new Error(res);
    }
  } catch (err) {
    console.error(err);
  }
}
async function getMessageBlastConfig({ sessionId, subscriptionId }) {
  try {
    const res = await getUserMessageBlastConfigBySubscriptionId({
      headers: {
        Cookie: "connect.sid=" + sessionId,
      },
      params: {
        subscriptionId: subscriptionId,
      },
    });
    const data = res?.data;
    if (data?.id) {
      const config = {
        loginMethod: data.loginMethod,
        loopCount: data.iteration,
        replyMessage: data.replyMessage,
        category: data.category,
        socialMedias: data.socialMedias,
        followerCount: data.followerCount,
        followerAge: data.followerAge,
        followerGender: data.followerGender,
      };
      return config;
    } else {
      throw new Error(res);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getReplyReviewsConfig,
  getMessageBlastConfig,
};
