<script>
export default {
  data() {
    return {
      isVisible: false,
      message: "",
      type: "success",
    };
  },
  methods: {
    hide() {
      this.isVisible = false;
      this.message = "";
      this.type = "success";
    },
    showSnackbar(message, options) {
      console.log(message, options);
      this.message = message;
      this.type = options?.type || "success";
      this.isVisible = true;

      setTimeout(() => {
        this.hide();
      }, options?.duration || 3000);
    }
  },
  created() {
    this.$nuxt.$on('show-snackbar', this.showSnackbar);
  },
  beforeDestroy() {
    this.$nuxt.$off('show-snackbar', this.showSnackbar);
  },
};
</script>


<template>
  <Transition name="snackbar">
    <div v-if="isVisible" :class="`snackbar--${type}`"
      class="flex items-center fixed right-[30px] top-[100px] p-3 bg-white shadow-md z-50 rounded-md border-l-4">

      <div class="flex items-center justify-center w-10 h-10 p-2 mr-3 rounded-full"
        :class="`snackbar__icon-wrapper--${type}`">
        <div v-if="type === 'success'" class="snackbar__icon--success">
          <Icon name="check" :size="24" />
        </div>

        <Icon v-else-if="type === 'error'" name="warning" :size="24" class="snackbar__icon--error" />
      </div>

      <div>
        <h6 class="snackbar__title">
          {{ type }}
        </h6>
        <p>{{ message }}</p>
      </div>

      <button class="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full ml-4" @click="hide">
        <Icon name="close" :size="16" />
      </button>

    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.snackbar {
  &__title {
    @apply capitalize text-base font-bold;
  }

  &--success {
    @apply border-success;

    .snackbar__title {
      @apply text-success;
    }

    .snackbar__icon-wrapper--success {
      @apply bg-success bg-opacity-25;
    }

    .snackbar__icon--success {
      @apply bg-success text-white flex items-center justify-center w-6 h-6 rounded-full;
    }
  }

  &--error {
    @apply border-error;

    .snackbar__title {
      @apply text-error;
    }

    .snackbar__icon-wrapper--error {
      @apply bg-error bg-opacity-25;
    }

    .snackbar__icon--error {
      @apply text-error;
    }
  }
}

.snackbar-enter-active,
.snackbar-leave-active {
  @apply transition-all;
}

.snackbar-enter,
.snackbar-leave-to {
  @apply opacity-0 translate-x-40;
}
</style>