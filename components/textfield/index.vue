<script>
export default {
  props: {
    id: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    iconSize: {
      type: Number,
      default: 24,
    },
    value: {
      type: [String, Number],
      default: "",
    },
    maxHeight: {
      type: Number,
      default: 44,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    inputClass: {
      type: [String, Array, Object],
      default: "",
    },
  },
  computed: {
    ringStyle() {
      if (this.$config.appName === "tiksender") {
        return "focus:!ring-primary";
      }
      return "focus:!ring-[#00AC01]";
    },
  },
};
</script>

<template>
  <div>
    <label
      class="flex items-center gap-3 flex-wrap text-[#2D2D2D] mb-3"
      v-if="label"
      :for="id"
    >
      <span>{{ label }}</span>
      <slot name="label" />
    </label>
    <div class="relative !text-[#2D2D2D]" @click.stop="$emit('click')">
      <textarea
        v-if="type === 'textarea'"
        :value="value"
        :type="type"
        :placeholder="placeholder"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
        :id="id"
        class="input-field"
        :class="[inputClass, { '!pr-9': icon }, ringStyle]"
        :style="{ maxHeight: `${maxHeight}px` }"
        :readonly="readonly"
      >
      </textarea>

      <input
        v-else
        :value="value"
        :type="type"
        :placeholder="placeholder"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
        :id="id"
        class="input-field"
        :class="[inputClass, { '!pr-9': icon }, ringStyle]"
        :style="{ maxHeight: `${maxHeight}px` }"
        :readonly="readonly"
      />

      <button
        v-if="icon"
        class="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3BD]"
        @click.stop="$emit('click:icon')"
      >
        <Icon :size="iconSize" :name="icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply border !border-[#A0A3BD] !border-opacity-40 focus:outline-none focus:ring-2  p-3 w-full rounded-[6px] text-base;
}
</style>
