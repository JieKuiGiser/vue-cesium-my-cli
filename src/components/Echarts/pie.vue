<template>
  <div
    :id="elementId"
    :style="{ width, height }"
    :legend="legend"
    :series="series"
    :grid="grid"
  ></div>
</template>
<script>
import * as echarts from "echarts";

export default {
  name: "Pie",
  data() {
    return {};
  },
  props: {
    elementId: { type: String },
    legend: { type: Object },
    series: { type: [Array, Object] },

    color: { type: String },
    title: { type: String },
    // data: { type: [Array, Object] },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
    grid: { type: Object },
  },
  methods: {
    init(elementId, legend, series, grid) {
      const element = document.getElementById(elementId);
      const eChart = echarts.init(element);
      const option = {
        color: [
          "#40b27d",
          "#ffdc60",
          "#ff7070",
          "#7ed3f4",
          "#40b27d",
          "#fe9059",
          "#a969c6",
          "#6e7074",
          "#546570",
          "#c4ccd3",
        ],
        title: {
          // text: title,
        },
        tooltip: {
          trigger: "item",
        },
        legend: legend,
        series: series,
        grid:{
          left:20,
          bottom:20
        }
      };
      console.log(option)
      eChart.setOption(option);
      window.addEventListener("resize", function () {
        eChart.resize();
      });
    },
  },
  mounted() {
    setTimeout(()=>{
    this.init(this.elementId, this.legend, this.series, this.grid);
      
    },2000)
  },
};
</script>