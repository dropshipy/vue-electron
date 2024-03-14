const showSnackbar = async ({ page, message }) => {
  await page.evaluate((_message) => {
    const snackbar = document.createElement("div");
    Object.assign(snackbar.style, {
      display: "flex",
      alignItems: "center",
      position: "fixed",
      left: "-1000px",
      top: "30px",
      padding: "12px",
      background: "white",
      zIndex: "9999",
      borderLeft: "4px solid #08A081",
      borderRadius: "4px",
      background: "#FFF",
      boxShadow: "0px 2px 12px 0px rgba(102, 115, 143, 0.10)",
      transition: "0.5s",
    });

    const snackbarContent = document.createElement("div");
    Object.assign(snackbarContent.style, {
      margin: "0 12px",
    });

    const snackbarTitle = document.createElement("h6");
    snackbarTitle.textContent = "Success";

    Object.assign(snackbarTitle.style, {
      margin: 0,
      color: "#08A081",
      textTransform: "capitalize",
      fontWeight: "700",
      fontSize: "16px",
    });

    const snackbarMessage = document.createElement("p");
    snackbarMessage.textContent = _message;

    Object.assign(snackbarMessage.style, {
      color: "#2D2D2D",
      fontSize: "16px",
      margin: 0,
      paddingTop: "4px",
    });

    snackbarContent.append(snackbarTitle, snackbarMessage);

    const successIcon = document.createElement("div");
    successIcon.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="20" fill="#E3FCF7"/>
        <path d="M20 32C13.3831 32 8 26.6169 8 20C8 13.3831 13.3831 8 20 8C26.6169 8 32 13.3831 32 20C32 26.6169 26.6169 32 20 32Z" fill="#13B795"/>
        <path d="M26.4739 14.6475L15.623 25.4983L21.9637 31.8389C27.5946 30.9082 31.9155 26.0435 31.9986 20.1722L26.4739 14.6475Z" fill="#0F9E77"/>
        <path d="M26.7156 14.8798C26.0224 14.1282 25.3939 13.621 24.6423 14.313L16.9599 21.3955L15.0205 19.1774C14.3474 18.4087 13.6683 18.8455 12.8983 19.5184C12.1284 20.1913 11.5592 20.8457 12.2328 21.6157L14.236 23.9067L15.8709 25.7767C16.3113 26.2803 17.0803 26.3218 17.5722 25.8683L19.3985 24.1846L27.1523 17.0364C27.9045 16.3432 27.4088 15.6315 26.7156 14.8798Z" fill="white"/>
      </svg>
    `;

    const closeIcon = document.createElement("div");
    closeIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="14" fill="#F9F2F2"/>
        <path d="M18.1973 10.743C18.4569 10.4834 18.4569 10.0626 18.1973 9.80301C17.9377 9.54343 17.5169 9.54343 17.2573 9.80301L14.0007 13.0597L10.744 9.80301C10.4844 9.54343 10.0636 9.54343 9.80398 9.80301C9.54441 10.0626 9.54441 10.4834 9.80398 10.743L13.0607 13.9997L9.80398 17.2563C9.54441 17.5159 9.54441 17.9368 9.80398 18.1963C10.0636 18.4559 10.4844 18.4559 10.744 18.1963L14.0007 14.9397L17.2573 18.1963C17.5169 18.4559 17.9377 18.4559 18.1973 18.1963C18.4569 17.9368 18.4569 17.5159 18.1973 17.2563L14.9407 13.9997L18.1973 10.743Z" fill="#2D2D2D"/>
      </svg>
    `;

    snackbar.append(successIcon, snackbarContent, closeIcon);

    document.body.appendChild(snackbar);

    setTimeout(() => {
      snackbar.style.left = "30px";
    }, 10);

    setTimeout(() => {
      snackbar.style.left = "-1000px";

      setTimeout(() => {
        snackbar.remove();
      }, 500);
    }, 1000);
  }, message);
};

module.exports = { showSnackbar };
