const copyToClipboard = (text, callback) => {
  navigator.clipboard.writeText(text).then(() => {
    if (callback) {
      callback();
    }
  });
};

export default copyToClipboard;
