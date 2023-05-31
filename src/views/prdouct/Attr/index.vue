<template lang="">
    <div>
        <!-- 三级分类 -->
        <el-card class="box-card">
            <el-form :inline="true"  class="demo-form-inline" :model="uFrom">
            
            <el-form-item label="一级分类" disabled="disabled">
                <el-select  placeholder="请选择" v-model="uFrom.Category1Id" value="" @change="chageC1">
                  <!-- 
                    label:为显示内容   v-for用来将从服务器获取过来的数据遍历出来 
                    value:收集一级分类id，用于二级分类展示数据使用
                  -->
                <el-option :label="c1.name" :value="c1.id" v-for="(c1,index) in Category1" :key="c1.id"></el-option>
                </el-select>
            </el-form-item>
            
            <el-form-item label="二级分类">
                <el-select  placeholder="请选择" v-model="uFrom.Category2Id" @change="chageC2">
                <el-option :label="c2.name" :value="c2.id"  v-for="(c2,index) in Category2" :key="c2.id"></el-option>

                </el-select>
            </el-form-item>

            <el-form-item label="三级分类">
                <el-select  placeholder="请选择" v-model="uFrom.Category3Id" @change="chageC3">
                  <el-option :label="c3.name" :value="c3.id"  v-for="(c3,index) in Category3" :key="c3.id"></el-option>

                </el-select>
            </el-form-item>

            </el-form>
        </el-card>
        <!-- 数据展示区 -->
        <el-card class="box-card">
            <div v-show="ishow">
              <!-- disabled为true时按钮被禁用，为false时按钮开启 -->
              <el-button type="primary" icon="el-icon-plus" :disabled="!uFrom.Category3Id" @click.native="getIn">添加属性</el-button>
              <el-table border style="width: 100%" :data="CategoryList">
                  <el-table-column type="index" label="序号" width="80" align=center>
                  </el-table-column>
                  <el-table-column prop="attrName" label="属性值名称" width="180" align=center>
                  </el-table-column>
                  <el-table-column prop="prop" label="属性值列表" width="600">
                    <template slot-scope="{row,$index}">
                        <el-tag type="success" v-for="(p,index) in row.attrValueList" 
                        :key="p.id" style="margin:10px 20px">{{p.valueName}}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="prop" label="操作">
                    <!-- 通过作用域插槽来将数据传递过去 -->
                    <template slot-scope="{row,$index}">
                      <el-button type="warning" icon="el-icon-edit" @click="updepe(row)">修改</el-button>
                      <el-button type="danger" icon="el-icon-delete">删除</el-button>
                    </template>
                  </el-table-column>
              </el-table>
            </div>
            <!-- 添加属性/修改属性解构 -->
            <div v-show="!ishow">
              <el-form :inline="true" ref="form" label-width="80px">
                <el-form-item label="属性名" >
                  <el-input placeholder="请输入属性名" v-model="attrInfo.attrName"></el-input>
                </el-form-item>
              </el-form>
              <!-- 如果添加属性值input框内没有数据时，添加属性值按钮是被禁用的 -->
              <el-button type="primary" icon="el-icon-plus" @click="getinfro" :disabled="!attrInfo.attrName">新增属性值</el-button>

              <el-button @click="ishow = true">取消</el-button>

              <el-table border style="width:100%; margin:20px 0;" :data="attrInfo.attrValueList">

                <el-table-column type="index" label="序号" width="80" align=center>
                </el-table-column>

                <el-table-column prop="prop" label="属性值名称" width="width" align=center>
                  <template slot-scope="{row,$index}">
                  <!-- 当取消input框焦点的时候会使得span框出现，进入查看模式，在次点击span标签时进入修改模式 -->
                  <!-- :ref 获取点击的 -->
                      <el-input
                        placeholder="请输入属性值名称"
                        v-model="row.valueName"
                        size="mini"
                        v-if="row.flage"
                        @blur="tolook(row)"
                        @keyup.native.enter="tolook(row)"
                        :ref="$index"
                      ></el-input>
                      <span v-else @click="upide(row,$index)">{{ row.valueName }}</span>
                  </template>
                  </el-table-column>

                <el-table-column prop="prop" label="操作" width="width">
                    <template slot-scope="{row,$index}">
                      <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
                  </template>
                </el-table-column>

              </el-table>

              <el-button type="primary" @click="postinfor">保存</el-button>

              <el-button @click="ishow = true">取消</el-button>
            </div>
        </el-card>
    </div>
</template>
<script>
//按需引入lodash中的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      //存放一级分类数据
      Category1: [],
      Category2: [],
      Category3: [],
      CategoryList: [],
      ishow: true,
      uFrom: {
        //存放分类们的id
        Category1Id: "",
        Category2Id: "",
        Category3Id: "",
      },
      //用户新增/修改属性参数
      attrInfo: {
        attrName: "", //属性名称
        attrValueList: [],
        categoryId: "", //携带三级列表id
        categoryLevel: "", //区别几级id
      },
    };
  },
  mounted() {
    //组件已挂载完毕就调用服务器获取数据
    this.getCategory();
  },
  methods: {
    //获取一级分类数据并存放起来
    async getCategory() {
      let result = await this.$API.Attr.getCategory1();
      if (result.code == 200) {
        this.Category1 = result.data;
      }
    },
    //根据一级分类id来获取二级分类数据
    //@change为elui封装好的一个事件，只要表单数据发送改变就会触发
    async chageC1() {
      //清楚数据，当一级分类发送改变时清楚其他分类数据
      this.uFrom.Category2Id = "";
      this.uFrom.Category3Id = "";
      (this.Category2 = []), (this.Category3 = []);

      let result = await this.$API.Attr.getCategory2(this.uFrom.Category1Id);
      if (result.code == 200) {
        this.Category2 = result.data;
      }
    },
    //根据二级分类的id来向服务器获取三级分类的数据并将其存储到Category3中
    async chageC2() {
      //在二级分类发送改变时，三级分类数据清楚
      this.uFrom.Category3Id = "";
      this.Category3 = [];
      let result = await this.$API.Attr.getCategory3(this.uFrom.Category2Id);
      if (result.code == 200) {
        this.Category3 = result.data;
      }
    },
    //根据一二三级分类id来获取服务器相对应数据
    async chageC3() {
      //解构id
      const { Category1Id, Category2Id, Category3Id } = this.uFrom;
      //携带id传递给服务器拉取数据
      let result = await this.$API.Attr.getattrInfoList(
        Category1Id,
        Category2Id,
        Category3Id
      );
      if (result.code == 200) {
        this.CategoryList = result.data;
      }
    },
    //新增属性值
    getinfro() {
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id,
        valueName: "",
        flage: true,
        //在每次新增属性值时为其多添加一个flage标记，用来控制查看模式和修改模式的切换
      });

      //点击新增属性值，使input自动聚焦
      this.$nextTick(()=>{
        //使每次添加的数组的最后一个数据自动聚焦
        //因为每次往数组内新增数据时都为最后一条数据
        this.$refs[this.attrInfo.attrValueList.length-1].focus()
      })
    },
    //新增回调
    async postinfor() {
      // 新增函数APIpostsaveAttrInfo
      let result = await this.$API.Attr.postsaveAttrInfo(this.attrInfo);
      if (result.code == 200) {
        //服务器回调成功，重新渲染页面
        this.ishow = true;
        this.chageC3()
      }
    },
    //点击添加属性按钮后将新增页面参数清空
    getIn() {
      //点击添加属性按钮后隐藏
      this.ishow = false;
      //在点击添加属性按钮后会将添加的属性参数清空
      this.attrInfo = {
        attrName: "", //属性名称
        attrValueList: [],
        //当点击添加属性值后，随带着就把ID给到了attrInfo里的categoryId
        categoryId: this.uFrom.Category3Id, //携带三级列表id
        categoryLevel: 3, //区别几级id
      };
    },
    //修改按钮
    updepe(row) {
      //隐藏展示页面
      this.ishow = false;
      //因为展示页面的数据和新增页面的数据都是调用的data中的attrInfo
      //因此只需要修改attrInfo即可达到点击修改按钮使得修改页面展示数据
      //又因为新增/修改是同一个页面不同请求所以，保存按钮是同一个，因此就不需要在写重复的业务操作
      // this.attrInfo.attrName=row.attrName
      // this.attrInfo.attrValueList=row.attrValueList
      //由于数据格式的复杂使用深拷贝解决不了点击取消后展示页面依旧被修改
      //数据解构为：对象里面有数组且数组内还套着对象
      //所以使用深拷贝来解决这个bug
      this.attrInfo = cloneDeep(row);
      //这里不使用row的原因为  row为最新数据  而我们使要给已经有的数据添加flage字段所以不能使用row
      this.attrInfo.attrValueList.forEach(item=>{
        //使用$set让添加上的flage为响应式数据
        //参数一：为哪个对象添加响应式属性
        //参数二：添加新的响应式属性  
        //参数三：响应式属性值
        this.$set(item,'flage',false)
      })
      this.chageC3();
    },
    //失去焦点的回调
    tolook(row) {
      // trim() 方法用于删除字符串的头尾空白符，空白符包括：空格、制表符 tab、换行符等其他空白符等。
      if (row.valueName.trim() == "") {
       return alert("输入内容不能为空");
      }
      //数组去重，如果 出现重复元素不可书写
      //使用some方法
      let isRecpt = this.attrInfo.attrValueList.some((item) => {
        if (row != item) {
          //row:为最新添加的属性值
          //item:为已经添加好的属性值
          //最新的和老的进行比较如果出现重复了就禁止
          return row.valueName == item.valueName;
        }
      });
      //如果重复不执行
      if(isRecpt) return alert('出现了重复内容,请重新录入');

      //失去焦点使inpisRecpt
      row.flage = false;
    },
    //点击span切换为input框
    toolook(row) {
      row.flage = true;
    },
    //表单自动获取焦点
    upide(row,index){
      //点击span框flage为真，显示input框
      row.flage = true
      //在我们点击span标签的时候,input标签还没有加载出来，所以需要配合nextTick使其加载出来一次后在获取index
      this.$nextTick(()=>{
        this.$refs[index].focus()
      })
    }
  },
};
</script>
<style lang="css">
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 1300px;
}
</style>