<template>
  <div
    class="control MapLayerManage"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="switchLayerView"
  >
    <span class="icon"><svg-icon iconName="icon-tc"></svg-icon></span>
  </div>
  <div
    class="layersViewBox"
    :style="{
      position: 'absolute',
      left: left + 50 + 'px',
      bottom: bottom - 340 + 'px',
    }"
    v-if="homeMenuStore.layersMenuState"
  >
    <div>
      <el-input
        placeholder="请输入关键词查询"
        suffix-icon="Search"
        v-model="layerKeyWord"
        @input="search"
        size="medium"
        class="search"
      ></el-input>
      <div class="scrollBox" v-scrollbar>
        <el-checkbox-group v-model="openLayerIds" @change="switchLayerShow">
          <el-checkbox
            v-for="(item, index) in layerData"
            :key="index"
            :label="item.id"
            @contextmenu.prevent="handleContextMenu($event, item)"
            >{{ item.name }}</el-checkbox
          >
        </el-checkbox-group>

        <div v-if="isContextMenuVisible" class="custom-context-menu">
          <ul>
            <li @click="layerOrderChange(item, 0)">图层置为顶层</li>
            <li @click="layerOrderChange(item, 1)">图层上移一层</li>
            <li @click="layerOrderChange(item, 2)">图层下移一层</li>
            <li @click="layerOrderChange(item, 3)">图层置为底层</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { ElMessage } from "element-plus";
import { queryLayer } from "@/api/gateway";
import { useMapPlotDataStore } from "@/store/mapPlotData";
import { useHomeMenuStore } from "@/store/homeMenu";
const turf = require("@turf/turf");
import {
  flyToPoint,
  flyToBbox,
  screenCoordinatesToDegrees,
  cartesianToDegrees,
} from "@/utils/cesium/tools";

export default {
  name: "MapLayerManage",
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
    return {
      layerKeyWord: "",
      isContextMenuVisible: false,
      layerData: [],
      openLayerIds: [],
      mapPlotDataStore: null,
      homeMenuStore: null,
      layerId: "globeDrawerDemoLayer",
    };
  },
  created() {
    this.getLayers();
    this.mapPlotDataStore = useMapPlotDataStore();
    this.homeMenuStore = useHomeMenuStore();
  },
  mounted() {},

  methods: {
    search() {
      this.getLayers();
    },
    layerOrderChange(item, type) {
      // 将指定id的项置为顶层
      const bringToTop = (id) => {
        const itemIndex = this.layerData.findIndex((obj) => obj.id === id);
        if (itemIndex !== -1) {
          const [item] = this.layerData.splice(itemIndex, 1);
          this.layerData.unshift(item);
        }
      };

      // 将指定id的项置为底层
      const bringToBottom = (id) => {
        const itemIndex = this.layerData.findIndex((obj) => obj.id === id);
        if (itemIndex !== -1) {
          const [item] = this.layerData.splice(itemIndex, 1);
          this.layerData.push(item);
        }
      };

      // 上移指定id的项
      const moveUp = (id) => {
        const itemIndex = this.layerData.findIndex((obj) => obj.id === id);
        if (itemIndex > 0) {
          const temp = this.layerData[itemIndex];
          this.layerData[itemIndex] = this.layerData[itemIndex - 1];
          this.layerData[itemIndex - 1] = temp;
        }
      };

      // 下移指定id的项
      const moveDown = (id) => {
        const itemIndex = this.layerData.findIndex((obj) => obj.id === id);
        if (itemIndex < this.layerData.length - 1) {
          const temp = this.layerData[itemIndex];
          this.layerData[itemIndex] = this.layerData[itemIndex + 1];
          this.layerData[itemIndex + 1] = temp;
        }
      };
      this.layerData.sort((a, b) => a.layerOrder - b.layerOrder);
      switch (type) {
        case 0:
          bringToTop(this.currentLayer.id);
          break;
        case 1:
          moveUp(this.currentLayer.id);
          break;
        case 2:
          moveDown(this.currentLayer.id);
          break;
        case 3:
          bringToBottom(this.currentLayer.id);
          break;
      }
      this.switchLayerShow();
    },
    handleContextMenu(event, item) {
      this.currentLayer = item;
      // 阻止浏览器默认的右键菜单
      event.preventDefault();

      // 显示自定义右键弹框
      this.isContextMenuVisible = true;

      // 获取点击位置，可以根据需要设置弹框的位置
      const x = event.clientX;
      const y = event.clientY;

      // 设置弹框位置
      this.$nextTick(() => {
        const contextMenu = document.querySelector(".custom-context-menu");
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
      });

      // 点击其他地方时隐藏自定义右键弹框
      document.addEventListener("click", this.hideContextMenu);
    },
    hideContextMenu() {
      this.isContextMenuVisible = false;
      document.removeEventListener("click", this.hideContextMenu);
    },
    switchLayerView() {
      this.getLayers()
      this.homeMenuStore.layersMenuState = !this.homeMenuStore.layersMenuState;
      this.homeMenuStore.baselayersMenuState = false;
      this.homeMenuStore.mapViewMenuState = false;
    },
    async switchLayerShow() {
      this.clearAllEntity();
      const openLayers = this.layerData.filter((obj) =>
        this.openLayerIds.includes(obj.id)
      );
      var layersList = openLayers.flatMap((obj) => {
        if (typeof obj.layerParams == "string") {
          obj.layerParams = JSON.parse(obj.layerParams);
        }
        return obj.layerParams.features;
      });

      var geojson = {
        type: "FeatureCollection",
        features: layersList,
      };
      console.log(geojson, "geojson");

      if (geojson.features.length) {
        for (let i = 0; i < geojson.features.length; i++) {
          const item = geojson.features[i];
          if (item.properties.type == "icon") {
            const canvas = await this.reLoadSvgToCanvas(
              item.properties.imageName,
              {
                fill: item.properties.style.color,
                stroke: item.properties.style.borderColor,
                strokeWidth: item.properties.style.borderWidth + "px",
                scale: item.properties.style.scale,
                strokeShow: item.properties.style.border,
              }
            );
            item.properties.image = canvas;
          }
          if (item.properties.type == "arrow") {
            switch (item.properties.arrowType) {
              case 0:
                this.showStraightArrow(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 1:
                this.showAttackArrow(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 2:
                this.showPincerArrow(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              default:
                break;
            }
          }
          if (item.properties.type == "baseMark") {
            switch (item.properties.baseMarkType) {
              case 0:
                this.showPolyLine(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 1:
                this.showCircle(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 2:
                this.showRectangle(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 3:
                this.showPolygon(
                  item.properties.objId,
                  item.properties.position,
                  item.properties.style
                );
                break;
              case 4:
                this.showPoint(
                  item.properties.objId,
                  item.properties.position[0],
                  item.properties.style
                );
                break;
            }
          }
        }
        this.mapPlotDataStore.layersList = geojson.features;
        var layersGeojson = {
          type: "FeatureCollection",
          features: this.mapPlotDataStore.layersList,
        };
        if (
          this.mapPlotDataStore.layersList.length &&
          this.mapPlotDataStore.layersList.length == 1 &&
          (this.mapPlotDataStore.layersList[0].properties.type == "icon" ||
            this.mapPlotDataStore.layersList[0].properties.type == "text")
        ) {
          console.log("===========flyToPoint==============");
          flyToPoint(
            window.$viewer,
            layersGeojson.features[0].geometry.coordinates
          );
        } else {
          console.log("===========flyToBbox==============");
          const bbox = turf.bbox(layersGeojson);
          flyToBbox(window.$viewer, bbox);
        }
      } else {
        this.mapPlotDataStore.layersList = geojson.features;
      }
    },

    // 显示直箭头
    showStraightArrow(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      var outlinePositions = [].concat(positions);
      const zIndex = this.mapPlotDataStore.layersList.findIndex((item) => {
        return item.objId == objId;
      });
      outlinePositions.push(positions[0]);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "StraightArrow",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: positions,
          asynchronous: false,
          material: material,
          zIndex: zIndex,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示攻击箭头
    showAttackArrow(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      var outlinePositions = [].concat(positions);
      outlinePositions.push(positions[0]);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "AttackArrow",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: positions,
          asynchronous: false,
          material: material,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示钳击箭头
    showPincerArrow(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      var outlinePositions = [].concat(positions);
      outlinePositions.push(positions[0]);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "PincerArrow",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: positions,
          asynchronous: false,
          material: material,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示线
    showPolyLine(objId, positions, styles) {
      var outlineMaterial = new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.fromCssColorString(styles["color"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
        outlineColor: Cesium.Color.fromCssColorString(
          styles["borderColor"]
        ).withAlpha(1),
        outlineWidth: styles["borderWidth"],
      });
      var outlinePositions = [].concat(positions);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "Polyline",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["width"],
          material: outlineMaterial,
        },
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示圆
    showCircle(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      const lonlatArr = [];
      for (let i = 0; i < positions.length; i++) {
        const item = positions[i];
        const { longitude, latitude, height } = cartesianToDegrees(item);
        lonlatArr.push([longitude, latitude]);
      }

      var lineString = turf.lineString(lonlatArr);
      var length = turf.length(lineString, { units: "kilometers" });
      var options = { steps: 360, units: "kilometers" };
      var circle = turf.circle(lonlatArr[0], length, options);

      var polygonPositions = circle.geometry.coordinates[0].map((item) => {
        const cartesian3 = Cesium.Cartesian3.fromDegrees(item[0], item[1]);
        return cartesian3;
      });

      var outlinePositions = [].concat(polygonPositions);

      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "Circle",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: polygonPositions,
          asynchronous: false,
          material: material,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示矩形
    showRectangle(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      const lonlatArr = [];
      for (let i = 0; i < positions.length; i++) {
        const item = positions[i];
        const { longitude, latitude, height } = cartesianToDegrees(item);
        lonlatArr.push([longitude, latitude]);
      }

      var bbox = [...lonlatArr[0], ...lonlatArr[1]];
      var polygon = turf.bboxPolygon(bbox);

      var polygonPositions = polygon.geometry.coordinates[0].map((item) => {
        const cartesian3 = Cesium.Cartesian3.fromDegrees(item[0], item[1]);
        return cartesian3;
      });

      var outlinePositions = [].concat(polygonPositions);
      outlinePositions.push(positions[0]);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "Rectangle",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: polygonPositions,
          asynchronous: false,
          material: material,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示多边形
    showPolygon(objId, positions, styles) {
      var material = Cesium.Color.fromCssColorString(
        styles["color"] ? styles["color"] : "#f00"
      ).withAlpha(styles["color"] ? styles["colorOpacity"] : 0);
      var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 0,
        color: Cesium.Color.fromCssColorString(styles["borderColor"]).withAlpha(
          styles["border"] ? 1 : 0
        ),
      });
      var outlinePositions = [].concat(positions);
      outlinePositions.push(positions[0]);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "PincerArrow",
        polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: styles["borderWidth"],
          material: outlineMaterial,
        },
        polygon: new Cesium.PolygonGraphics({
          hierarchy: positions,
          asynchronous: false,
          material: material,
        }),
      };
      var entity = window.$viewer.entities.add(bData);
    },
    // 显示点
    showPoint(objId, positions, styles) {
      const color = Cesium.Color.fromCssColorString(styles["color"]).withAlpha(
        styles["colorOpacity"]
      );
      const outlineColor = Cesium.Color.fromCssColorString(
        styles["borderColor"]
      ).withAlpha(1);
      var bData = {
        layerId: this.layerId,
        objId: objId,
        shapeType: "Point",
        position: positions,
        point: {
          pixelSize: styles["scale"],
          color: color,
          outlineColor: outlineColor,
          outlineWidth: styles["borderWidth"],
        },
      };
      var entity = window.$viewer.entities.add(bData);
    },

    async clearAllEntity() {
      const viewer = window.$viewer;
      var entityList = viewer.entities.values;

      for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        console.log(entity);

        if (entity.layerId == this.layerId) {
          viewer.entities.remove(entity);
          i--;
        }
      }
    },
    reLoadSvgToCanvas(svgUrl, styles) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", async () => {
          const resXML = xhr.responseXML;

          const svgDom = resXML.documentElement.cloneNode(true);

          const pathElements = svgDom.querySelectorAll("path");
          const rectElements = svgDom.querySelectorAll("rect");

          console.log(pathElements);
          if (!styles["strokeShow"]) {
            styles["strokeWidth"] = 0;
          }
          pathElements.forEach((path, index) => {
            path.setAttribute("fill", styles["fill"]);
            path.setAttribute("stroke", styles["stroke"]);
            path.setAttribute("stroke-width", styles["strokeWidth"]);
          });
          rectElements.forEach((rect, index) => {
            rect.setAttribute("fill", styles["fill"]);
            rect.setAttribute("stroke", styles["stroke"]);
            rect.setAttribute("stroke-width", styles["strokeWidth"]);
          });
          svgDom.setAttribute(
            "width",
            svgDom.width.baseVal.value * styles["scale"]
          );
          svgDom.setAttribute(
            "height",
            svgDom.height.baseVal.value * styles["scale"]
          );

          // svgDom.height = svgDom.height * 5;

          const svgStr = new XMLSerializer().serializeToString(svgDom);

          const blob = new Blob([svgStr], {
            type: "image/svg+xml",
          });
          const blobStr = URL.createObjectURL(blob);
          // const base64str = window.btoa(svgStr);
          // const base64 = `data:image/svg+xml;base64,${base64str}`;
          const canvas = await this.convertSvgToCanvas(blobStr);

          // document.body.appendChild(canvas); // 添加到页面中显示
          resolve(canvas);
        });
        xhr.open("GET", this.$config.gjburl + svgUrl);
        xhr.send();
      });
    },
    async convertSvgToCanvas(base64) {
      return new Promise((resolve, reject) => {
        // 创建一个新的 Canvas 元素
        var canvas = document.createElement("canvas");
        // document.body.appendChild(canvas); // 添加到页面中显示
        // 获取 SVG 图像对象
        var svgImage = new Image();
        svgImage.src = base64;
        // 等待 SVG 图像加载完成后进行处理
        svgImage.onload = function () {
          var context = canvas.getContext("2d");

          // 设置 Canvas 大小与 SVG 相同
          canvas.width = svgImage.width;
          canvas.height = svgImage.height;

          console.log(svgImage);

          // 在 Canvas 上绘制 SVG 图像
          context.drawImage(svgImage, 0, 0);
          resolve(canvas);
        };
      });
    },
    getLayers() {
      const params = {
        isEnable: 1,
        isPage: false,
        name: this.layerKeyWord,
      };
      queryLayer(params).then((res) => {
        if (res.code == 200) {
          this.layerData = res.data.map((item, index) => {
            item.layerOrder = index + 1;
            return item;
          });
        }
      });
    },
  },
  watch: {
    "homeMenuStore.layersMenuState"() {
      if (this.homeMenuStore.layersMenuState) {
        document.querySelector(".MapLayerManage > .icon").style.color =
          "#00b8b8";
      } else {
        document.querySelector(".MapLayerManage > .icon").style.color =
          "#b2c2c2";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.el-checkbox {
  display: block;
  text-align: left;
  --el-checkbox-text-color: #fff;
  --el-checkbox-bg-color: #181f23;
  --el-checkbox-checked-bg-color: #00b8b8;
  --el-checkbox-checked-text-color: #00b8b8;
}

.el-checkbox-group {
  margin: 25px;
}
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
    color: #b2c2c2;
    .svg-icon {
      font-size: 30px;
      fill: currentColor;
    }
  }
}
.control:hover {
  .icon {
    color: #33f8ff;
  }
}
.layersViewBox {
  width: 358px;
  height: 600px;
  padding: 0 8px 0;
  background: rgba(20, 27, 31, 0.94);
  border: 1px solid rgba(80, 123, 134, 1);
  border-top: 5px solid #38888c;
  box-shadow: inset 0px 0px 20px 0px rgba(90, 150, 185, 0.45);
  .search {
    margin-top: 20px;
  }
  .scrollBox{
    position: relative;
    height: 520px;
  }
  .custom-context-menu {
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(20, 27, 31, 0.94);
    border: 1px solid;
    border-color: #24546b;

    ul {
      li {
        font-family: SourceHanSansCN-Regular;
        color: #b2c2c2;
        font-size: 12px;
        line-height: 18px;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
      }
      li:hover {
        background: #000000;
        font-family: SourceHanSansCN-Regular;
        color: #00b8b8;
        font-size: 12px;
        cursor: pointer;
      }
    }
  }
}
</style>
