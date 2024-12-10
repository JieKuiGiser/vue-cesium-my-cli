<template>
  <div
    class="control MapZoom"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="resetMap"
  >
    <vc-zoom-control
      position="bottom"
      :enable-reset-button="false"
      border-radius="0"
      :offset="[0, 120]"
    ></vc-zoom-control>
  </div>
</template>

<script>
export default {
  name: "MapZoom",
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
    // 放大
    zoomIn() {
      // viewer 为 Viewer 对象
      let position = window.$viewer.camera.position;
      let cameraHeight =
        window.$viewer.scene.globe.ellipsoid.cartesianToCartographic(
          position
        ).height;
      // 每次缩小 20 倍，参数可改
      let moveRate = cameraHeight / 10.0;
      window.$viewer.camera.moveForward(moveRate);
    },

    zoomOut() {
      // viewer 为 Viewer 对象
      let position = window.$viewer.camera.position;
      let cameraHeight =
        window.$viewer.scene.globe.ellipsoid.cartesianToCartographic(
          position
        ).height;
      // 每次缩小 20 倍，参数可改
      let moveRate = cameraHeight / 10.0;
      window.$viewer.camera.moveBackward(moveRate);
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  width: 44px;
  height: 88px;
  background: rgba(20, 27, 31, 0.8);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  .addZoom {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    width: 60%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .addZoom:hover {
    .icon {
      color: #33f8ff;
    }
  }
  .subZoom:hover {
    .icon {
      color: #33f8ff;
    }
  }

  .subZoom {
    width: 60%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon {
    color: #b2c2c2;
    .svg-icon {
      font-size: 30px;
      fill: currentColor;
    }
  }
}
</style>
