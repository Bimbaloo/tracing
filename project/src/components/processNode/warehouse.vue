<!--仓库操作-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick(true)"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="fullScreenClick(false)"  title="缩小"></i>
        </div>
        <div class="router-path">
            <span class="path-item">{{routerName}}</span>
        </div>
		<div class="router-content">
			<div class="innner-content" >
				<div class="content-message tableData">
					<span class='table-title'>
						<!-- <span>物料编码：{{node.code}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>物料名称：{{node.name}}</span> -->
					</span>
					<span class='table-handle'>
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('rawTable', materialData, $event)"></i>
						<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printAgTableHandle('rawTable', materialData, $event)"></i>
					</span>
				</div>
				<div class="content-table" ref="rawTable">
					<!-- <v-table :table-data="materialData" :loading="loading"  :resize="true" :heights="tableHeight"></v-table> -->
          <v-agtable
            ref="agTable"
            :table-data="materialData"
            :heights="tableHeight"
            :loading="loading"
          ></v-agtable>
				</div>
			</div>
    	</div>
    </div>
</template>

<script>
import table from 'components/basic/table.vue'
import agTable from 'components/basic/ag-table.vue'
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
// import html2canvas from 'html2canvas'
import rasterizeHTML from 'rasterizehtml'
import { needTableDatas } from 'assets/js/public.js'

export default {
  components: {
    'v-agtable': agTable,
    'v-table': table
  },
  data () {
    return {
      // 右下详情内容区域全屏标识。
      key: this.$route.params.key, // 全屏标志
      url: window.HOST + '/api/v1/trace/operation-detail/stock/by-id',
      excel: true,
      print: true,
      styleObject: {
        'min-width': '1000px'
      },
      // 物料节点信息
      node: {},
      loading: true,
      error: '',
      pathMapping: {
        101: '库存转储',
        102: '入库',
        103: '出库',
        111: '库存损益',
        112: '库存调整',
        23: '到货登记'
      },
      materialData: {
        // filename: '',
        columns: [],
        data: []
      },
      allColumns: {
        101: [
          {
            // 库存转储
            field: 'destBarcode',
            headerName: '条码'
          },
          {
            field: 'batchNo',
            headerName: '批次'
          },
          {
            field: 'srcWarehouseName',
            headerName: '原仓库'
          },
          {
            field: 'srcReservoir',
            headerName: '原库位',
            width: 80
          },
          {
            field: 'destWarehouseName',
            headerName: '新仓库'
          },
          {
            field: 'destReservoir',
            headerName: '新库位',
            width: 80
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ],
        102: [
          {
            // 入库
            field: 'destBarcode',
            headerName: '条码'
          },
          {
            field: 'batchNo',
            headerName: '批次'
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'destWarehouseName',
            headerName: '仓库'
          },
          {
            field: 'destReservoir',
            headerName: '库位',
            width: 80
          },
          {
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'vendorName',
            headerName: '供应商'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ],
        103: [
          {
            // 出库
            field: 'traceCode',
            headerName: '物流码'
          },
          {
            field: 'destBarcode',
            headerName: '条码'
          },
          {
            field: 'batchNo',
            headerName: '批次'
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'destWarehouseName',
            headerName: '仓库'
          },
          {
            field: 'destReservoir',
            headerName: '库位',
            width: 80
          },
          {
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'customerName',
            headerName: '客户'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ],
        111: [
          {
            field: 'destBarcode',
            headerName: '条码'
          },
          {
            field: 'batchNo',
            headerName: '批次'
          },
          {
            field: 'destWarehouseName',
            headerName: '仓库'
          },
          {
            field: 'destReservoir',
            headerName: '库位',
            width: 80
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ],
        112: [
          {
            field: 'srcBarcode',
            headerName: '源条码'
          },
          {
            field: 'destBarcode',
            headerName: '目标条码'
          },
          {
            field: 'batchNo',
            headerName: '批次'
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'destWarehouseName',
            headerName: '仓库'
          },
          {
            field: 'srcReservoir',
            headerName: '源条码库位'
          },
          {
            field: 'destReservoir',
            headerName: '目标条码库位',
            width: 80
          },
          {
            field: 'quantity',
            headerName: '调整数量'
          },
          {
            field: 'srcQuantity',
            headerName: '源条码调整后数量'
          },
          {
            field: 'destQuantity',
            headerName: '目标条码调整后数量'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ],
        // 到货登记。
        23: [
          {
            field: 'barcode',
            headerName: '条码'
          },
          {
            field: 'batchNo',
            headerName: '到货批次'
          },
          {
            field: 'rawBatchNo',
            headerName: '原料批次'
          },
          {
            field: 'materialName',
            headerName: '物料名称'
          },
          {
            field: 'materialCode',
            headerName: '物料编码'
          },
          {
            field: 'materialSpec',
            headerName: '物料规格'
          },
          {
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'destWarehouseName',
            headerName: '仓库'
          },
          {
            field: 'destReservoir',
            headerName: '库位'
          },
          {
            field: 'vendorName',
            headerName: '供应商'
          },
          {
            field: 'arrivalOrder',
            headerName: '到货单号'
          },
          {
            field: 'purchaseOrder',
            headerName: '采购单号'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'operationTime',
            headerName: '时间'
          }
        ]
      },
      tableHeight: 200
    }
  },
  computed: {
    // 上下移动轴
    resizeY () {
      return this.$store && this.$store.state.resizeY
    },
    // 全屏
    fullscreen () {
      return this.$store.state.fullscreen
    },
    treeFullscreen: function () {
      return this.$store && this.$store.state.treeFullscreen
    },
    // 节点上所有参数
    detailInfos () {
      return this.$store.state.detailInfos
    },
    // 节点类型
    nodeType () {
      return this.$store.state.nodeType
    },
    nodeKey () {
      return this.$store.state.key
    },
    // 点击次数
    clickNum () {
      return this.$store.state.clickNum
    },
    rawData () {
      return this.$store.state.rawData
    },
    // op_id 传给后端的参数
    operationIdList () {
      // let operationIdList = []
      // this.detailInfos.forEach(el => {
      //   operationIdList.push(el.opId)
      // })
      // return operationIdList
      return this.detailInfos.opIdList
    },
    // 显示的名称
    routerName () {
      let name = this.pathMapping[this.nodeType]
      return name
    }
  },
  created () {
    this.fetchData()
  },
  mounted () {
    this.tableHeight = this.setHeight()
  },
  watch: {
    // "clickNum": "fetchData",
    $route: function (to, from) {
      if (to.meta.title === 'warehouse') {
        this.fetchData()
      }
    },
    /* 视窗大小变化，重新设置table大小 */
    resizeY: function () {
      this.tableHeight = this.setHeight()
    },
    /* 全屏大小时，重新设置table大小 */
    fullscreen: function () {
      this.tableHeight = this.setHeight()
    },
    treeFullscreen: function () {
      if (!this.treeFullscreen) {
        this.$nextTick(() => {
          this.tableHeight = this.setHeight()
          this.$refs.agTable.option.api.doLayout()
        })
      }
    }
  },
  methods: {
    // 发起请求
    fetchData () {
      this.loading = true

      let oNode = this.rawData.nodeList.filter(o => o.key === this.nodeKey)[0] || {}
      this.node = {
        code: oNode.materialCode || '',
        name: oNode.name || ''
      }

      let oQuery = { operationIdList: this.operationIdList }
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        this.url,
        'post',
        oQuery,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    // 请求成功。
    requestSucess (oData) {
      // 更新 materialData
      let oTableData = needTableDatas(
        this.pathMapping,
        this.nodeType,
        this.allColumns
      )

      if (this.nodeType === 103) {
        // 若为出库
        if (!oData.stockOperationDetailList.some(o => o.traceCode)) {
          // 若物流码列为空，则隐藏该列。
          oTableData.columns = oTableData.columns.filter(o => o.field !== 'traceCode')
        }
      }
      oTableData.data = [].concat(oData.stockOperationDetailList)
      this.materialData = oTableData
      this.loading = false
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.materialData = needTableDatas(
        this.pathMapping,
        this.nodeType,
        this.allColumns
      )
      this.loading = false
      // 提示信息。
      this.error = '查无数据'
      console.warn(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.materialData = needTableDatas(
        this.pathMapping,
        this.nodeType,
        this.allColumns
      )
      this.loading = false
      this.error = '查无数据。'
      this.styleObject.minWidth = 0
      console.log(err)
    },
    // 表格导出。
    exportExcelHandle (sTable, oTableData, event) {
      // window.Rt.utils.exportMergeTable2Excel(
      //   XLSX,
      //   Blob,
      //   FileSaver,
      //   oTableData,
      //   this.$refs[sTable]
      // )
      window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oTableData, 'ag-table')
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
                        //  .el-table__body-wrapper tr:nth-child(even) {
                        //  background-color: #fafafa;
                        //  }
                        //  .el-table__body-wrapper tr:nth-child(odd) {
                        //     background-color: #fff;
                        //  }
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
                            .el-table__body-wrapper .batch .cell > div {
                                color: #f90;
                                font-weight: 600
                            }
                            .el-table__empty-block {
                                text-align: center;
                            }
                        </style>
                    </div>
                `

      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
    },
    // ag-table打印
    printAgTableHandle (refTable, oData, event) {
      let oTable = this.$refs[refTable]

      if (!oTable) {
        return false
      }

      let nWidth = document.body.clientWidth

      let sHeaderHtml = '<thead><tr>'

      oData.columns.forEach(o => {
        sHeaderHtml += `<th class="is-center"><div class="cell">${o.headerName}</div></th>`
      })

      sHeaderHtml += '</tr></thead>'

      // 表格内容
      let sBodyHtml = '<tbody>'
      oData.data.forEach(oRow => {
        sBodyHtml += `<tr class="el-table__row table-item">`

        oData.columns.forEach(oCol => {
          sBodyHtml += `<td class="is-center"><div class="cell"><div class="cell-content">${oCol.valueFormatter ? oCol.valueFormatter({data: oRow}) : oRow[oCol.field]}</div></div></td>`
        })
        sBodyHtml += '</tr>'
      })
      sBodyHtml += '</tbody>'

      // 不存在数据时
      let sEmpty = ''

      if (!oData.data.length) {
        sEmpty = `<div class="el-table__empty-block" width=${nWidth}><span class="el-table__empty-text">暂无数据</span></div>`
      }

      let sHtml = `
                <div class="table el-table">
                    <table cellspacing="0" cellpadding="0" border="0" width=${nWidth}>
                        ${sHeaderHtml}
                        ${sBodyHtml}
                    </table>
                    ${sEmpty}
                </div>
                <style>
                    .el-table td.is-center, .el-table th.is-center {
                        text-align: center;
                    }
                    .el-table td.is-left, .el-table th.is-left {
                        text-align: left;
                    }
                    .table thead th {
                        height: 36px;
                        background-color: #42af8f;
                    }
                    .table thead th .cell {
                        color: #fff;
                    }
                    .table tbody tr:nth-child(even) {
                        background-color: #fafafa;
                    }
                    .table tbody tr:nth-child(odd) {
                        background-color: #fff;
                    }
                    .table tbody td {
                        white-space: normal;
                        word-break: break-all;
                    }
                    .table tbody .cell {
                        min-height: 30px;
                        line-height: 30px;
                        // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                        //border: 1px solid #e4efec;
                        box-sizing: border-box;
                    }
                    .el-table__empty-block {
                        text-align: center;
                    }
                </style>
            `
      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    // 设置table的高度
    setHeight () {
      let content = document.querySelector('.router-content')
      let tableData = document.querySelector('.tableData')
      return this.outerHeight(content) - this.outerHeight(tableData) - 40
    },
    // 详情全屏按钮点击事件
    fullScreenClick (isTrue) {
      this.$store.commit({
        type: 'updateFullscreen',
        key: isTrue // true:全屏
      })
    }
  }
}
</script>

<style lang="less" scoped>
.material-stock {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .view-icon {
    position: absolute;
    cursor: pointer;
    top: 15px;
    right: 10px;
    z-index: 10;
  }

  .path-btn {
    position: absolute;
    top: 10px;
    right: 50px;
    z-index: 10;
  }
  .router-path {
    flex: 0 50px;
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #ccc;
    font-size: 16px;
    box-sizing: border-box;
  }

  /deep/.router-content {
    flex: 1 1;
    overflow: auto;
    .table-title {
      display: flex;
      align-items: center;
    }
    .innner-content {
      .tableData {
        display: flex;
        margin-top: 0;
        margin-bottom: -20px;
        flex-direction: row;
        justify-content: space-between;
        .table-handle {
          margin-right: 5px;
          display: flex;
          & > i {
            margin: 7.5px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
