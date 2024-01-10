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
    value: {
      type: String,
      default: ''
    },
    maxHeight: {
      type: Number,
      default: 44
    }
  }
}
</script>

<template>
  <div>
    <label class="text-[#2D2D2D] mb-3" v-if="label" :for="id">{{ label }}</label>
    <div class="relative !text-[#2D2D2D]">
      <input :value="value" :type="type" :placeholder="placeholder" @input="$emit('input', $event.target.value)" :id="id"
        class="border !border-[#A0A3BD] !border-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary p-3 w-full rounded-[6px] text-base"
        :style="{ maxHeight: `${maxHeight}px` }" />

      <button v-if="icon" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3BD]"
        @click.stop="$emit('click:icon')">
        <Icon :size="24" :name="icon" />
      </button>
    </div>
  </div>
</template>