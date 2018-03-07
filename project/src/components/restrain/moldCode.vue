<template>
	<div class="router-content suspicious moldCode" ref='moldCode'>
		<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="!isRestrained && !needRestrain">遏制</el-button>
		<el-button class="btn btn-plain btn-restrain" @click="showSuspiciousList" v-show="needRestrain">可疑品</el-button>
		<div class="innner-content" >
      <!-- <h2 class="title">模具记录</h2> -->
      <h2 class="content-title path-title" >
        <span :class="{ 'mold-list': !needRestrain }" @click="needRestrain = true,isRestrained = true">模具记录</span>
        <span class="suspected-list" v-if="!needRestrain"  @click="needRestrain = false">>可疑品列表。</span>
      </h2>
      <div class="moldInfo">
				<span>模具名称：{{moldInfo.moldName}}</span><span>规格：{{moldInfo.moldCode}}</span><span>模具额定寿命：{{moldInfo.moldLife}}</span>
			</div>
      <div class="mold-tabke">
        <el-table :data="tableData.data" :span-method="objectSpanMethod" border style="width: 100%" :height='tableHeight' ref="table" v-if="isRestrained">
          <el-table-column :prop="column.prop" :label="column.name" :width="column.width" :align="column.align?column.align:'center'" header-align='center' v-for="column in tableData.columns" :key="column.prop" >
            <template slot-scope="scope">
              <div v-if="column.prop === 'select' && scope.row[column.prop] !== null">
                <el-checkbox v-model="scope.row.value" @change="handleCheckChange(scope.row)"></el-checkbox>
              </div>
              <!-- 如果改行产出质量不是合格，那么改行的`动作`和`数量`标红 -->
              <div :class="[(scope.row['qualityType'] !== '合格') && (column.prop === 'eventName' || column.prop === 'quantity') ? 'ng' : '', 'td-cell']" v-else>{{scope.row[column.prop]}}</div>
            </template>
          </el-table-column>
        </el-table>
        <v-report v-if="!needRestrain" :hasData="setWidth" :noData="removeWidth" type='mold' :query='moldQuery'></v-report>        
      </div>
		</div>
	</div>

</template>

<script>
import report from 'components/report/report.vue'
import fnP from 'assets/js/public.js'
const moldUrl = window.HOST + `/api/v1/suppress/get-mold-resume`
// const moldUrl = `http://rap2api.taobao.org/app/mock/5395/POST/post-mold-resume`  // 模拟
// const moldUrl = `static/mold.json`  // 模拟
export default {
  components: {
    'v-report': report
  },
  data () {
    return {
      isRestrained: true,
      needRestrain: true,
      doDescription: '',
      url: window.HOST + '/api/v1/suppress/do-by-mold', // 根据模号
      styleObject: {
        'min-width': '1000px'
      },
      // 模具记录信息
      moldInfo: {
        moldCode: '',
        moldName: '',
        moldLife: ''
      },
      // 可疑品列表的查询条件
      moldQuery: {
        'endTime': '',
        'moldCode': '',
        'processCode': '',
        'startTime': ''
      },
      tableData: {
        columns: [{
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
          prop: 'eventName',
          name: '动作',
          width: '100',
          align: 'left'
        },
        {
          prop: 'operator',
          name: '操作人员',
          align: 'left',
          width: '100'
        },
        {
          prop: 'quantity',
          name: '产出数量',
          width: '100'
        },
        {
          prop: 'quantityAll',
          name: '区间产出数量',
          width: '100'
        },
        {
          prop: 'percent',
          name: '区间产出合格率',
          width: '100'
        },
        {
          prop: 'equipmentName',
          name: '设备',
          align: 'left',
          minWidth: '150'
        },
        {
          prop: 'materialName',
          name: '物料',
          align: 'left',
          minWidth: '150'
        },
        {
          prop: 'batchNo',
          name: '批次',
          align: 'left',
          minWidth: '100'
        }
        ],
        data: []
      },
      tableHeight: 500 // 表格高度
    }
  },
  computed: {
    isrestrainHtml () {
      return window.location.pathname.includes('restrain')
    },
    oQuery () {
      return this.$route.query
    }
  },
  created () {
    this.init()
    // window.addEventListener('resize', () => {
    //   this.$refs['table'].doLayout()
    // })
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.setTableHeight)
      this.setTableheight()
    })
  },
  destroyed () {
    // window.removeEventListener('resize', () => {
    //   this.$refs['table'].doLayout()
    // })
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function () {
      this.init()
      this.isRestrained = true
    }
  },
  methods: {
    // 根据添加渲染页面
    init () {
      let {endTime, moldCode, processCode, startTime} = this.moldQuery = fnP.parseQueryParam(this.oQuery)
      const oCondition = {endTime, moldCode, processCode, startTime}
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        moldUrl,
        'post',
        oCondition,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    requestSucess (oData) {
      let myData = {...oData}
      let needArr = []

      myData.moldDoOutList.forEach(element => {
        element.firstDoOut.percent = (element.quantityAll - element.quantityNoGood) * 100 / element.quantityAll.toFixed(2) + '%'  // 合格率
        element.firstDoOut.colspan = 1
        if (element.firstDoOut.qualityType !== '合格') {
          element.firstDoOut.eventName = `第一次产出（${element.firstDoOut.qualityType}）`  // 事件名称
        } else {
          element.firstDoOut.eventName = `第一次产出`  // 事件名称
        }

        element.firstDoOut.quantityAll = element.quantityAll          // 总数
        element.firstDoOut.equipmentName = element.equipmentName      // 设备名称
        element.firstDoOut.materialName = element.materialName        // 物料名称
        element.firstDoOut.batchNo = element.batchNo                  // 批次
        element.firstDoOut.select = 'first'                           // 有勾选框
        element.firstDoOut.value = false                              // 勾选框默认 false

        needArr.push(element.firstDoOut)
        if (element.lastDoOut === null || Object.keys(element.lastDoOut).length === 0) { // 最后一次生产不存在
          if (element.noGoodDoOutList.length === 0) {       // 最后一次生产不存在 && 不良品不存在
            element.firstDoOut.rowspan = 1
          } else {                                           // 最后一次生产不存在 && 不良品存在
            element.firstDoOut.rowspan = 1 + element.noGoodDoOutList.length
            element.noGoodDoOutList.forEach(el => {
              el.rowspan = el.colspan = 0
              el.value = false
              el.eventName = el.qualityType
            })
            needArr.push(...element.noGoodDoOutList)
          }
        } else {                                           // 最后一次生产存在
          if (element.lastDoOut.qualityType !== '合格') {
            element.lastDoOut.eventName = `最后一次产出（${element.lastDoOut.qualityType}）`  // 事件名称
          } else {
            element.lastDoOut.eventName = '最后一次产出'  // 事件名称
          }
          element.lastDoOut.select = 'last'                           // 有勾选框
          if (element.lastDoOut !== null && element.noGoodDoOutList.length === 0) {       // 最后一次生产存在 && 不良品不存在
            element.firstDoOut.rowspan = 1 + 1
            needArr.push(element.lastDoOut)
          } else {                                           // 最后一次生产存在 && 不良品存在
            element.firstDoOut.rowspan = 1 + element.noGoodDoOutList.length + 1
            element.noGoodDoOutList.forEach(el => {
              el.rowspan = el.colspan = 0
              el.value = false
              el.eventName = el.qualityType
            })

            needArr.push(...element.noGoodDoOutList)
            needArr.push(element.lastDoOut)
          }
        }
      })
      needArr.forEach(el => {
        if (el.select === undefined) {
          el.select = null
        }
      })
      myData.moldInfo.moldEventList.forEach(event => {
        event.rowspan = event.colspan = 1
        event.select = null
        event.value = false         // 模事件不显示勾选框
        event.qualityType = '合格'  // 模事件不改变行内信息颜色
        needArr.forEach((el, index) => {
          if (event.happenTime < el.happenTime) {
            needArr.splice(index, 0, event)
          } else if (event.happenTime > needArr[needArr.length - 1].happenTime) {
            needArr.push(event)
          }
        })
      })
      needArr.forEach((el, index) => {
        el.index = index
      })

      this.tableData.data = needArr
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      console.log(err)
      this.loading = false
      console.log('数据库查询出错。')
    },
    // 显示可疑品列表
    showSuspiciousList () {
      let startTime = ''
      let endTime = ''
      this.tableData.data.forEach(el => {
        if (el.select === 'first' && el.value === true) {
          startTime = el.happenTime
        } else if (el.select === 'last' && el.value === true) {
          endTime = el.happenTime
        }
      })
      if (startTime > endTime) {
        this.$message({
          showClose: true,
          message: '开始时间不能大于结束时间，请重新选择。',
          type: 'error'
        })
      } else {
        this.moldQuery.startTime = startTime
        this.moldQuery.endTime = endTime
        this.needRestrain = false
        this.isRestrained = false
        // this.moldQuery = {
        //   'endTime': '2018-01-26 00:00:00',
        //   'moldCode': 'ABCD',
        //   'processCode': '190',
        //   'startTime': '2018-01-15 00:00:00'
        // }
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

            this.$post(this.url, oConditions)
              .then(oData => {
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
                self.doDescription = ''
                sessionStorage.setItem('restrain', JSON.stringify(restrain))
                window.open(
                  '/restrainReport.html?' +
                    '_tag=' +
                    new Date()
                      .getTime()
                      .toString()
                      .substr(-5)
                )

                done()
              })
              .catch(err => {
                instance.confirmButtonLoading = false
                this.$message.error('遏制失败')
                self.doDescription = ''
                console.log(err)
                done()
              })
          } else {
            self.doDescription = ''
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
    // 合并单元格
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 5 || columnIndex === 6 || columnIndex === 7 || columnIndex === 8 || columnIndex === 9) { // 第5-9列需要合并单元格
        return {
          rowspan: row.rowspan,
          colspan: row.colspan
        }
      }
    },
    // 勾选
    handleCheckChange (row) {
      const select = row.select
      const value = row.value
      const index = row.index
      for (let i in this.tableData.data) {
        let el = this.tableData.data[i]
        if (el.value === value && el.index !== index && el.select === select && value === true) {
          el.value = !value
          return 0
        }
      }
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    // 设置高度
    setTableheight () {
      if (this.needRestrain) {
        this.tableHeight = 100
        this.$nextTick(() => {
          const allHeight = this.outerHeight(this.$refs.moldCode)
          // console.log(allHeight)
          const titleHeight = this.outerHeight(document.querySelector('.content-title'))
          const moldInfoHeight = this.outerHeight(document.querySelector('.moldInfo'))
          this.tableHeight = allHeight - titleHeight - moldInfoHeight - 20
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.moldCode {
  .btn-restrain {
    position: fixed !important;
    top: 104px;
    right: 40px !important;
  }
  .innner-content {
    .content-title {
      .mold-list {
        &:hover {
          color: #42af8f;
          cursor: pointer;
        }
      }
      .suspected-list {
        color: #42af8f;
      }
    }
    .moldInfo {
      margin: 0 0 15px 0;
    }
    /deep/.mold-tabke {
      .el-table {
        .el-table__header-wrapper {
          .el-table__header {
            th:first-child  {
              .cell {
                padding-left: 0px !important;
              }
            }
          }
        }
        .el-table__body-wrapper {
          .el-table__body {
            td:first-child  {
              .cell {
                padding-left: 0px !important;
              }
            }
          }
        }
      }
      
        
      td {
        .cell {
          .td-cell {
            padding: 0 10px;
            box-sizing: box-border;
          }
          .ng {
            color: #e60012
          }
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

  .moldInfo {
    margin: 0 0 10px 0;
    span {
      display: inline-block;
      & + span {
        margin-left: 60px;
      }
    }
  }
}

.message {
  textarea {
    font-family: "微软雅黑";
  }
}
</style>
