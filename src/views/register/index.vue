<template>
  <div class="login-container">
    <h3>多源时空信息大数据门户</h3>
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRule"
      label-width="80px"
      class="resiger"
    >
      <el-form-item label="账户名称" prop="name">
        <el-input v-model="registerForm.name"></el-input>
      </el-form-item>
      <el-form-item label="账户密码" prop="password">
        <el-input v-model="registerForm.password" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="registerForm.realName"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNum">
        <el-input v-model="registerForm.phoneNum"></el-input>
      </el-form-item>
      <el-form-item label="证件号码" prop="citizenIdNumber">
        <el-input v-model="registerForm.citizenIdNumber"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="resigerUser">注 册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { registerUser } from "@/api/gateway";
export default {
  name: "Register",
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    const validateMobile = function (rule, value, callback) {
      const regex = /^1[3-9]\d{9}$/;
      if (!value) {
        callback(new Error("请输入正确的手机号"));
      } else if (!regex.test(value)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };

    const validateIDCard1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入正确的证件号码"));
      }
      setTimeout(() => {
        if (this.validateIDCard(value)) {
          callback();
        } else {
          callback(new Error("请输入正确的证件号码"));
        }
      }, 1000);
    };
    return {
      registerForm: {
        name: "",
        password: "",
        confirmPassword: "",
        realName: "",
        phoneNum: "",
        email: "",
        citizenIdNumber: "",
      },
      registerRule: {
        email: [
          { required: true, message: "请输入邮箱地址", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        name: [{ required: true, message: "请输入账户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        confirmPassword: [
          { required: true, validator: validatePass, trigger: "blur" },
        ],
        phoneNum: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          {
            validator: validateMobile,
            trigger: ["blur", "change"],
          },
        ],
        citizenIdNumber: [
          { required: true, trigger: "blur", validator: validateIDCard1 },
        ],
        realName: [
          { required: true, message: "请输入真实姓名", trigger: "blur" },
        ],
      },
    };
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    validateIDCard(id) {
      // 地区校验码
      const city = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外",
      };

      // 校验码权重和校验码计算
      const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      const parity = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

      if (!/^\d{17}(\d|X|x)$/.test(id)) {
        return false; // 格式校验
      }

      if (!city[id.substr(0, 2)]) {
        return false; // 地区校验
      }

      const birthday = id.substr(6, 8);
      if (!/^\d{8}$/.test(birthday)) {
        return false; // 出生日期格式校验
      }

      const year = parseInt(birthday.substr(0, 4), 10);
      const month = parseInt(birthday.substr(4, 2), 10);
      const day = parseInt(birthday.substr(6, 2), 10);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return false; // 出生日期有效性校验
      }

      let sum = 0;
      for (let i = 0; i < 17; i++) {
        sum += id[i] * factor[i];
      }

      const last = parity[sum % 11];
      if (last !== id[17].toUpperCase()) {
        return false; // 校验码校验
      }

      return true;
    },

    resigerUser() {
      this.$refs.registerFormRef.validate((valid) => {
        if (valid) {
          let params = JSON.parse(JSON.stringify(this.registerForm));
          if (params.confirmPassword) {
            delete params.confirmPassword;
          }
          registerUser(params).then((res) => {
            if (res.code == 200) {
              this.$message.success("注册成功!");
              this.$router.push({
                path: "/login",
              });
            } else {
              this.$message.error("注册失败!" + res.errorMessage);
            }
          });
        }
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
    top: 17%;
    left: 35%;
    color: #fff;
    font-size: 40px;
    letter-spacing: 10px;
  }

  .resiger {
    position: absolute;
    top: 39%;
    left: 34%;
    width: 29%;

    :deep(.el-button) {
      width: 100%;
      color: #fff;
      background-image: linear-gradient(180deg, #093a97 0%, #3297ef 100%);
      border: 1px solid rgba(84, 147, 255, 1);
      border-radius: 2px;
    }

    :deep(.el-form-item__label) {
      color: #fff;
    }
  }
}
</style>
