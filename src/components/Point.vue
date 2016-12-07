<template lang="pug">
.point(
  v-bind:style="{ left: x + 'px', top: y + 'px'}"
  v-bind:class="{ tverberg }"
  @mousedown="$emit('startDrag', $event, i)" @touchstart="$emit('startDrag', $event, i)"
)
</template>

<script>
export default {
  name: 'point',
  props: {
    x: Number,
    y: Number,
    i: Number,
    tverberg: Boolean,
  },
};
</script>

<style lang="stylus">
size = 12px
msize = -6px
.point
  width size
  height size
  border-radius size
  padding-left msize
  padding-top msize
  background-color #00024A
  position absolute
  opacity 0.5
.point.tverberg
  background-color #009662
  z-index -1
  opacity 1
</style>
