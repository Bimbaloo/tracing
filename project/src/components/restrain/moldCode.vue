<template>
	<div class="router-content suspicious moldCode" ref='moldCode' v-loading="loading" element-loading-text="拼命加载中">
		<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="!isRestrained && !needRestrain && hasSupressionList">遏制</el-button>
		<el-button class="btn btn-plain btn-restrain" @click="showSuspiciousList" v-show="needRestrain && !isOpDbBeforeRefact">可疑品</el-button>
		<div class="innner-content" >
      <!-- <h2 class="title">模具记录</h2> -->
      <h2 class="content-title path-title" >
        <span :class="{ 'mold-list': !needRestrain }" @click="needRestrain = true,isRestrained = true">模具记录</span>
        <span class="suspected-list" v-if="!needRestrain"  @click="needRestrain = false">>可疑品列表</span>
      </h2>
      <div class="moldInfo" v-show="needRestrain" >
				<span>模具名称：{{moldInfo.moldName}}</span><span>模具额定寿命：{{moldInfo.moldLife}}</span>
			</div>
      <div class="condition" ref='condition' v-if="!needRestrain">
        <div class='condition-messsage'>
          <span v-for="(filter,index) in filters" :key="index">
            {{filter[0]}} : {{filter[1]}}
          </span>
        </div>
      </div>
      <div class="mold-table">
        <el-table :data="tableData.data" :span-method="objectSpanMethod" border style="width: 100%" :height='tableHeight' ref="table" v-show="isRestrained">
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
        <v-report v-if="!needRestrain" :hasData="setWidth" :noData="removeWidth" type='mold' :query='moldQuerys'></v-report>
      </div>
		</div>
	</div>

</template>

<script>
import report from 'components/report/report.vue'
import fnP from 'assets/js/public.js'
import _ from 'lodash'
const moldUrl = window.HOST + `/api/v1/suppress/get-mold-resume`
// const moldUrl = `http://rap2api.taobao.org/app/mock/5395/POST/post-mold-resume`  // 模拟
// const moldUrl = `static/mold.json`  // 模拟
export default {
  components: {
    'v-report': report
  },
  data () {
    return {
      loading: true,
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
        'equipmentName': '',
        'endTime': '',
        'moldCode': '',
        'processCode': '',
        'startTime': '',
        'equipmentId': ''
      },
      // 条件对应中文名
      dataName: [
        {
          itemCode: 'equipmentName',
          itemName: '设备'
        },
        {
          itemCode: 'moldCode',
          itemName: '模号'
        },
        {
          itemCode: 'startTime',
          itemName: '开始时间'
        },
        {
          itemCode: 'endTime',
          itemName: '结束时间'
        }
      ],
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
    // 版本信息数据。
    isOpDbBeforeRefact () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isOpDbBeforeRefact
      )
    },
    isrestrainHtml () {
      return window.location.pathname.includes('restrain')
    },
    oQuery () {
      return this.$route.query
    },
    // 以选项
    selected () {
      let arr = []
      this.tableData.data.forEach((el, $index) => {
        if (el.value) {
          arr.push({el, $index})
        }
      })
      return arr
    },
    filters () {
      let filters = JSON.parse(JSON.stringify(this.moldQuery))
      for (let i in filters) {
        if (filters[i] === '' || i === '_tag' || i === 'equipmentId' || i === 'processCode') {
          delete filters[i]
        }
      }
      /* 为了将获取到的 barcode等转换为对应的中文 */
      let b = window.Rt.utils.getObjectEntries(filters) // Object.entries(filters)
      let a = this.dataName

      b.forEach(o =>
        a.forEach(function (x) {
          if (o[0] === x.itemCode) {
            o[0] = x.itemName
          }
        })
      )
      return b
    },
    // 查询可疑品的
    moldQuerys () {
      let {equipmentId, moldCode, processCode, startTime, endTime} = this.moldQuery
      return {equipmentId, moldCode, processCode, startTime, endTime}
    },
    // 版本信息数据。
    hasSupressionList () {
      return (
        this.$store.state.supressionModule &&
        this.$store.state.supressionModule.hasSupressionList
      )
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
      this.needRestrain = true
      this.isRestrained = true
    }
  },
  methods: {
    // 根据添加渲染页面
    init () {
      this.loading = true
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
      this.tableData.data = []
      if (myData.moldDoOutList.length === 0 && myData.moldInfo === null) {
        this.$message({
          showClose: true,
          message: '查询结果为空，请选择合适的查询条件',
          type: 'error'
        })
      } else {
        /* 获取模具信息 */
        let {moldCode, moldName, moldLife} = myData.moldInfo
        this.moldInfo = {moldCode, moldName, moldLife}
        let needArr = []

        myData.moldDoOutList.forEach(element => {
          element.firstDoOut.percent = ((element.quantityAll - element.quantityNoGood) * 100 / element.quantityAll).toFixed(2) + '%'  // 合格率
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
          element.firstDoOut.equipmentId = element.equipmentId          // 设备ID
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
            element.lastDoOut.equipmentId = element.equipmentId         // 设备ID
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
        let needArrCopy = JSON.parse(JSON.stringify(needArr))
        myData.moldInfo.moldEventList.forEach(event => {
          event.rowspan = event.colspan = 1
          event.select = null
          event.value = false         // 模事件不显示勾选框
          event.qualityType = '合格'  // 模事件不改变行内信息颜色
          _.forEach(needArrCopy, (el, index) => {
            if (event.happenTime < el.happenTime) {
              needArr.splice(index, 0, event)
              return false
            } else if (event.happenTime > needArrCopy[needArrCopy.length - 1].happenTime) {
              needArr.push(event)
              return false
            }
          })
        })
        needArr.forEach((el, index) => {
          el.index = index
        })

        this.tableData.data = needArr
      }
      this.loading = false
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
      const length = this.selected.length
      switch (length) {
        case 0:     // 没有选中条件
          this.$message({
            showClose: true,
            message: '请选择可疑品范围',
            type: 'error'
          })
          break
        case 1:     // 选中了一条
          if (this.selected[0].el.select === 'first') {
            this.moldQuery.startTime = this.selected[0].el.happenTime
            this.moldQuery.endTime = new Date().Format()   // 将当期时间当做结束时间
            this.moldQuery.equipmentId = this.selected[0].el.equipmentId
            this.moldQuery.equipmentName = this.selected[0].el.equipmentName
            this.needRestrain = false
            this.isRestrained = false
          } else {  // 如果选中的是`最后一次`产出的话
            this.$message({
              showClose: true,
              message: '请选择开始时间',
              type: 'error'
            })
          }

          break
        case 2:     // 选中了两条
          if (this.selected[0].el.select === 'first' && this.selected[0].el.equipmentId === this.selected[1].el.equipmentId) {  // 以选项中开始时间大于结束时间 && 设备ID相同
            this.moldQuery.startTime = this.selected[0].el.happenTime
            this.moldQuery.endTime = this.selected[1].el.happenTime
            this.moldQuery.equipmentId = this.selected[0].el.equipmentId
            this.moldQuery.equipmentName = this.selected[0].el.equipmentName
            this.needRestrain = false
            this.isRestrained = false
          } else if (this.selected[0].el.equipmentId !== this.selected[1].el.equipmentId) {  // 以选项中设备ID不同
            this.$message({
              showClose: true,
              message: '请选择相同设备',
              type: 'error'
            })
          } else {
            this.$message({
              showClose: true,
              message: '结束时间不能小于开始时间',
              type: 'error'
            })
          }
          break
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
              this.moldQuery
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
                const handle = oData.handle
                sessionStorage.setItem('handleID', handle)
                instance.confirmButtonLoading = false
                this.$message.success('遏制成功')
                let restrain = {
                  ...this.moldQuery,
                  ...{
                    handleID: handle,
                    description: this.doDescription,
                    suppressTime: new Date().Format('yyyy-MM-dd hh:mm:ss')
                  }
                }
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
                console.log(err)
                done()
              },
              this.requestError
            )
          } else {
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
      console.log(row)
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
    .condition {
      border: 2px solid #42af8f;
      padding: 20px 12px;
      margin-bottom: 30px;

      span {
        display: inline-block;
        & + span {
          margin-left: 30px;
        }
      }
    }
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
    /deep/.mold-table {
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
            color: #eb0920
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
