<template>
  <div class="page">
    <el-pagination
      layout="jumper,slot, prev, pager, next"
      :total="total"
      :page-size="pagePsize"
      @current-change="handleSizeChange"
      :current-page="currentPage"
    >
      <p>/ {{ totalPage }} 页</p>
      <el-button size="small" @click="goPageChange">GO</el-button>
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: "Page",
  props: {
    totalPage: {
      type: Number,
      default: 1,
    },
    currentPage: Number,
    pagePsize: Number,
    total: Number,
  },
  data() {
    return {};
  },
  methods: {
    handleSizeChange(newPage) {
      this.$emit("pageChange", { _currentPage: newPage });
    },
    goPageChange() {
      this.$emit("pageChange", { _currentPage: this.currentPage });
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.page {
  //   margin: 20px 0 0 40px;
  margin-top: 10px;
  text-align: right;

  :deep(.el-pagination) {
    margin-right: 17px;

    p {
      display: inline-block;
      margin-top: 3px;
      color: #fff;
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
    }

    i {
      color: #fff;
    }

    .btn-next {
      width: 23px;
      height: 23px;
      background: rgba(1, 176, 176, 0.3);
      border: 1px solid rgba(1, 176, 176, 0.5);
      border-radius: 3px;
      color: #1677ff;
    }

    .btn-prev {
      width: 18px;
      height: 23px;
      background: rgba(1, 176, 176, 0.3);
      border: 1px solid rgba(1, 176, 176, 0.5);
      border-radius: 3px;
      margin: 0 3px 0 2px;
      color: #1677ff;
    }
  }

  :deep(.el-pagination button:hover) {
    color: #6c7899;
  }

  :deep(.el-pagination__editor.el-input) {
    width: 40px;
    height: 18px;
  }

  :deep(.el-pagination .el-input__inner) {
    height: 23px;
    // margin-top: 3px;
    background: #1a5559;
    // border: 1px solid rgba(1, 176, 176, 0.5);
    border-radius: 3px;
    color: #fff;
  }

  :deep(.el-pagination__editor.el-input .el-input__inner) {
    height: 23px;
  }

  :deep(.el-pagination__jump) {
    margin-top: -3px;
    font-size: 0;
  }

  :deep(.el-button) {
    width: 23px !important;
    height: 23px;
    margin: 0 5px;
    color: #33f8ff;
    background-color: #191c20;

    border: 1px solid rgba(8, 130, 134, 1);
    border-radius: 3px;

    span {
      width: 23px;
      height: 23px;
      line-height: 23px;
      font-size: 12px;
      text-align: left;
      padding-left: 3px;
    }
  }

  :deep(.el-pager, .el-pager li) {
    display: none;
  }

  :deep(.el-input__wrapper) {
    height: 23px;
    padding: 0;
  }
}
</style>
