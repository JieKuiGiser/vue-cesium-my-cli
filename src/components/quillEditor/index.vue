<template>
  <div class="vue-quill-editor">
    <quill-editor
      ref="mwQuillEditor"
      v-model="html"
      :options="editorOption"
      @change="onEditorChange($event)"
    />
  </div>
</template>
<script>
import { quillEditor, Quill } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
// 设置字体大小
const fontSizeStyle = Quill.import("attributors/style/size"); // 引入这个后会把样式写在style上
fontSizeStyle.whitelist = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
];
Quill.register(fontSizeStyle, true);
// 设置字体样式
const Font = Quill.import("attributors/style/font"); // 引入这个后会把样式写在style上
const fonts = ["SimSun", "SimHei", "Microsoft-YaHei", "KaiTi", "FangSong"];
Font.whitelist = fonts; // 将字体加入到白名单
Quill.register(Font, true);
// 工具栏
const toolbarOptions = [
  // ["bold", "italic", "underline"], // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
  [{ color: [] }], // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
  // [{ align: [] }], // 对齐方式-----[{ align: [] }]
  [{ size: fontSizeStyle.whitelist }], // 字体大小-----[{ size: ['small', false, 'large', 'huge'] }]
  [{ font: fonts }], // 字体种类-----[{ font: [] }]
  // [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
  // [{ direction: "ltl" }], // 文本方向-----[{'direction': 'rtl'}]
  // [{ direction: "rtl" }], // 文本方向-----[{'direction': 'rtl'}]
  // [{ indent: "-1" }, { indent: "+1" }], // 缩进-----[{ indent: '-1' }, { indent: '+1' }]
  // [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
  // [{ script: "sub" }, { script: "super" }], // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
  // ["blockquote", "code-block"], // 引用  代码块-----['blockquote', 'code-block']
  // ["clean"], // 清除文本格式-----['clean']
  // ["link", "image", "video"], // 链接、图片、视频-----['link', 'image', 'video']
];
export default {
  name: "VueQuillEditor",
  components: {
    quillEditor,
  },
  props: {
    value: {
      type: [Number, Object, Array, String],
      default: "",
    },
  },
  data() {
    return {
      html: this.value,
      editorOption: {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: this.handleImgUpload,
            },
          },
        },
      },
      isShow: false,
    };
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) this.html = newValue;
      },
      deep: true,
    },
  },
  mounted() {
    this.initMounted();
  },
  methods: {
    initMounted() {
      setTimeout(() => {
        this.isShow = true;
      }, 100);
    },
    handleImgUpload() {
      const { quill } = this.$refs.mwQuillEditor;
    },
    onEditorFocus(val) {
      console.log("=========onEditorFocus==========");
      console.log(val);
      console.log("=========onEditorFocus==========");
    },
    onEditorBlur(val) {
      console.log("=========onEditorBlur==========");
      console.log(val);
      console.log("=========onEditorBlur==========");
    },
    onEditorChange(val) {
      // console.log("=================onEditorChange===================");
      // console.log(val);
      // console.log("=================onEditorChange===================");

      this.$emit("textEditChange", val);
    },
  },
};
</script>
<style lang="scss" scoped>
.vue-quill-editor {
  height: 100%;
  .quill-editor {
    height: 100%;
    line-height: normal;
    .ql-toolbar.ql-snow .ql-formats {
      margin-right: 10px !important;
    }
    .ql-editor.ql-blank::before {
      display: none;
    }
    .ql-toolbar.ql-snow {
      .ql-stroke {
        fill: #373a3d;
        stroke: #fff;
      }
      .ql-picker-label {
        color: #fff;
      }
      .ql-snow.ql-toolbar button .ql-active {
        color: rgb(64, 158, 255);
      }
      .ql-active .ql-stroke {
        fill: none;
        stroke: rgb(64, 158, 255);
      }
      border: 0;
    }
    .ql-container.ql-snow {
      line-height: normal !important;
      height: calc(100% - 375px);
      color: #fff;
      font-size: 14px;
      background: #373a3d;
      border: 1px solid rgba(100, 103, 106, 1);
      border-radius: 2px;
    }
    .ql-snow {
      .ql-tooltip[data-mode="link"]::before {
        content: "请输入链接地址:";
      }
      .ql-tooltip.ql-editing a.ql-action::after {
        border-right: 0px;
        content: "保存";
        padding-right: 0px;
      }
      .ql-tooltip[data-mode="video"]::before {
        content: "请输入视频地址:";
      }
      .ql-picker.ql-size {
        width: 80px;
        .ql-picker-label[data-value="12px"]::before,
        .ql-picker-item[data-value="12px"]::before {
          content: "12px";
        }
        .ql-picker-label[data-value="14px"]::before,
        .ql-picker-item[data-value="14px"]::before {
          content: "14px";
        }
        .ql-picker-label[data-value="16px"]::before,
        .ql-picker-item[data-value="16px"]::before {
          content: "16px";
        }
        .ql-picker-label[data-value="18px"]::before,
        .ql-picker-item[data-value="18px"]::before {
          content: "18px";
        }
        .ql-picker-label[data-value="20px"]::before,
        .ql-picker-item[data-value="20px"]::before {
          content: "20px";
        }
        .ql-picker-label[data-value="24px"]::before,
        .ql-picker-item[data-value="24px"]::before {
          content: "24px";
        }
        .ql-picker-label[data-value="28px"]::before,
        .ql-picker-item[data-value="28px"]::before {
          content: "28px";
        }
        .ql-picker-label[data-value="32px"]::before,
        .ql-picker-item[data-value="32px"]::before {
          content: "32px";
        }
        .ql-picker-label[data-value="36px"]::before,
        .ql-picker-item[data-value="36px"]::before {
          content: "36px";
        }
      }
      .ql-picker.ql-header {
        .ql-picker-label::before,
        .ql-picker-item::before {
          content: "文本";
        }
        .ql-picker-label[data-value="1"]::before,
        .ql-picker-item[data-value="1"]::before {
          content: "标题1";
        }
        .ql-picker-label[data-value="2"]::before,
        .ql-picker-item[data-value="2"]::before {
          content: "标题2";
        }
        .ql-picker-label[data-value="3"]::before,
        .ql-picker-item[data-value="3"]::before {
          content: "标题3";
        }
        .ql-picker-label[data-value="4"]::before,
        .ql-picker-item[data-value="4"]::before {
          content: "标题4";
        }
        .ql-picker-label[data-value="5"]::before,
        .ql-picker-item[data-value="5"]::before {
          content: "标题5";
        }
        .ql-picker-label[data-value="6"]::before,
        .ql-picker-item[data-value="6"]::before {
          content: "标题6";
        }
      }
      .ql-picker.ql-font {
        width: 80px;
        .ql-picker-label[data-value="SimSun"]::before,
        .ql-picker-item[data-value="SimSun"]::before {
          content: "宋体";
          font-family: "SimSun" !important;
        }
        .ql-picker-label[data-value="SimHei"]::before,
        .ql-picker-item[data-value="SimHei"]::before {
          content: "黑体";
          font-family: "SimHei";
        }
        .ql-picker-label[data-value="Microsoft-YaHei"]::before,
        .ql-picker-item[data-value="Microsoft-YaHei"]::before {
          content: "微软雅黑";
          font-family: "Microsoft YaHei";
        }
        .ql-picker-label[data-value="KaiTi"]::before,
        .ql-picker-item[data-value="KaiTi"]::before {
          content: "楷体";
          font-family: "KaiTi" !important;
        }
        .ql-picker-label[data-value="FangSong"]::before,
        .ql-picker-item[data-value="FangSong"]::before {
          content: "仿宋";
          font-family: "FangSong";
        }
      }
    }
    .ql-align-center {
      text-align: center;
    }
    .ql-align-right {
      text-align: right;
    }
    .ql-align-left {
      text-align: left;
    }
  }
}
</style>