<template>
  <div class="router-content">
    <div class="innner-content" :style="styleObject">
      <div class="condition" ref='condition'>
        <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
        </div>
      </div>
      <h2 class="content-title tableData">
        <span class='table-title'>事件记录</span>
        <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel"
                       @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print"
                       @click="printHandle('eventTable', $event)"></i>
                </span>
      </h2>
      <div class="content-table" ref="eventTable">
        <v-table :table-data="tableData" :heights="tableHeight" :loading="loading" :resize="tdResize"></v-table>
      </div>

    </div>
  </div>
</template>

<script>

  import XLSX from 'xlsx'
  import Blob from 'blob'
  import FileSaver from 'file-saver'
  // import html2canvas from 'html2canvas'
  import table from 'components/basic/table.vue'
  import rasterizeHTML from 'rasterizehtml'
  import _ from 'lodash'
  const url = window.HOST + '/api/v1/eventrecord/by-equipment-time'

  // const url = `http://rapapi.org/mockjsdata/24404/eventrecord/by-equipment-time?`;
  export default {
    components: {
      'v-table': table
    },
    data () {
      return {
        excel: true,
        print: true,
        loading: false,
        sErrorMessage: '',
        empty: '暂无数据。',
        styleObject: {
          //  "min-width": "2000px"
        },

        // loading: false,
        tdResize: true, // 是否允许拖动table大小
        condition: {}, // 查询条件
        filters: {},
        dataName: [
          // 条件对应中文名
          {
            itemCode: 'equipmentName',
            itemName: '设备'
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
        /* 事件 */
        tableData: {
          filename: '事件记录',
          columns: [
            {
              name: '状态',
              prop: 'statusName',
              width: '120'
            },
            {
              name: '事件分类',
              prop: 'eReasonTypeName',
              width: '120',
              filters: [],
              filterMethod: function (value, row, column) {
                const property = column['property']
                return row[property] === value
              }
            },
            {
              name: '事件原因',
              prop: 'eReasonName',
              width: '200'
            },
            {
              name: '发生时间',
              prop: 'happenTime',
              width: '200'
            },
            {
              name: '上报时间',
              prop: 'reportTime',
              width: '200'
            },
            {
              name: '上报人',
              prop: 'reportName',
              width: ''
            },
            {
              name: '确认时间',
              prop: 'checkTime',
              width: '200'
            },
            {
              name: '确认人',
              prop: 'checkName',
              width: ''
            },
            {
              name: '处理时间',
              prop: 'manageTime',
              width: '200'
            },
            {
              name: '处理人',
              prop: 'manageName',
              width: ''
            },
            {
              name: '结束时间',
              prop: 'endTime',
              width: '200'
            },

            {
              name: '关闭时间',
              prop: 'closeTime',
              width: '200'
            },
            {
              name: '关闭人',
              prop: 'closeName',
              width: ''
            }
          ],
          height: 1,
          data: []
        },
        tableHeight: 1,
        routerContent: 0
      }
    },
    created () {
      this.fetchData()
    },
    computed: {
      viewHeight: function () {
        return this.routerContent
      },
      resizeY: function () {
        return this.$store && this.$store.state.resizeY
      },
      fullscreen: function () {
        return this.$store && this.$store.state.fullscreen
      }
    },
    mounted () {
      this.routerContent = document.querySelectorAll('.el-tabs')[0].offsetHeight // 获取初始高度
      this.$nextTick(() => {
        this.tableHeight = this.adjustHeight()
      })
    },
    updated () {
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      $route: function (to, from) {
        // 当是质检时，更新数据
        if (to.meta.title === 'event') {
          this.fetchData()
        }
      },
      /* 上下拖动时，重新设置table大小变化 */
      resizeY: 'setTbaleHeight',
      /* 全屏大小时，重新设置table大小 */
      fullscreen: 'setTbaleHeight'
    },
    methods: {
      /* 查询条件转数组中文 */
      // 使用keep-alive时。 condition数据变化后，通过计算属性时filters数据没变。
      getFilters () {
        let filters = this.condition
        for (let i in filters) {
          if (filters[i] === '' || i === '_tag') {
            delete filters[i]
          }
        }
        /* 为了将获取到的barcode等转换为对应的中文 */
        let b = window.Rt.utils.getObjectEntries(filters)//Object.entries(filters)
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
      requestSuccess (oData) {
        this.loading = false
        this.tableData.data = oData
        console.log(oData)
        let eTypeColumnConfig = _.find(this.tableData.columns, one => one.prop === 'eReasonTypeName')
        eTypeColumnConfig.filters = _.map(_.filter(_.uniq(_.map(oData, 'eReasonTypeName'), one => !!one)), one => {
          return {text: one, value: one}
        })
        console.log(this.tableData.columns)
        this.setTbaleHeight()
      },
      requestFail (sErrorMessage) {
        this.loading = false
        // 提示信息。
        console.log(sErrorMessage)
      },
      requestError (err) {
        this.loading = false
        this.styleObject.minWidth = 0
        console.log('数据库查询出错。')
        console.log(err)
      },

      // 获取数据。
      fetchData () {
        this.loading = true
        let oQuery = {}
        Object.keys(this.$route.query).forEach(el => {
          if (el === 'equipmentId' || el === 'startTime' || el === 'endTime') {
            oQuery[el] = this.$route.query[el]
          }
          if (el === 'equipmentName' || el === 'startTime' || el === 'endTime') {
            this.condition[el] = this.$route.query[el]
          }
        })
        this.filters = this.getFilters()
        this.$register.sendRequest(
          this.$store,
          this.$ajax,
          url,
          'get',
          oQuery,
          this.requestSuccess,
          this.requestFail,
          this.requestError
        )

        // this.$get(url, oQuery)
        //     .then((res) => {
        //         this.loading = false;

        //         this.judgeLoaderHandler(res, () => {
        //             this.tableData.data = res.data.data
        //         });
        //     })
        //     .catch((err) => {
        //         this.loading = false;
        //         this.styleObject.minWidth = 0;
        //         console.log("数据库查询出错。")
        //     })
      },
      // 表格导出。
      exportExcelHandle (oData, event) {
        if (!oData) {
          return
        }
        // 下载表格。
        window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData)
      },
      // 表格打印。
      printHandle (refTable, event) {
        let oTable = this.$refs[refTable]

        if (!oTable) {
          return
        }

        let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${
          oTable.querySelector('.el-table__header-wrapper')
            .innerHTML
          }
                    </div>
                    <div class="el-table__body-wrapper">
                        ${
          oTable.querySelector('.el-table__body-wrapper')
            .innerHTML
          }
                    </div>
                    <style>
                        .el-table td.is-center, .el-table th.is-center {
                            text-align: center;
                        }
                        .table thead th {
                            height: 36px;
                            background-color: #42af8f;
                        }
                        .table thead th .cell {
                            color: #fff;
                        }
                        .el-table__body-wrapper tr:nth-child(even) {
                            background-color: #fafafa;
                        }
                        .el-table__body-wrapper tr:nth-child(odd) {
                            background-color: #fff;
                        }
                        .el-table__body-wrapper td {
                            white-space: normal;
                            word-break: break-all;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            // border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;
                        }
                    </style>
                </div>
            `

        window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
      },
      // 获取高度。
      adjustHeight () {
        let ntable = 0
        ntable = Math.floor(
          this.viewHeight -
          (document.querySelector('.condition')
            ? this.outerHeight(document.querySelector('.condition'))
            : 0) -
          (document.querySelector('.router-path')
            ? this.outerHeight(document.querySelector('.router-path'))
            : 0) -
          56 - //   this.outerHeight(document.querySelector(".content-title.outTitle"))
          20 - // 表格margin-bottom
          40
        )
        return ntable
      },
      /* 获取元素实际高度(含margin) */
      outerHeight (el) {
        var height = el.offsetHeight
        var style = el.currentStyle || getComputedStyle(el)

        height += parseInt(style.marginTop) + parseInt(style.marginBottom)
        return height
      },
      /* 设置table实际高度 */
      setTbaleHeight () {
        if (this.$route.meta.title === 'event') {
          this.routerContent = document.querySelectorAll(
            '.el-tabs'
          )[0].offsetHeight // 获取初始高度
          this.$nextTick(() => {
            this.tableHeight = this.adjustHeight()
          })
        }
      }
    }
  }
</script>

<style lang="less">
  .content-title.table-title {
    margin-top: 10px;
    margin-bottom: 0;
    color: #333;
    font-size: 14px;
    i {
      color: #ccc;
      float: right;
      &:first-child {
        transform: rotate(180deg);
        margin-left: 20px;
      }
    }
  }

  .content-title {
    .icon-print {
      right: auto;
    }
  }
</style>

<style lang="less" scoped>
.router-content {
  .innner-content {
    .condition {
      border: 2px solid #42af8f;
      padding: 20px 12px;
      margin-bottom: 20px;
    }
  }
}
  .tableData {
    display: flex;
    justify-content: space-between;
    .table-handle {
      margin-right: 5px;
      display: flex;
      align-items: center;
      i {
        margin: 7.5px;
        &:hover {
          cursor: pointer;
        }
      }
    }
    .table-table {
      i {
        margin: 5px;
      }
    }
  }
</style>
