<template>
	<div class="report">
		<v-dTable
			v-if="loading"
			:dialog-visible="loading"
			:progress-id="progressId"
		></v-dTable>
		<div v-if="sErrorMessage" class="error">
			{{ sErrorMessage }}
		</div>
		<div v-else ref="content" class='report-content'>
			<div ref="summary" :class="[{ actived: active.summary },'report-tablebox']">
				<h2 class="content-title" @click="active.summary=!active.summary">
					<span class='table-title'>汇总信息
						<i class="el-icon-d-arrow-right icon"></i>
					</span>
					<span class='table-handle'>
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.summary, $event)"></i>
						<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('summaryTable', $event, '汇总信息')"></i>
					</span>
				</h2>
				<transition name="el-zoom-in-top">
					<div class="content-table" ref="summaryTable">
						<v-table v-show="active.summary" :table-data="reportData.summary"></v-table>
					</div>
				</transition>
			</div>
			<div ref="inStocks" :class="[{ actived: active.inStocks },'report-tablebox']" v-if="reportData.inStocks.show">
				<h2 class="content-title" @click="active.inStocks=!active.inStocks">
					<span class='table-title'>在库明细
						<i class="el-icon-d-arrow-right icon"></i>
					</span>
					<span class='table-handle'>
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.inStocks, $event)"></i>
						<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inStocksTable', $event, '在库明细')"></i>
					</span>
				</h2>
				<transition name="el-zoom-in-top">
					<div class="content-table" ref="inStocksTable">
						<v-table v-show="active.inStocks" :table-data="reportData.inStocks"></v-table>
					</div>
				</transition>
			</div>
			<div ref="inMakings" :class="[{ actived: active.inMakings },'report-tablebox']" v-if="reportData.inMaking.show || reportData.remain.show">
				<h2 class="content-title" @click="active.inMakings=!active.inMakings">
					<span class='table-title'>在制明细
						<i class="el-icon-d-arrow-right icon"></i>
					</span>
				</h2>
				<transition-group name="el-zoom-in-top" tag="div">
					<h2 v-show="active.inMakings" key="1" class="inner-title" v-if="reportData.inMaking.show">
						<span class='table-title'>加工中</span>
						<span class='table-handle'>
							<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.inMaking, $event)"></i>
							<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inMakingTable', $event, '在制明细-加工中')"></i>
						</span>
					</h2>
					<div class="content-table" ref="inMakingTable" key="2" v-if="reportData.inMaking.show">
						<v-table v-show="active.inMakings" :table-data="reportData.inMaking"></v-table>
					</div>
					<h2 v-show="active.inMakings" key="3" class="inner-title" v-if="reportData.remain.show">
						<span class='table-title'>滞留中</span>
						<span class='table-handle'>
							<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.remain, $event)"></i>
							<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('remainTable', $event, '在制明细-滞留中')"></i>
						</span>
					</h2>
					<div class="content-table" ref="remainTable" key="4" v-if="reportData.remain.show">
						<v-table v-show="active.inMakings" :table-data="reportData.remain"></v-table>
					</div>
				</transition-group>
			</div>
			<div ref="outStocks" :class="[{ actived: active.outStocks },'report-tablebox']" v-if="reportData.outStocks.show || reportData.delivered.show">
				<h2 class="content-title" @click="active.outStocks=!active.outStocks">
					<span class='table-title'>出库明细
						<i class="el-icon-d-arrow-right icon"></i>
					</span>
				</h2>
				<transition-group name="el-zoom-in-top" tag="div">
					<h2 v-show="active.outStocks" key="5" class="inner-title" v-if="reportData.outStocks.show">
						<span class='table-title'>滞留中</span>
						<span class='table-handle'>
							<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.outStocks, $event)"></i>
							<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outStocksTable', $event, '出库明细-滞留中')"></i>
						</span>
					</h2>
					<div class="content-table" key="6" ref="outStocksTable" v-if="reportData.outStocks.show">
						<v-table v-show="active.outStocks" :table-data="reportData.outStocks"></v-table>
					</div>
					<h2 v-show="active.outStocks" key="7" class="inner-title" v-if="reportData.delivered.show">
						<span class='table-title'>已发货</span>
						<span class='table-handle'>
							<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.delivered, $event)"></i>
							<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('deliveredTable', $event, '出库明细-已发货')"></i>
						</span>
					</h2>
					<div class="content-table" key="8" ref="deliveredTable" v-if="reportData.delivered.show">
						<v-table v-show="active.outStocks" :table-data="reportData.delivered"></v-table>
					</div>
				</transition-group>
			</div>
			<div ref="loss" :class="[{ actived: active.loss },'report-tablebox']" v-if="reportData.loss.show">
				<h2 class="content-title" @click="active.loss=!active.loss">
					<span class='table-title'>库存损益
						<i class="el-icon-d-arrow-right icon"></i>
					</span>
					<span class='table-handle'>
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.loss, $event)"></i>
						<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('lossTable', $event, '库存损益')"></i>
					</span>
				</h2>
				<transition name="el-zoom-in-top">
					<div class="content-table" ref="lossTable">
						<v-table v-show="active.loss" :table-data="reportData.loss"></v-table>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
import table from 'components/basic/table.vue'
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
// import html2canvas from 'html2canvas'
import rasterizeHTML from 'rasterizehtml'
import progressTable from 'components/basic/dialogProgressTable.vue'
import $ from 'jquery'

export default {
  components: {
    'v-table': table,
    'v-dTable': progressTable
  },
  props: {
    type: String,
    query: [Array, Object, String],
    showTables: {
      type: Array,
      required: false,
      default: function () {
        return ['summary']
      }
    },
    killProgress: Boolean
  },
  data () {
    return {
      excel: true,
      print: true,
      loading: false,
      sErrorMessage: '',
      oUrl: {
        points: '/api/v1/trace/report/by-start-points',
        barcode: '/api/v1/trace/report/by-equipment-barcode',
        batch: '/api/v1/trace/report/by-equipment-batch',
        time: '/api/v1/trace/report/by-equipment-time',
        restrainBatch: '/api/v1/trace/report/by-batch',
        restrainDetails: '/api/v1/suppress/verbose',
        suspiciouByBarcode: '/api/v1/trace/report/by-barcode', // 根据条码遏制
        mold: `/api/v1/trace/report/by-mold`  // 根据模具信息查询快速报告
      },
      active: {
        summary: true,
        inStocks: false,
        outStocks: false,
        inMakings: false,
        loss: false
      },
      reportData: {
        // 汇总。
        summary: {
          filename: '汇总',
          show: true,
          columns: [
            {
              prop: 'batchNo',
              name: '批次',
              // width: "250",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              width: '200',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              sortable: true
            },
            {
              prop: 'quantity',
              name: '数量',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'quantity')
            },
            {
              prop: 'qualifiedNum',
              name: '合格数',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'qualifiedNum')
            },
            {
              prop: 'unqualifiedNum',
              name: '不合格数',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'unqualifiedNum')
            },
            {
              prop: 'disabilityNum',
              name: '报废数',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'disabilityNum')
            },
            {
              prop: 'rate',
              name: '合格率',
              width: '100',
              sortable: true,
              formatter: function (row, column) {
                return (row.rate * 100).toFixed(2) + '%'
              },
              sortMethod: (a, b) => this.setSortFun(a, b, 'rate')
            }
          ],
          data: []
        },
        // 发货。
        delivered: {
          filename: '发货',
          show: true,
          filteredData: [],
          filterChange: filters => {
            this.filterChange(filters, 'delivered')
          },
          columns: [
            {
              prop: 'barcode',
              name: '条码',
              sortable: true
            },
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'quantity',
              name: '数量',
              width: '100',
              sortable: true
            },
            {
              prop: 'stock',
              name: '仓库',
              sortable: true
            },
            {
              prop: 'stocklot',
              name: '库位',
              sortable: true
            },
            {
              prop: 'customer',
              name: '客户',
              sortable: true,
              filters: [],
              filterMethod: function (value, row) {
                return row.customer === value
              },
              filterPlacement: 'bottom-end'
            },
            {
              prop: 'outstockType',
              name: '出库类型',
              sortable: true
            },
            {
              prop: 'person',
              name: '出库人',
              sortable: true
            },
            {
              prop: 'outstockTime', // 格式：yyyy-MM-dd hh:mm:ss
              name: '出库时间',
              width: '160',
              sortable: true
            }
          ],
          data: []
        },
        // 出库。
        outStocks: {
          filename: '出库',
          show: true,
          filteredData: [],
          filterChange: filters => {
            this.filterChange(filters, 'outStocks')
          },
          columns: [
            {
              prop: 'barcode',
              name: '条码',
              sortable: true
            },
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'quantity',
              name: '数量',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'quantity')
            },
            {
              prop: 'stock',
              name: '仓库',
              sortable: true
            },
            {
              prop: 'stocklot',
              name: '库位',
              sortable: true
            },
            {
              prop: 'customer',
              name: '客户',
              sortable: true,
              filters: [],
              filterMethod: function (value, row) {
                return row.customer === value
              },
              filterPlacement: 'bottom-end'
            },
            {
              prop: 'outstockType',
              name: '出库类型',
              sortable: true
            },
            {
              prop: 'person',
              name: '出库人',
              sortable: true
            },
            {
              prop: 'outstockTime', // 格式：yyyy-MM-dd hh:mm:ss
              name: '出库时间',
              width: '160',
              sortable: true
            }
          ],
          data: []
        },
        // 在库
        inStocks: {
          filename: '在库',
          show: true,
          filteredData: [],
          filterChange: filters => {
            this.filterChange(filters, 'inStocks')
          },
          columns: [
            {
              prop: 'barcode',
              name: '条码',
              sortable: true
            },
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'quantity',
              name: '数量',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'quantity')
            },
            {
              prop: 'remainingNum',
              name: '库存余量',
              sortable: true
            },
            {
              prop: 'stock',
              name: '仓库',
              sortable: true
            },
            {
              prop: 'stocklot',
              name: '库位',
              sortable: true
            },
            {
              prop: 'customer',
              name: '客户',
              sortable: true,
              filters: [],
              filterMethod: function (value, row) {
                return row.customer === value
              },
              filterPlacement: 'bottom-end'
            },
            {
              prop: 'instockType',
              name: '入库类型',
              sortable: true
            },
            {
              prop: 'person',
              name: '入库人',
              sortable: true
            },
            {
              prop: 'instockTime', // 格式：yyyy-MM-dd hh:mm:ss
              name: '入库时间',
              width: '160',
              sortable: true
            }
          ],
          data: []
        },
        // 加工
        inMaking: {
          filename: '加工',
          show: true,
          columns: [
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'processName',
              name: '工序',
              sortable: true
            },
            {
              prop: 'equipmentName',
              name: '设备',
              sortable: true
            },
            {
              prop: 'inNum',
              name: '投入数量',
              width: '100',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'inNum')
            },
            {
              prop: 'consumedNum',
              name: '已消耗数量',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'consumedNum')
            },
            {
              prop: 'remainingNum',
              name: '剩余量',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'remainingNum')
            },
            {
              prop: 'inTimeFirst',
              name: '最早投料时间',
              width: '180',
              sortable: true
            },
            {
              prop: 'inTimeLast',
              name: '最晚投料时间',
              width: '180',
              sortable: true
            }
          ],
          data: []
        },
        // 滞留
        remain: {
          filename: '滞留',
          show: true,
          columns: [
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'processName',
              name: '工序',
              sortable: true
            },
            {
              prop: 'equipmentName',
              name: '设备',
              sortable: true
            },
            {
              prop: 'outNum',
              name: '数量',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'outNum')
            },
            {
              prop: 'qualifiedNum',
              name: '合格数',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'qualifiedNum')
            },
            {
              prop: 'unqualifiedNum',
              name: '不合格数',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'unqualifiedNum')
            },
            {
              prop: 'disabilityNum',
              name: '报废数',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'disabilityNum')
            },
            {
              prop: 'outTimeFirst',
              name: '最早产出时间',
              width: '180',
              sortable: true
            },
            {
              prop: 'outTimeLast',
              name: '最晚产出时间',
              width: '180',
              sortable: true
            }
          ],
          data: []
        },
        // 库存损益
        loss: {
          filename: '库存损益',
          show: false, // 只有快速报告才显示。
          columns: [
            {
              prop: 'barcode',
              name: '条码',
              sortable: true
            },
            {
              prop: 'batchNo',
              name: '批次',
              // width: "200",
              sortable: true
            },
            {
              prop: 'materialCode',
              name: '物料编码',
              sortable: true
            },
            {
              prop: 'materialName',
              name: '物料名称',
              width: '300',
              sortable: true
            },
            {
              prop: 'quantity',
              name: '数量',
              sortable: true,
              sortMethod: (a, b) => this.setSortFun(a, b, 'quantity')
            },
            {
              prop: 'opPerson',
              name: '操作人',
              // width: "300",
              sortable: true
            },
            {
              prop: 'opTime',
              name: '操作时间',
              sortable: true
            }
          ],
          data: []
        }
      },
      progressId: new Date().getTime().toString().substr(-5),
      cancelProgressUrl: window.HOST + '/api/v1/request/kill/',
			timer: null
    }
  },
  watch: {
// 遏制页面：新建遏制中监听
    $route: function () {
      // 页面重新查询时，设置新进程
      this.progressId = new Date().getTime().toString().substr(-5)
      this.loading = false

			if(this.timer) {
					clearTimeout(this.timer)
					this.timer = null
			}

      this.fetchData()
    },
    killProgress () {
      if (this.killProgress) {
        this.setProgressEndHandle()
      }
    }
  },
  created () {
    if (this.type === 'trace') {
      // 若为快速报告,展示库存损益。
      this.reportData.loss.show = true
    }
    // 数据加载。
    this.fetchData()
  },
  mounted () {
    this.$nextTick(() => {
      // 设置显示顺序.
      this.setSequence()
    })
  },
  methods: {
    // 排序函数。
    setSortFun (oA, oB, paramName) {
      return oA[paramName] - oB[paramName]
    },
// 关闭进度进程
    closeProgressDialog () {
      this.timer = setTimeout(() => {
        this.loading = false
      }, 2000)
    },
// 关闭进程
    setProgressEndHandle () {
      this.closeProgressDialog()
      let oLoginInfo = this.$store.state.loginModule

      $.ajax({
        url: this.cancelProgressUrl + this.progressId,
        method: 'POST',
        async: false,
        crossDomain: true,
        headers: {
          Authorization: JSON.stringify({
            token: oLoginInfo.token,
            userId: Number(oLoginInfo.userId),
            username: oLoginInfo.username,
            nickname: oLoginInfo.nickname,
            progressId: oLoginInfo.progressId
          })
        }
      })
    },
    // 请求成功。
    requestSucess (oResult) {
      // this.loading = false
      this.closeProgressDialog()

      let bSetWidth = false

      let oData = this.reportData
      for (let p in oData) {
        oData[p].data = oResult[p]

        oData[p].data.sort(function (a, b) {
          if (a.materialCode > b.materialCode) {
            return 1
          }
          if (a.materialCode < b.materialCode) {
            return -1
          }
          if ((a.materialCode = b.materialCode)) {
            if (a.batchNo > b.batchNo) {
              return 1
            }
          }
          // a 必须等于 b
          return 0
        })

        oData[p].filteredData = oData[p].data

        if (!oResult[p].length) {
          // 若无数据。
          oData[p].show = false
        } else {
          oData[p].show = true
        }

        if (oResult[p].length && !bSetWidth) {
          bSetWidth = true
          // 设置最小宽度。
          // this.$emit('hasData')
        }

        if (p === 'summary') {
          // 若为汇总信息。
          oData[p].data.map(o => {
            if (o.quantity) {
              o.rate = (o.qualifiedNum / o.quantity).toFixed(4) // 保留小数点后两位
            } else {
              o.rate = 0
            }
          })
        }

        this.setFilters(oData[p])
      }

      if (!bSetWidth) {
        // this.$emit('noData')
        // this.error = "查无数据。"
        console.log('查无数据。')
      }
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      // this.loading = false
      this.closeProgressDialog()

      this.sErrorMessage = sErrorMessage
      // this.showMessage();

      this.$emit('noData')
      // this.error = "查无数据。"
      console.log(this.sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      // this.loading = false
      this.closeProgressDialog()

      this.sErrorMessage = err
      this.$emit('noData')
      console.log('查询出错。')
    },
    fetchData () {
      // 进入页面时设置页面的进程标记(created,watch)
      window.Rt.utils.cookie('progressId', this.progressId)

      this.sErrorMessage = ''
      // this.loading = true

      let sUrl = ''

      // 初始设置内容为空。
      for (let param in this.reportData) {
        this.reportData[param].data = []
      }
      // debugger
      let oParam = null
      if (this.type === 'trace') {
        this.showTables.forEach(e => {
          this.active[e] = true
        })

        // 若为快速报告。
        let oQuery = this.query

        if (oQuery.type) {
          // 若为溯源页面跳转。
          sUrl = this.oUrl[oQuery.type]
          oParam = oQuery.keys
          delete oParam.equipmentName
        } else {
          sUrl = this.oUrl['points']
          oParam = oQuery
        }
      } else if (this.type === 'restrainDetails') {
        // 遏制详情
        oParam = this.query
        // console.log(oParam)
        sUrl = this.oUrl[this.type]
        this.$ajax.defaults.headers.post['Content-Type'] =
          'application/json;charset=UTF-8'
      } else if (this.type === 'mold') {
        // 根据模具信息查询快速报告
        sUrl = this.oUrl[this.type]
        oParam = this.query
        this.$ajax.defaults.headers.post['Content-Type'] =
          'application/json;charset=UTF-8'
      } else if (this.type === 'suspiciouByBarcode') {
        // 根据条码信息查询快速报告  --遏制那边
        sUrl = this.oUrl[this.type]
        oParam = {
          'barcode': this.$route.query.barcode
        }
      } else {
        // 若为遏制报告。
        oParam = this.$route.query
        if (oParam && 'equipmentId' in oParam) {
          // 若根据设备查询。
          sUrl = this.oUrl['time']
          delete oParam.equipmentName
        } else {
          // 根据物料查询。
          oParam.materialCode = oParam.materialCode.split(':')[0]
          sUrl = this.oUrl['restrainBatch']
        }
      }

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        window.HOST + sUrl,
        'post',
        oParam,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )

// 调用进程
      this.loading = true
    },
    // 设置过滤。
    setFilters (oData) {
      let aoColumns = oData.columns
      let aoData = oData.data

      for (let i = 0, l = aoColumns.length; i < l; i++) {
        if (aoColumns[i].prop === 'customer') {
          // 若有客户信息。
          let oFilter = {}

          aoData.map(o => {
            if (!oFilter[o.customer]) {
              oFilter[o.customer] = 1
            }
          })

          Object.keys(oFilter).map(key =>
            aoColumns[i].filters.push({
              text: key,
              value: key
            })
          )

          break
        }
      }
    },
    /**
     * 表格筛选变化。
     * @param {Object} filters
     * @param {String} param
     * @return {void}
     */
    filterChange (filters, param) {
      let selected = []

      for (let p in filters) {
        selected = filters[p]
      }

      // 设置过滤数据。
      selected.map(
        s =>
          (this.reportData[param].filteredData = this.reportData[param].data.filter(o => o.customer === s))
      )
    },
    setSequence () {
      if (this.type === 'trace') {
        // 若为快速报告，改变显示顺序：汇总-出库-在制-在库
        // this.$refs.content.insertBefore(
        //   this.$refs.outStocks,
        //   this.$refs.inMakings
        // )
        this.$refs.content.append(this.$refs.inStocks)
        this.$refs.content.append(this.$refs.loss)
      }
    },
    // 表格导出。
    exportExcelHandle (oData, event) {
      event.stopPropagation()

      if (!oData) {
        return
      }
      // 下载表格。
      window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData)
    },
    // 表格打印。
    printHandle (refTable, event, sTitle) {
      event.stopPropagation()

      let oTable = this.$refs[refTable]
      if (!oTable) {
        return
      }

      let sQuery = document.querySelector('.condition-message')
        ? `
            <div class="condition-message">${
              document.querySelector('.condition-message').innerHTML
            }</div>
            <div class="condition-list">${
              document.querySelector('.condition-list').innerHTML
            }</div>
            <div class="content-table condition-table">${
              document.querySelector('.condition-table').innerHTML
            }</div>
          `
        : `
            <div class="condition">${
              document.querySelector('.condition').innerHTML
            }</div>
          `

      let sHtml = `
          <h2 class="content-title">查询条件</h2>
          ${sQuery}
          <h2 class="content-title"><span class="table-title">${sTitle}</span></h2>
          <div class="table el-table">
            <div class="el-table__header-wrapper">
              ${oTable.querySelector('.el-table__header-wrapper').innerHTML}
            </div>
            <div class="el-table__body-wrapper">
              ${oTable.querySelector('.el-table__body-wrapper').innerHTML}
            </div>
          </div>
          <style>
            .content-title {
              font-size: 16px;
              height: 16px;
              line-height: 16px;
              text-indent: 10px;
              border-left: 4px solid #42af8f;
            }
            .content-title .table-title {
              font-size: 16px;
                color: #42AF8F;
            }
            .condition span {
              display: inline-block;
            }
            .condition span + span {
              margin-left: 60px;
            }
            .condition-message {
              box-sizing: border-box;
              padding-left: 10px;
            }
            .condition-message span {
              font-size: 14px;
              margin-right: 30px
            }
            .condition-message .default-message {
              color: #999;
              margin-right: 10px;
            }
            .condition-list {
              box-sizing: border-box;
              padding-left: 10px;
            }
            .condition-list span {
              font-size: 14px;
              line-height: 40px;
              color: #42AF8F;
            }
            .condition-list icon {
              display: none;
            }
            .condition-table {
              margin-top: 0;
              box-sizing: border-box;
              border: 1px solid #42AF8F;
              padding: 10px;
            }
            .condition-table .materialBox {
              display: flex;
              box-sizing: border-box;
              padding-left: 10px;
              color: #666;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .condition-table .materialBox .material {
              line-height: 20px;
            }
            .condition-table .materialBox .time {
              display: flex;
              flex: 1;
              flex-wrap: wrap;
              height: auto;
            }
            .condition-table .materialBox .time > span {
              margin-left: 10px;
              line-height: 20px;
            }
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
            .el-table__body-wrapper .batch .cell > div {
                color: #f90;
              font-weight: 600
            }
            .el-table__empty-block {
                text-align: center;
            }
          </style>
         `

      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
    }
  }
}
</script>

<style lang="less">
.report {
	position: relative;

  .content-title {
    .icon-excel,
    .icon-print {
      display: none;
    }
  }

  .actived {
    .icon-excel,
    .icon-print {
      margin-left: 10px;
      position: relative;
      top: -2px;
      display: inline-block;
      cursor: pointer;
    }
    .el-icon-d-arrow-right {
      display: none;
    }
    .content-title {
      color: #333;
    }
    .content-table.inner {
      display: block;
    }
  }
  .el-icon-d-arrow-right {
    font-size: 14px;
  }
  .content-title {
    color: #42af8f;

    &:hover {
      color: #42af8f;
      cursor: pointer;
    }
  }
  .content-table.inner {
    display: none;
  }
  .inner-title {
    color: #42af8f;
    margin: 13px 0;
    text-indent: 10px;
  }

  .el-table th > .cell.highlight {
    color: #f9ff00;
  }
}
</style>

<style lang="less" scoped>
  .content-table {
    margin-top: 0;
  }
  .content-title,
  .inner-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 0px;
    .table-handle {
      margin-right: 5px;
      i {
        margin: 12px 5px 5px;
      }
    }
    .table-table {
      i {
        margin: 5px;
      }
    }
  }
  .content-title {
    margin-bottom: 10px;
  }
  // .second-table {
  //   margin-top: 0px;
  //   margin-bottom: 0px;
  // }
</style>
