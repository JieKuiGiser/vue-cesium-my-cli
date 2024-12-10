<template>
  <div
    class="control MapView"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="switchMapViewView"
  >
    <span class="icon"><svg-icon iconName="icon-sjqh"></svg-icon></span>
  </div>
  <div
    class="mapViewView"
    :style="{
      position: 'absolute',
      left: left + 50 + 'px',
      bottom: bottom - 55 + 'px',
    }"
    v-if="homeMenuStore.mapViewMenuState"
  >
    <el-row class="mapViewRow" :gutter="5">
      <el-col :span="8" v-for="(item, index) in viewList" :key="index">
        <div
          class="itemView"
          :class="{ activeItem: currentMapViewIndex === index }"
        >
          <div class="left" @click="switchCamera(index)">
            <div class="img">
              <span
                class="icon china"
                @mouseover="hoverChina"
                @mouseout="backoutChina"
                v-if="index == 1"
              >
                <img v-bind:src="item.icon" alt="" />
              </span>
              <span class="icon" v-else
                ><svg-icon :iconName="item.icon"></svg-icon
              ></span>
            </div>
            <div class="label">
              {{ item.name }}
            </div>
          </div>
          <div class="right">
            <span
              class="xiala"
              @click="selectCurrentView(index)"
              :class="{ activeXiaLa: currentViewIndex === index }"
            >
              <svg-icon iconName="icon-xl"></svg-icon>
            </span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mapViewParmas">
      <div
        class="noCustom"
        v-if="currentViewIndex == 0 || currentViewIndex == 1"
      >
        <el-row class="btns">
          <el-button class="reset btn" @click="resetChange">恢复默认</el-button>
          <el-button class="currentCamera btn" @click="getCurrentCamera"
            >当前相机</el-button
          >
        </el-row>
        <el-row class="destination">
          <span class="label">位置：</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.destination.lon"
            :min="-180"
            :max="180"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.destination.lat"
            :min="-90"
            :max="90"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.destination.height"
            :min="1"
            :max="Infinity"
            controls-position="right"
            size="large"
          />
          <span class="unit">m</span>
        </el-row>
        <el-row class="orientation">
          <span class="label">朝向：</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.orientation.heading"
            :min="0"
            :max="360"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.orientation.pitch"
            :min="-90"
            :max="90"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            @input="updateQqOrchCamera"
            v-model="viewList[currentViewIndex].camera.orientation.roll"
            :min="0"
            :max="360"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
        </el-row>
      </div>
      <div class="custom" v-if="currentViewIndex == 2">
        <el-row class="btns" type="flex" justify="end">
          <div class="icons">
            <ul class="btnList">
              <li class="btnItem">
                <button @click="addCustomView">
                  <span class="icon"
                    ><svg-icon iconName="icon-jh"></svg-icon
                  ></span>
                </button>
              </li>
              <!-- <li class="btnItem">
                <button
                  @click="editCustomView"
                  :disabled="currentSelection.length != 1"
                >
                  <span class="icon"
                    ><svg-icon iconName="icon-bianji"></svg-icon
                  ></span>
                </button>
              </li> -->
              <li class="btnItem" @click="switchShowCheckBox">
                <button>
                  <span
                    class="icon"
                    v-bind:style="'color:' + currentEditIconColor"
                    ><svg-icon iconName="icon-duoxuankuang"></svg-icon
                  ></span>
                </button>
              </li>
              <li class="btnItem">
                <button
                  @click="delCustomView"
                  :disabled="!currentSelection.length"
                >
                  <span class="icon"
                    ><svg-icon iconName="icon-qc"></svg-icon
                  ></span>
                </button>
              </li>
            </ul>
          </div>
        </el-row>
        <el-checkbox-group v-model="currentSelection" @change="selectionChange">
          <el-row class="viewList" :gutter="20" v-scrollbar>
            <el-col
              v-for="(item, index) in viewList[2].cameraList"
              :key="index"
              :span="6"
              @contextmenu.prevent="handleContextMenu($event, index)"
              @click="switchCustomCamera(index)"
            >
              <div class="viewItem">
                <div class="viewImg">
                  <img
                    class="thumbImg"
                    :src="`${$config.baseurl}/images/${item.imgUrl}`"
                    alt=""
                  />
                  <img
                    class="default"
                    v-if="item.isCustomDef == 1"
                    src="@/assets/images/default.png"
                    alt=""
                  />
                </div>
                <div class="label">
                  <span>
                    <el-checkbox
                      v-if="checkboxShow"
                      :label="item.id"
                      v-model="item.checked"
                      @change="switchChecked(item)"
                      fill
                      size="large"
                    />
                    <span class="text">{{ item.name }}</span>
                  </span>
                </div>
              </div>
            </el-col>
            <div v-if="isContextMenuVisible" class="custom-context-menu">
              <ul>
                <li @click="locationView()">定位</li>
                <li @click="settingDefault()">设为默认</li>
                <li @click="delView()">删除</li>
                <li @click="editView()">属性</li>
              </ul>
            </div>
          </el-row>
        </el-checkbox-group>
      </div>
    </el-row>
  </div>

  <el-dialog
    v-model="currentCameraDialogVisible"
    popper-append-to-body
    custom-class="currentCameraDialog"
    title="视角编辑器"
    width="600"
    draggable
  >
    <div class="editView">
      <el-form :model="currentViewForm" label-width="60px">
        <el-form-item label="名称">
          <el-input v-model="currentViewForm.name" />
        </el-form-item>
        <el-row :gutter="16" class="thumb">
          <el-col :span="20">
            <el-form-item label="缩略图">
              <el-input
                type="textarea"
                v-model="currentViewForm.img"
                :rows="5"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4" class="rightImg">
            <div class="thumbImg">
              <img class="thumbImg" :src="currentViewForm.img" alt="" />
            </div>
            <el-button type="primary" @click="zdyProperty_img">截图</el-button>
          </el-col>
        </el-row>

        <el-form-item label="位置">
          <el-input-number
            v-model="currentViewForm.camera.destination.lon"
            :min="-180"
            :max="180"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            v-model="currentViewForm.camera.destination.lat"
            :min="-90"
            :max="90"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            v-model="currentViewForm.camera.destination.height"
            :min="1"
            :max="Infinity"
            controls-position="right"
            size="large"
          />
          <span class="unit">m</span>
        </el-form-item>
        <el-form-item label="朝向">
          <el-input-number
            v-model="currentViewForm.camera.orientation.heading"
            :min="0"
            :max="360"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            v-model="currentViewForm.camera.orientation.pitch"
            :min="-90"
            :max="90"
            :precision="7"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
          <el-input-number
            v-model="currentViewForm.camera.orientation.roll"
            :min="0"
            :max="360"
            controls-position="right"
            size="large"
          />
          <span class="unit">°</span>
        </el-form-item>
        <el-row class="currentViewbtn">
          <el-button type="primary" @click="zdyProperty_camera"
            >当前相机</el-button
          >
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="currentCameraDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpdateCamera"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  addCamera,
  delCamera,
  delCameras,
  searchCamera,
  defaultCamera,
  updateCamera,
} from "@/api/gateway";
import { useHomeMenuStore } from "@/store/homeMenu";
import { ElMessage, ElMessageBox } from "element-plus";
import ChinaMapIcon from "@/assets/icon/chinaMapIcon/zg.svg";
import ChinaMapActiveIcon from "@/assets/icon/chinaMapIcon/zg gl.svg";
import {
  cartesianToDegrees,
  getScreenCenterCoordinatesAndHeight,
  getCameraOrientation,
  getCameraHeight,
  exportMapImgBase64,
} from "@/utils/cesium/tools";
export default {
  name: "MapView",
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
      currentCameraDialogVisible: false,
      homeMenuStore: null,
      rightClickViewIndex: -1,
      isContextMenuVisible: false,
      currentSelection: [],
      delCustomBtn: true,
      currentEditIconColor: "#fff",
      checkboxShow: false,
      currentMapViewIndex: -1,
      currentViewIndex: -1,
      ChinaMapIcon: ChinaMapIcon,
      ChinaMapActiveIcon: ChinaMapActiveIcon,
      viewList: [
        // {
        //   name: "全球",
        //   icon: "icon-qq",
        //   defaultCamera: {
        //     destination: {
        //       lon: 120.5,
        //       lat: 28.891179,
        //       height: 22191651.02,
        //     },
        //     orientation: {
        //       heading: 0,
        //       pitch: -90,
        //       roll: 0,
        //     },
        //   },
        //   camera: {
        //     destination: {
        //       lon: 120.5,
        //       lat: 28.891179,
        //       height: 22191651.02,
        //     },
        //     orientation: {
        //       heading: 0,
        //       pitch: -90,
        //       roll: 0,
        //     },
        //   },
        // },
        // {
        //   name: "中国",
        //   icon: ChinaMapIcon,
        //   defaultCamera: {
        //     destination: {
        //       lon: 107.5493044,
        //       lat: 37.9611768,
        //       height: 8511735.8,
        //     },
        //     orientation: {
        //       heading: 0,
        //       pitch: -90,
        //       roll: 0,
        //     },
        //   },
        //   camera: {
        //     destination: {
        //       lon: 107.5493044,
        //       lat: 37.9611768,
        //       height: 8511735.8,
        //     },
        //     orientation: {
        //       heading: 0,
        //       pitch: -90,
        //       roll: 0,
        //     },
        //   },
        // },
        // {
        //   name: "自定义",
        //   icon: "icon-zdy",
        //   camera: {
        //     // destination: {
        //     //   lon: 107.5493044,
        //     //   lat: 37.9611768,
        //     //   height: 8511735.8,
        //     // },
        //     // orientation: {
        //     //   heading: 0,
        //     //   pitch: -90,
        //     //   roll: 0,
        //     // },
        //   },
        //   cameraList: [],
        // },
      ],
      currentDefalutViewIndex: 0,
    };
  },
  created() {
    this.homeMenuStore = useHomeMenuStore();
    this.getCameraList();
  },
  mounted() {},

  methods: {
    switchChecked(item) {
      item.checked = !item.checked;
    },
    locationView() {
      this.viewList[2].camera =
        this.viewList[2].cameraList[this.rightClickViewIndex].camera;
      this.switchCamera(2);
      this.isContextMenuVisible = false;
    },
    settingDefault() {
      this.currentDefalutViewIndex = this.rightClickViewIndex;
      this.viewList[2].camera =
        this.viewList[2].cameraList[this.rightClickViewIndex].camera;
      this.isContextMenuVisible = false;
      // this.viewList[2].cameraList[this.rightClickViewIndex].isCustomDef = 1;
      // const cpParams = JSON.parse(JSON.stringify(this.viewList[2].cameraList[this.rightClickViewIndex]));
      // cpParams.camera = JSON.stringify(cpParams.camera);
      // cpParams.defaultCamera = JSON.stringify(cpParams.defaultCamera);
      defaultCamera(
        this.viewList[2].cameraList[this.rightClickViewIndex].id
      ).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "修改成功",
          });
          this.getCameraList();
        }
      });
    },
    delView() {
      ElMessageBox.confirm("请问您确定要删除此视角么?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delCamera(
            this.viewList[2].cameraList[this.rightClickViewIndex].id
          ).then((res) => {
            if (res.code == 200) {
              this.isContextMenuVisible = false;
              ElMessage({
                type: "success",
                message: "删除成功",
              });
              this.getCameraList();
            }
          });
        })
        .catch(() => {
          // ElMessage({
          //   type: 'info',
          //   message: 'Delete canceled',
          // })
        });
    },
    async editView() {
      this.isContextMenuVisible = false;
      this.currentCameraDialogVisible = true;
      this.currentViewForm =
        this.viewList[2].cameraList[this.rightClickViewIndex];
      this.currentViewForm.img = await this.getBase64Image(
        thus.$config.baseurl + "/images/" + this.currentViewForm.imgUrl
      );
      console.log(this.currentViewForm.img);
    },
    async getBase64Image(src) {
      return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open("get", src, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
          if (this.status == 200) {
            let blob = this.response;
            let oFileReader = new FileReader();
            oFileReader.onloadend = function (e) {
              const base64 = e.target.result;
              resolve(base64);
            };
            oFileReader.readAsDataURL(blob);
          }
        };
        xhr.send();
      });
    },
    selectionChange() {},
    handleContextMenu(event, index) {
      // 阻止浏览器默认的右键菜单
      event.preventDefault();

      // 显示自定义右键弹框
      this.isContextMenuVisible = true;
      this.rightClickViewIndex = index;

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
    async addCustomView() {
      var { longitude, latitude } = getScreenCenterCoordinatesAndHeight(
        window.$viewer
      );
      var height = await getCameraHeight(window.$viewer);
      var { heading, pitch, roll } = getCameraOrientation(window.$viewer);
      var base64Img = await exportMapImgBase64(window.$viewer);
      const params = {
        camera: {
          destination: {
            lon: longitude,
            lat: latitude,
            height: height,
          },
          orientation: {
            heading: heading,
            pitch: pitch,
            roll: roll,
          },
        },
        defaultCamera: {
          destination: {
            lon: longitude,
            lat: latitude,
            height: height,
          },
          orientation: {
            heading: heading,
            pitch: pitch,
            roll: roll,
          },
        },
        isCustomDef: 0,
        img: base64Img,
        name: "新视角",
        type: 3,
      };
      addCamera({
        camera: JSON.stringify(params.camera),
        defaultCamera: JSON.stringify(params.defaultCamera),
        isCustomDef: 0,
        img: base64Img,
        name: "新视角",
        type: 3,
      }).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "添加成功",
          });
          this.getCameraList();
        }
      });
      // this.viewList[2].cameraList.push({
      //   thumbImg: base64Img,
      //   checked: false,
      //   name: "新视角",
      //   id: Date.now(),
      //   camera: {
      //     destination: {
      //       lon: longitude,
      //       lat: latitude,
      //       height: height,
      //     },
      //     orientation: {
      //       heading: heading,
      //       pitch: pitch,
      //       roll: roll,
      //     },
      //   },
      // });
    },
    delCustomView() {
      console.log(this.viewList[2].cameraList);
      const isDelItem = this.viewList[2].cameraList.some((item) => {
        return item.checked;
      });
      const cameras = this.viewList[2].cameraList.filter((item) => {
        return item.checked;
      });
      const ids = cameras.map((item) => {
        return item.id;
      });
      if (isDelItem) {
        ElMessageBox.confirm("请问您确定要删除这些视角么?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            delCameras(ids).then((res) => {
              if (res.code == 200) {
                ElMessage({
                  type: "success",
                  message: "删除成功",
                });
                this.getCameraList();
              }
            });
          })
          .catch(() => {
            // ElMessage({
            //   type: 'info',
            //   message: 'Delete canceled',
            // })
          });
      }
    },
    switchShowCheckBox() {
      this.checkboxShow = !this.checkboxShow;
      this.currentEditIconColor = this.checkboxShow ? "#33f8ff" : "#fff";
      if (!this.checkboxShow) {
        this.currentSelection = [];
      }
    },
    selectCurrentView(index) {
      if (this.currentViewIndex == index) {
        this.currentViewIndex = -1;
        return;
      }
      this.currentViewIndex = index;
    },
    hoverChina() {
      this.viewList[1].icon = ChinaMapActiveIcon;
    },
    backoutChina() {
      this.viewList[1].icon = ChinaMapIcon;
    },
    switchMapViewView() {
      this.homeMenuStore.mapViewMenuState =
        !this.homeMenuStore.mapViewMenuState;

      this.homeMenuStore.baselayersMenuState = false;
      this.homeMenuStore.layersMenuState = false;
    },
    async getCurrentCamera() {
      var { longitude, latitude } = getScreenCenterCoordinatesAndHeight(
        window.$viewer
      );
      var height = await getCameraHeight(window.$viewer);
      var { heading, pitch, roll } = getCameraOrientation(window.$viewer);
      this.viewList[this.currentViewIndex].camera = {
        destination: {
          lon: longitude,
          lat: latitude,
          height: height,
        },
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      };
      this.updateQqOrchCamera();
    },
    resetChange() {
      if (this.currentViewIndex != 2) {
        this.viewList[this.currentViewIndex].camera =
          this.viewList[this.currentViewIndex].defaultCamera;
        this.updateQqOrchCamera();
      }
    },
    switchCamera(index) {
      if (this.viewList[index].camera.destination) {
        let mapParams = this.viewList[index].camera;
        window.$viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            mapParams.destination.lon,
            mapParams.destination.lat,
            mapParams.destination.height
          ),
          orientation: {
            heading: Cesium.Math.toRadians(mapParams.orientation.heading),
            pitch: Cesium.Math.toRadians(mapParams.orientation.pitch),
            roll: Cesium.Math.toRadians(mapParams.orientation.roll),
          },
          complete: function callback() {},
        });
      }
    },
    switchCustomCamera(index) {
      this.rightClickViewIndex = index;
      this.viewList[2].camera =
        this.viewList[2].cameraList[this.rightClickViewIndex].camera;
      this.switchCamera(2);
    },
    getCameraList() {
      searchCamera().then((res) => {
        if (res.code == 200) {
          this.viewList = [];
          res.data.map((item) => {
            item.defaultCamera = JSON.parse(item.defaultCamera);
            item.camera = JSON.parse(item.camera);
            if (item.type == 1) {
              item.icon = "icon-qq";
              this.viewList.push(item);
            }
            if (item.type == 2) {
              item.icon = ChinaMapIcon;
              this.viewList.push(item);
            }
          });
          this.viewList[2] = {
            name: "自定义",
            icon: "icon-zdy",
            camera: {
              destination: {
                lon: 107.5493044,
                lat: 37.9611768,
                height: 8511735.8,
              },
              orientation: {
                heading: 0,
                pitch: -90,
                roll: 0,
              },
            },
            cameraList: res.data.filter((item) => {
              item.checked = false;
              return item.type == 3;
            }),
          };
        }
      });
    },
    async zdyProperty_img() {
      var base64Img = await exportMapImgBase64(window.$viewer);
      this.currentViewForm.img = base64Img;
      console.log(this.currentViewForm.base64Img);
    },
    async zdyProperty_camera() {
      var { longitude, latitude } = getScreenCenterCoordinatesAndHeight(
        window.$viewer
      );
      var height = await getCameraHeight(window.$viewer);
      var { heading, pitch, roll } = getCameraOrientation(window.$viewer);
      var base64Img = await exportMapImgBase64(window.$viewer);

      this.currentViewForm.camera = {
        destination: {
          lon: longitude,
          lat: latitude,
          height: height,
        },
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      };
      this.currentViewForm.img = base64Img;
    },
    updateQqOrchCamera() {
      let cpParams = JSON.parse(
        JSON.stringify(this.viewList[this.currentViewIndex])
      );
      cpParams.defaultCamera = JSON.stringify(cpParams.defaultCamera);
      cpParams.camera = JSON.stringify(cpParams.camera);
      updateCamera(cpParams).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "更新成功",
          });
          this.getCameraList();
          this.currentCameraDialogVisible = false;
        }
      });
    },
    submitUpdateCamera() {
      let cpParams = JSON.parse(JSON.stringify(this.currentViewForm));
      cpParams.defaultCamera = JSON.stringify(cpParams.defaultCamera);
      cpParams.camera = JSON.stringify(cpParams.camera);
      updateCamera(cpParams).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: "success",
            message: "更新成功",
          });
          this.getCameraList();
          this.currentCameraDialogVisible = false;
        }
      });
    },
  },
  watch: {
    currentMapViewIndex(val) {
      if (val == 1) {
        this.viewList[1].icon = ChinaMapActiveIcon;
      } else {
        this.viewList[1].icon = ChinaMapIcon;
      }
    },
    "homeMenuStore.mapViewMenuState"() {
      if (this.homeMenuStore.mapViewMenuState) {
        document.querySelector(".MapView > .icon").style.color = "#00b8b8";
      } else {
        document.querySelector(".MapView > .icon").style.color = "#b2c2c2";
      }
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
.mapViewView {
  width: 410px;
  padding: 0 15px 0;
  background: rgba(20, 27, 31, 0.94);
  border: 1px solid rgba(80, 123, 134, 1);
  border-top: 5px solid #38888c;
  box-shadow: inset 0px 0px 20px 0px rgba(90, 150, 185, 0.45);
  .mapViewRow {
    height: 100px;
    border-bottom: 1px solid rgba(71, 146, 168, 0.5);
    .el-col {
      display: flex;
      justify-content: center;
    }
    .itemView {
      display: flex;
      flex-direction: row;
      align-items: center;
      .left {
        .img {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          .icon {
            color: #8a9ca4;
            .svg-icon {
              font-size: 60px;
              fill: currentColor;
            }
            img {
              width: 60px;
              height: 60px;
            }
          }
        }
        .img:hover {
          .icon {
            color: #33f8ff;
          }
        }
        .label {
          font-family: Source Han Sans CN;
          color: #ffffff;
          font-size: 16px;
          line-height: normal;
        }
      }
      .right {
        margin-left: 10px;
        margin-top: -20px;
        .xiala {
          color: #8a9ca4;
          .svg-icon {
            fill: currentColor;
          }
        }
        .activeXiaLa {
          color: #33f8ff;
        }
      }
    }

    .right:hover {
      cursor: pointer;
      .xiala {
        color: #33f8ff;
      }
    }
    .activeItem {
      .left {
        .img {
          .icon {
            color: #33f8ff;
          }
        }
      }
    }
  }
  .mapViewParmas {
    .noCustom {
      height: 120px;
      .unit {
        color: #fff;
        padding: 0 3px;
      }
      .btns {
        margin-top: 10px;
        .btn {
          width: 115px;
          height: 28px;
          font-family: Source Han Sans CN;
          color: #b2c2c2;
          font-size: 14px;
          line-height: 21px;
          text-align: center;
          background: rgba(7, 32, 42, 0.7);
          border: 1px solid #2d5966;
        }
        .btn:hover {
          color: #33f8ff;
        }
      }
      .destination,
      .orientation {
        margin-top: 10px;
        .label {
          font-family: SourceHanSansCN-Regular;
          color: #ffffff;
          font-size: 14px;
          line-height: 21px;
          margin-right: 10px;
        }
        :deep(.el-input-number) {
          width: 90px;
          height: 28px;
          font-family: Source Han Sans CN;
          color: #b2c2c2;
          font-size: 14px;
          line-height: 21px;
          text-align: center;
          background: rgba(7, 32, 42, 0.7);
          border: 1px solid #2d5966;
          .el-input__wrapper {
            padding-right: 10px;
            padding-left: 10px;
          }
          .el-input-number__decrease {
            display: none;
          }
          .el-input-number__increase {
            display: none;
          }
        }
      }
    }
    .custom {
      width: 100%;
      height: 200px;
      .btns {
        margin-top: 10px;
        .icons {
          .btnList {
            display: flex;
            .btnItem {
              button {
                background: transparent;
                border: 0;
                outline: none;
                .icon {
                  color: #fff;
                  font-size: 25px;
                  cursor: pointer;
                  .svg-icon {
                    fill: currentColor;
                  }
                }
                .icon:hover {
                  color: #33f8ff;
                }
              }
            }
          }
        }
      }
      .viewList {
        position: relative;
        height: 150px;
        .custom-context-menu {
          position: fixed;
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
              text-align: left;
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
        :deep(.el-checkbox-group) {
          width: 100%;
        }
        .viewItem {
          width: 100%;
          cursor: pointer;
          position: relative;
          .viewImg {
            width: 100%;
            height: 60px;
            .thumbImg {
              width: 100%;
              height: 100%;
            }
            .default {
              position: absolute;
              top: 0;
              left: 0;
            }
          }
          .label {
            span {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            :deep(.el-checkbox__label) {
              display: none;
            }
            .text {
              font-family: PingFangSC-Medium;
              color: #ffffff;
              font-size: 12px;
              line-height: 25px;
              margin-left: 5px;
              margin-top: 2px;
            }

            .el-checkbox.el-checkbox--large {
              height: 25px;
            }
          }
        }
      }
    }
  }
}

.editView {
  .thumb {
    .el-button {
      width: auto;
      margin-top: 10px;
    }
    .rightImg {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .thumbImg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    ::-webkit-scrollbar {
      width: 0 !important;
    }
  }
  .unit {
    margin: 0 5px;
  }
  :deep(.el-input-number) {
    width: 90px;
    height: 28px;
    font-family: Source Han Sans CN;
    color: #b2c2c2;
    font-size: 14px;
    line-height: 21px;
    text-align: center;
    background: rgba(7, 32, 42, 0.7) !important;
    border: 1px solid #2d5966;
    .el-input__wrapper {
      padding-right: 10px;
      padding-left: 10px;
    }
    .el-input-number__decrease {
      display: none;
    }
    .el-input-number__increase {
      display: none;
    }
  }
}
</style>
<style lang="scss" scoped>
.currentCameraDialog {
  background: rgba(20, 27, 31, 0.94) !important;
  border: 1px solid rgb(80, 123, 134);
  .el-dialog__header {
    .el-dialog__title {
      color: #fff !important;
    }
  }
  .el-form-item__label {
    color: #fff;
  }
  .currentViewbtn {
    padding-left: 20px;
  }
  .unit {
    color: #fff;
  }
}
</style>
