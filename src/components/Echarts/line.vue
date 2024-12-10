<template>
  <div
    :id="elementId"
    :style="{ width, height }"
    :legendData="legendData"
    :dataX="dataX"
    :dataY="dataY"
    :seriesData="seriesData"
    :textStyle="textStyle"
  ></div>
</template>
<script>
import * as echarts from "echarts";

export default {
  name: "Lines",
  data() {
    return {};
  },
  props: {
    elementId: { type: String },
    color: { type: String },
    title: { type: String },
    legendData: { type: Array },
    dataX: { type: [Array, Object] },
    dataY: { type: [Array, Object] },
    seriesData: { type: [Array, Object] },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
    textStyle: {
      type: String,
      default: "#000",
    },
  },
  methods: {
    init(elementId, dataY, dataX, legendData, seriesData, textStyle) {
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
        legend: {
          textStyle: {
            color: this.textStyle, // 文字颜色
          },
          data: legendData,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: this.dataX,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: this.seriesData,
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
      this.dataY,
      this.dataX,
      this.legendData,
      this.seriesData,
      this.textStyle
    );
  },
};
</script>