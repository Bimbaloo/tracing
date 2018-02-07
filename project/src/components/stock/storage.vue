<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content">
            <h2 class="content-title tableData">
                <span class='table-title'>出库信息</span>
               	<span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outstockData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outstockTable', $event)"></i>
                </span>
            </h2>
            <div v-if="outstockData.error" class="error" :style="styleError">
                {{ outstockData.error }}
            </div>
            <div v-else class="content-table" ref="outstockTable">
            	<v-table :table-data="outstockData" :heights="tableHeight" :loading="outstockData.loading" :resize="tdResize"></v-table>            
                <v-dialogTable :dialog-data="dialogData" :heights="dialogData.height"  v-on:dialogVisibleChange="visibleChange"></v-dialogTable>        
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>入库信息</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(instockData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('instockTable', $event)"></i>
                </span>
            </h2>
            <div v-if="instockData.error" class="error" :style="styleError">
                {{ instockData.error }}
            </div>
            <div v-else class="content-table" ref="instockTable">
            	<v-table :table-data="instockData" :heights="tableHeight" :loading="instockData.loading" :resize="tdResize"></v-table>
            </div>
            <!-- 复制的内容 -->
            <!--<div v-show="false" ref="outstockTable">
            	<v-table :b-fixed="false" :table-data="outstockData" :loading="outstockData.loading"></v-table>
            </div>
            <div v-show="false" ref="instockTable">
            	<v-table :b-fixed="false" :table-data="instockData" :loading="instockData.loading"></v-table>
            </div>-->
        </div>
    </div>      
</template>

<script>

import table from 'components/basic/table.vue'
import dialogTable from 'components/basic/dialogTable.vue'
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
import rasterizeHTML from 'rasterizehtml'
import fnP from 'assets/js/public.js'

export default {
  components: {
    'v-table': table,
    'v-dialogTable': dialogTable
  },
  data () {
    return {
      key: this.$route.params.key,
      tag: this.$route.query._tag,
      styleError: {
        'max-height': '200px'
      },
      excel: true,
      print: true,
      tdResize: true,
      tableHeight: 100,
      outstockData: {
        url: window.HOST + '/api/v1/outstock',
        loading: false,
        error: null,
        filename: '出库',
        columns: [
          {
            prop: 'barcode',
            name: '条码',
            width: '220',
            fixed: true
            // },{
            // prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
            // name: "条码类型"
          },
          {
            prop: 'batchNo',
            name: '批次',
            width: '180',
            class: 'batch',
            cellClick: this.batchClick
          },
          {
            prop: 'materialCode',
            name: '物料编码',
            width: '160'
          },
          {
            prop: 'materialName',
            name: '物料名称',
            width: '300'
          },
          {
            prop: 'quantity',
            name: '数量'
          },
          {
            prop: 'stock',
            name: '仓库'
          },
          {
            prop: 'stocklot',
            name: '库位'
          },
          {
            prop: 'customer',
            name: '客户'
          },
          {
            prop: 'stockType',
            name: '出库类型'
          },
          {
            prop: 'person',
            name: '出库人'
          },
          {
            prop: 'createTime', // 格式：yyyy-MM-dd hh:mm:ss
            name: '出库时间',
            width: '160'
          }
        ],
        data: []
        // {
        //     "logId":59320,
        //     "barcode":"5CK2612674413170727165530",
        //     "barcodeTypeName":"单件码",
        //     "batchNo":"P170719-LTG_r-0014",
        //     "materialCode":"10000151",
        //     "materialName":"ZC/LTG 2L 活塞总成/环销卡簧连杆/12626989",
        //     "quantity": 1,
        //     "stock":"成品库",
        //     "stocklot":"A01",
        //     "customer":'上汽通用',
        //     "opType":1,
        //     "stockType":"库存发货",
        //     "person":"sysadmin",
        //     "createTime":"2017-08-01 08:32:40",
        //     "reportStockType":null
        // }
      },
      instockData: {
        url: window.HOST + '/api/v1/instock',
        loading: false,
        error: null,
        columns: [
          {
            prop: 'barcode',
            name: '条码',
            width: '220',
            fixed: true
            // },{
            // prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
            // name: "条码类型"
          },
          {
            prop: 'batchNo',
            name: '批次',
            width: '180',
            class: 'batch',
            cellClick: this.batchClick
          },
          {
            prop: 'materialCode',
            name: '物料编码',
            width: '160'
          },
          {
            prop: 'materialName',
            name: '物料名称',
            width: '300'
          },
          {
            prop: 'quantity',
            name: '数量',
            width: '50'
          },
          {
            prop: 'remainingNum',
            name: '库存余量'
          },
          {
            prop: 'stock',
            name: '仓库'
          },
          {
            prop: 'stocklot',
            name: '库位'
          },
          {
            prop: 'customer',
            name: '客户',
            width: '50'
          },
          {
            prop: 'stockType',
            name: '入库类型'
          },
          {
            prop: 'person',
            name: '入库人'
          },
          {
            prop: 'createTime', // 格式：yyyy-MM-dd hh:mm:ss
            name: '入库时间',
            width: '160'
          }
        ],
        data: []
      },
      /* 模拟序号数据 */
      dialogData: {
        dialogVisible: false,
        height: '100%',
        columns: [
          {
            prop: 'barcode',
            name: '条码'
          },
          {
            prop: 'batchNo',
            name: '批次',
            class: 'batch'
          }
        ],
        data: [
          {
            barcode: '1',
            batchNo: 'batchNo'
          }
        ]
      }
    }
  },
  mounted () {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    this.fetchPage()
    window.addEventListener('resize', this.setTableHeight)
    this.$nextTick(() => {
      this.setTableHeight()
    })
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      this.key = this.$route.params.key

      // 不是从后面同批入库及遏制中进入的都要重新获取数据
      let toTitle = to.meta.title
      let fromTitle = from.meta.title

      // 从查询按钮进入查询时的处理。
      // 查出库: 从可疑品(restrain)或同批次入库(batch)中进入，则不会重新请求
      if (
        toTitle === 'storage' &&
        (fromTitle === 'storage' ||
          (to.query._tag !== undefined && this.tag !== to.query._tag))
      ) {
        this.tag = to.query._tag
        this.fetchPage()
      }
    }
  },
  methods: {
    // 条码点击。
    barcodeClick (row) {
      // 若为箱码。
      if (row.barcodeTypeName === '2') {
        this.dialogData.dialogVisible = !this.dialogData.dialogVisible
      }
    },
    // 点击批次
    batchClick (row) {
      // 如果批次数据存在，则可点击。
      if (row.batchNo) {
        this.$router.replace({
          path: `/stock/${this.key}/batch`,
          query: { materialCode: row.materialCode, batchNo: row.batchNo }
        })
      }
    },
    // 获取高度。
    // adjustHeight () {
    //   let jRouter = $('.router-content')
    //   let jTitle = jRouter.find('.content-title')
    //   let jTable = jRouter.find('.content-table')
    //   let nHeight = 0

    //   nHeight = Math.floor(
    //     (jRouter.height() -
    //       jTitle.outerHeight(true) * jTitle.length -
    //       (jTable.outerHeight(true) - jTable.height())) /
    //       2
    //   )

    //   return nHeight
    // },
    // 查询。
    fetchPage () {
      this.fetchData(this.outstockData)
      this.fetchData(this.instockData)
    },
    // 获取数据。
    fetchData (oData) {
      oData.error = null
      oData.data = []
      // oData.height = this.adjustHeight()
      oData.loading = true

      let sPath = oData.url

      switch (this.key) {
        // 条码。
        case '1':
          sPath += '/bybarcode'
          break
        // 批次。
        case '2':
          sPath += '/bybatch'
          break
        // 出库时间。
        case '3':
          sPath += '/byouttime'
          break
        // 入库时间。
        case '4':
          sPath += '/byintime'
          break
        default:
          break
      }

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        sPath,
        'post',
        fnP.parseQueryParam(this.$route.query),
        oResult => {
          // 请求成功。
          oData.loading = false
          oData.data = oResult

          // 设置批次的鼠标样式
          this.$nextTick(function () {
            // 设置批次为空时，鼠标样式。
            var aBatch = document.querySelectorAll('.batch')
            for (var i = 0; i < aBatch.length; i++) {
              let oCell = aBatch[i].querySelector('.cell')
              if (oCell && !oCell.innerHTML) {
                aBatch[i].style.cursor = 'default'
              }
            }
          })
        },
        sErrorMessage => {
          // 请求失败。
          oData.loading = false
          this.styleError.maxHeight = this.setTableHeight() - 50 + 'px'
          // 提示信息。
          console.log(sErrorMessage)
        },
        err => {
          // 请求错误。
          oData.loading = false
          console.log('接口查询出错。')
          console.log(err)

          if (this.outstockData.error && this.instockData.error) {
            this.styleError.maxHeight = this.setTableHeight() - 50 + 'px'
          }
        }
      )
    },
    visibleChange () {
      this.dialogData.dialogVisible = !this.dialogData.dialogVisible
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
                        ${oTable.querySelector('.el-table__header-wrapper').innerHTML}
                    </div>
                    <div class="el-table__body-wrapper">
                        ${oTable.querySelector('.el-table__body-wrapper').innerHTML}
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
    // 设置高度
    setTableHeight () {
      this.tableHeight = 100
      this.$nextTick(() => {  // 确保屏幕缩小时，不会因为内容撑开导致高度设置失败
        const viewHeight = fnP.outerHeight(document.querySelector('.router-content'))
        let titleHeight = 0
        document.querySelectorAll('.tableData').forEach(el => {
          titleHeight += fnP.outerHeight(el)
        })
        this.tableHeight = (viewHeight - titleHeight) / 2 - 10
        const residue = (viewHeight - titleHeight) / 2  // 剩余高度，显示错误的高度
        return residue
      })
    }
  }
}
</script>

<style lang="less">
.router-content {
  flex: 1 1;
  overflow: auto;

  .icon {
    margin-left: 10px;
    position: relative;
    top: -2px;
    cursor: pointer;

    &.disabled {
      &.icon-print:hover {
        background-position: 0 0;
      }
      &.icon-excel:hover {
        background-position: 0 -40px;
      }
    }
  }
  .table {
    .el-table__body-wrapper {
      .clicked {
        cursor: pointer;
        color: #f90;
      }
    }
  }

  .error {
    border: 2px solid #42af8f;
    padding: 20px 12px;
    margin-bottom: 30px;
    font-size: 14px;
    color: red;
    overflow: auto;
  }
}
</style>
<style lang="less" scoped>
.tableData {
  display: flex;
  justify-content: space-between;
  .table-handle {
    margin-right: 5px;
    display: flex;
    align-items: center;
    i {
      margin: 7.5px;
    }
  }
  .table-table {
    i {
      margin: 5px;
    }
  }
}
</style>
