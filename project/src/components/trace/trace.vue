<template>
    <div class="post trace">
    	<h2 class="content-title">查询结果集</h2>
    	<el-button class="btn btn-plain" @click="onTrace">溯源</el-button>
        <div class="router-content" ref="routerContent">
	        <div class="innner-content">
	            <div v-if="gridData.error" class="error" style="margin-top: 10px;">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table">
	            	<div ref="summary" :class="[{actived: active.summary}]">
	            		<h2 class="content-title" @click="active.summary=!active.summary">
							      <span class='table-title'>汇总信息
								      <i class="el-icon-d-arrow-right icon"></i>
							      </span>
						      </h2>
						      <transition name="el-zoom-in-top">
							      <div class="content-table inner" ref="summaryTable">
								      <v-table
                        ref="table"
                        v-show="active.summary"
                        :max-height="tableHeight"
                        :table-data="summaryData"
                        :loading="gridData.loading">
                      </v-table>
							      </div>
						      </transition>
	            	</div>
	            	<div ref="started" :class="[{actived: active.started}]">
	            		<h2 class="content-title" @click="active.started=!active.started">
							      <span class='table-title'>起点明细信息
								      <i class="el-icon-d-arrow-right icon"></i>
							      </span>
                    <span class="table-tip">已选中{{gridData.selected.length}}项</span>
						      </h2>
						      <transition name="el-zoom-in-top">
							      <div class="content-table inner" ref="startedTable">
				            	<v-agtable
				            		v-show="active.started"
							    	    :table-data="gridData"
							    	    :heights="tableHeight"
							    	    :loading="gridData.loading"
							        ></v-agtable>
							      </div>
						      </transition>
	            	</div>
	            </div>
	       </div>
    	</div>
    </div>
</template>

<script>
import agTable from 'components/basic/ag-table.vue'
import table from 'components/basic/table.vue'
import fnP from 'assets/js/public.js'
import {mapGetters} from 'vuex'

export default {
  components: {
    'v-agtable': agTable,
    'v-table': table
  },
  data () {
    return {
      tdResize: true, // 是否允许拖动table大小
      dataFilter: true, // 是否启用过滤功能
      tableHeight: 200,
      gridData: {
        url: window.HOST + '/api/v1/trace/up/start-points',
        loading: false,
        error: null,
        selected: [],
        gridOptions: {
// enableColResize: true,
// enableSorting: true,
// rowSelection: "multiple",
// rowHeight: 40,
// headerHeight: 40,
// rowClass: 'row-style',
// rowDeselection: true,
// enableRangeSelection: true,
// suppressRowClickSelection: true,
// suppressLoadingOverlay: true,
// overlayNoRowsTemplate: "暂无数据"
        },
        columns: [],
        data: []
      },
      active: {
        summary: false,
        started: true
      },
      summaryData: {
        data: [],
        columns: [
          {
            prop: 'batchNo',
            name: '批次'
          },
          {
            prop: 'materialCode',
            name: '物料编码'
          },
          {
            prop: 'materialName',
            name: '物料名称'
          },
          {
            prop: 'quantity',
            name: '总数'
          }
        ]
      }
    }
  },
  mounted () {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    this.fetchPage()
    window.addEventListener('resize', this.adjustHeight)
    this.$nextTick(() => {
      this.adjustHeight()
    })
  },
  computed: {
    ...mapGetters(
      {
        // tablesColumn
        tablesColumns: 'tablesColumns'
      }
    ),
    // 起点明细表已定义的
    startPointsTableColumns () {
      return this.tablesColumns['startPointsTable'] || []
    }
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function () {
      this.active = {
        summary: false,
        started: true
      }
      this.fetchPage()
    },
    'gridData.selected': function (params) {
      let aoColumns = this.getColumns()

      if (params.length) {
        aoColumns[0].headerCheckboxSelection = true
      } else {
        aoColumns[0].headerCheckboxSelection = false
      }

      this.gridData.columns = aoColumns
    },
    'active.summary': function (isShow) {
      if (isShow) {
        this.$nextTick(() => {
          let oTable = this.$refs.table.$children[0]
          oTable && oTable.doLayout()
        })
      }
    }
  },
  methods: {
    // 获取显示列
    getColumns () {
      // 基本显示列。
      let arr = [
        {
          width: 30,
          checkboxSelection: true,
          // 默认全选按钮为false，当有选中的时候才能全选
          headerCheckboxSelection: false,
          pinned: true,
          suppressSorting: true
        },
        {
          headerName: '序号',
          field: 'index',
          pinned: true,
          width: 50
        },
        {
          field: 'barcode',
          headerName: '条码',
          width: 120,
          pinned: true
        },
        {
          field: 'batchNo',
          headerName: '批次',
          width: 150
        },
        {
          field: 'materialCode',
          headerName: '物料编码'
        },
        {
          field: 'materialName',
          headerName: '物料名称',
          width: 300
        },
        {
          field: 'quantity',
          headerName: '数量',
          width: 50
        },
        {
          field: 'materialUnit',
          headerName: '单位',
          width: 50
        },
        {
          field: 'personName',
          headerName: '操作人'
        },
        {
          field: 'opTime',
          headerName: '时间',
          width: 160
        },
        {
          field: 'opTypeName',
          headerName: '动作'
        },
        {
          field: 'processName',
          headerName: '工序'
        },
        {
          field: 'srcWarehouse',
          headerName: '源仓库'
        },
        {
          field: 'srcWarehouseLocation',
          headerName: '源库位'
        },
        {
          field: 'warehouse',
          headerName: '仓库'
        },
        {
          field: 'warehouseLocation',
          headerName: '库位'
        },
        {
          field: 'srcBarcode',
          headerName: '源条码'
        },
        {
          field: 'contactName',
          headerName: '客户/供应商'
        },
        {
          field: 'traceCode',
          headerName: '物流码'
        },
        {
          field: 'equipmentName',
          headerName: '设备',
          cellRenderer: function (params) {
            return (
              (params.data.equipmentCode || '') +
              (params.data.equipmentCode && params.data.equipmentName
                ? ':'
                : '') +
              (params.data.equipmentName || '')
            )
          }
        },
        {
          field: 'moldCode',
          headerName: '模号'
        },
        {
          field: 'doCode',
          headerName: '工单'
        },
        {
          field: 'srcDoCode',
          headerName: '源工单'
        },
        {
          field: 'qualityTypeName',
          headerName: '质量'
        }
      ]
      this.startPointsTableColumns.forEach(el => {
        arr.push({
          field: el.searchCode,
          headerName: el.itemName
        })
      })
      return arr
    },
    // 查询。
    fetchPage () {
      this.gridData.selected = []
      this.fetchData(this.gridData)
    },
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    // 获取高度。
    adjustHeight () {
      this.tableHeight = 200
      this.$nextTick(() => {
        this.tableHeight = this.$refs.routerContent.clientHeight -
                          this.outerHeight(document.querySelector('.content-title')) * 2 -
                          20
      })
    },
    // 根据时间排序。
    sortByTime (a, b) {
      return (
        Date.parse(b.opTime.replace(/-/g, '/')) -
        Date.parse(a.opTime.replace(/-/g, '/'))
      )
    },
    // 获取数据。
    fetchData (oData) {
      oData.error = null
      oData.data = []
      oData.loading = true

      let sPath = oData.url

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        sPath,
        'post',
        fnP.parseQueryParam(this.$route.query),
        oResult => {
          // 请求成功。
          oData.loading = false

          // 数据处理- 排序， 索引
          let aResult = oResult.sort(this.sortByTime)
          let aColumns = this.getColumns()

          // 汇总处理函数，设置汇总表格数据。
          this.summaryData.data = this.setSummaryData(aResult)

          aResult = oResult.map((o, n) => {
            return Object.assign({}, o, {
              index: n + 1
            })
          })

          // 是否需要隐藏的列。
          let aHideColumn = ['moldCode', 'traceCode']

          aHideColumn.forEach(sColumn => {
            let isShow = aResult.some(o => o[sColumn])

            if (!isShow && aColumns.filter(o => o.field === sColumn).length) {
              // 修改该列隐藏。
              aColumns.filter(o => o.field === sColumn)[0].hide = true
            }
          })

          oData.data = aResult
          oData.columns = aColumns
        },
        sErrorMessage => {
          // 请求失败。
          oData.loading = false
          // oData.columns = this.getColumns()
          // 提示信息。
          oData.error = sErrorMessage
          console.log(sErrorMessage)
        },
        err => {
          // 请求错误。
          oData.loading = false
          oData.columns = this.getColumns()
          console.log('接口查询出错。')
          console.log(err)
        }
      )
    },
    // 汇总表处理函数。--根据批次，物料汇总显示，总数累加处理。
    setSummaryData (aoList) {
      let oFlag = {}

      aoList &&
        aoList.forEach(o => {
          // 需合并的参数值。
          let sKey = `${o.batchNo}+${o.materialCode}`

          if (!oFlag[sKey]) {
            oFlag[sKey] = {
              batchNo: o.batchNo,
              materialName: o.materialName,
              materialCode: o.materialCode,
              quantity: o.quantity || 0
            }
          } else {
            // 数量累加。
            oFlag[sKey].quantity += o.quantity || 0
          }
        })

      // 返回数据。
      return window.Rt.utils.getObjectValues(oFlag)
    },
    onTrace (event) {
      if (this.gridData.data && this.gridData.selected.length) {
        let aSelected = []
        this.gridData.selected.forEach(o => {
          let oSelected = {};
          // 解构赋值。
          ({
            snapshotId: oSelected.snapshotId,
            batchNo: oSelected.batchNo,
            materialCode: oSelected.materialCode
          } = o)

          aSelected.push(oSelected)
        })

        let tag = new Date()
          .getTime()
          .toString()
          .substr(-5) // 生成唯一标识。

        sessionStorage.setItem('trace_' + tag, JSON.stringify(aSelected))
        window.open('traceIndex.html?tag=' + tag)
      } else {
        this.$message('没有数据溯源')
      }
    }
  }
}
</script>

<style lang="less">
.error {
  border: 2px solid #42af8f;
  padding: 20px 12px;
  margin-bottom: 30px;
  font-size: 14px;
  color: red;
}
.trace {
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
    margin-left: 0;
    font-size: 14px;
  }
  .content-title {
    color: #42af8f;
    position: relative;

    .table-tip {
      position: absolute;
      top: 0;
      left: 140px;
      color: #999;
      font-size: 12px;
      font-weight: bold;
    }
    &:hover {
      color: #42af8f;
      cursor: pointer;
    }
  }
}
</style>
