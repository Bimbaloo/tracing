<template>
	<div class="router-content suspicious" ref='quality'>
		<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="!isRestrained && !needRestrain">遏制</el-button>
		<div class="innner-content" >
      <h2 class="content-title path-title" >
        <span :class="{ 'suspicious-list': !needRestrain }" @click="needRestrain = true,isRestrained = true">质检记录</span>
        <span class="suspected-list" v-if="!needRestrain"  @click="needRestrain = false">>可疑品列表。</span>
      </h2>
      <div class="suspicious-table">
        <v-table :table-data="tableData" :loading="tableLoading" :heights='tableHeight'></v-table>
        <v-report v-if="!needRestrain" :hasData="setWidth" :noData="removeWidth" type='mold' :query='moldQuery'></v-report>     
      </div>
		</div>
	</div>

</template>


<script>
import report from 'components/report/report.vue'
import table from 'components/basic/table.vue'
import fnP from 'assets/js/public.js'
const qualityUrl = `static/restrain/quality.json`
export default {
  components: {
    'v-report': report,
    'v-table': table
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
      // 可疑品列表的查询条件
      moldQuery: {
        'endTime': ''
      },
      tableData: {
        columns: [
          {
            prop: 'happenTime',
            name: '时间',
            width: '200'
          },
          {
            prop: 'type',
            name: '首检',
            width: '100',
            align: 'left'
          },
          {
            prop: 'report',
            name: '工单',
            align: 'left',
            width: '100'
          },
          {
            prop: 'equipmentName',
            name: '设备',
            align: 'left',
            minWidth: '150',
            class: 'batch',
            cellClick: this.equipmentNameTime
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
            prop: 'materialName',
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
        qualityUrl,
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
      let myData = [...oData]
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
                  '/restrainReport.html?' +
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
    /* 根据设备+时间查询 */
    equipmentNameTime (row) {
      console.log(row)
      console.log('根据设备+时间查询')
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
    // 设置高度
    setTableheight () {
      if (this.needRestrain) {
        this.tableHeight = 100
        this.$nextTick(() => {
          const allHeight = this.outerHeight(document.querySelector('.suspicious'))
          const titleHeight = this.outerHeight(document.querySelector('.content-title'))
          this.tableHeight = allHeight - titleHeight - 20
        })
      }
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

.table {
      .el-table__body-wrapper {
        .batch {
          cursor: pointer;
          color: #f90;
          .cell {
            font-weight: 600;
          }
        }
      }
    }
</style>
