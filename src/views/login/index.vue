<template>
  <div class="login-container">
    <h3>多源时空信息大数据门户</h3>
    <div class="form">
      <el-input
        v-model="userParams.name"
        placeholder="用 户 名："
        prefix-icon="el-icon-user-solid"
      ></el-input>
      <el-input
        v-model="userParams.password"
        placeholder="密     码："
        prefix-icon="el-icon-lock"
        show-password
        class="password"
      ></el-input>
      <el-row :span="24" style="margin: 10px 0px">
        <el-radio v-model="radio" label="1">全军统一认证</el-radio>
        <el-radio v-model="radio" label="2">系统认证</el-radio>
      </el-row>
      <el-row>
        <!-- <el-col :span="12">
          <el-button>注册</el-button>
        </el-col> -->
        <el-col :span="24"
          ><el-button @click="login()">登 录</el-button></el-col
        >
      </el-row>
      <span class="sign" @click="register">注册账户</span>
    </div>
  </div>
</template>

<script>
import { userLogin } from "@/api/gateway";
export default {
  name: "Login",
  data() {
    return {
      visible: false,
      modalContent: "这是一段自定义模态框消息",
      userParams: {
        name: "",
        password: "",
      },
      radio: "1",
    };
  },
  computed: {},
  created() {
    document.onkeyup = (e) => {
      if (e.keyCode === 13 && e.target.baseURI.match(/login/)) {
        // 调用登录 验证方法
        this.login();
      }
    };
  },
  mounted() {},
  methods: {
    login() {
      if (this.userParams.name != "" && this.userParams.password != "") {
        userLogin(this.userParams).then((res) => {
          if (res.code == 200) {
            localStorage.setItem("bigdata_token", res.data.token);
            localStorage.setItem(
              "bigdata_userInfo",
              JSON.stringify(res.data.user)
            );
            this.$router.push({
              path: "/portal/home",
              params: {
                userInfo: res.data.user,
              },
            });
            this.$message.success("登录成功!");
          } else {
            this.$message.error(res.errorMessage + "," + "请重新输入!");
          }
        });
        // this.$router.push({
        //   path: "/"
        // });
        // this.$message.success("登录成功!");
      } else {
        this.$message.error("用户名或密码不能为空!");
      }
    },
    confirm() {
      this.visible = false;
      console.log("点击确定");
    },
    register() {
      this.$router.push({
        name: "Register",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background: url("../../assets/images/login_bg.png");
  background-size: 100% 100%;

  h3 {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 40px;
    letter-spacing: 10px;
  }

  .form {
    width: 425px;
    height: 214px;
    // background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    :deep(.el-input__inner) {
      // background-color: #00104a;
      // border: 1px solid #5493ff;
      // margin-bottom: 14px;
      color: #fff;
    }

    :deep(.el-button) {
      width: 100%;
      color: #fff;
      background-image: linear-gradient(180deg, #093a97 0%, #3297ef 100%);
      border: 1px solid rgba(84, 147, 255, 1);
      border-radius: 2px;
    }

    :deep(.el-input__icon) {
      margin-top: -6px;
    }

    :deep(.el-radio) {
      color: #fff;
    }

    :deep(.el-input__wrapper) {
      height: 44px;
    }

    :deep(.el-input) {
      height: 44px;
    }

    .password {
      margin-top: 10px;
    }
  }

  .sign {
    display: inline-block;
    color: #409eff;
    margin-top: 10px;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
