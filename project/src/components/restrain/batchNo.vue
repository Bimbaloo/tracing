<template>
	<div class="router-content suspicious" ref='workOrders'>
		<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="!isRestrained && !needRestrain">遏制</el-button>
		<div class="innner-content" >
      <h2 class="content-title path-title" >
        <span :class="{ 'suspicious-list': !needRestrain }" @click="needRestrain = true,isRestrained = true">工单</span>
        <span class="suspected-list" v-if="!needRestrain"  @click="needRestrain = false">>可疑品列表</span>
      </h2>
      <div class="suspicious-table">
        <el-table :data="tableData.data" border style="width: 100%" :height='tableHeight' ref="table" v-if="isRestrained" @cell-click="cellClick">
          <el-table-column :prop="column.prop" :label="column.name" :width="column.width" :align="column.align?column.align:'center'" header-align='center' v-for="column in tableData.columns" :key="column.prop" :class-name="column.class">
            <template slot-scope="scope" >
              <div v-if="column.prop === 'select'">
                <el-checkbox v-model="scope.row.select" @change="handleCheckChange(scope.row,scope)"></el-checkbox>
              </div>
              <div :class="['td-cell']" v-else>{{scope.row[column.prop]}}</div>
            </template>
          </el-table-column>
        </el-table>
        <v-report v-if="!needRestrain" :hasData="setWidth" :noData="removeWidth" type='mold' :query='moldQuery'></v-report>
        <div class="btn-box">
          <el-button class="btn btn-plain suspicion" @click="showSuspiciousList" v-show="needRestrain">可疑品</el-button>  
        </div>   
      </div>
		</div>
    <el-dialog :visible.sync="dialogFormVisible" width='400px' id="dialog" top='20vh'>
      <el-form :model="ruleForm" label-position="right" label-width="80px">
        <el-form-item label="设备">
          <el-input v-model="ruleForm['material']" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="ruleForm['startTime']" type="datetime" placeholder="选择开始时间" value-format="yyyy-MM-dd hh:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="ruleForm['endTime']" type="datetime" placeholder="选择结束时间" value-format="yyyy-MM-dd hh:mm:ss"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="btn" type="primary" @click="dialogFormVisible = false">确 定</el-button>        
        <el-button class="btn" @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
	</div>

</template>


<script>
import report from 'components/report/report.vue'
import table from 'components/basic/table.vue'
import fnP from 'assets/js/public.js'
import Input from 'components/basic/input.vue'
import DateTime from 'components/basic/dateTime.vue'
const workOrdersUrl = `static/restrain/workOrders.json`
export default {
  components: {
    'v-report': report,
    'v-table': table,
    'v-input': Input,
    'v-datetime': DateTime
  },
  data () {
    return {
      dialogFormVisible: false,                         // dialog是否显示
      isRestrained: true,
      needRestrain: true,
      doDescription: '',                                // 遏制描述
      url: window.HOST + '/api/v1/suppress/do-by-mold', // 根据模号
      styleObject: {
        'min-width': '1000px'
      },
      // 查询可疑品的条件
      ruleForm: {
        'material': '',
        'startTime': '',
        'endTime': ''
      },
      tableData: {
        columns: [
          {
            prop: 'select',
            name: '选择',
            width: '50'
          },
          {
            prop: 'happenTime',
            name: '时间',
            width: '200'
          },
          {
            prop: 'ID',
            name: '质检单id',
            width: '200'
          },
          {
            prop: 'type',
            name: '首检',
            width: '100',
            align: 'left'
          },
          {
            prop: 'equipment',
            name: '设备',
            align: 'left',
            minWidth: '150'
          },
          {
            prop: 'sourceCode',
            name: '来源条码',
            align: 'left',
            minWidth: '150',
            class: 'batch',
            cellClick: this.sourceCode
          },
          {
            prop: 'material',
            name: '物料',
            align: 'left',
            minWidth: '150'
          },
          {
            prop: 'batchNo',
            name: '批次',
            align: 'left',
            minWidth: '100',
            class: 'batch',
            cellClick: this.batchNo
          },
          {
            prop: 'quantity',
            name: '数量',
            width: '100'
          },
          {
            prop: 'result',
            name: '检验结果',
            width: '100'
          },
          {
            prop: 'handling',
            name: '处置方式',
            width: '100'
          },
          {
            prop: 'person',
            name: '检验人',
            width: '100'
          },
          {
            prop: 'items',
            name: '检验项目',
            width: '100'
          },
          {
            prop: 'surveyReport',
            name: '检验报告',
            width: '100',
            class: 'batch',
            cellClick: this.surveyReport
          }
        ],
        data: []
      },
      tableHeight: 500, // 表格高度
      tableLoading: true
    }
  },
  computed: {
    isrestrainHtml () {
      return window.location.pathname.includes('restrain')
    },
    oQuery () {
      return this.$route.query
    },
    // 以选项
    selected () {
      let arr = []
      this.tableData.data.forEach((el, index) => {
        if (el.select) {
          arr.push({el, index})
        }
      })
      return arr
    }

  },
  created () {
    this.init()
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.setTableHeight)
      this.setTableheight()
    })
  },
  methods: {

    // 根据添加渲染页面
    init () {
      let oCondition = this.moldQuery = fnP.parseQueryParam(this.oQuery)
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        workOrdersUrl,
        'get',
        oCondition,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    requestSucess (oData) {
      // debugger
      this.tableLoading = false
      let myData = oData.map(el => {
        let obj = {}
        obj = Object.assign({}, {'material': `${el.materialCode}:${el.materialName}`}, {'select': false}, el)
        return obj
      })
      this.tableData.data = myData
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.tableLoading = false
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      console.log(err)
      this.tableLoading = false
      console.log('数据库查询出错。')
    },
    // 显示可疑品列表
    showSuspiciousList () {
      const length = this.selected.length
      switch (length) {
        case 0:
          this.$message({
            message: '请选择设备和时间',
            type: 'warning'
          })
          break
        case 1:
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.ruleForm.material = this.selected[0].el.material
            this.ruleForm.startTime = this.selected[0].el.happenTime
          })
          break
        case 2:
          if (this.selected[0].el.materialCode === this.selected[1].el.materialCode) {  // 设备相同
            this.dialogFormVisible = true
            this.$nextTick(() => {
              this.ruleForm.material = this.selected[0].el.material
              this.ruleForm.startTime = this.selected[0].el.happenTime
              this.ruleForm.endTime = this.selected[1].el.happenTime
            })
          } else {
            this.$message({
              message: '所选择的的设备不相同，请确认后重新选择',
              type: 'warning'
            })
          }
      }
    },
    // 遏制。
    suppres () {
      const h = this.$createElement
      let self = this
      this.$msgbox({
        title: '提示',
        message: h('el-input', {
          attrs: {
            type: 'textarea',
            rows: 4,
            placeholder: '请输入遏制描述信息'
          },
          class: {
            message: true
          },
          domProps: {
            value: self.doDescription
          },
          on: {
            blur: function (event) {
              self.doDescription = event.target.value
            }
          }
        }),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '遏制中...'
            let oConditions = Object.assign(
              { doDescription: self.doDescription },
              this.$route.query
            )

            this.$register.sendRequest(
              this.$store,
              this.$ajax,
              this.url,
              'post',
              oConditions,
              oData => {
                console.log(oData)
                this.isRestrained = false
                const handle = oData.data.data.handle
                sessionStorage.setItem('handleID', handle)
                instance.confirmButtonLoading = false
                this.$message.success('遏制成功')
                let restrain = {
                  ...this.$route.query,
                  ...{
                    handleID: handle,
                    description: this.doDescription,
                    suppressTime: new Date().Format('yyyy-MM-dd hh:mm:ss')
                  }
                }
                // self.doDescription = ''
                sessionStorage.setItem('restrain', JSON.stringify(restrain))
                window.open(
                  'restrainReport.html?' +
                    '_tag=' +
                    new Date()
                      .getTime()
                      .toString()
                      .substr(-5)
                )

                done()
              },
              err => {
                instance.confirmButtonLoading = false
                this.$message.error('遏制失败')
                // self.doDescription = ''
                console.log(err)
                done()
              },
              this.requestError
            )
          } else {
            // self.doDescription = ''
            done()
          }
        }
      })
    },
    setWidth () {
      this.styleObject.minWidth = '1000px'
    },
    removeWidth () {
      this.styleObject.width = 0
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    /* 根据来源码查询 */
    sourceCode (row) {
      console.log(row)
      console.log('根据来源码查询')
    },
    /* 根据批次查询 */
    batchNo (row) {
      console.log(row)
      console.log('根据来源码查询')
    },
    /* 质检报告 */
    surveyReport (row) {
      console.log(row)
      console.log('跳转到质检报告')
    },
    /* 勾选项 */
    handleCheckChange (row, scope) {
      const $index = scope.$index
      if (this.selected.length > 2) {
        if (this.selected[0].index === $index) {
          this.tableData.data[this.selected[1].index].select = false
        } else {
          this.tableData.data[this.selected[0].index].select = false
        }
      }
    },
    // 设置高度
    setTableheight () {
      if (this.needRestrain) {
        this.tableHeight = 100
        this.$nextTick(() => {
          const allHeight = this.outerHeight(document.querySelector('.suspicious'))
          const titleHeight = this.outerHeight(document.querySelector('.content-title'))
          const btnBoxHeight = this.outerHeight(document.querySelector('.btn-box'))
          this.tableHeight = allHeight - titleHeight - btnBoxHeight
        })
      }
    },
    // 传入单元格点击事件
    cellClick (row, column, cell, event) {
      let oColumn =
        this.tableData.columns.filter(o => o.prop === column.property)[0] ||
        this.tableData.columns
          .find(o => o.lists)
          .lists.filter(o => o.prop === column.property)[0]
      oColumn.cellClick && oColumn.cellClick(row)
    }

  }
}
</script>


<style lang="less" scoped>
.suspicious {
  .btn-restrain {
    position: fixed !important;
    top: 104px;
    right: 40px !important;
  }
  .innner-content {
    .content-title {
      .suspicious-list {
        &:hover {
          color: #42af8f;
          cursor: pointer;
        }
      }
      .suspected-list {
        color: #42af8f;
      }
    }
    /deep/.suspicious-table {
      .el-table {
        .el-table__header-wrapper {
          .el-table__header {
            th {
              height: 36px;
              box-sizing: border-box;
              padding: 0;
            }
            th:first-child  {
              .cell {
                padding-left: 0px !important;
              }
            }
          }
        }
        .el-table__body-wrapper {
          .el-table__body {
            .el-table__row {
              td {
                box-sizing: border-box;
                padding: 0;
              }
              td.batch {
                cursor: pointer;
                .cell {
                  font-weight: 600;
                  color: #f90;
                }
              }
            }
            td:first-child  {
              .cell {
                padding-left: 0px !important;
              }
            }
          }
        }
      }
      .btn-box {
        display: flex;
        justify-content: center;
        margin: 10px 0;
      }
    }
  }
  /deep/ #dialog {
    .el-dialog{
      .el-dialog__body {
        margin-top: 10px;
        .el-form {
          .el-form-item {
            margin-bottom: 10px;
            .el-form-item__content {
              .el-input {
                width: 280px;
              }
            }
          }
        }
      }
      .el-dialog__footer {
        .dialog-footer {
          display: flex;
          justify-content: center;
        }
      }
    }
  }
}
.el-message-box {
  .el-textarea__inner {
    border-radius: 0;
  }
  .el-button {
    border-radius: 0;
    padding: 7px 15px;
  }
  .el-message-box__headerbtn {
    padding: 0;
    border: none;
  }
  .el-message-box__content {
    padding: 0 20px;
  }
}

.router-content {
  flex: 1 1;
  overflow: auto;
  position: relative;

  .btn-restrain {
    position: absolute;
    right: 20px;
    //	top: 45px;
  }
}

.message {
  textarea {
    font-family: "微软雅黑";
  }
}

</style>
