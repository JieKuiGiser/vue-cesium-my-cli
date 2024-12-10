<style lang="scss" scoped>
@import "./index.scss";
</style>
<template>
  <div class="mapModelDataView">
    <vue3dLoader :filePath="currentFilePath" height="500" />
  </div>
</template>

<script>
import { Plus, Minus, SortUp, SortDown } from "@element-plus/icons-vue";
import { screenCoordinatesToDegrees } from "@/utils/cesium/tools";

import { vue3dLoader } from "vue-3d-loader";
export default {
  name: "MapDataView",
  props: {},
  data() {
    return {
      Plus: Plus,
      Minus: Minus,
      SortUp: SortUp,
      SortDown: SortDown,
      // http://192.168.16.42/model/car.glb
      currentFilePath:''
    };
  },
  created() {},
  mounted() {
    window.addEventListener(
      "message",
      (e) => {
        const params = e.data;
        // geojson || 3dtiles || wmts
        this.currentFilePath = params.url
      },
      false
    );
  },

  methods: {},
};
</script>
