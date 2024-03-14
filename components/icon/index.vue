<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 20
    }
  },

  computed: {
    iconSource() {
      return require(`~/assets/icons/${this.name}.svg`)
    }
  }
}
</script>

<template>
  <svg :width="size" :height="size" fill="none">
    <use v-if="iconSource" :xlink:href="`${iconSource}#icon`" />
  </svg>
</template>