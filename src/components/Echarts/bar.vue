<template>
  <div
    :id="elementId"
    :style="{ width, height }"
    :legendData="legendData"
    :grid="grid"
    :legendX="legendX"
    :yAxis="yAxis"
    :datasetSourse="datasetSourse"
    :seriesData="seriesData"
    :visualMap="visualMap"
  ></div>
</template>
<script>
import * as echarts from "echarts";

export default {
  name: "Bars",
  data() {
    return {};
  },
  props: {
    elementId: { type: String },
    legendData: { type: Object },
    grid: { type: Object },
    legendX: { type: [Array, Object] },
    yAxis: { type: [Array, Object] },
    datasetSourse: { type: [Object, Array] },
    // dataX: { type: [Array, Object] },
    // dataY: { type: [Array, Object] },
    seriesData: { type: [Array, Object] },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
    dataset: {
      type: Object,
    },
    yAxisValue: {
      type: String,
    },
    visualMap: {
      type: Object,
    },
  },
  methods: {
    init(
      elementId,
      legendData,
      grid,
      legendX,
      yAxis,
      datasetSourse,
      seriesData,
      visualMap
    ) {
      const element = document.getElementById(elementId);
      const eChart = echarts.init(element);
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        legend: this.legendData,
        grid: this.grid,
        xAxis: this.legendX,
        yAxis: this.yAxis,
        dataset: this.datasetSourse,
        series: this.seriesData,
        visualMap: this.visualMap,
      };
      eChart.setOption(option);
      window.addEventListener("resize", function () {
        eChart.resize();
      });
    },
  },
  mounted() {
    this.init(
      this.elementId,
      this.legendData,
      this.grid,
      this.legendX,
      this.yAxis,
      this.datasetSourse,
      this.seriesData,
      this.visualMap
    );
  },
};
</script>