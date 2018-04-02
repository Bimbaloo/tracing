<template>
	<div class="router-content" ref="suspiciousList">
		<div class="innner-content" >
      <div class="path-btn">
        	<el-button class="btn btn-plain btn-restrain" v-show="isDetails&&state" @click="cancelSuppres">取消遏制</el-button>
        </div>
			<h2 class="content-title path-title" >
        <span :class="{ 'list': isDetails }" @click="isDetails = false">遏制列表</span>
        <span class="details" v-if="isDetails"  @click="isDetails = true">>遏制详情</span>
      </h2>
			<h2 class="content-title" v-show="!isDetails">遏制列表</h2>
      <h2 class="content-title" v-show="isDetails">操作信息</h2>
      <div class='condition-table' v-show="isDetails">
        <span v-for="infor in information" :key="infor.value">{{infor.value}}：{{infor.key}}</span>
      </div>
			<!-- <v-table v-show="!isDetails"  :heights="tableDate.height" :table-data="tableDate" :loading="loading" :resize="resize" class="raw-table"></v-table> -->
      <el-table v-show="!isDetails" :height="tableHeight" :loading="loading" :resize="resize"  :data="tableDate.data" border style="width: 100%">
        <el-table-column type="index" label="序号" width="50" align='center'></el-table-column>
        <el-table-column v-for="col in columns" :sortable='col.sortable' :key="col.prop" :prop="col.prop" :label="col.name" :width="col.width" align='center'></el-table-column>
        <el-table-column label="操作" width="200" align='center'>
          <template slot-scope="scope">
            <el-button @click="viewDetails(scope)" type="text" size="small">遏制清单</el-button>
            <el-button @click="viewReport(scope)" type="text" size="small">遏制报告</el-button>
          </template>
        </el-table-column>
      </el-table>
      <v-report v-if="isDetails" :hasData="setWidth" :noData="removeWidth" :query="handleId" type="restrainDetails"></v-report>
		</div>
	</div>

</template>


<script>
import table from 'components/basic/table.vue'
import report from 'components/report/report.vue'

const URL = window.HOST + '/api/v1/suppress/list' // 遏制列表
// const verboseURL = window.HOST + '/api/v1/suppress/verbose' // 遏制详情
const cancelURL = window.HOST + '/api/v1/suppress/cancel' //   取消遏制

export default {
  components: {
    'v-report': report,
    'v-table': table
  },
  data () {
    return {
      isDetails: false,
      loading: false,
      resize: true, // 是否允许拖动table大小
      tableDate: {
        // 遏制列表
        columns: [
          {
            type: 'index',
            name: '序号',
            width: 50
          },
          {
            prop: 'doDescription',
            name: '遏制详情'
          },
          {
            prop: 'doTime',
            name: '遏制时间',
            sortable: true,
            width: 180
          },
          {
            prop: 'cancelTime',
            name: '取消遏制时间',
            sortable: true,
            width: 180
          },
          {
            prop: 'doOperator',
            name: '开始遏制人员',
            width: 120
          },
          {
            prop: 'cancelDescription',
            name: '结束遏制详情',
            width: 120
          },
          {
            prop: 'cancelOperator',
            name: '结束遏制人员',
            width: 120
          },
          {
            prop: 'stateName',
            name: '遏制状态',
            sortable: true,
            width: 100
          },
          {
            prop: 'handle',
            name: '操作',
            width: 200
          }
        ],
        data: [],
        highlight: true,
        height: 200
      },
      /* 查询条件 */
      restrainList: {
        startTime: '',
        endTime: '',
        personCode: ''
      },
      height: 200,
      handleId: '', // 点击行的 handleId
      index: 0, // 点击行的 index
      doDescription: '' // 取消遏制的描述信息
    }
  },
  created () {
    // 获取查询条件
    this.getCondition()
    // 调用接口查询
    this.getListhData(this.restrainList)
    window.addEventListener('resize', this.setTableHeight)
    this.$nextTick(() => {
      this.setTableHeight()
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.setTableHeight)
  },
  computed: {
    /* 遏制详情--操作信息 */
    information () {
      const arr = [
        {
          prop: 'doDescription',
          name: '遏制详情'
        },
        {
          prop: 'condition',
          name: '遏制条件'
        },
        {
          prop: 'doTime',
          name: '遏制时间'
        },
        {
          prop: 'cancelTime',
          name: '取消遏制时间'
        },
        {
          prop: 'doOperator',
          name: '开始遏制人员'
        },
        {
          prop: 'endDescription',
          name: '结束遏制详情'
        },
        {
          prop: 'endOperator',
          name: '结束遏制人员'
        }
      ]
      let informationArr =
        Object.assign({}, this.tableDate.data[this.index]) || {}
      let needArr = []
      arr.forEach(element => {
        if (
          informationArr[element.prop] !== null &&
          informationArr[element.prop] !== undefined
        ) {
          needArr.push({
            value: element.name,
            key: informationArr[element.prop]
          })
        }
      })
      return needArr
    },
    /* 当前点击行的状态信息 */
    state () {
      /* 对照表 */
      // const stateForm = {
      //   "-1":'异常',
      //   "0": "已结束",
      //   "1": "成功",
      //   "2": "失败",
      //   "3": "遏制",
      //   "4": "异常"
      // }
      const state = this.tableDate.data[this.index].state || 0
      if (state === 1 || state === 3 || state === 4) {
        return true
      } else {
        return false
      }
    },
    /* 表格列 */
    columns () {
      return this.tableDate.columns.filter(el => !!el.prop && el.prop !== 'handle')
    },
    /* 表格高度 */
    tableHeight () {
      return this.tableDate.height
    }
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function () {
      this.getCondition()
      this.getListhData(this.restrainList)
      this.$nextTick(() => {
        this.setTableHeight()
      })
    }
  },
  methods: {
    // 获取查询信息
    getCondition () {
      let { startTime, endTime, personCode } = this.$route.query
      this.restrainList = { startTime, endTime, personCode }
    },

    // 获取遏制列表信息
    getListhData (oCondition) {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        URL,
        'post',
        oCondition,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    // 获取遏制列表信息 - 请求成功。
    requestSucess (oData) {
      this.loading = false
      oData.forEach((el, index) => {
        el.handleId = el.handle
        el.handle = '查看详情'
        el.index = index
      })
      this.tableDate.data = []
      this.tableDate.data.push(...oData)
      this.isDetails = false
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      console.log(err)
      this.loading = false
      console.log('数据库查询出错。')
    },

    // 查看遏制清单
    viewDetails (oDate) {
      this.index = oDate.$index
      this.handleId = oDate.row.handleId
      this.isDetails = true
    },
    // 查看遏制报告
    viewReport (oDate) {
      let tag = new Date().getTime().toString().substr(-5)

      sessionStorage.setItem('restrainReports_' + tag, JSON.stringify(oDate.row))

      window.open('restrainReports.html?tag=' + tag)
    },
    setWidth () {
      this.styleObject.minWidth = '1000px'
    },
    removeWidth () {
      this.styleObject.minWidth = 0
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    /* 设置高度 */
    setTableHeight () {
      this.tableDate.height = this.outerHeight(this.$refs.suspiciousList) - 130
    },
    /* 取消遏制 */
    cancelSuppres () {
      const handleId = this.tableDate.data[this.index].handleId
      const h = this.$createElement
      // let bSucess = false
      let self = this
      this.$msgbox({
        title: '提示',
        message: h('el-input', {
          attrs: {
            type: 'textarea',
            rows: 4,
            placeholder: '请输入取消遏制描述信息'
          },
          class: {
            message: true
          },
          domProps: {
            value: self.doDescription
          },
          on: {
            blur: function (event) {
              self.doDescription = event.target.value
            }
          }
        }),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '取消遏制中...'
            let oConditions = {
              description: self.doDescription,
              handle: handleId
            }
            this.$post(cancelURL, oConditions)
              .then(oData => {
                instance.confirmButtonLoading = false
                this.$message.success('取消遏制成功')
                self.doDescription = ''
                this.isDetails = false
                this.getListhData(this.restrainList)
                done()
              })
              .catch(err => {
                instance.confirmButtonLoading = false
                this.$message.error('取消遏制失败')
                self.doDescription = ''
                console.log(err)
                done()
              })
          } else {
            self.doDescription = ''
            done()
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="less" scoped>
.router-content {
  height: 100%;

  /deep/.innner-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    // padding: 0 20px;
    box-sizing: border-box;

    .path-btn {
      .btn-restrain {
        right: 20px;
      }
    }
    .content-table {
      flex: 1;
    }
    .path-title {
      border-left: 0;
      margin-bottom: 0px;
      margin-left: -10px;
      .list {
        &:hover {
          color: #42af8f;
          cursor: pointer;
        }
      }
      .details {
        color: #42af8f;
      }
    }
    .condition-table {
      margin-top: 0;
      box-sizing: border-box;
      border: 1px solid #42af8f;
      padding: 10px;
      min-height: 40px;
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      & > span {
        line-height: 20px;
        display: inline;
        margin-right: 20px;
      }
    }
    .report {
      .report-content {
        padding: 0 !important;
      }
    }
  }
}
</style>
