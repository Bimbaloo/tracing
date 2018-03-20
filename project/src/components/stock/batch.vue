<!--同批出入库-->
<template>
	<div class="router-content">
		<!--<el-button  @click="showSuspiciousList"  :class="[{ 'nobtn': btnShow }, 'btn' , 'btn-plain' , 'btn-restrain']" >可疑品</el-button>-->
		<div class="innner-content">
			<h2 class="content-title tableData">
				<span class='table-title'>批次<span class="tag">{{ batch}}</span>&nbsp;物料<span class="tag">{{materialCode}}</span>&nbsp;出库信息</span>
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
			</div>
			<h2 class="content-title tableData">
				<span class='table-title'>批次<span class="tag">{{batch}}</span>&nbsp;物料<span class="tag">{{materialCode}}</span>&nbsp;在库信息</span>
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
		</div>
	</div>

</template>

<script>

import table from 'components/basic/table.vue'
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
import rasterizeHTML from 'rasterizehtml'
import fnP from 'assets/js/public.js'

export default {
  components: {
    'v-table': table
  },
  data () {
    return {
      excel: true,
      print: true,
      tdResize: true,
      btnShow: false, // 根据需要是否隐藏‘可疑品’按钮
      styleError: {
        'max-height': '200px'
      },
      tableHeight: 100,
      batch: this.$route.query.batchNo,
      materialCode: this.$route.query.materialCode,
      outstockData: {
        url: window.HOST + '/api/v1/outstock/bybatch',
        loading: false,
        error: null,
        filename: this.$route.query.batchNo + '出库',
        columns: [
          {
            prop: 'barcode',
            name: '条码',
            width: '300',
            fixed: true
          },
          {
            prop: 'batchNo',
            name: '批次',
            width: '150'
          },
          {
            prop: 'materialCode',
            name: '物料编码',
            width: '140'
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
      },
      instockData: {
        url: window.HOST + '/api/v1/stock/bybatch',
        loading: false,
        error: null,
        filename: this.$route.query.batchNo + '在库',
        columns: [
          {
            prop: 'barcode',
            name: '条码',
            width: '300',
            fixed: true
          },
          {
            prop: 'batchNo',
            name: '批次',
            width: '150'
          },
          {
            prop: 'materialCode',
            name: '物料编码',
            width: '140'
          },
          {
            prop: 'materialName',
            name: '物料名称',
            width: '300'
          },
          {
            prop: 'quantity',
            name: '数量'
            // },{
            //     prop: "remainingNum",
            //     name: "库存余量"
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
      let toTitle = to.meta.title
      let fromTitle = from.meta.title

      // 当从可疑品(restrain)点击进入不会重新查询。
      if (toTitle === 'batch' && fromTitle === 'storage') {
        // 同批次出入库
        this.fetchPage()
        this.batch = this.$route.query.batchNo
        this.materialCode = this.$route.query.materialCode
      }
    },
    // 在物料仓储时，放大处理。
    '$store.state.fullscreen': function () {
      // 修改页面的内容的高度。
      this.outstockData.height = this.instockData.height = this.adjustHeight()
    },
    batch: function () {
      // 修改fielname值。
      this.instockData.filename = this.batch + '在库'
      this.outstockData.filename = this.batch + '出库'
    }
  },
  methods: {
    // 查询。
    fetchPage () {
      this.fetchData(this.outstockData)
      this.fetchData(this.instockData)
    },

    // 获取参数。
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
        this.$route.query,
        oResult => {
          // 请求成功。
          oData.loading = false
          oData.data = oResult
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
    // 可疑品列表。
    showSuspiciousList () {
      if (!this.btnShow) {
        let sKey = this.$route.params.key
        let sPath = ''
        if (sKey !== undefined && sKey !== '') {
          sPath = `/stock/${sKey}/restrain`
        } else {
          sPath = '/stock/restrain'
        }
        this.$router.replace({ path: sPath, query: this.$route.query })
      } else {
        console.log('该功能将在后续开发，敬请期待...')
      }
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

  .nobtn {
    background: rgb(204, 204, 204);
    border: none;
    color: #fff;
    // cursor: no-drop;
    cursor: auto;
  }

  .btn-restrain {
    position: absolute;
    right: 0;
    top: 15px;
  }

  .content-title {
    .tag {
      color: #f90;
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
.router-content {
  .btn-restrain {
    right: 100px;
  }
}
</style>
