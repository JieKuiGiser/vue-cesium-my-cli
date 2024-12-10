import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { getToken, setToken, removeToken } from "@/utils/auth.js";

import store from "@/store";

// create an axios instance
const service = axios.create({
  timeout: 5000000000, // request timeout
});

// export default service
service.interceptors.request.use(
  (config) => {
    // const tokenHead = "Bearer ";
    // const token = getToken();
    // if (tokenHead && token) {
    //   config.headers["Authorization"] = tokenHead + token;
    // }
    return config;
  },
  (error) => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    // 拦截 自动延时
    if (response.status < 500) {
      return Promise.resolve(response.data);
    } else if (response.data.code == 502) {
      return Promise.reject(response.data.errorMessage);
    } else {
      return Promise.reject(response.data.errorMessage);
    }
  },
  (error) => {
    // if (error.response.status == 401) {
    //   ElMessage({
    //     type: "error",
    //     message: "登录已过期，请重新登录" + error.response.data.errorMessage,
    //   });
    //   removeToken();
    //   setTimeout(() => {
    //     window.location.reload()
    //   }, 500);
    // } else {
      return Promise.reject("服务器错误!" + error);
    // }
  }
);

export default service;
