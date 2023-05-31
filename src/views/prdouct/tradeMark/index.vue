<template lang="">
  <div>
    <!-- 添加按钮 -->
    <el-button type="primary" icon="el-icon-plus" class="but" @click="showDialog">添加</el-button>
    <!-- 
      表格组件
        label:  标题
        width： 列宽度
        align:  对齐方式       left/center/right
        props:  字段名         填写的为list中的tmName
    -->
    <el-table style="width: 100%" :data="list">
        <el-table-column type="index" label="序号" width="120" align="center">
        </el-table-column>
        <el-table-column prop="tmName" label="品牌名称" width="360">
        </el-table-column>
        <el-table-column prop="name" label="品牌LOGO" width="360">
        <!-- 
          因为props无法展示图片   因此需要借用作用域插槽 配合img标签来展示图片 
          作用域插槽的row和$index不可更改，规定如此
        -->
        <template slot-scope="{row,$index}">
            <img :src="row.logoUrl" alt="" style="width:50px;height:50px">
        </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="360">
          <template slot-scope="{row,$index}">
        <el-button type="warning" icon="el-icon-edit" @click="updata(row)">修改</el-button>
        <el-button type="danger" @click="open2(row)" icon="el-icon-delete">删除</el-button>
    </template>
        </el-table-column>
    </el-table>
    <!-- 分页器-->
    <el-pagination
      :total="total"  
      :page-size="limit"
      :page-sizes="[3, 5, 10]"
      :current-page="page"
      layout="prev, pager, next, jumper,->,sizes,total"
      background 
      @current-change="currentChange"
      @size-change="sizeChange"
     class="pagin">
     <!-- 
      layout:内的控制分页器布局  ->让后面的跑到最右方 
      page-sizes:控制每页显示多少条数据，但是可以选择由后面的数组内数字决定
    -->
    </el-pagination>

    <!-- 对话框 -->
    <el-dialog :title="names" :visible.sync="dialogFormVisible">
      <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可 -->
    <el-form :model="umFrom" :rules="rules" ref="formName"> 
      <el-form-item label="品牌名称" label-width="100px" prop="tmName">
        <el-input  autocomplete="off" v-model="umFrom.tmName"></el-input>
      </el-form-item>
      <!-- 上传图片 
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      -->
      <el-form-item label="品牌logo" label-width="100px" prop="logoUrl">
        <el-upload class="avatar-uploader" action="dev-api/admin/product/fileUpload" :show-file-list="false"  :on-success="handleAvatarSuccess":before-upload="beforeAvatarUpload">
          <img v-if="umFrom.logoUrl" :src="umFrom.logoUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <div slot="tip" class="el-upload__tip" style="font-weight:700">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="addAll">确 定</el-button>
    </div>
</el-dialog>
    
  </div>
</template>
<script>
export default {
  name: "tradeMark",
  data() {
    return {
      //当前页码数
      page: 1,
      //页面展示条数
      limit: 3,
      //从服务器获取来的total总条数
      total: 0,
      //从服务器获取的品牌列表
      list: [],
      //控制添加对话框显示和隐藏
      dialogFormVisible: false,
      //品牌名称
      names: "",
      //获取用户添加的数据
      umFrom: {
        logoUrl: "",
        tmName: "",
      },
      rules: {
        //品牌名称  required:必填项
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
        ],
        //品牌logo
        logoUrl: [{ required: true, message: "请选择品牌LOGO" }],
      },
    };
  },
  //向服务器发送请求并封装起来
  mounted() {
    this.getTrade();
  },
  methods: {
    async getTrade() {
      //解构数据
      const { page, limit } = this;
      let result = await this.$API.TradeMark.reqTradeMark(page, limit);
      if (result.code == 200) {
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },
    // 用户点击页码跳转相应页
    currentChange(pager) {
      this.page = pager;
      this.getTrade();
    },
    //用户点击切换当前页展示多少条数据
    sizeChange(limit) {
      this.limit = limit;
      this.getTrade();
    },
    //点击添加品牌
    showDialog() {
      this.dialogFormVisible = true;
      this.names = "添加品牌";
      //每次点击添加按钮将数据清空
      this.umFrom = {
        logoUrl: "",
        tmName: "",
      };
    },
    //点击修改品牌
    async updata(row) {
      this.dialogFormVisible = true;
      this.names = "修改品牌";
      //浅拷贝：只会在服务器返回后进行修改
      //此处代码会修改data中的umFrom数据，在传递给服务器时会携带id参数，在api中进行判断有则会进行修改，没有则会进行新增
      //{...row}:为浅拷贝  
      // this.umFrom = { ...row };
      this.umFrom = row
    },
    // 上传图片
    handleAvatarSuccess(res, file) {
      //res:上传成功后返回给前端的数据
      this.umFrom.logoUrl = res.data;
    },
    //图片规范
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    addAll() {
      //获取表单的真实dom来获取数据进行表单验证
      this.$refs.formName.validate(async (valid) => {
        //若过所有字段都验证成功则在进行业务  valid：返回一个布尔值
        if (valid) {
          this.dialogFormVisible = false;
          //向服务器发送请求并把数据带给服务器

          let result = await this.$API.TradeMark.reqAddorUpdata(this.umFrom);

          if (result.code == 200) {
            //弹出信息：'修改品牌成功':'添加品牌成功'
            this.$message({
              message: this.umFrom.id ? "修改品牌成功" : "添加品牌成功",
              type: "success",
            });
            //添加成功后在其向服务器发送请求捞取最新的数据
            this.getTrade();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //删除按钮，是否确认删除
    //绑定点击事件，触发后弹窗是否确认删除   弹窗为饿了么ui组件
    //在确认删除代码处调用接口，去向服务器传递要删除品牌的id来完成删除
    //发完请求后，在次调用接口重现渲染页面
    open2(row) {
      this.$confirm("此操作将永久删除该品牌, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          //确定删除后执行
          let result = await this.$API.TradeMark.reqDeletTrade(row.id);
          if ((result.code = 200)) {
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.getTrade();
          }
        })
        .catch(() => {
          //取消删除后执行
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>
<style lang="css">
.but {
  border: 2.5px solid black;
}
.pagin {
  margin-top: 20px;
  text-align: center;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>