<template>
  <div
    class="control MapLocation"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="locationMap"
  >
    <span class="icon"><svg-icon iconName="icon-dw"></svg-icon></span>
  </div>

  <div
    class="mapLocationBox"
    :style="{
      position: 'absolute',
      left: left + 50 + 'px',
      bottom: bottom - 50 + 'px',
    }"
    v-show="mapLocationBox"
  >
    <div>
      <el-row class="lon">
        <el-form ref="locationRef" :model="locationData" :rules="locationRules">
          <el-form-item label="经度:" prop="lon"
            ><el-input
              placeholder="请输入经度"
              v-model="locationData.lon"
              size="medium"
              class="search"
            ></el-input
          ></el-form-item>
          <el-form-item label="纬度:" prop="lat">
            <el-input
              placeholder="请输入纬度"
              v-model="locationData.lat"
              size="medium"
              class="search"
            ></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="submitLocaion">确定</el-button>
            <el-button @click="mapLocationBox = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row class="lat"> </el-row>
    </div>
  </div>
</template>

<script>
// import { ElMessage } from "element-plus";
export default {
  name: "MapLocation",
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
    let lngReg =
      /^(((-?1{1}[0-7]{1}[0-9]{1})|(-?[1-9]{1}[0-9]{1})|-?[0-9]?)(\.\d*[1-9]\d*)?$)|^(-?180)$/;
    let latReg = /^((-?[1-8]{1}[0-9]{1}|-?[0-9]{1})(\.\d*[1-9]\d*)?)$|^(-?90)$/;

    const checkLng = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入经度"));
      }
      setTimeout(() => {
        if (isNaN(parseFloat(value))) {
          callback(new Error("请输入数值类型"));
        } else {
          if (!lngReg.test(value) || value.length > 19) {
            callback(new Error("请输入正确的经度"));
          } else {
            callback();
          }
        }
      }, 20);
    };
    const checkLat = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入纬度"));
      }
      setTimeout(() => {
        if (isNaN(parseFloat(value))) {
          callback(new Error("请输入数值类型"));
        } else {
          if (!latReg.test(value) || value.length > 19) {
            callback(new Error("请输入正确的纬度"));
          } else {
            callback();
          }
        }
      }, 20);
    };
    return {
      mapLocationBox: false,
      locationData: {
        lon: "87.40870070049976",
        lat: "42.21866053050087",
        height: "1000",
      },
      locationRules: {
        lon: [{ required: true, validator: checkLng, trigger: "blur" }],
        lat: [{ required: true, validator: checkLat, trigger: "blur" }],
      },
    };
  },

  mounted() {},

  methods: {
    submitLocaion() {
      this.$refs["locationRef"].validate((valid) => {
        if (valid) {
          window.$viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              parseFloat(parseFloat(this.locationData.lon).toFixed(6)),
              parseFloat(parseFloat(this.locationData.lat).toFixed(6)),
              parseFloat(parseFloat(this.locationData.height).toFixed(6))
            ),
            orientation: {
              heading: Cesium.Math.toRadians(348.4202942851978),
              pitch: Cesium.Math.toRadians(-89.74026687972041),
              roll: Cesium.Math.toRadians(12),
            },
            complete: function callback() {},
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 复位
    locationMap() {
      this.mapLocationBox = !this.mapLocationBox;
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
.mapLocationBox {
  width: 265px;
  height: 150px;
  padding: 8px 8px 0;
  background: rgba(20, 27, 31, 0.94);
  border: 1px solid rgba(80, 123, 134, 1);
  border-top: 5px solid #38888c;
  box-shadow: inset 0px 0px 20px 0px rgba(90, 150, 185, 0.45);
  .el-form-item {
    margin-bottom: 20px;
    :deep(.el-form-item__label) {
      color: #fff;
    }
  }
  .btns{
    :deep(.el-form-item__content){
      justify-content: center
    }
  }
}
</style>
