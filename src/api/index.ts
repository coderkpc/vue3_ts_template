import request from '@/service'

// 请求接口
interface Req {
    apiKey: string
    area?: string
    areaID?: string
}

// 响应接口
interface Res {
    area: string
    areaCode: string
    areaID: string
    dayList: any[]
}

export const get15DaysWeatherByArea = (data: Req) => {
    return request<Req, Res>({
        url: '/api/common/weather/get15DaysWeatherByArea',
        method: 'GET',
        data,
        interceptors: {
            requestInterceptors(res) {
                console.log('接口请求拦截器')
                return res
            },
            responseInterceptors(result) {
                console.log('接口响应拦截器')
                return result
            },
        },
    })
}
