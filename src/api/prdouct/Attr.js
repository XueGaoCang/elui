//引入request
import request from '@/utils/request'
//获取一级分类数据
export const getCategory1 = () => request({ url: '/admin/product/getCategory1', method: 'GET' })

//根据一级分类id获取二级分类数据
export const getCategory2 = (category1Id) => request({ url: `/admin/product/getCategory2/${category1Id}`, method: 'GET' })
//根据二级分类id获取三级分类数据
export const getCategory3 = (category2Id) => request({ url: `/admin/product/getCategory3/${category2Id}`, method: 'GET' })

//根据一二三级分类id来获取相对应数据
///admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
export const getattrInfoList = (category1Id,category2Id,category3Id)=> request({url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,method: 'GET'})

//新增数据
export const postsaveAttrInfo = (data)=> request({url:'/admin/product/saveAttrInfo',data,method: 'POST'})
/*

{
  "attrName": "",  //属性名称
  "attrValueList": [
    {
      "attrId": 0,   //属性列表id
      "valueName": "string"  //属性列表名称
    }
  ],
  "categoryId": 0,  携带三级列表id
  "categoryLevel": 0,区别几级id
}

*/ 