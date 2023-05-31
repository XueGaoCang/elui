import request from '@/utils/request'

//获取品牌列表
export const reqTradeMark = (page, limit) => request({ url: `/admin/product/baseTrademark/${page}/${limit}`, method: 'get', })
//新增品牌和修改品牌
//新增品牌：需要携带品牌名称和品牌logo
//修改品牌：需要携带品牌id，名称，logo

export const reqAddorUpdata = (tradeMark) => {
    //如果传递过来的对象含有id则为修改品牌
    if (tradeMark.id) {
        return request({ url: '/admin/product/baseTrademark/update', method: 'put', data: tradeMark })
        //若没有id则为新增品牌
    } else {
        return request({ url: '/admin/product/baseTrademark/save', method: 'post', data: tradeMark })
    }
}

//删除品牌

export const reqDeletTrade = (id) => request({ url: `/admin/product/baseTrademark/remove/${id}`, method: 'delete' })