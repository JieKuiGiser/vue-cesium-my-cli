import request from "@/utils/request";
import { config } from "@/config";

/*
 * 首页搜索Poi
 * */
export function findByPoiKeyword(params) {
  return request.post(`${config.baseurl}/gateway/findByPoiKeyword`, params);
}


/*
 * 范围搜索Poi
 * */
export function findByWithinRadius(params) {
  return request.post(`${config.baseurl}/gateway/findByWithinRadius`, params);
}


/*
 * 注册
 * */
export function registerUser(params) {
  return request.post(`${config.loginurl}/register`, params);
}
/*
 * 登录
 * */
export function userLogin(params) {
  return request.post(`${config.loginurl}/login`, params);
}
