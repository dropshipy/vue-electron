const showSnackbar = async ({ page, message, type = 'success', autoHide = true }) => {
  try {
    await page.evaluate(({ _message, _autoHide, _type }) => {
      const theme = `#${_type === 'success' ? '08A081' : _type === 'warning' ? 'F4B740' : 'F7374F'}`
      return new Promise((resolve) => {
        const snackbar = document.createElement("div");
        Object.assign(snackbar.style, {
          display: "flex",
          alignItems: "center",
          position: "fixed",
          right: "-1000px",
          width: "max-content",
          top: "30px",
          padding: "12px",
          width: "max",
          background: "white",
          zIndex: "9999",
          borderLeft: `4px solid ${theme}`,
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
        snackbarTitle.textContent = _type.charAt(0).toUpperCase() + _type.slice(1);

        Object.assign(snackbarTitle.style, {
          margin: 0,
          color: theme,
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

        const iconContainer = document.createElement("div");

        if (_type === 'warning') {
          iconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="${theme}" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="8" fill="${theme}" />
      <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0z" fill="white"/>
    </svg>
  `;
        } else if (_type === 'error') {
          iconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="${theme}" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="8" fill="${theme}" />
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" fill="white"/>
    </svg>
  `;
        } else {
          // default to success
          iconContainer.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="${theme}"/>
      <path d="M20 32C13.3831 32 8 26.6169 8 20C8 13.3831 13.3831 8 20 8C26.6169 8 32 13.3831 32 20C32 26.6169 26.6169 32 20 32Z" fill="${theme}"/>
      <path d="M26.4739 14.6475L15.623 25.4983L21.9637 31.8389C27.5946 30.9082 31.9155 26.0435 31.9986 20.1722L26.4739 14.6475Z" fill="${theme}"/>
      <path d="M26.7156 14.8798C26.0224 14.1282 25.3939 13.621 24.6423 14.313L16.9599 21.3955L15.0205 19.1774C14.3474 18.4087 13.6683 18.8455 12.8983 19.5184C12.1284 20.1913 11.5592 20.8457 12.2328 21.6157L14.236 23.9067L15.8709 25.7767C16.3113 26.2803 17.0803 26.3218 17.5722 25.8683L19.3985 24.1846L27.1523 17.0364C27.9045 16.3432 27.4088 15.6315 26.7156 14.8798Z" fill="white"/>
    </svg>
  `;
        }

        const closeIcon = document.createElement("div");
        closeIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="14" fill="#F9F2F2"/>
        <path d="M18.1973 10.743C18.4569 10.4834 18.4569 10.0626 18.1973 9.80301C17.9377 9.54343 17.5169 9.54343 17.2573 9.80301L14.0007 13.0597L10.744 9.80301C10.4844 9.54343 10.0636 9.54343 9.80398 9.80301C9.54441 10.0626 9.54441 10.4834 9.80398 10.743L13.0607 13.9997L9.80398 17.2563C9.54441 17.5159 9.54441 17.9368 9.80398 18.1963C10.0636 18.4559 10.4844 18.4559 10.744 18.1963L14.0007 14.9397L17.2573 18.1963C17.5169 18.4559 17.9377 18.4559 18.1973 18.1963C18.4569 17.9368 18.4569 17.5159 18.1973 17.2563L14.9407 13.9997L18.1973 10.743Z" fill="#2D2D2D"/>
      </svg>
    `;

        snackbar.append(iconContainer, snackbarContent, closeIcon);

        document.body.appendChild(snackbar);

        setTimeout(() => {
          snackbar.style.right = "30px";
        }, 10);

        closeIcon.addEventListener("click", () => {
          snackbar.style.right = "-1000px";
          setTimeout(() => {
            snackbar.remove()
            resolve();
          }, 300);
        });


        if (_autoHide) {
          setTimeout(() => {
            snackbar.style.right = "-1000px";
            setTimeout(() => {
              snackbar.remove();
              resolve();
            }, 300);
          }, 3000);
        }
      })
    }, { _message: message, _autoHide: autoHide, _type: type });
  } catch { }
};

const searchCreatorSnackbar = async ({ page, username }) => {
  try {
    await page.evaluate((username) => {
      const theme = "#08A081"; // default to success color

      if (!window.__searchCreatorSnackbar) {
        const snackbar = document.createElement("div");
        Object.assign(snackbar.style, {
          display: "flex",
          alignItems: "center",
          position: "fixed",
          right: "-1000px",
          top: "30px",
          padding: "12px 16px",
          background: "#FFF",
          zIndex: "9999",
          borderLeft: `4px solid ${theme}`,
          borderRadius: "4px",
          boxShadow: "0px 2px 12px 0px rgba(102, 115, 143, 0.10)",
          transition: "0.5s",
          fontFamily: "sans-serif",
        });

        // Spinner
        const spinner = document.createElement("div");
        Object.assign(spinner.style, {
          border: "4px solid #f3f3f3",
          borderTop: `4px solid ${theme}`,
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          animation: "spin 1s linear infinite",
          marginRight: "12px",
        });

        // Inject @keyframes spin (only once)
        if (!document.getElementById("__snackbar_style")) {
          const style = document.createElement("style");
          style.id = "__snackbar_style";
          style.innerHTML = `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }

        // Text container
        const snackbarText = document.createElement("div");

        const title = document.createElement("h6");
        title.textContent = `Looking for creators: ${username}`;
        Object.assign(title.style, {
          margin: 0,
          color: "#2D2D2D",
          fontWeight: "500",
          fontSize: "16px",
        });

        snackbarText.appendChild(title);
        snackbar.appendChild(spinner);
        snackbar.appendChild(snackbarText);
        document.body.appendChild(snackbar);

        setTimeout(() => {
          snackbar.style.right = "30px";
        }, 10);

        // Save references for later updates
        window.__searchCreatorSnackbar = snackbar;
        window.__searchCreatorSnackbarTitle = title;

        // Optional close function
        window.__closeSearchCreatorSnackbar = () => {
          snackbar.style.right = "-1000px";
          setTimeout(() => {
            snackbar.remove();
            delete window.__searchCreatorSnackbar;
            delete window.__searchCreatorSnackbarTitle;
            delete window.__closeSearchCreatorSnackbar;
          }, 300);
        };
      } else {
        // Just update the title text
        window.__searchCreatorSnackbarTitle.textContent = `Looking for creators: ${username}`;
      }
    }, username);
  } catch (e) {
    console.error("Failed to show searchCreatorSnackbar:", e);
  }
};

module.exports = { showSnackbar, searchCreatorSnackbar };
