<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: Number,
      default: 24
    },
    value: {
      type: [String, Number],
      default: ''
    },
    maxHeight: {
      type: Number,
      default: 44
    },
    readonly: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: [String, Array, Object],
      default: ''
    }
  },
  computed: {
    elementTag() {
      if (this.type === 'textarea') return 'textarea'
      return 'input'
    }
  }
}
</script>

<template>
  <div>
    <label class="flex items-center gap-3 flex-wrap text-[#2D2D2D] mb-3" v-if="label" :for="id">
      <span>{{ label }}</span>
      <slot name="label" />
    </label>
    <div class="relative !text-[#2D2D2D]" @click.stop="$emit('click')">
      <component :is="elementTag" :value="value" :type="type" :placeholder="placeholder"
        @input="$emit('input', $event.target.value)" :id="id"
        class="border !border-[#A0A3BD] !border-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary p-3 w-full rounded-[6px] text-base"
        :class="inputClass" :style="{ maxHeight: `${maxHeight}px` }" :readonly="readonly" />

      <button v-if="icon"
        class="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3BD]"
        @click.stop="$emit('click:icon')">
        <Icon :size="iconSize" :name="icon" />
      </button>
    </div>
  </div>
</template>