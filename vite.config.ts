import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import requireTransform from "vite-plugin-require-transform";
import { resolve } from "path";

const pathResolve = (dir: string): any => {
  return resolve(__dirname, ".", dir);
};

const alias: Record<string, string> = {
  "@": pathResolve("src"),
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    requireTransform({
      fileRegex: /.ts$|.tsx$|.vue$/
    })
  ],
  define: { "process.env": {} },
  server: {
    hmr: true,
    host: '0.0.0.0',
    cors: true,
  },
  resolve: {
    // ****************** 路径配置新增
    alias, // ****************** 路径配置新增
  },
});
