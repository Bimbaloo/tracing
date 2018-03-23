<!--质检-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="filter in filters" :key="filter[0]">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                </div>
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>质检记录</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('qtTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="qtTable">
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
// import {host} from 'assets/js/configs.js'

// var HOST = window.HOST ? window.HOST: host
const url = window.HOST + `/api/v1/quality/inspect/by-equipment-time`
// const url = `http://rap.taobao.org/mockjsdata/24404/quality/inspect/by-equipment-time?`
// const url = `static/a.json`

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
      tdResize: true, // 是否允许拖动table大小
      condition: {}, // 查询条件
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
      filters: {},
      /* 质检显示数据 */
      tableData: {
        filename: '质检记录',
        columns: [
          {
            name: '质检类型',
            prop: 'methodName',
            width: '80'
          },
          // {
          //     name: "设备编码",
          //     prop: "equipmentCode",
          //     width: ""
          // },
          {
            name: '设备名称',
            prop: 'equipmentName',
            width: ''
          },
          {
            name: '上报时间',
            prop: 'reportTime',
            width: '180'
          },
          {
            name: '检验时间',
            prop: 'commitTime',
            width: '180'
          },
          {
            name: '质检人',
            prop: 'operatorName',
            width: '120'
          },
          {
            name: '审核时间',
            prop: 'inspectedTime',
            width: '180'
          },
          {
            name: '审核人',
            prop: 'inspectorName',
            width: '120'
          },
          {
            name: '检验结果',
            prop: 'isPassName',
            width: ''
          }
          // ,{
          //     name: "检验项目",
          //     prop: "happenTime",
          //     width: "500",
          //     lists: [
          //         {
          //             itemName: "项目1",
          //             prop: "value0",
          //            // width: "200"
          //         },
          //         {
          //             itemName: "项目2",
          //             prop: "value1",
          //            // width: "300"
          //         }]
          // }
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
  updated () {},
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      // 当是质检时，更新数据
      if (to.meta.title === 'qtReport') {
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
      /* 为了将获取到的 barcode等转换为对应的中文 */
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
    // 请求成功。
    requestSucess (oData) {
      this.loading = false
      this.tableData.data = []

      let odata = oData // 获取到的data
      let obj = {
        name: '检验项目',
        width: '500',
        lists: []
      }

      odata.forEach(el => {
        /* 处理columns和data */
        let items = el.items
        let tdata = [] // 储存items里面的data
        items.forEach(item => {
          if (
            obj.lists.every(list => {
              return list.itemName !== item.itemName
            })
          ) {
            obj.lists.push({
              // 将获取到的检验项目的名称的 'encodeURI'编码作为该名称的 value值
              itemName: `${item.itemName}`,
              prop: encodeURI(`${item.itemName}`)
            })
          }
          tdata[encodeURI(`${item.itemName}`)] = item.value
        })
        let objData = Object.assign(el, tdata) // 合并获取正在的data
        this.tableData.data.push(objData)
      })

      // 判断是否需要添加column。
      if (!this.tableData.columns.some(o => o.name === obj.name)) {
        this.tableData.columns.push(obj)
      }

      this.setTbaleHeight()
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
      // 提示信息。
      console.log(sErrorMessage)
    },
    // 请求错误。
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
      // oQuery = {
      //     "equipmentId": "208",
      //     "startTime": "2017-05-03 08:19:30", //开始时间 格式：yyyy-MM-dd hh:mm:ss
      //     "endTime": "2017-05-03 08:19:30" //结束时间 格式：yyyy-MM-dd hh:mm:ss
      // }
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        url,
        'get',
        oQuery,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    // 表格导出。
    exportExcelHandle (oData, event) {
      if (!oData) {
        return
      }
      /* 将传入的json格式转化 */
      let copyData = this.cloneObj(oData)
      copyData.columns.forEach((column, index) => {
        if (column.lists && column.lists.length !== 0) {
          column.lists.forEach(function (el) {
            copyData.columns.push({
              name: `${el.itemName}`,
              prop: `${el.prop}`,
              width: `${el.width}`
            })
          })
          copyData.columns.splice(index, 1)
        }
      })
      // 下载表格。
      window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, copyData)
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
      if (this.$route.meta.title === 'qtReport') {
        this.routerContent = document.querySelectorAll(
          '.el-tabs'
        )[0].offsetHeight // 获取初始高度
        this.$nextTick(() => {
          this.tableHeight = this.adjustHeight()
        })
      }
    },
    /* 设置title */
    setTitle (el, title) {
      let elTds = document.querySelectorAll(el)
      elTds.forEach((el, index) => {
        if (elTds[index].tagName.toLocaleLowerCase() === 'td') {
          el.setAttribute('title', title)
        }
      })
    },
    /* 数组与对象深拷贝 */
    cloneObj (obj) {
      let str
      let newobj = obj.constructor === Array ? [] : {}
      if (typeof obj !== 'object') {
        return
      } else if (window.JSON) {
        str = JSON.stringify(obj) // 系列化对象
        newobj = JSON.parse(str) // 还原
      } else {
        for (var i in obj) {
          newobj[i] =
            typeof obj[i] === 'object' ? this.cloneObj(obj[i]) : obj[i]
        }
      }
      return newobj
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
