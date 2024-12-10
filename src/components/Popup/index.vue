<template>
  <transition name="Dialog">
    <Vue3DraggableResizable
      v-show="popup.visible"
      :initW="width"
      :initH="height"
      v-model:x="position.x"
      v-model:y="position.y"
      v-model:active="popup.visible"
      :draggable="true"
      :resizable="false"
      @activated="print('activated')"
      @deactivated="print('deactivated')"
      @drag-start="print('drag-start')"
      @resize-start="print('resize-start')"
      @dragging="print('dragging')"
      @resizing="print('resizing')"
      @drag-end="print('drag-end')"
      @resize-end="print('resize-end')"
    >
      <div v-show="popup.visible" class="popup" id="popup">
        <slot></slot>
      </div>
    </Vue3DraggableResizable>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "popup",
  props: {
    width: {
      type: Number,
      default: 100,
    },
    height: {
      type: Number,
      default: 100,
    },
    isFollow: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      popup: {
        visible: false,
        timerId: null,
      },
      position: {
        x: 0,
        y: 0,
      },
      currentLonlat: {
        lon: "",
        lat: "",
      },
    };
  },
  methods: {
    print(val) {
      switch (val) {
        case "deactivated":
          this.popup.visible = false;
          this.removeEventListener();
          break;
      }
    },
    // 地图移动时弹窗跟随
    addEventListener() {
      window.$viewer.scene.postRender.addEventListener(
        this.infoWindowPostRender
      );
    },
    removeEventListener() {
      window.$viewer.scene.postRender.removeEventListener(
        this.infoWindowPostRender
      );
    },
    transForm(screenX, screenY) {
      var scene = window.$viewer.scene;
      var cartesian = scene.camera.pickEllipsoid(
        new Cesium.Cartesian2(screenX, screenY),
        scene.globe.ellipsoid
      );
      if (cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        return {
          lon: longitude,
          lat: latitude,
          height: height,
        };
      } else {
        console.log("No position found.");
      }
    },
    infoWindowPostRender() {
      if (!this.popup.timerId) {
        this.popup.timerId = setTimeout(() => {
          // 定义弹窗在场景中的位置
          var popupPosition = Cesium.Cartesian3.fromDegrees(
            this.currentLonlat.lon,
            this.currentLonlat.lat
          ); // 这里使用一个初始位置，您可以根据需要进行调整
          // 将弹窗的场景坐标转换为屏幕坐标
          var windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            window.$viewer.scene,
            popupPosition
          );

          // 更新弹窗的位置
          if (Cesium.defined(windowPosition)) {
            this.setPopPosition(windowPosition);
          }
          this.popup.timerId = null;
        }, 0);
      } else {
        this.removeEventListener();
      }
    },
    setPopPosition(position) {
      this.position = position;
      this.currentLonlat = this.transForm(position.x, position.y);
      if (this.isFollow) {
        this.addEventListener();
      }
      // console.log(this.currentLonlat);
      // const pop = document.getElementById("popup");
      // pop.style.top = position.y + "px";
      // pop.style.left = position.x + "px";
    },
  },
});
</script>
<style lang="scss" scoped>
.popup {
  position: absolute;
  z-index: 999;
  background: rgba(15, 26, 33, 0.8);
  border: 1px solid rgba(8, 37, 49, 1);
  box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}
.draggable {
  border: 0 !important;
}
</style>
