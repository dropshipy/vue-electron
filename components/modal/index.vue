<script>
import Teleport from 'vue2-teleport'

export default {
  components: {
    Teleport
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    modalClass: {
      type: String,
      default: ''
    },
    value: {
      type: Boolean,
      default: false
    },
    cancelBtnText: {
      type: String,
      default: 'Batal'
    },
    confirmBtnText: {
      type: String,
      default: 'Simpan'
    }
  },

  methods: {
    onClose() {
      this.isShow = false;
      this.$emit('close');
    }
  },

  computed: {
    isShow: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    }
  }
}

</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isShow" class="modal__overlay" @click="onClose">
        <div class="modal" :class="modalClass" @click.stop>
          <h3 class="modal__title">{{ title || 'Title' }}</h3>

          <div class="modal__content">
            <slot></slot>
          </div>

          <div class="modal__footer">
            <slot name="footer">
              <Button theme="primary-outline" @click="onClose" class="w-28">{{ cancelBtnText }}</Button>
              <Button @click="$emit('confirm')" class="w-28">{{ confirmBtnText }}</Button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="postcss">
.modal {
  @apply min-w-[500px] bg-white transition-all p-6 rounded-xl shadow;

  &__overlay {
    @apply flex items-center justify-center fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-40;
  }

  &__title {
    @apply text-xl font-medium;
  }

  &__content {
    @apply mt-4;
  }

  &__footer {
    @apply flex items-center justify-end space-x-4;
  }
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-all;
}

.modal-enter .modal,
.modal-leave-to .modal {
  @apply scale-50 opacity-0;
}
</style>