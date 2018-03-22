<template>
    <!-- <div class="progress-dialog-table-wrap">
        <div class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">列表生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
        <v-table empty-text=" " :table-data="oDialogTable" :loading="tableLoading"></v-table>
    </div> -->
    <el-dialog
        class="progress-dialog-table-wrap"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        width="80%"
        center>
        <div slot="title" class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">列表生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
        <v-table empty-text=" " heights="60vh" :table-data="oDialogTable" :loading="tableLoading"></v-table>
    </el-dialog>
</template>

<script>
import table from 'components/basic/table.vue'

export default {
  props: {
    dialogVisible: {
      type: Boolean
    },
    progressId: {
      type: String
    }
  },
  components: {
    'v-table': table
  },
  data () {
    return {
      tableLoading: false,
      getProgressUrl: window.HOST + '/api/v1/request/state/fast-report/',
      tableData: [],
      oDialogTable: {
        columns: [{
          prop: 'type',
          name: '类型',
          formatter: function (row, column) {
              // 根据当前类型，显示标题
            let str = ''
            switch (row.type) {
              case 'deliveredList':
                str = '出库: 发货'
                break
              case 'inMakingList':
                str = '在制: 加工中'
                break
              case 'inStockList':
                str = '在库'
                break
              case 'outStockList':
                str = '出库: 滞留中'
                break
              case 'remainList':
                str = '在制: 滞留中'
                break
            }
            return str
          }
        }, {
          prop: 'materialName',
          name: '物料名称'
        }, {
          prop: 'info',
          name: '名称(数量)'
        }],
        data: [],
        spanMergeMethod: params => {
          return this.spanMergeMethod(params)
        }
      }
    }
  },
  created () {
          // 显示弹窗。
    this.showDialogTable()
  },
  methods: {
    showDialogTable () {
      this.tableLoading = true

      setTimeout(() => {
        this.showData()
      }, 2000)
    },
    // 加载数据
    showData () {
      this.$register.sendRequest(
                this.$store,
                this.$ajax,
                this.getProgressUrl + this.progressId,
                'post',
                null,
                data => {
                  this.tableLoading = false

                  // 处理数据。最后一次返回结果为null，所以数据不处理
                  if (data !== undefined) {
                    this.oDialogTable.data = this.parseTableData(data)
                  }

                    // 重新加载
                  setTimeout(() => {
                    this.$nextTick(() => {
                      document.querySelector('.progress-dialog-table-wrap') && this.showData()
                    })
                  }, 3000)
                },
                () => {
                    // 加载失败
                  this.tableLoading = true
                }
            )
    },
    // 单元格合并处理函数
    spanMergeMethod ({row, column, rowIndex, columnIndex}) {
      if (columnIndex === 0) {
            // 第一列
        if (!row.hide) {
          return [row.rowspan, 1]
        } else {
          return [0, 0]
        }
      }
    },
    // 数据处理函数
    parseTableData (oData) {
      let aoData = []
        // 增加合并单元格字段
      for (let obj in oData) {
        let aoFlag = oData[obj]

        aoFlag.forEach((o, nIndex) => {
          aoData.push({
            materialName: o.materialName,
            type: obj,
            info: (function () {
              let aoStr = []
              aoStr = o.simpleInfoList.map(c => {
                return `${c.keyValue}(${c.quantity})`
              })
              return aoStr.join('、')
            })(),
            rowspan: !nIndex ? aoFlag.length : 1,   // 第一行合并
            hide: !!nIndex  // 第一行显示
          })
        })
      }

      return aoData
    }
  }
}
</script>

<style lang="less">
    .progress-dialog-table-wrap {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1001;
        width: 100%;
        height: 100%;
        // background-color: #fff;

        .loader {
          text-align: center;
          padding: 10px 0;
        }

        .el-dialog__header {
          padding-top: 15px;
        }
        .el-dialog__body {
          padding-top: 0px;
        }
    }
    @-webkit-keyframes scale {
      0% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1;
      }
      45% {
        -webkit-transform: scale(0.1);
        transform: scale(0.1);
        opacity: 0.7;
      }
      80% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes scale {
      0% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1;
      }
      45% {
        -webkit-transform: scale(0.1);
        transform: scale(0.1);
        opacity: 0.7;
      }
      80% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1;
      }
    }

    .ball-pulse .ball-text {
      color: #42af8f;
      font-size: 20px;
    }

    .ball-pulse > div:nth-child(0) {
      -webkit-animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
      animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
    }

    .ball-pulse > div:nth-child(1) {
      -webkit-animation: scale 0.75s 0.12s infinite
        cubic-bezier(0.2, 0.68, 0.18, 1.08);
      animation: scale 0.75s 0.12s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
    }

    .ball-pulse > div:nth-child(2) {
      -webkit-animation: scale 0.75s 0.24s infinite
        cubic-bezier(0.2, 0.68, 0.18, 1.08);
      animation: scale 0.75s 0.24s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
    }

    .ball-pulse > div:nth-child(3) {
      -webkit-animation: scale 0.75s 0.36s infinite
        cubic-bezier(0.2, 0.68, 0.18, 1.08);
      animation: scale 0.75s 0.36s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
    }

    .ball-pulse > div {
      background-color: #42af8f;
      width: 3px;
      height: 3px;
      border-radius: 100%;
      margin: 2px;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      display: inline-block;
    }
</style>
