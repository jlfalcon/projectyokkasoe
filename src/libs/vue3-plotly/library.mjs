import { v4 } from 'uuid';
import Plotly from 'plotly.js-dist';
import { openBlock, createElementBlock } from 'vue';

const names = [
  "afterExport",
  "afterPlot",
  "animated",
  "animatingFrame",
  "animationInterrupted",
  "autoSize",
  "beforeExport",
  "buttonClicked",
  "click",
  "clickAnnotation",
  "deselect",
  "doubleClick",
  "framework",
  "hover",
  "legendClick",
  "legendDoubleClick",
  "relayout",
  "restyle",
  "redraw",
  "selected",
  "selecting",
  "sliderChange",
  "sliderEnd",
  "sliderStart",
  "transitioning",
  "transitionInterrupted",
  "unhover"
];

const events = names.map(evt => evt.toLocaleLowerCase())
.map(eventName => ({
  completeName: "plotly_" + eventName,
  handler: (ctx) => (...args) => {
    console.log( "plotly event triggered", eventName, args ); 
    ctx.$emit.apply(ctx, [eventName, ...args]);
  }
}));


let timeOutFunctionId;

var script = {
  name: 'VuePlotly',

  data() {
    return {
      plotlyId: `plotly-${v4()}`,
    };
  },

  props: ['data', 'layout', 'config'],

  watch: {
    data() { this.setGraph(); },
    layout() { this.setGraph(); },
    config() { this.setGraph(); },
  },

  mounted() {
    this.setGraph();
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeOutFunctionId); // debounce the reset
      timeOutFunctionId = setTimeout(this.setGraph, 100);
    });
    this.resizeObserver.observe(document.getElementById(this.plotlyId));
  },

  beforeUnmount() { this.resizeObserver.disconnect(); },

  methods: {
    setGraph() {
      Plotly.newPlot(this.plotlyId, this.data, this.layout, this.config);
      events.forEach((e) => {
        this.$el.on(e.completeName, e.handler(this));
      });
    },
  },
};

const _hoisted_1 = ["id"];

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", { id: $data.plotlyId }, null, 8 /* PROPS */, _hoisted_1))
}

script.render = render;
script.__file = "src/VuePlotly.vue";

export { script as VuePlotly };
