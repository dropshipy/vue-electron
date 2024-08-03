<script>
export default {
  props: {
    theme: {
      type: String,
      default: "primary",
      validator: (value) =>
        ["primary", "tertiary", "primary-outline"].includes(value),
    },
  },
  computed: {
    buttonStyle() {
      if (this.theme === "primary") {
        if (this.$config.appName === "tiksender") {
          return {
            background:
              "linear-gradient(181deg, #EE3A31 -56.56%, #F47922 98.99%)",
          };
        }
        return {
          background:
            "linear-gradient(181deg, #00AC01 -56.56%, #00AC01 98.99%)",
        };
      }
      return {};
    },
    buttonClasses() {
      switch (this.theme) {
        case "primary":
          return "text-white font-bold";
        case "primary-outline":
          if (this.$config.appName === "tiksender") {
            return "text-primary font-medium border border-primary";
          }
          return "text-[#4F9D4E] font-medium border border-[#4F9D4E]";
        default:
          return "text-dark font-medium";
      }
    },
  },
};
</script>

<template>
  <button
    v-bind="$attrs"
    v-on="$listeners"
    class="flex items-center justify-center space-x-2 text-sm py-2 px-4 rounded-lg transition-all"
    :class="buttonClasses"
    :style="buttonStyle"
  >
    <slot />
  </button>
</template>
