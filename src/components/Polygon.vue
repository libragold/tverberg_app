<template lang="pug">
polygon.poly(v-bind:points="cString" v-bind:class="{ outline }")
</template>

<script>
export default {
  name: 'poly',
  props: {
    coordinates: Array,
    outline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    cString() {
      return this.coordinates.map(p => p.join(',')).join(' ');
    },
  },
};
</script>

<style lang="stylus">
.poly
  fill #009662
  opacity 0.005
  stroke #111
  &.outline
    fill transparent
    stroke #940100
    opacity 0.5
</style>