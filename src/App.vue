<template lang="pug">
#app
  p Drag points (in blue) and see how their Tverberg points (in green) move.
  label r 
  input(v-model.number="r")
  #canvas(
    @mousemove="onDrag" @touchmove="onDrag"
    @mouseup="stopDrag" @touchend="stopDrag" @mouseleave="stopDrag"
  )
    point(
      v-for="(point, i) in points"
      v-bind:x="point.x"
      v-bind:y="point.y"
      v-bind:i="i"
      v-bind:key="i"
      v-bind:tverberg="false"
      @startDrag="startDrag($event, i)"
    )
    point(
      v-for="(point, i) in tverbergPoints"
      v-bind:x="point.x"
      v-bind:y="point.y"
      v-bind:i="i"
      v-bind:tverberg="true"
      v-bind:key="i"
    )
</template>

<script>
import partitions from './lib/partitions';
import { intersection, triangleContainsPoint } from './lib/convex';
import Point from './components/Point';

export default {
  name: 'app',
  data() {
    return {
      r: 2,
      h: 0,
      w: 0,
      points: [],
      dragging: null, // is the index of the dragged point if not null.
      start: { x: 0, y: 0 },
      startPoint: { x: 0, y: 0 },
    };
  },
  components: { Point },
  mounted() {
    this.h = document.getElementById('canvas').clientHeight;
    this.w = document.getElementById('canvas').clientWidth;
    this.random();
  },
  methods: {
    random() {
      let i = 0;
      this.points.splice((3 * this.r) - 2);
      for (i = 0; i < (3 * this.r) - 2; i += 1) {
        if (this.points[i] === undefined) {
          this.$set(
            this.points,
            i,
            {
              x: this.w * Math.random(),
              y: this.h * Math.random(),
            }
          );
        }
      }
    },
    startDrag(e, i) {
      e = e.changedTouches ? e.changedTouches[0] : e;
      this.dragging = i;
      this.start.x = e.pageX;
      this.start.y = e.pageY;
      this.startPoint.x = this.points[i].x;
      this.startPoint.y = this.points[i].y;
    },
    onDrag(e) {
      e = e.changedTouches ? e.changedTouches[0] : e;
      if (this.dragging !== null) {
        const x = this.startPoint.x + (e.pageX - this.start.x);
        const y = this.startPoint.y + (e.pageY - this.start.y);
        this.$set(this.points, this.dragging, { x, y });
      }
    },
    stopDrag(e) {
      if (this.dragging !== null) {
        this.dragging = null;
      }
    },
  },
  computed: {
    partitions() {
      return partitions((3 * this.r) - 2);
    },
    tverbergPoints() {
      if (this.points.length !== (3 * this.r) - 2) return [];
      const points = [];
      for (const partition of this.partitions) {
        let point;
        let triplization;
        if (partition[0].length === 1) {
          point = this.points[partition[0][0]];
          triplization = partition.slice(1);
        } else {
          const segment1 = partition[0].map(i => this.points[i]);
          const segment2 = partition[1].map(i => this.points[i]);
          const intersectionCoordinates = intersection(segment1, segment2);
          if (intersectionCoordinates !== null) {
            point = {
              x: intersectionCoordinates[0],
              y: intersectionCoordinates[1],
            };
            triplization = partition.slice(2);
          } else {
            point = null;
          }
        }
        if (point !== null) {
          let everyTriangleContainsPoint = true;
          for (const triple of triplization) {
            const triangle = triple.map(i => this.points[i]);
            if (!triangleContainsPoint(triangle, point)) {
              everyTriangleContainsPoint = false;
              break;
            }
          }
          if (everyTriangleContainsPoint) points.push(point);
        }
      }
      return points;
    },
  },
  watch: {
    r() {
      this.random();
    },
  },
};
</script>

<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
#canvas
  position absolute
  left 10px
  right 10px
  top 90px
  bottom 10px
  border 1px solid #999
  border-radius 5px
  cursor crosshair
</style>
