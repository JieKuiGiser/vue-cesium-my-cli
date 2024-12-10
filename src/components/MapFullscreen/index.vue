<template>
  <div
    class="control MapFullscreen"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="mapFullscreen"
  >
    <el-tooltip
      v-if="!isFullscreen"
      effect="dark"
      content="全屏"
      placement="top-start"
    >
      <span class="icon"><svg-icon iconName="icon-sf"></svg-icon></span>
    </el-tooltip>
    <el-tooltip v-else effect="dark" content="退出全屏" placement="">
      <span class="icon"><svg-icon iconName="icon-compress"></svg-icon></span>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: "MapFullscreen",
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
      isFullscreen: false,
    };
  },

  mounted() {},

  methods: {
    // 复位
    mapFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        const element = document.documentElement; // 获取整个文档的元素
        if (element.requestFullscreen) {
          // 标准写法
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          // Firefox 浏览器
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          // Chrome 和 Safari
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          // 标准写法
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          // Firefox 浏览器
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          // Chrome 和 Safari
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          // IE11
          document.msExitFullscreen();
        }
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
