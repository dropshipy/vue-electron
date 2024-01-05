<script>
export default {
  props: {
    theme: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'tertiary'].includes(value)
    }
  },
  computed: {
    buttonStyle() {
      if (this.theme === 'primary') {
        return {
          background: 'linear-gradient(181deg, #EE3A31 -56.56%, #F47922 98.99%)'
        }
      }
      return {}
    }
  }
}
</script>

<template>
  <button v-bind="$attrs" v-on="$listeners"
    class="flex items-center space-x-2 text-sm py-2 px-4 rounded-lg transition-all"
    :class="theme === 'primary' ? 'text-white font-bold' : 'text-dark font-medium'" :style="buttonStyle">
    <slot />
  </button>
</template>