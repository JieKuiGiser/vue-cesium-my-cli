import request from '@/utils/request';
import {config} from "@/config";

/*
 * 路径规划
 * */
export function routePlan(params,routePlanurl) {
    return request.get(`${routePlanurl}route`, { params });
}