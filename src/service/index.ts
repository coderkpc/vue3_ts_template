import Request from './request'

import type { RequestConfig } from '@/service/request/types'
interface TestRequestConfig<T> extends RequestConfig {
    data?: T
}
interface TestResponse<T> {
    code: number
    message: string
    data: T
}

const request = new Request({
    baseURL: import.meta.env.BASE_URL,
    timeout: 60000,
    interceptors: {
        // 请求拦截器
        requestInterceptors: (config) => {
            console.log('实例请求拦截器')
            return config
        },
        // 响应拦截器
        responseInterceptors: (result) => {
            console.log('实例响应拦截器')
            return result
        },
    },
})

/**
 * @description: 函数的描述
 * @interface D 请求参数的interface
 * @interface T 响应结构的intercept
 * @param {TestRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const TestRequest = <D = any, T = any>(config: TestRequestConfig<D>) => {
    const { method = 'GET' } = config
    if (method === 'get' || method === 'GET') {
        config.params = config.data
    }
    return request.request<TestResponse<T>>(config)
}

// 取消请求
export const cancelRequest = (urls: string | string[]) => {
    return request.cancelRequest(urls)
}
// 取消全部请求
export const cancelAllRequest = () => {
    return request.cancelAllRequest()
}

export default TestRequest
