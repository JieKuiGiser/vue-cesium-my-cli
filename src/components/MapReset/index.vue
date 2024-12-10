<template>
  <div
    class="control mapReset"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="resetMap"
  >
    <span class="icon"><svg-icon iconName="icon-znz"></svg-icon></span>
  </div>
</template>

<script>
export default {
  name: "MapReset",
  props: {
    left: {
      type: Number,
      default: 0,
    },
    bottom: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {};
  },

  mounted() {},

  methods: {
    // 复位
    resetMap() {
      // console.log(window.$viewer.camera);
      // window.$viewer.camera.flyTo({
      //   destination: window.$viewer.camera.destination,
      //   orientation: {
      //     heading: window.$viewer.camera.heading,
      //     pitch: window.$viewer.camera.pitch,
      //     roll: 0,
      //   },
      //   complete: function callback() {},
      // });

      window.$viewer.camera.setView({
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: Cesium.Math.toRadians(0),
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  width: 44px;
  height: 44px;
  background: rgba(20, 27, 31, 0.8);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  .icon {
    .svg-icon {
      font-size: 30px;
      fill: #b2c2c2;
    }
  }
}
.control:hover {
  .icon {
    .svg-icon {
      fill: #33f8ff;
    }
  }
}
</style>
