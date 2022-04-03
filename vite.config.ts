import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }: ConfigEnv) => {
    const env = loadEnv(mode, process.cwd())
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                cpns: resolve(__dirname, 'src/components'),
            },
            extensions: ['.js', '.json', '.ts', '.vue'], // 使用路径别名时想要省略的后缀名，可以自己 增减
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/style/global.scss";',
                },
            },
        },
        // 强制预构建插件包
        optimizeDeps: {
            include: ['axios'],
        },
        // 打包配置
        build: {
            target: 'modules',
            outDir: 'dist', //指定输出路径
            assetsDir: 'assets', // 指定生成静态资源的存放路径
            minify: 'terser', // 混淆器，terser构建后文件体积更小
        },
        // 本地运行配置，及反向代理配置
        server: {
            cors: true, // 默认启用并允许任何源
            open: true, // 在服务器启动时自动在浏览器中打开应用程序
            //反向代理配置，注意rewrite写法，开始没看文档在这里踩了坑
            proxy: {
                '/api': {
                    target: env.VITE_APP_BASE_URL, //代理接口
                    changeOrigin: true,
                    configure: (proxy, options) => {
                        // proxy 是 'http-proxy' 的实例
                        console.log(proxy, options)
                    },
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    }
})
