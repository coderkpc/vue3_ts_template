// axios请求封装
/*
 * 满足功能：
 * 1. 无处不在的代码提示；
 * 2. 灵活的拦截器；
 * 3. 可以创建多个实例，灵活根据项目进行调整；
 * 4. 每个实例，或者说每个接口都可以灵活配置请求头、超时时间等；
 * 5. 取消请求（可以根据url取消单个请求也可以取消全部请求）。
 */

import axios, { AxiosResponse } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type {
    RequestConfig,
    RequestInterceptors,
    CancelRequestSource,
} from '@/service/request/types'
// import nProgress from 'nprogress'

/* 封装为一个类  因为类可以创建多个实例对象 适用范围更广 封装性更强
区分：1. 实例对象   2.axios实例 */
export default class Request {
    // 声明axios实例的类型
    instance: AxiosInstance
    // 拦截器对象
    interceptorsObj?: RequestInterceptors

    /* 存放取消方法的集合
    在创建请求后将取消请求push到该集合中
    封装一个方法，可以取消请求，传入url: string | string[]
    在请求之前判断同一url的请求是否存在，存在就取消请求 */
    cancelRequestSourceList?: CancelRequestSource[]

    /* 存放所有请求url的集合
    请求之前将url 添加到集合中
    请求完毕后将url从集合中删除
    在发送请求之前完成，在响应之后删除 */
    requestUrlList?: string[]

    // 构造器接收一个配置项 用这个作为全局配置
    constructor(config: RequestConfig) {
        // 创建一个axios实例 挂载在实例对象上
        this.instance = axios.create(config)
        this.interceptorsObj = config.interceptors

        // 初始化存放所有请求url的集合和存放取消方法的集合
        this.requestUrlList = []
        this.cancelRequestSourceList = []

        // 执行顺序为实例请求→类请求→实例响应→类响应
        // 全局请求拦截器
        this.instance.interceptors.request.use(
            (res: AxiosRequestConfig) => {
                console.log('全局请求拦截器')
                return res
            },
            (err: any) => err
        )

        // 实例请求拦截器
        this.instance.interceptors.request.use(
            this.interceptorsObj?.requestInterceptors,
            this.interceptorsObj?.requestInterceptorsCatch
        )
        // 实例响应拦截器
        this.instance.interceptors.response.use(
            this.interceptorsObj?.responseInterceptors,
            this.interceptorsObj?.responseInterceptorsCatch
        )

        // 全局响应拦截器最后执行
        this.instance.interceptors.response.use(
            (res: AxiosResponse) => {
                console.log('全局响应拦截器')
                /* 对接口请求的数据主要是存在在.data中
                跟data同级的属性我们基本是不需要的 */
                return res.data
            },
            (err: any) => err
        )
    }

    /**
     * @description: 获取指定 url 的取消token 在 cancelRequestSourceList 中的索引
     * @param {string} url
     * @returns {number} 索引位置
     */
    private getSourceIndex(url: string): number {
        /*
         * 存的时候是通过每次都新建一个对象以 url : c 的键值对来存的
         * 所以取的时候 只用看每个对象的第一个key（只有一个）是否等于 url
         * 如果是 就返回这个token在数组中的索引
         */
        return this.cancelRequestSourceList?.findIndex((item: CancelRequestSource) => {
            return Object.keys(item)[0] === url
        }) as number
    }

    /**
     * @description: 删除 requestUrlList 和 cancelRequestSourceList
     * @param {string} url
     * @returns {*}
     */
    private delUrl(url: string) {
        // 找到要删除的url的索引   断言成number
        const urlIndex = this.requestUrlList?.findIndex((u) => u === url)
        // 找到要取消的请求的token
        const sourceIndex = this.getSourceIndex(url)
        // 删除url和取消请求的方法
        // 如果这个url还在   不在就是已经响应了 请求结束
        urlIndex !== -1 && this.requestUrlList?.splice(urlIndex as number, 1)
        // 如果这个请求还在
        sourceIndex !== -1 && this.cancelRequestSourceList?.splice(sourceIndex as number, 1)
    }

    // 封装取消全部请求的方法
    cancelAllRequest() {
        this.cancelRequestSourceList?.forEach((source) => {
            const url = Object.keys(source)[0]
            // 直接调用这个token实例就可以取消请求
            source[url]()
        })
    }

    // 封装取消单个请求的方法
    cancelRequest(urls: string | string[]) {
        if (typeof urls === 'string') {
            // 传入的是一个url字符串 取消单个请求
            const sourceIndex = this.getSourceIndex(urls)
            // 直接调用这个token实例就可以取消请求
            sourceIndex !== -1 && this.cancelRequestSourceList?.[sourceIndex][urls]()
        } else {
            // 传入的是数组 全部取消
            urls.forEach((url) => {
                const sourceIndex = this.getSourceIndex(url)
                // 直接调用这个token实例就可以取消请求
                sourceIndex !== -1 && this.cancelRequestSourceList?.[sourceIndex][url]()
            })
        }
    }

    // 实例对象自带instance属性(axios实例)和request方法
    // 接收一个请求配置
    request<T>(config: RequestConfig): Promise<T> {
        // 一调用实例对象的request方法
        // 就会调用axios实例的request方法发送请求
        // 并将这个promise对象返回
        return new Promise((reslove, reject) => {
            // 如果有单个请求拦截器，就使用单个请求拦截器
            if (config.interceptors?.requestInterceptors) {
                config = config.interceptors.requestInterceptors(config)
            }
            const url = config.url
            // 当前请求存在url，保存请求方法和url
            if (url) {
                this.requestUrlList?.push(url)
                config.cancelToken = new axios.CancelToken((c) => {
                    this.cancelRequestSourceList?.push({
                        // 以键值对的形式保存   url为key   token为value
                        [url]: c,
                    })
                })
            }
            this.instance
                .request<any, T>(config)
                .then((res) => {
                    // 如果有单个响应的拦截器，就使用单个响应拦截器
                    if (config.interceptors?.responseInterceptors) {
                        res = config.interceptors?.responseInterceptors<T>(res)
                    }
                    reslove(res)
                })
                .catch((err: any) => {
                    reject(err)
                })
                .finally(() => {
                    url && this.delUrl(url)
                })
        })
    }
}
export { RequestConfig, RequestInterceptors }
