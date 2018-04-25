<!--自定义字段名称脚本-->
<template>
  <div class="content-inner content-wraps">
    <div class="head">
      <span class="title">自定义字段列表</span>
      <el-button size='mini' class="save-btn" type="primary" @click="newItem">添加字段</el-button>
    </div>
    <div class="table-wraps">
      <el-table :data="datas" style="width: 100%" :height='tableHeight' border>
        <el-table-column v-for="col in columns" :key="col.prop" :label="col.label" :prop="col.prop" :class-name="col.class" align='center'>
          <template slot-scope="props">
            <div v-if="col.prop !== 'handle'">
              <span>{{ props.row[col.prop] }}</span>
            </div>
            <div v-else>
              <i v-show="true" class="icon el-icon-edit" @click="editItem(props.$index)" title="编辑"></i>
              <i v-show="true" class="icon el-icon-delete" @click="deleteItem(props.$index)" title="删除"></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="350px" class='field-dialog'>
      <el-form ref="form" :model="editForm" label-width="80px">
        <el-form-item label="操作类型">
          <el-select v-model="editForm.type" placeholder="请选择" :disabled='editType === 1'>
            <el-option v-for="item in operationTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字段属性">
          <el-select v-model="editForm.code" placeholder="请选择" :disabled='!editForm.type || editType === 1'>
            <el-option v-for="item in operationCodes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size='mini' @click="dialogVisible = false">取 消</el-button>
        <el-button size='mini' type="primary" @click="saveClickHandler">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import {mapGetters} from 'vuex'
import { outerHeight } from 'assets/js/public.js'
const TABLE_DATA_URL = window.HOST + '/api/v1/customized/items'

export default {
  data () {
    return {
      dialogVisible: false,
      tableData: {
        columns: [
          {
            label: '序号',
            prop: 'index',
            align: 'center'
          },
          {
            label: '字段属性',
            prop: 'itemCode',
            align: 'center'
          },
          {
            label: '操作类型',
            prop: 'opType',
            align: 'center'
          },
          {
            label: '显示名称',
            prop: 'itemName',
            align: 'center'
          },
          {
            label: '操作',
            prop: 'handle',
            align: 'center'
          }
        ],
        height: 700
      },
      aBefore: [],
      // 提示信息。
      sErrorMessage: '',
      currentRow: null, // 存放当前点击行
      editForm: {
        type: '',
        code: '',
        name: ''
      },
      editType: '' // 操作类型（0：新增。1：编辑）
    }
  },
  created () {
    this.init()
    window.addEventListener('resize', this.setTableHeight)
  },
  destroyed () {
    window.removeEventListener('resize', this.setTableHeight)
  },
  computed: {
    // 列信息
    columns () {
      return this.tableData.columns
    },
    // 表格高度
    tableHeight () {
      return this.tableData.height
    },
    ...mapGetters(
      {
        // 行信息
        datas: 'userDefinedItems',
        // 可以新增的自定义字段
        canUserDefinedItems: 'canUserDefinedItems'
      }
    ),
    // 操作类型选项
    operationTypes () {
      let arr = []
      this.canUserDefinedItems.forEach(el => {
        arr.push({
          'opType': el.opType,
          'opTypeName': el.opTypeName
        })
      })
      arr = _.uniqBy(arr, 'opType')
      return arr.map(el => {
        return {
          value: el['opType'],
          label: el['opTypeName']
        }
      })
    },
    // 字段属性选择
    operationCodes () {
      return this.canUserDefinedItems.filter((el, index) => el.opType === this.editForm.type).map(el => {
        return {
          value: el['itemCode'],
          label: el['itemCode']
        }
      }).sort((a, b) => {
        return a.value > b.value
      })
    }
  },
  watch: {},
  methods: {
    // 初始化
    init () {
      this.getCustomizedItems()
      this.setTableHeight()
    },
    // 获取 Items
    getCustomizedItems () {
      return new Promise((resolve, reject) => {
        resolve(this.$register.getBeforeDispatchData(
          'getCustomizedItems',
          this.$store,
          this.$ajax,
          null,
          TABLE_DATA_URL
        ))
      })
    },
    // 修改 Items 并更新
    setCustomizedItems (oQuery) {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        TABLE_DATA_URL,
        'put',
        oQuery,
        this.getCustomizedItems,
        sErrorMessage => {
          // 提示信息。
          console.log(sErrorMessage)
          this.showMessage(sErrorMessage)
        }
      )
    },
    // 显示提示信息。
    showMessage (info) {
      this.$message({
        message: this.sErrorMessage || info,
        duration: 3000
      })
    },
    // 新增
    newItem () {
      this.editType = 0 // 新增
      this.openDialog()
    },
    // 打开 Dialog
    openDialog () {
      this.dialogVisible = true
      this.editForm = {
        type: '',
        code: '',
        name: ''
      }
    },
    // 编辑
    editItem (index) {
      this.editType = 1 // 编辑
      this.openDialog()
      this.editForm = {
        type: this.datas[index].opType,
        code: this.datas[index].itemCode,
        name: this.datas[index].itemName
      }
    },
    // 删除
    deleteItem (index = 0, oItemCode = undefined) {
      this.$confirm('确定是否删除该自定义条码(显示名称为空将删除)?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        let oQuery = {
          'items': [
            {
              'itemCode': oItemCode || this.datas[index].itemCode,
              'itemName': ''
            }
          ]
        }
        this.setCustomizedItems(oQuery)
        this.$nextTick(function () {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        this.dialogVisible = false
      })
      .catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      console.log(index)
    },
    // 保存事件。
    saveClickHandler () {
      if (this.editType === 0) { // 新增
        if (this.editForm.code && this.editForm.name) {
          console.log('保存')
          let oQuery = {
            'items': [
              {
                'itemCode': this.editForm.code,
                'itemName': this.editForm.name
              }
            ]
          }
          this.setCustomizedItems(oQuery)
          this.dialogVisible = false
        } else {
          this.$message({
            message: '字段属性不能为空，请重新选择',
            type: 'warning'
          })
        }
      } else if (this.editType === 1) { // 编辑
        if (!this.editForm.name) {
          this.deleteItem(undefined, this.editForm.code)
        } else {
          let oQuery = {
            'items': [
              {
                'itemCode': this.editForm.code,
                'itemName': this.editForm.name
              }
            ]
          }
          this.setCustomizedItems(oQuery)
          this.dialogVisible = false
        }
      }
    },
    // 保存当前状态（编辑或者非编辑）
    updateEdit (type) {
      this.$store.commit({
        type: 'updateEdit',
        key: type
      })
    },
    // 设置表格高度
    setTableHeight () {
      this.tableData.height = 100
      this.$nextTick(() => {
        this.tableData.height = outerHeight(document.querySelector('.table-wraps'))
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    next(vm => {
      // 初始化编辑状态
      vm.updateEdit(false)
    })
    next()
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`

    // 初始化编辑状态
    this.updateEdit(false)
    next()
  }
}
</script>

<style lang="less" scoped>
.content-wraps {
  padding: 20px;

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .title {
      display: inline-block;
      margin: 0 0;
    }
    .save-btn {
      margin: 0;
    }
  }

  .table-wraps {
    flex: 1;
    /deep/.el-table {
      .el-table__header-wrapper {
        .el-table__header {
          thead {
            th {
              height: 36px;
              background-color: #42af8f;
              box-sizing: border-box;
              padding: 0;
              .cell {
                background-color: #42af8f;
                color: #fff;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
  /deep/.field-dialog {
    .el-dialog {
      .el-dialog__body {
        padding: 10px 20px;
        .el-form {
          .el-form-item {
            margin-bottom: 5px;
            &:last-child{
              .el-form-item__content {
                width: 200px;
              }
            }
          }
        }
      }
      .el-dialog__footer {
        text-align: center;
        padding-top: 0;
      }
    }
  }
}
</style>
