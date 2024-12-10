<template>
  <vc-drawings
    ref="drawingsCustomRef"
    :main-fab-opts="mainFabOpts"
    :editable="editable"
    :clamp-to-ground="clampToGround"
    @ready="drawingsReadyDefault"
    @drawEvt="drawEvt"
    @mouse-evt="mouseEvt"
    :pin-drawing-opts="pinDrawingOpts"
    :point-drawing-opts="pointDrawingOpts"
    :polygon-drawing-opts="polygonDrawingOpts"
    :polyline-drawing-opts="polylineDrawingOpts"
    :regular-drawing-opts="regularDrawingOpts"
    :rectangle-drawing-opts="rectangleDrawingOpts"
    :circle-drawing-opts="circleDrawingOpts"
  >
    <template #body="drawingActionInstances">
      <div class="custom-drawings">
        <!-- <h3>绘制</h3> -->
        <el-row
          type="flex"
          justify="space-around"
          v-for="(drawingActionInstance, index) in showTool"
          :key="index"
          :color="drawingActionInstance.isActive ? 'positive' : 'primary'"
          rounded
          @click="toggle(drawingActionInstance)"
          class="draw-margin"
        >
          <!-- {{ drawingActionInstance.tip }}> -->
          <el-col :span="8">
            <img :src="drawingActionInstance.imgUrl" alt="" />
          </el-col>
          <el-col :span="16">
            <span>{{ drawingActionInstance.tip }}</span>
          </el-col>
        </el-row>
      </div>
    </template>
  </vc-drawings>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usedrawEventStore } from "@/store/drawEvent";
import { useMapStore } from "@/store/map";

import emitter from "@/utils/bus";
// let viewer = undefined
export default defineComponent({
  props: {
    tools: {
      type: Array,
      default: ["pin", "point", "polyline", "rectangle", "regular", "circle"],
    },
    position: {
      type: Object,
      default: {
        left: 30,
        top: 30,
      },
    },
    isDrawClear: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      addTerrain: false,
      editable: false,
      clampToGround: false,
      mainFabOpts: {
        direction: "right",
      },
      polylineDrawingOpts: {
        onClick: this.handlePolylineClick,
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
        },
        primitiveOpts: {
          appearance: {
            type: "PolylineMaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: "#ff1a1a",
                  },
                },
              },
            },
          },
        },
      },
      rectangleDrawingOpts: {
        regular: false,
        onClick: this.handleRectangleClick,
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
        },
        polygonOpts: {
          appearance: {
            type: "MaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: new window.$Cesium.Color(255, 0, 0, 0.3),
                  },
                },
              },
            },
          },
        },
        primitiveOpts: {
          appearance: {
            type: "PolylineMaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: "#ff1a1a",
                  },
                },
              },
            },
          },
        },
      },
      pinDrawingOpts: {
        billboardOpts: {
          image: "https://zouyaoji.top/vue-cesium/images/grepin.png",
          onClick: this.handleBillboardClick,
        },
        labelOpts: {
          text: "图标点",
          pixelOffset: [0, -60],
          onClick: this.handleLabelClick,
        },
      },
      pointDrawingOpts: {
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
          onClick: this.handlePointClick,
        },
      },
      polygonDrawingOpts: {
        onClick: this.handlePolygonClick,
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
        },
        polygonOpts: {
          appearance: {
            type: "MaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: new window.$Cesium.Color(255, 0, 0, 0.3),
                  },
                },
              },
            },
          },
        },
        primitiveOpts: {
          appearance: {
            type: "PolylineMaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: "#ff1a1a",
                  },
                },
              },
            },
          },
        },
      },
      regularDrawingOpts: {
        onClick: this.handleRegularClick,
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
        },
        polygonOpts: {
          appearance: {
            type: "MaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: new window.$Cesium.Color(255, 0, 0, 0.3),
                  },
                },
              },
            },
          },
        },
        primitiveOpts: {
          appearance: {
            type: "PolylineMaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: "#ff1a1a",
                  },
                },
              },
            },
          },
        },
      },
      circleDrawingOpts: {
        onClick: this.handleCircleClick,
        pointOpts: {
          color: "#fff",
          outlineColor: "#f00",
        },
        polygonOpts: {
          appearance: {
            type: "MaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: new window.$Cesium.Color(255, 0, 0, 0.3),
                  },
                },
              },
            },
          },
        },
        primitiveOpts: {
          appearance: {
            type: "PolylineMaterialAppearance",
            options: {
              material: {
                fabric: {
                  type: "Color",
                  uniforms: {
                    color: "#ff1a1a",
                  },
                },
              },
            },
          },
        },
      },
      drawTools: [
        {
          name: "pin",
          tip: "图标点",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/yingyan02.png"),
        },
        {
          name: "point",
          tip: "点",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/ljgh-qi.png"),
        },
        {
          name: "polyline",
          tip: "线",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/xian.png"),
        },
        {
          name: "polygon",
          tip: "多边形",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/juxing.png"),
        },
        {
          name: "rectangle",
          tip: "矩形",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/zhengfangxing.png"),
        },
        {
          name: "regular",
          tip: "菱形",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/duobianxing.png"),
        },
        {
          name: "circle",
          tip: "圆",
          type: "drawing",
          isActive: false,
          imgUrl: require("@/assets/images/yuan.png"),
        },
      ],
      showTool: [],
      currentlonlatArr: [],
      currentlonlatList:[],
      drawEvent: null,
      mapStore: null,
      drawing:false
    };
  },
  methods: {
    initStyle() {
      setTimeout(() => {
        console.log(this.$refs.drawingsCustomRef);
        console.log(document.querySelector(".custom-drawings"));
        document.querySelector(".custom-drawings").style.left =
          this.position.left + "px";
        document.querySelector(".custom-drawings").style.top =
          this.position.top + "px";
      }, 0);
    },
    drawingsReadyDefault({ Cesium, viewer, cesiumObject }) {
      // console.log("绘制选项参数：", cesiumObject);
      // window.vm = this
      // window.$viewer = viewer
      // console.log(cesiumObject)
      // this.drawEvt()
    },
    clear() {
      this.$refs.drawingsCustomRef.clearAll();
    },
    deactivate() {
      this.$refs.drawingsCustomRef.deactivate();
    },
    toggle(drawingActionInstance) {
      if (this.isDrawClear) {
        this.clear();
        this.currentlonlatList = [];
      }
      this.$refs.drawingsCustomRef.toggleAction(drawingActionInstance.name);
      this.drawing = true;
    },
    drawEvt(e, viewer) {
      const restoreCursor = getComputedStyle(window.$viewer.canvas).cursor;
      if (e.finished) {
        if (e.type === "move") {
          window.$viewer.canvas.setAttribute(
            "style",
            `cursor: ${this.restoreCursorMove}`
          );
        }
        switch (e.name) {
          case "polygon":
            this.currentlonlatArr = e.positionsDegreesArray;
            this.currentlonlatArr.push(this.currentlonlatArr[0]);
            break;
          case "point":
            this.currentlonlatArr = e.positionDegrees;
            break;
          case "polyline":
            this.currentlonlatArr = e.positionsDegreesArray;
            break;
          case "rectangle":
            this.currentlonlatArr = e.polygonPositionsDegreesArray;
            break;
          case "regular":
            this.currentlonlatArr = e.polygonPositionsDegreesArray;
            this.currentlonlatArr.push(this.currentlonlatArr[0]);
            break;
          case "circle":
            this.currentlonlatArr = e.polygonPositionsDegreesArray;
            this.currentlonlatArr.push(this.currentlonlatArr[0]);
            break;
        }
        this.$emit('drawFinishEvent',this.currentlonlatArr)
        this.currentlonlatList.push(this.currentlonlatArr)
        this.drawEvent.drawFinish.state = true;
        this.drawEvent.drawFinish.event = e;
        console.log(this.drawEvent);

        // let handler = new Cesium.ScreenSpaceEventHandler(
        //   window.$viewer.scene.canvas
        // );
        // emitter.emit("event", handler);
        viewer.canvas.setAttribute("style", "cursor: auto");
        this.drawing = false;
        // this.$emit("drawFinish", this.currentlonlatArr, e);
      } else {
        this.drawing = true;
        if (e.type === "move") {
          viewer.canvas.setAttribute("style", "cursor: move");
          // console.log("绘制移动")
        }
        if (e.type === "new") {
          viewer.canvas.setAttribute("style", "cursor: crosshair");
          // console.log("新的绘制")
        }
      }
    },
    activeEvt(e, viewer) {
      // console.log(e);
      viewer.canvas.setAttribute(
        "style",
        `cursor: ${e.isActive ? "crosshair" : "auto"}`
      );
      if (!e.isActive) {
        this.drawing = false;
        this.restoreCursorMove = "auto";
      }
    },
    editorEvt(e, viewer) {
      if (e.type === "move") {
        viewer.canvas.setAttribute("style", "cursor: move");
        this.drawing = true;
      } else {
        viewer.canvas.setAttribute("style", "cursor: auto");
      }
    },
    mouseEvt(e, viewer) {
      const restoreCursor = getComputedStyle(viewer.canvas).cursor;
      if (!this.drawing) {
        // console.log(e);
        if (e.type === "onmouseover") {
          this.restoreCursorMove = restoreCursor;
          viewer.canvas.setAttribute("style", "cursor: pointer");
        } else {
          viewer.canvas.setAttribute(
            "style",
            `cursor: ${this.restoreCursorMove || "auto"}`
          );
        }
      }
    },
    clearEvt(e, viewer) {
      // console.log(e);
    },
    getAllDrawExample() {
      return this.$refs.drawingsCustomRef.getDrawingActionInstances();
    },
    unload() {
      this.$refs.drawingsCustomRef.unload();
    },
    load() {
      this.$refs.drawingsCustomRef.load();
    },
    reload() {
      this.$refs.drawingsCustomRef.reload();
    },
    toolsList() {
      this.drawTools.filter((item, index) => {
        this.tools.map((i) => {
          if (item.name == i) {
            this.showTool.push(item);
          }
        });
      });
      // console.log(this.showTool);
    },
    async initMounted() {
      this.$nextTick(() => {
        console.log(this.polygonDrawingOpts, "this.polygonDrawingOpts");
      });
    },
    handlePolylineClick(event) {
      // console.log(event);

      // event.cesiumObject

      if (event.type) {
        this.drawEvent.drawToolClick.polyline.event = event;
        this.drawEvent.drawToolClick.polyline.state = true;
      }
    },
    handleRectangleClick(event) {
      if (event.type) {
        this.drawEvent.drawToolClick.rectangle.event = event;
        this.drawEvent.drawToolClick.rectangle.state = true;
      }
    },
    handlePointClick(event) {
      if (event.type) {
        this.drawEvent.drawToolClick.point.event = event;
        this.drawEvent.drawToolClick.point.state = true;
      }
    },
    handlePolygonClick(event) {
      if (event.type) {
        this.drawEvent.drawToolClick.polygon.event = event;
        this.drawEvent.drawToolClick.polygon.state = true;
      }
    },
    handleRegularClick(event) {
      if (event.type) {
        this.drawEvent.drawToolClick.regular.event = event;
        this.drawEvent.drawToolClick.regular.state = true;
      }
    },
    handleCircleClick(event) {
      if (event.type) {
        this.drawEvent.drawToolClick.circle.event = event;
        this.drawEvent.drawToolClick.circle.state = true;
      }
    },
  },
  created() {
    this.toolsList();
  },
  mounted() {
    this.$nextTick(() => {
      this.initStyle();
    });
    this.drawEvent = usedrawEventStore();
    this.mapStore = useMapStore();
    if (this.mapStore.mapLoading) {
      this.initMounted();
    }
  },
  watch: {
    "mapStore.mapLoading"() {
      if (this.mapStore.mapLoading) {
        this.initMounted();
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.custom-drawings {
  position: absolute;
  left: 0;
  top: 0;
  text-align: left;
  padding: 10px 0 10px 24px;
  width: 121px;
  height: auto;
  background-color: #082530;
  color: #05717f;
  cursor: pointer;
  font-size: 14px;
}

p {
  margin: 10px;
}

.draw-margin {
  margin-top: 10px;
}

.draw-margin:hover {
  cursor: pointer;
  font-family: SourceHanSansCN-Bold;
  font-size: 14px;
  color: #33f8ff;
  letter-spacing: 1px;
  font-weight: 700;
}
</style>
