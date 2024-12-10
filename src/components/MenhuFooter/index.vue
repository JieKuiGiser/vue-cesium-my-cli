<template>
  <div>
    <el-footer class="footer">
      <p>
        <span @click="aboutUS">关于我们</span> 
        <span class="split">|</span> <span @click="contactUs">联系我们</span>
        <span class="split">|</span> <span @click="feedBack">意见反馈</span>
      </p>
      <p>
        主办单位：中国人民解放军作战试验基地 技术支持：中国电子科技集团公司第十五研究所
      </p>
    </el-footer>
  </div>
</template>

<script>
export default {
  name: "Footer",

  data() {
    return {};
  },

  mounted() { },

  methods: {
    feedBack() {
      this.$emit('feedBack', true)
    },
    contactUs() {
      this.$emit('contactUs', true)
    },
    aboutUS() {
      this.$emit('aboutUS', true)
    }
  },
};
</script>

<style lang="scss" scoped>
.footer {
  height: 180px !important;
  background: #191E24;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  p {
    line-height: 50px;
    text-align: center;
    font-family: AlibabaPuHuiTi_2_55_Regular;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.80);
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;

    .split {
      margin: 0 20px;
    }
  }
}
</style>