<template lang="pug">
#app
  p Drag points (in blue) and see how their Tverberg points (in green) move.
  label r 
  select(v-model.number="r")
    option 2
    option 3
  |  &middot; 
  label mode 
  select(v-model="mode")
    option 3r-2
    option 3r
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
    svg
      poly(
        v-for="(polygon, i) in tverbergSet"
        v-bind:coordinates="polygon"
        v-bind:key="i"
      )
    svg
      poly(
        v-for="(polygon, i) in convexHulls"
        v-bind:coordinates="polygon"
        v-bind:outline="true"
        v-bind:key="i"
      )
</template>

<script>
import convexhull from 'convexhull-js';
import { triplize, partitions } from './lib/partitions';
import { intersection, triangleContainsPoint, intersectAll } from './lib/convex';
import Point from './components/Point';
import Poly from './components/Polygon';

export default {
  name: 'app',
  data() {
    return {
      r: 3,
      mode: '3r',
      h: 0,
      w: 0,
      points: [],
      dragging: null, // is the index of the dragged point if not null.
      start: { x: 0, y: 0 },
      startPoint: { x: 0, y: 0 },
    };
  },
  components: { Point, Poly },
  mounted() {
    this.h = document.getElementById('canvas').clientHeight;
    this.w = document.getElementById('canvas').clientWidth;
    this.random();
  },
  methods: {
    random() {
      let i = 0;
      const n = (this.mode === '3r-2' ? (3 * this.r) - 2 : 3 * this.r);
      this.points.splice(n);
      for (i = 0; i < n; i += 1) {
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
      if (this.mode === '3r-2') {
        return partitions((3 * this.r) - 2);
      } else {
        return triplize([...Array(3 * this.r).keys()]);
      }
    },
    tverbergPoints() {
      if (this.mode !== '3r-2') return [];
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
    tverbergSet() {
      if (this.mode !== '3r' || this.points.length !== 3 * this.r) return null;
      const that = this;
      const triangleIntersections = this.partitions.map((p) => {
        const parameters = p.map(q => q.map(i => [that.points[i].x, that.points[i].y])).map(q => [...q, q[0]]);
        return intersectAll(parameters);
      });
      return [].concat(...triangleIntersections.filter(a => a));
    },
    convexHulls() {
      if (this.mode !== '3r' || this.points.length !== 3 * this.r) return null;
      const convexHulls = [];
      if (this.r === 2) {
        for (let i = 0; i < this.points.length; i += 1) {
          convexHulls.push(convexhull([...this.points.slice(0, i), ...this.points.slice(i+1)]));
        }
      } else if (this.r === 3) {
        for (let i = 0; i < this.points.length; i += 1) {
          for (let j = i + 1; j < this.points.length; j += 1) {
            convexHulls.push(convexhull([...this.points.slice(0, i), ...this.points.slice(i+1, j), ...this.points.slice(j+1)]));
          }
        }
      }
      return convexHulls.map(a => a.map(o => [o.x, o.y]));
    },
  },
  watch: {
    r() {
      this.random();
    },
    mode() {
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
  svg
    z-index -1
    position absolute
    left 0
    top 0
    width 100%
    height 100%
</style>
