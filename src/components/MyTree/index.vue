<template>
  <div :id="id" class="myTree">
    <el-tree
      :data="treeData"
      :node-key="nodeKey"
      :default-expand-all="defaultExpandAll"
      :expand-on-click-node="false"
      :highlight-current="true"
      :props="defaultProps"
      ref="tree"
      @node-click="handleNodeClick"
      :lazy="isLazy"
      :load="loadNode"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span class="tree_label">
            <img :src="data.icon" width="20" height="20" />
            <span class="label">{{ data[defaultProps.label] }}</span>
          </span>

          <span class="tree_menu" v-if="treeMenuShow">
            <el-dropdown>
              <span class="el-dropdown-link">
                <i class="el-icon-more"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in otherDropdownList"
                  :key="index"
                  @click.native="otherClickChange(node, data, item)"
                >
                  {{ item.label }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="isAddSon"
                  @click.native="addChildNode(node, data)"
                  >添加下级目录</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="editNode(node, data)"
                  v-if="isRename"
                  >重命名</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="handleDeleteNode(node, data)"
                  v-if="idDelete"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </span>
      </template>
      <!-- <span class="custom-tree-node" slot-scope="{ node, data }">
        <slot :node="node" :data="data" >
        
        </slot> 
      </span> -->
    </el-tree>
  </div>
</template>

<script>
export default {
  name: "Organization",
  props: {
    // 唯一id,这个是树状结构的id就是唯一的,没啥作用其实,区分用
    id: {
      type: String,
      default: "Mytree",
      required: true,
    },
    treeMenuShow: {
      type: Boolean,
      default: true,
    },

    // 这是每一个树状节点的唯一的key,element 原有属性
    nodeKey: {
      type: String,
      default: "id",
      required: true,
    },

    // 是否默认显示全部,element 原有属性
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },

    // tree的数组,element 原有属性
    treeData: {
      type: Array,
      default: () => {
        return new Array();
      },
    },

    // tree的数据解析方式,element 原有属性
    defaultProps: {
      type: Object,
    },
    isAddSon: {
      type: Boolean,
      default: true,
    },
    otherDropdownList: {
      type: Array,
    },
    isRename: {
      type: Boolean,
      default: true,
    },
    idDelete: {
      type: Boolean,
      default: true,
    },
    isLazy: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {};
  },
  watch: {},

  mounted() {},
  methods: {
    // 增加子级节点事件
    addChildNode(node, data) {
      this.$emit("addChildNodeChange", { node: node, data: data });

      // this.$prompt('请输入节点名称', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消'
      // })
      //   .then(({ value }) => {
      //     // let treeData = {
      //     //   id: id,
      //     //   label: value,
      //     //   icon: require('@/assets/images/file2.png')
      //     // }
      //     // this.$refs.tree.append(treeData, data)
      //     // console.log(this.treeData)
      //   })
      //   .catch(() => {})
    },
    //编辑节点
    editNode(node, data) {
      this.$emit("editNodeChange", { node: node, data: data });

      // this.$prompt('请输入节点名称', '提示', {
      //   confirmButtonText: '确定',
      //   inputValue: data.label,
      //   cancelButtonText: '取消'
      // }).then(({ value }) => {
      //   console.log(value, '-----')
      //   this.$set(data, 'label', value)
      // })
      // }
    },
    // 删除节点
    handleDeleteNode(node, data) {
      this.$emit("delNodeChange", { node: node, data: data });
    },
    handleNodeClick(data, node) {
      this.$emit("handleNodeClickChange", { node: node, data: data });
    },
    otherClickChange(node, data, evt) {
      this.$emit("otherNodeChange", { node: node, data: data, evt: evt });
    },
    loadNode(node, resolve) {
      if (this.isLazy) {
        this.$emit("lazyLoad", {
          node,
          resolve,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .tree_label {
    img {
      vertical-align: middle;
    }
    .label {
      vertical-align: middle;
    }
  }
}
</style>
