<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isChecked: {
      get: function () {
        return this.value;
      },
      set: function (val) {
        this.$emit("input", val);
      },
    },

    bgStyle() {
      if (this.$config.appName === "tiksender") {
        return {
          backgroundColor: "black",
        };
      }
      return `!bg-[#00AC01]`;
    },
  },
  methods: {
    backgroundStyle(isChecked) {
      if (isChecked && this.$config.appName == "tiksender") {
        return "!bg-primary";
      } else if (isChecked) {
        return "!bg-[#00AC01]";
      }
    },
    textStyle(isChecked) {
      if (isChecked && this.$config.appName == "tiksender") {
        return "!text-primary";
      } else if (isChecked) {
        return "!text-[#00AC01]";
      }
    },
  },
};
</script>

<template>
  <label class="flex items-center gap-2 w-max cursor-pointer">
    <div
      class="flex items-center p-[2px] w-12 h-6 bg-gray-300 rounded-3xl"
      :class="backgroundStyle(value)"
    >
      <input type="checkbox" class="hidden" v-model="isChecked" />
      <div
        class="bg-white h-5 w-5 rounded-full transition-all"
        :class="{ 'translate-x-6': value }"
      ></div>
    </div>
    <p class="text-base transition-all text-dark" :class="textStyle(value)">
      {{ label }}
    </p>
  </label>
</template>

<style scoped></style>
