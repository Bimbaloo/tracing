<!--车间操作-->
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
						<span>物料编码：{{materialCode}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>物料名称：{{materialName}}</span>
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
  data () {
    return {
      // 右下详情内容区域全屏标识。
      key: this.$route.params.key, // 全屏标志
      excel: true,
      print: true,
      styleObject: {
        'min-width': '1000px'
      },
      loading: true,
      error: '',
      pathMapping: {
        2: '结转转入',
        7: '结转转出',
        8: '退料',
        11: '车间调整',
        14: '返工入站',
        15: '返工出站',
        10002: '结转'
      },
      urls: [
        window.HOST + '/api/v1/trace/operation-detail/workshop/by-id', // 车间接口
        window.HOST + '/api/v1/trace/operation-detail/turn-inout/by-id', // 结转接口
        window.HOST + '/api/v1/trace/operation-detail/inout/by-id' // 投产接口
      ],
      materialData: {
        filename: '',
        columns: [],
        data: []
      },
      allColumns: {
        2: [
          {
            field: 'barcode',
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
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'srcDoCode',
            headerName: '源工单'
          },
          {
            field: 'destDoCode',
            headerName: '目标工单'
          },
          {
            field: 'equipmentName',
            headerName: '设备名称'
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
        7: [
          {
            field: 'barcode',
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
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'srcDoCode',
            headerName: '源工单'
          },
          {
            field: 'destDoCode',
            headerName: '目标工单'
          },
          {
            field: 'equipmentName',
            headerName: '设备名称'
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
        8: [
          {
            field: 'barcode',
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
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'doCode',
            headerName: '工单'
          },
          {
            field: 'equipmentName',
            headerName: '设备'
          },
          {
            field: 'failReason',
            headerName: '退料原因'
          },
          {
            field: 'personName',
            headerName: '操作人'
          },
          {
            field: 'happenTime',
            headerName: '时间'
          }
        ],
        11: [
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
        14: [
          {
            field: 'barcode',
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
            field: 'srcWarehouse',
            headerName: '仓库'
          },
          {
            field: 'destWarehouse',
            headerName: '库位'
          },
          {
            field: 'destReservoir',
            headerName: '数量'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'vendorName',
            headerName: '时间'
          }
        ],
        15: [
          {
            field: 'barcode',
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
            field: 'srcWarehouse',
            headerName: '仓库'
          },
          {
            field: 'destWarehouse',
            headerName: '库位'
          },
          {
            field: 'destReservoir',
            headerName: '数量'
          },
          {
            field: 'operatorName',
            headerName: '操作人'
          },
          {
            field: 'vendorName',
            headerName: '时间'
          }
        ],
        10002: [
          {
            field: 'barcode',
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
            field: 'quantity',
            headerName: '数量'
          },
          {
            field: 'srcDoCode',
            headerName: '源工单'
          },
          {
            field: 'destDoCode',
            headerName: '目标工单'
          },
          {
            field: 'equipmentName',
            headerName: '设备名称'
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
  components: {
    'v-table': table,
    'v-agtable': agTable
  },
  computed: {
    // 物料编码
    materialCode () {
      return this.$store.state.detailInfos[0].materialCode
    },
    // 物料名称
    materialName () {
      return this.$store.state.detailInfos[0].materialName
    },
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
    // 点击次数
    clickNum () {
      return this.$store.state.clickNum
    },
    // op_id 传给后端的参数
    operationIdList () {
      let operationIdList = []
      if (
        this.nodeType === 2 ||
        this.nodeType === 7 ||
        this.nodeType === 10002 ||
        this.nodeType === 11
      ) {
        // 结转.. || 车间调整
        this.detailInfos.forEach(el => {
          operationIdList.push(el.opId)
        })
      } else {
        // 投产
        this.detailInfos.forEach(el => {
          let obj = {
            opId: el.opId,
            opType: el.opType
          }
          operationIdList.push(obj)
        })
      }

      return operationIdList
    },
    // 显示的名称
    routerName () {
      let name = this.pathMapping[this.nodeType]
      return name
    },
    url () {
      if (
        this.nodeType === 2 ||
        this.nodeType === 7 ||
        this.nodeType === 10002
      ) {
        // 结转
        return this.urls[1]
      } else if (this.nodeType === 11) {
        // 车间调整
        return this.urls[0]
      } else {
        // 投产
        return this.urls[2]
      }
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
      if (to.meta.title === 'workshop') {
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
    // 当初始进入时，点击左侧导航
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
    // 判断调用接口是否成功。
    judgeLoaderHandler (param, fnSu, fnFail) {
      let bRight = param.data.errorCode
      // 判断是否调用成功。
      if (!bRight) {
        // 调用成功后的回调函数。
        fnSu && fnSu(param.data.data)
      } else {
        // 提示信息。
        this.error = '查无数据'
        console.warn(param.data.errorMsg.message)
        // 失败后的回调函。
        fnFail && fnFail()
      }
    },
    // 请求成功。
    requestSucess (oData) {
      // 更新 materialData
      let oTableData = needTableDatas(
        this.pathMapping,
        this.nodeType,
        this.allColumns
      )
      if (this.nodeType === 8) {
        // 退料
        oTableData.data = [].concat(oData.outList)
      } else if (
        this.nodeType === 2 ||
        this.nodeType === 7 ||
        this.nodeType === 10002
      ) {
        oTableData.data = [].concat(oData.turnInOutDetailList)
      } else {
        oTableData.data = [].concat(oData.workshopOperationDetailList)
      }
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
