<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <!-- 结合 slot 改变默认 UI -->
    <vc-measurements
      ref="measurementsRef4"
      @ready="drawingsReadyDefault"
      position="top-left"
      :main-fab-opts="measurementFabOptions4"
      :offset="[10, 30]"
      :editable="editable"
      :polylineMeasurementOpts="polylineMeasurementOpts"
      :areaMeasurementOpts="areaMeasurementOpts"
    >
      <template #body="drawingActionInstances">
        <!-- <div class="custom-measurements">
                    <el-button v-for="(drawingActionInstance, index) in showTool" :key="index"
                        :color="drawingActionInstance.isActive ? 'amber' : 'primary'"
                        @click="toggle(drawingActionInstance)">
                        {{ drawingActionInstance.tip }}
                    </el-button>
                </div> -->
      </template>
    </vc-measurements>
  </el-row>
</template>

<script>
import { DistanceUnits, AngleUnits } from "vue-cesium";
export default {
  data() {
    return {
      addTerrain: false,
      editable: false,
      clampToGround: false,
      measurementFabOptions1: {
        direction: "right",
      },
      measurementFabOptions2: {
        direction: "left",
        color: "accent",
      },
      measurementFabOptions3: {
        direction: "right",
        modelValue: false,
        color: "primary",
      },
      polylineMeasurementOpts: {
        measureUnits: {
          distanceUnits: DistanceUnits.KILOMETERS,
          angleUnits: AngleUnits.RADIANS,
        },
        decimals: {
          distance: 4,
          angle: 3,
        },
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
      componentDistanceMeasurementOpts3: {
        measureUnits: {
          distanceUnits: DistanceUnits.KILOMETERS,
          angleUnits: AngleUnits.RADIANS,
        },
        decimals: {
          distance: 4,
          angle: 3,
        },
      },
      pointMeasurementOpts: {
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
      areaMeasurementOpts: {
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
      measurements: [
        "component-distance",
        "polyline",
        "vertical",
        "area",
        "point",
      ],
      measurementFabOptions4: {
        direction: "right",
      },
      measureTool: [
        {
          name: "polyline",
          tip: "新测距",
          isActive: false,
        },
        {
          name: "area",
          tip: "新测量",
          isActive: false,
        },
      ],
      showTool: [],
    };
  },
  props: {
    tools: {
      type: Array,
      default: ["polyline", "area"],
    },
    position: {
      type: Object,
      default: {
        left: 30,
        top: 30,
      },
    },
  },
  methods: {
    toolsList() {
      this.measureTool.filter((item, index) => {
        this.tools.map((i) => {
          if (item.name == i) {
            this.showTool.push(item);
          }
        });
      });
    },
    initStyle() {
      setTimeout(() => {
        document.querySelector(".custom-measurements").style.left =
          this.position.left + "px";
        document.querySelector(".custom-measurements").style.top =
          this.position.top + "px";
      }, 0);
    },
    drawingsReadyDefault({ Cesium, viewer, cesiumObject }) {
      // console.log('绘制选项参数：', cesiumObject)
      this.$refs.measurementsRef4.toggleAction(this.showTool[0].name);
      window.vm = this;
    },
    clear() {
      this.$refs.measurementsRef4.clearAll();
    },
    toggle(drawingActionInstance) {
      // console.log(drawingActionInstance)
      this.clear();
      this.$refs.measurementsRef4.toggleAction(drawingActionInstance.name);
    },
    onTilesetReady({ cesiumObject: tileset, viewer }) {
      // const cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
      // const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
      // const offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 5)
      // const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
      // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
      viewer.zoomTo(tileset);
      viewer.scene.globe.depthTestAgainstTerrain = true;
      this.restoreCursorMove = "auto";
      this.drawing = false;
    },
    drawEvt(e, viewer) {
      console.log(e);
      const restoreCursor = getComputedStyle(viewer.canvas).cursor;
      if (e.finished) {
        this.drawing = false;
        if (e.type === "move") {
          viewer.canvas.setAttribute(
            "style",
            `cursor: ${this.restoreCursorMove}`
          );
        }
      } else {
        this.drawing = true;
        if (e.type === "move") {
          viewer.canvas.setAttribute("style", "cursor: move");
        }
        if (e.type === "new") {
          viewer.canvas.setAttribute("style", "cursor: crosshair");
        }
      }
    },
    activeEvt(e, viewer) {
      console.log(e);
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
      console.log(e);
      if (e.type === "move") {
        const restoreCursor = getComputedStyle(viewer.canvas).cursor;
        viewer.canvas.setAttribute("style", "cursor: move");
        this.drawing = true;
      }
    },
    mouseEvt(e, viewer) {
      console.log(e);
      const restoreCursor = getComputedStyle(viewer.canvas).cursor;
      if (!this.drawing) {
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
      console.log(e, viewer);
    },
    unload() {
      this.$refs.measurementsRef.unload();
    },
    load() {
      this.$refs.measurementsRef.load();
    },
    reload() {
      this.$refs.measurementsRef.reload();
    },
  },
  created() {
    this.toolsList();
  },
  mounted() {
    this.$nextTick(() => {
      // this.initStyle();
    });
  },
};
</script>

<style lang="scss" scoped>
.demo-viewer {
  .custom-measurements {
    position: absolute;
    left: 0;
    top: 0;
    text-align: left;
    padding: 10px 10px 20px;
    width: 121px;
    height: auto;
    /* background-color: #082530; */
    color: #05717f;
    cursor: pointer;
    font-size: 14px;
  }

  .el-button {
    width: 100px;
    height: 35px;
    background-color: #38888c;
    color: #fff;
    border: none;
  }
}
</style>
