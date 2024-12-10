<template>
  <div class="mapLabel">
    <DrawTools
      ref="drawTool"
      :tools="['point', 'polyline', 'circle', 'polygon', 'rectangle']"
      :position="position"
    />
    <el-row class="row" :span="24">
      <el-col class="selectLabelMode" :span="12">
        <el-select
          :teleported="false"
          popper-class="selectStyle"
          v-model="mapLabelForm.currentMode"
          @change="switchLabelMode"
          placeholder="请选择标注方式"
        >
          <el-option
            v-for="item in mapLabelList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="12" class="clearMapLabel">
        <span>
          <span class="icon" @click="clearShape"
            ><svg-icon iconName="icon-qc"></svg-icon> 清空</span
          >
        </span>
      </el-col>
    </el-row>
    <el-row class="row" :span="24" v-if="mapLabelForm.currentMode == 1">
      <el-col :span="24">
        <el-input v-model="mapLabelForm.position"></el-input>
      </el-col>
    </el-row>
    <el-row class="row" :span="24">
      <el-col :span="24">
        <el-input
          :rows="2"
          type="textarea"
          @input="endEditLabel"
          v-model="currentLabel.text"
        ></el-input>
      </el-col>
    </el-row>
    <el-row class="row">
      <!-- 属性编辑 -->
      <div class="attribute_info labelStyle">
        <p class="title">属性编辑</p>
        <el-form
          ref="form"
          :model="currentLabel.textStyle"
          label-width="100px"
          class="attribute_content"
        >
          <el-form-item label="填充颜色">
            <el-color-picker
              v-model="currentLabel.textStyle.fillColor"
              @change="editLabelStyleChange"
              size="small"
            ></el-color-picker>
          </el-form-item>
          <el-form-item label="字体">
            <el-select
              v-model="currentLabel.textStyle.fontFamily"
              placeholder="请选择字体"
              popper-class="selectStyle"
              @change="editLabelStyleChange"
            >
              <el-option
                v-for="(item, index) in fontList"
                :key="index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字体大小">
            <el-input
              type="number"
              v-model.number="currentLabel.textStyle.fontSize"
              @input="editLabelStyleChange"
            ></el-input>
          </el-form-item>
          <el-form-item label="是否加粗">
            <el-select
              v-model="currentLabel.textStyle.bold"
              placeholder="请选择是否加粗"
              popper-class="selectStyle"
              @change="editLabelStyleChange"
            >
              <el-option label="是" value="bold"></el-option>
              <el-option label="否" value=" "></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否背景">
            <el-switch
              v-model="currentLabel.textStyle.background"
              @change="editLabelStyleChange"
            ></el-switch>
          </el-form-item>
          <el-form-item label="背景颜色">
            <el-color-picker
              v-model="currentLabel.textStyle.backgroundColor"
              @change="editLabelStyleChange"
              size="small"
            ></el-color-picker>
          </el-form-item>
          <el-form-item label="横向偏移像素">
            <el-input-number
              v-model="currentLabel.textStyle.offset.x"
              controls-position="right"
              :precision="2"
              :step="0.1"
              @change="editLabelStyleChange"
            />
          </el-form-item>
          <el-form-item label="纵向偏移像素">
            <el-input-number
              v-model="currentLabel.textStyle.offset.y"
              controls-position="right"
              :precision="2"
              :step="0.1"
              @change="editLabelStyleChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="save_img" @click="saveImg">保存图片</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-row>

    <!-- 保存图片 -->
    <el-dialog
      v-model="warMapDialog"
      width="30%"
      :append-to-body="true"
      class="createTaskDialog"
    >
      <el-form :model="warMapForm" label-width="120px">
        <el-form-item label="分辨率：">
          <el-select
            v-model="warMapForm.resolutionRatio"
            placeholder="请选择分辨率"
          >
            <el-option label="1680×1200" value="1600×1050" />
            <el-option label="1920×1080" value="1920×1080" />
            <el-option label="2560×1440" value="2560×1440" />
            <el-option label="4096×2160" value="4096×2160" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片名称：">
          <el-input v-model="warMapForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="sureDownload">确定</el-button>
          <el-button type="primary" @click="warMapDialog = false">
            取消
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as turf from "@turf/turf";
import { useMapEventStore } from "@/store/mapEvent";
import { usedrawEventStore } from "@/store/drawEvent";
import { screenCoordinatesToDegrees } from "@/utils/cesium/tools";
export default {
  name: "SpacetimeBigDataIndex",

  data() {
    return {
      fontList: [
        {
          label: "宋体",
          value: "SimSun",
        },
        {
          label: "黑体",
          value: "SimHei",
        },
        {
          label: "微软雅黑",
          value: "Microsoft YaHei",
        },
        {
          label: "楷体",
          value: "KaiTi",
        },
        {
          label: "仿宋",
          value: "FangSong",
        },
      ],
      mapEventStore: null,
      testWord: "Hello VueCesium",
      labelShow: true,
      textList: [],
      position: {
        top: -999,
        left: -999,
      },
      entityPosition: {
        pointPosition: [],
        labelPosition: [],
        linePosition: [],
      },
      isShowDraw: false,
      mapLabelList: [
        {
          label: "点标注",
          mode: "point",
          value: 1,
        },
        {
          label: "文本",
          mode: "text",
          value: 2,
        },
        {
          label: "线标注",
          mode: "polyline",
          value: 3,
        },
        {
          label: "面标注",
          mode: "polygon",
          value: 4,
        },
        {
          label: "矩形",
          mode: "rectangle",
          value: 5,
        },
        {
          label: "圆",
          mode: "circle",
          value: 6,
        },
      ],
      mapLabelForm: {
        currentMode: "",
        position: "XXX北道",
      },
      currentLabel: {
        text: "",
        index: "",
        textStyle: {
          fontFamily: "Microsoft YaHei",
          fontSize: 18,
          bold: " ",
          background: false,
          backgroundColor: "rgba(0,0,0,0.3)",
          fillColor: "#f00",
          offset: { x: 0, y: 0 },
        },
      },
      currentPosition: [],
      drawEvent: null,
      drawText: false,
      warMapDialog: false,
      warMapForm: {
        resolutionRatio: "1920×1080",
        name: "",
      },
    };
  },

  mounted() {
    this.mapEventStore = useMapEventStore();
    this.drawEvent = usedrawEventStore();
  },

  methods: {
    // 编辑图层文件
    editLabelStyleChange() {
      // if (!this.currentSelectRow) {
      //   this.$message.warning("请选择图层");
      //   return;
      // }
      this.textList[this.currentLabel.index].textStyle = {
        fontFamily: this.currentLabel.textStyle.fontFamily,
        fontSize: this.currentLabel.textStyle.fontSize,
        bold: this.currentLabel.textStyle.bold,
        background: this.currentLabel.textStyle.background,
        backgroundColor: this.currentLabel.textStyle.backgroundColor,
        fillColor: this.currentLabel.textStyle.fillColor,
        offset: {
          x: this.currentLabel.textStyle.offset.x,
          y: this.currentLabel.textStyle.offset.y,
        },
      };
      this.$emit("updateText", this.textList);
      console.log(this.textList[this.currentLabel.index].textStyle);
    },
    endEditLabel() {
      if (this.textList.length) {
        this.textList[this.currentLabel.index].textConetnt =
          this.currentLabel.text;
        this.$emit("updateText", this.textList);
      }
    },
    drawFinish(currentlonlatArr, e) {},
    switchLabelMode() {
      const currentMode = this.mapLabelList.find((item) => {
        return item.value == this.mapLabelForm.currentMode;
      }).mode;
      this.currentLabel.text = "";
      if (currentMode == "text") {
        this.drawText = true;
        this.$refs.drawTool.$refs.drawingsCustomRef.deactivate();
        console.log(this.drawText);
        console.log(this.mapEventStore.leftClick.state);
        window.$viewer.canvas.setAttribute("style", `cursor: "auto"`);
      } else {
        this.$refs.drawTool.$refs.drawingsCustomRef.activate();
        this.$refs.drawTool.$refs.drawingsCustomRef.toggleAction(currentMode);
      }
    },
    checkLaelIndex(point) {
      let chickIndex = -1;
      for (let i = 0; i < this.textList.length; i++) {
        const item = this.textList[i];
        if (item.type != "text") {
          if (item.type == "points") {
          } else if (item.type == "polyline") {
            let coordinates = item.lonlatArr.map((lonlatItem) => {
              return [lonlatItem[0], lonlatItem[1]];
            });
            let polygon = turf.polygon([coordinates]);
            const isWithin = turf.booleanWithin(point, polygon);
            if (isWithin) {
              chickIndex = i;
            }
          } else {
            var coordinates = item.lonlatArr.map((lonlatItem) => {
              return [lonlatItem[0], lonlatItem[1]];
            });
            var polygon = turf.polygon([coordinates]);
            const isWithin = turf.booleanWithin(point, polygon);
            if (isWithin) {
              chickIndex = i;
            }
          }
        }
      }
      return chickIndex;
    },
    // 处理矩形 面 圆编辑
    handelEditShape(event) {
      const pointLonlat = screenCoordinatesToDegrees(event.windowPosition);
      const point = turf.point([pointLonlat.longitude, pointLonlat.latitude]);
      const clickIndex = this.checkLaelIndex(point);
      if (clickIndex != -1) {
        this.currentLabel.index = clickIndex;
        this.currentLabel.text = this.textList[clickIndex].textConetnt;
        this.currentLabel.textStyle = this.textList[clickIndex].textStyle;
      }
    },
    clearShape() {
      this.textList = [];
      this.$emit("updateText", this.textList);
      this.$refs.drawTool.clear();
      this.currentLabel.index = "";
      this.currentLabel.text = "";
    },
    saveImg() {
      this.warMapDialog = true
    },
    sureDownload() {
      if (this.warMapForm.name == "") {
        this.$message.error("名称不能为空");
      } else {
        this.exportMapImg();
        this.warMapDialog = false;
      }
    },
    async exportMapImg() {
      await window.$viewer.render();
      var canvas = window.$viewer.scene.canvas;
      console.log(this.warMapForm.resolutionRatio);
      var width = parseInt(this.warMapForm.resolutionRatio.split("×")[0]);
      var height = parseInt(this.warMapForm.resolutionRatio.split("×")[1]);
      // 创建一个新的Canvas元素，与原来的Canvas大小一致
      var newCanvas = document.createElement("canvas");
      newCanvas.width = width;
      newCanvas.height = height;
      console.log(width);
      console.log(height);
      // newCanvas.width = 3840;
      // newCanvas.height = 2160;
      var newContext = newCanvas.getContext("2d");

      // 在新Canvas上绘制原Canvas内容
      // newContext.drawImage(canvas, 0, 0, 3840, 2160);
      // 测量文字的宽度和高度
      const textHeight = parseInt(newContext.font);
      var textWidth = newContext.measureText(`${this.warMapForm.name}`).width;
      var x = newCanvas.width / 2 - textWidth;
      newContext.drawImage(canvas, 0, 0,width,height);

      // 设置外边框的位置和大小
      const borderx = 50;
      const bordery = 50;
      const borderWidth = textWidth + 150; // 加上一些额外的空间
      const borderHeight = textHeight + 40;
      const cornerRadius = 25; // 圆角半径

      // 绘制外边框
      newContext.beginPath();
      newContext.moveTo(borderx + cornerRadius, bordery);
      newContext.lineTo(borderx + borderWidth - cornerRadius, bordery);
      newContext.arcTo(
        borderx + borderWidth,
        bordery,
        borderx + borderWidth,
        bordery + cornerRadius,
        cornerRadius
      );
      newContext.lineTo(
        borderx + borderWidth,
        bordery + borderHeight - cornerRadius
      );
      newContext.arcTo(
        borderx + borderWidth,
        bordery + borderHeight,
        borderx + borderWidth - cornerRadius,
        bordery + borderHeight,
        cornerRadius
      );
      newContext.lineTo(borderx + cornerRadius, bordery + borderHeight);
      newContext.arcTo(
        borderx,
        bordery + borderHeight,
        borderx,
        bordery + borderHeight - cornerRadius,
        cornerRadius
      );
      newContext.lineTo(borderx, bordery + cornerRadius);
      newContext.arcTo(
        borderx,
        bordery,
        borderx + cornerRadius,
        bordery,
        cornerRadius
      );
      newContext.closePath();
      newContext.fillStyle = "rgba(0,0,0, 0.5)"; // 蓝色，透明度0.4
      newContext.fill();
      newContext.strokeStyle = "#254854";
      newContext.lineWidth = 3;
      newContext.stroke();

      newContext.font = "bold 20px sans-serif";
      newContext.textAlign = "center";
      newContext.textBaseline = "middle";
      newContext.fillStyle = "#fff";
      //填充字符串
      // newContext.fillText(`${this.warMapForm.name}`, x, 100);
      newContext.fillText(
        `${this.warMapForm.name}`,
        borderx + borderWidth / 2,
        bordery + borderHeight / 2
      );
      // 将新Canvas转换为图片并下载
      var dataURL = newCanvas.toDataURL("image/png");
      var link = document.createElement("a");
      link.href = dataURL;
      link.download = `${this.warMapForm.name}.png`;
      link.click();
    },
  },

  watch: {
    async "mapEventStore.leftClick.state"() {
      if (this.mapEventStore.leftClick.state && this.drawText) {
        if (this.mapLabelForm.currentMode == 2) {
          const pointLonlat = screenCoordinatesToDegrees(
            this.mapEventStore.leftClick.position
          );
          this.currentLabel.text = "新建文本";
          this.textList.push({
            // 类型
            type: "text",
            // 经纬度
            lonlatArr: null,
            // 实体经纬度
            textPosition: [pointLonlat.longitude, pointLonlat.latitude],
            // 标注内容
            textConetnt: this.currentLabel.text,
            textStyle: this.currentLabel.textStyle,
          });
          this.$emit("updateText", this.textList);
          this.drawText = false;
          this.currentLabel.index = this.textList.length - 1;
        }
      }
      this.mapEventStore.leftClick.state = false;
    },
    "drawEvent.drawFinish.state"() {
      if (this.drawEvent.drawFinish.state) {
        var e = this.drawEvent.drawFinish.event;
        var currentlonlatArr = this.$refs.drawTool.currentlonlatArr;
        var textPosition = [];
        var primitiveId = "";
        if (e.finished) {
          console.log(e);
          const pick = window.$viewer.scene.pick(e.windowPoistion);
          if (Cesium.defined(pick)) {
            // if (pick.primitive.id) {
            //   primitiveId = pick.primitive.id;
            // } else {
            //   primitiveId = pick.id;
            // }
            if (e.name == "point") {
              currentlonlatArr.splice(currentlonlatArr.length - 1, 1);
              textPosition = currentlonlatArr;
              var point = turf.point([
                currentlonlatArr[0],
                currentlonlatArr[1],
              ]);
              var buffered = turf.buffer(point, 20, { units: "kilometers" });
              currentlonlatArr = buffered.geometry.coordinates[0];
              this.currentLabel.textStyle.offset = {
                x: 0,
                y: 20,
              };
            } else if (e.name == "polyline") {
              var coordinates = currentlonlatArr.map((item) => {
                return [item[0], item[1]];
              });
              var features = turf.points(coordinates);
              var centerFeature = turf.center(features);
              textPosition = centerFeature.geometry.coordinates;
              let polyline = turf.lineString(coordinates);
              var buffered = turf.buffer(polyline, 20, { units: "kilometers" });
              currentlonlatArr = buffered.geometry.coordinates[0];
            } else {
              var coordinates = currentlonlatArr.map((item) => {
                return [item[0], item[1]];
              });
              var polygon = turf.polygon([coordinates]);
              var centerFeature = turf.centerOfMass(polygon);
              textPosition = centerFeature.geometry.coordinates;
            }

            this.textList.push({
              // 类型
              type: e.name,
              // 经纬度
              lonlatArr: currentlonlatArr,
              // 实体经纬度
              textPosition: textPosition,
              // 标注内容
              textConetnt: "",
              textStyle: this.currentLabel.textStyle,
            });
            console.log("======");
            console.log(this.textList);
            console.log("======");
            this.currentLabel.index = this.textList.length - 1;
            this.drawEvent.drawFinish.state = false;
            console.log(pick, "pick");
          }

          // const pick = window.$viewer.scene.pick(e.windowPoistion);
          // console.log(pick, "pick");
          // if (Cesium.defined(pick)) {
          //   console.log("==============pick=================");
          //   var cartesianPosition = [];
          //   var primitiveId = "";

          // if (pick.primitive.position) {
          //   cartesianPosition = pick.primitive.position;
          //   primitiveId = pick.primitive.id;
          // } else {
          //   cartesianPosition =
          //     pick.primitive._vcParent._primitives[0].positions[
          //       pick.primitive._vcParent._primitives[0].positions.length - 1
          //     ];
          //   primitiveId = pick.id;
          // }

          // // 获取当前场景的椭球体（Ellipsoid）
          // var ellipsoid = window.$viewer.scene.globe.ellipsoid;

          // // 将 Cartesian3 转换为经度、纬度和高度
          // var cartographicPosition =
          //   ellipsoid.cartesianToCartographic(cartesianPosition);

          // // 从 cartographic 对象中获取经度、纬度和高度
          // var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
          // var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
          // var height = cartographicPosition.height;
          // this.textList.push({
          //   // 屏幕坐标
          //   cartesianPosition: cartesianPosition,
          //   // 实体id
          //   primitiveId: primitiveId,
          //   // 实体经纬度
          //   textPosition: [longitude, latitude],
          //   // 标注内容
          //   textConetnt: "",
          // });
          // this.currentLabel.index = this.textList.length - 1;
          // console.log(this.textList);
          // }
        }
      }
    },
    "drawEvent.drawToolClick.polyline.state"() {
      if (this.drawEvent.drawToolClick.polyline.state) {
        let event = this.drawEvent.drawToolClick.polyline.event;
        this.handelEditShape(event);
        this.drawEvent.drawToolClick.polyline.state = false;
      }
    },
    "drawEvent.drawToolClick.rectangle.state"() {
      if (this.drawEvent.drawToolClick.rectangle.state) {
        let event = this.drawEvent.drawToolClick.rectangle.event;
        this.handelEditShape(event);
        this.drawEvent.drawToolClick.rectangle.state = false;
      }
    },
    "drawEvent.drawToolClick.polygon.state"() {
      if (this.drawEvent.drawToolClick.polygon.state) {
        let event = this.drawEvent.drawToolClick.polygon.event;
        this.handelEditShape(event);
        this.drawEvent.drawToolClick.polygon.state = false;
      }
    },
    "drawEvent.drawToolClick.point.state"() {
      if (this.drawEvent.drawToolClick.point.state) {
        let event = this.drawEvent.drawToolClick.point.event;
        this.handelEditShape(event);
        this.drawEvent.drawToolClick.point.state = false;
      }
    },
    "drawEvent.drawToolClick.regular.state"() {
      if (this.drawEvent.drawToolClick.regular.state) {
        this.drawEvent.drawToolClick.regular.state = false;
      }
    },
    "drawEvent.drawToolClick.circle.state"() {
      if (this.drawEvent.drawToolClick.circle.state) {
        let event = this.drawEvent.drawToolClick.circle.event;
        this.handelEditShape(event);
        this.drawEvent.drawToolClick.circle.state = false;
      }
    },
  },
  beforeUnmount() {
    this.clearShape();
  },
};
</script>

<style lang="scss" scoped>
.mapLabel {
  .row {
    margin-top: 10px;
  }
  .labelStyle {
    .title {
      font-family: PingFangSC-Regular;
      color: #33f8ff;
      font-size: 14px;
      line-height: normal;
      text-align: left;
    }
    :deep(.el-form) {
      .el-form-item {
        .el-form-item__label {
          color: #fff;
        }
      }
    }

    .save_img {
      position: absolute;
      right: 0;
      margin-top: 10px;

      .el-button--primary {
        --el-button-border-color: #33f8dd;
      }
    }
  }

  .clearMapLabel {
    cursor: pointer;
    display: flex;
    justify-content: start;
    align-items: center;
    font-family: Source Han Sans CN;
    color: #b2c2c2;
    font-size: 13px;
    line-height: normal;

    .icon {
      color: #b2c2c2;
      margin-left: 10px;

      .svg-icon {
        font-size: 16px;
        fill: currentColor;
      }
    }

    .icon:hover {
      color: #0dffeb;
    }
  }
}
</style>
