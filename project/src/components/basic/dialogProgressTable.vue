<template>
    <!-- <el-dialog
        class="progress-dialog-table-wrap"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false"
        :close-on-press-escape="false"
        fullscreen
        center>
        <div slot="title" class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">快速报告生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
        <v-table :table-data="oDialogTable" :loading="loading"></v-table>
    </el-dialog> -->
    <div class="progress-dialog-table-wrap">
        <div class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">快速报告生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
        <v-table :table-data="oDialogTable" :loading="loading"></v-table>
    </div>
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
      loading: false,
      getProgressUrl: window.HOST + '/api/v1/request/state/',
      tableData: [],
      oDialogTable: {
        columns: [{
          prop: 'type',
          name: '类型',
          formatter: function (row, column) {
              // 根据当前类型，显示标题
            return ''
          }
        }, {
          prop: 'materialName',
          name: '物料名称'
        }, {
          prop: 'info',
          name: '名称(数量)'
        }],
        data: [],
        spanMergeMethod: this.spanMergeMethod
      }
    }
  },
  created () {
          // 显示弹窗。
    this.showDialogTable()
  },
  methods: {
    showDialogTable () {
      // this.loading = true
          // this.showData()
    },
    showData () {
      this.$register.sendRequest(
                this.$store,
                this.$ajax,
                this.getProgressUrl + this.progressId,
                'post',
                null,
                data => {
                  this.loading = false

                  // 处理数据。

                    // 重新加载
                },
                () => {
                    // 加载失败
                  this.loading = true
                }
            )
    },
    // 单元格合并处理函数
    spanMergeMethod () {},
    // 数据处理函数
    parseTableData () {

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
        background-color: #fff;

        .loader {
          text-align: center;
          padding: 10px 0;
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
      font-size: 16px;
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
