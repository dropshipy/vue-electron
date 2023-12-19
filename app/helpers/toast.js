const showToast = ({ wrapperSelector, textContent }) => {
  // Create a div element for the toast bar
  const wrapper = document.querySelector(wrapperSelector);
  const toastBar = document.createElement("div");
  // Set some basic styles
  toastBar.style.position = "absolute";
  toastBar.style.top = "100px";
  toastBar.style.left = "50%";
  toastBar.style.transform = "translateX(-50%)";
  toastBar.style.backgroundColor = "#3a373c";
  toastBar.style.border = "1px solid #3a373c";
  toastBar.style.color = "#52c81e ";
  toastBar.style.fontWeight = "600";
  toastBar.style.minWidth = "500px";
  toastBar.style.maxWidth = "90%";
  toastBar.style.fontSize = "40px";
  toastBar.style.padding = "20px 30px";
  toastBar.style.borderRadius = "10px";
  toastBar.style.zIndex = "9999";
  // Set the text content of the toast bar
  toastBar.textContent = textContent;
  // Append the toast bar to the body
  wrapper.appendChild(toastBar);
  toastBar.style.opacity = "0";
  setTimeout(() => {
    toastBar.style.transition = "opacity 1s";
    toastBar.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    toastBar.style.opacity = "0";
    toastBar.remove();
  }, 1000);
};

module.exports = { showToast };
