export default (ctx, inject) => {
  inject("snackbar", {
    success(message, options = {}) {
      $nuxt.$emit("show-snackbar", message, {
        type: "success",
        ...options,
      });
    },
    error(message, options = {}) {
      $nuxt.$emit("show-snackbar", message, {
        type: "error",
        ...options,
      });
    },
  });
};
