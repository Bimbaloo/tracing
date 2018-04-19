<!--工艺参数-->
<template>
    <div class="router-content" id="parameter">
      <!-- 设备监控 -->
	    <v-dialog
    		v-if="showCamera"
    		:dialog-visible="videoForm.visible"
            :equipment-id="videoForm.equipmentId"
            :equipment-name="videoForm.equipmentName"
            :startDate="videoForm.startDate"
            :endDate="videoForm.endDate"
    		@hideDialog="hideVideoDialog">
	    </v-dialog>
        <div class="inner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                </div>
            </div>
            <h2 class="content-title" id='content-title'>
                <span>工艺参数</span>
            </h2>
            <div class='contentBox' :style="{ flexBasis: flexbase + 'px' }" v-loading="loading" element-loading-text="拼命加载中">
                <el-switch
                  style="display: inline-block;max-width: 150px"
                  v-model="activeName"
                  active-value="table"
                  inactive-value="charts"
                  active-color="#409eff"
                  inactive-color="#409eff"
                  active-text="条码表"
                  inactive-text="曲线图"
                  @change = "tabChange">
                </el-switch>
                <div v-show="activeName === `table`" class="table" >
                  <div v-if="!barcodeTableData.show" class="error">
                    {{ empty }}
                  </div>
                  <div v-if="barcodeTableData.show" class="barcode-input">
                      <el-form :model="ruleForm"  ref="ruleForm" class='el-form-input'>
                          <el-form-item label="条码：" style="width: 400px">
                              <el-input v-model="ruleForm.input" placeholder="请输入条码"  @change="updateRow" ></el-input>
                          </el-form-item>
                      </el-form>
                      <span class='table-handle'>
                          <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(barcodeTableData, $event)"></i>
                          <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('barcodeTable', $event)"></i>
                      </span>
                  </div>
                  <div v-if="barcodeTableData.show" class="content-table" ref="barcodeTable">
                      <el-table
                      :data="datas"
                      stripe
                      class="table"
                      :row-key="barcodeTableData.data.barcode"
                      style="width: 100%"
                      ref="multipleTable"
                      @expand-change="expandRow"
                      :height="barcodeTableData.height">
                          <el-table-column
                          v-if="!!column.show"
                          v-for="column in columns"
                          align="center"
                          :type="column.type"
                          :prop="column.prop"
                          :label="column.name"
                          :key="column.prop"
                          :class-name="column.class"
                          :width="column.width">
                              <template slot-scope="props">
                                  <el-form
                                  label-position="left"
                                  class="demo-table-expand expand-form"
                                  v-if="column.type === 'expand'">
                                    <div v-if="props.row.list.length">
                                        <el-form-item
                                        :label="`${prop.description}${prop.varUnit}`"
                                        v-for="prop in props.row.list"
                                        :key="prop.varStdId"
                                        class="expand-lable">
                                            <span class="expand-span" v-for="(item,index) in prop.params" :key="index" :style="{ color: item.isWarn}">{{item.value}}({{item.pickTime}})
                                              <i
                                                v-if="showCamera"
                                                class="icon icon-12 icon-camera"
                                                title="视频监控"
                                                @click="showVideoDialog(item.pickTime, props.row)">
                                              </i>
                                            </span>
                                        </el-form-item>
                                    </div>
                                    <div v-else>{{detailTip}}</div>
                                  </el-form>
                                  <div v-else :class="[ 'cell-content']">
                                      {{ props.row[column.prop] }}
                                  </div>
                              </template>
                          </el-table-column>
                      </el-table>
                  </div>
                  
                </div>
                <div v-show="activeName === `charts`" class="chart">
                  <div v-if="!chartShow" class="error">
                    {{ empty }}
                  </div>
                  <el-tabs v-else v-model="activeChart" @tab-click="chartTabChange">
                      <el-tab-pane :name="`chart${index}`" v-for="(chartData,index) in tableDatas" :key="index">
                        <span slot="label" :style="{ color: chartData.isWarn }"> {{chartData.filename}}</span>
                          <!-- 没有图表时，不显示图表开关 -->
                          <el-switch
                              v-model="chartData.value"
                              active-color="#42af8f"
                              inactive-color="#42af8f"
                              active-text="图表"
                              inactive-text="表格"
                              active-value="表格"
                              inactive-value="图形"
                              v-for="(option,indexs) in options"
                              v-if="option.optionModal && option.optionModal.series[0].name === chartData.filename"
                              :key="indexs+50"
                              @change = "switchChange(chartData.value)">
                          </el-switch>
                          <div class="content-echarts"
                            v-for="option in options"
                            :key="option.index"
                            v-if="option.optionModal && option.optionModal.series[0].name === chartData.filename"
                            v-show="chartData.value === '图形'">
                            <div class="charts" :id="`charts${index}`"></div>
                          </div>
                          <div class="content-tables" v-show="chartData.value === '表格' && index == tabPaneNum">
                              <h2 class="content-title tableData">
                                  <span class='table-title'>
                                      <span>检验参数：{{chartData.varStdId}}</span>&nbsp;&nbsp;
                                      <span>单位：{{chartData.unit}}</span>
                                  </span>
                                  <span class='table-handle'>
                                      <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(chartData, $event)"></i>
                                      <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle(`tableData${index}`, $event)"></i>
                                  </span>
                              </h2>
                              <div class="content-table" :ref="`tableData${index}`">
                                  <!-- <v-table :table-data="chartData" :heights="chartTableHeight" :resize="tdResize"></v-table> -->
                                  <el-table :data="chartData.data" :height="chartTableHeight" border class="table" ref="multipleTable">
                                      <el-table-column v-for='column in chartData.columns' :key="column.prop" :prop="column.prop" :label="column.name" :width="column.width" align='center'>
                                        <template slot-scope="scope" >
                                          <el-checkbox @change="chooseTime(scope.row.checked,chartData.data, scope.$index)" v-model="scope.row.checked" v-if="column.name === '采集时间'">{{scope.row[column.prop]}}</el-checkbox>
                                          <div v-else :class="[{ 'isWarn': column.name === '检测值' && scope.row['isWarn'] }, 'cell']" >{{scope.row[column.prop]}}</div>
                                        </template>
                                      </el-table-column>
                                  </el-table>
                              </div>
                          </div>
                          <div class="btn-box">
                            <el-button v-if="supression" class="btn btn-plain" @click="showSuspiciousList">可疑品</el-button>
                            <el-button v-if="showCamera" class="btn btn-plain" @click="showVideoDialog">视频查看</el-button>
                          </div>
                      </el-tab-pane>
                  </el-tabs>
                </div>
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
import _ from 'lodash'
import VideoDialog from 'components/monitor/dialog.vue'

// 条码表接口
const BARCODE_TABLE_DATA = window.HOST + '/api/v1/processparameter/barcode-list'
// const BARCODE_TABLE_DATA = 'static/parameterVue/BARCODE_TABLE_DATA.json'
// 曲线图接口
const CHART_DATA = window.HOST + '/api/v1/processparameter/by-equipment-time'
// const CHART_DATA = 'static/parameterVue/CHART_DATA.json'
// 条码详情接口
const BARCODE_DETAIL_DATA = window.HOST + '/api/v1/processparameter/by-equipment-time-barcode'
// const BARCODE_DETAIL_DATA = 'static/parameterVue/BARCODE_DETAIL_DATA.json'

export default {
  components: {
    'v-dialog': VideoDialog,
    'v-table': table
  },
  data () {
    return {
      // 条码筛选。
      barcode: '',
      // 条码详情无数据提示。
      detailTip: '',
      activeName: 'charts',
      // 当前图形tab。
      activeChart: 'chart0',
      excel: true,
      print: true,
      loading: false,
      chartShow: true,
      sErrorMessage: '',
      empty: '暂无数据。',
      error: false,
      styleObject: {
        //  "min-width": "2000px"
      },
      tdResize: true, // 是否允许拖动table大小
      condition: {}, // 显示的查询条件
      oQuery: {}, // 查询条件。
      filters: {},
      // 条件对应中文名
      dataName: [
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
      /* echarts的配置文件 */
      options: [],
      /* 实际的echarts实例 */
      myEcharts: [],
      routerContent: 0,
      flexbase: 200,
      tableDatas: [],
      chartFetched: false, // 曲线表是否获取过数据
      tableFetched: false, // 条码表是否获取过数据
      chartTableHeight: 400,
      /* 条码表 */
      barcodeTableData: {
        loading: false,
        filename: '条码表',
        columns: [
          {
            type: 'expand',
            width: '100',
            show: true, // 是否在表头显示
            isNotShowInExcel: true
          },
          {
            name: '条码',
            prop: 'barcode',
            show: true
          },
          {
            name: '最小采集时间',
            prop: 'minPickTime',
            show: true
          },
          {
            name: '最大采集时间',
            prop: 'maxPickTime',
            show: true
          }
        ],
        data: [],
        height: 400,
        show: true
      },
      ruleForm: {
        input: ''
      },
      tabPaneNum: 0,
      code: 0,
      videoForm: {
        visible: false,
        equipmentId: '',
        equipmentName: '',
        startDate: '',
        endDate: ''
      }
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
    resize: function () {
      return this.$store && this.$store.state.resize
    },
    fullscreen: function () {
      return this.$store && this.$store.state.fullscreen
    },

    /* 列信息 */
    columns: function () {
      return this.barcodeTableData.columns
    },
    /* 显示的行信息 */
    datas: function () {
      if (this.ruleForm.input === '') {
        return this.barcodeTableData.data
      } else {
        return this.updateRow(this.ruleForm.input)
      }
    },
    /* 当前tabs下的echart */
    nowEchart () {
      let oEchart = this.myEcharts.filter(o => o.index === this.tabPaneNum)[0]
      return oEchart.echart
    },
    setWidth () {
      this.styleObject.minWidth = '1000px'
    },
    removeWidth () {
      this.styleObject.minWidth = 0
    },
    // 是否开启视频监控
    showCamera () {
      return this.$store.state.factoryModule.cameraFetched
    },
    // 是否支持遏制。
    supression () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.supression
      )
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.addEvent() // 监听resize变化 触发 echarts.resize()

      this.routerContent = document.querySelector('#parameter').offsetHeight // 获取初始高度
      this.flexbase = this.adjustHeight()
      this.chartTableHeight = this.setChartTableHeight()
      this.barcodeTableData.height = this.setBarcodeTableHeight()
    })
  },

  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      // 当是工艺参数时，更新数据
      if (to.meta.title === 'parameter') {
        // 初始化数据。
        console.log('watch $route')
        this.initData()
        this.fetchData()
      }
    },
    resize: 'updateEcharts',
    /* 上下拖动时，重新设置flexBase大小变化 */
    resizeY: function () {
      if (this.$route.meta.title === 'parameter') {
        this.setFlexBase()
        this.chartTableHeight = this.setChartTableHeight()
        this.barcodeTableData.height = this.setBarcodeTableHeight()
      }
    },
    /* 全屏大小时，重新设置flexBase大小 */
    fullscreen: function () {
      if (this.$route.meta.title === 'parameter') {
        this.setFlexBase()
        this.chartTableHeight = this.setChartTableHeight()
        this.barcodeTableData.height = this.setBarcodeTableHeight()
      }
    }
  },
  methods: {
    // 初始化数据。
    initData () {
      this.barcode = ''
      this.activeName = 'table'
      this.tabPaneNum = 0
      this.activeChart = 'chart0'
      this.myEcharts = []
    },
    // 获取数据。
    fetchData () {
      this.code = this.$route.query.code
      Object.keys(this.$route.query).forEach(el => {
        if (el === 'equipmentId' || el === 'startTime' || el === 'endTime') {
          // equipmentIdList//equipmentList
          this.oQuery[el] = this.$route.query[el]
        }
        if (el === 'equipmentName' || el === 'startTime' || el === 'endTime') {
          this.condition[el] = this.$route.query[el]
        }
      })
      this.filters = this.getFilters()

      if (this.activeName === 'table') {
        // 条码表。
        this.fetchBarcodeTableData()
      } else {
        // 获取曲线图数据。
        this.fetchChartData()
      }
    },
    // 获取曲线图数据。
    fetchChartData () {
      this.loading = true

      this.chartFetched = true
      /* 设置显示信息和查询条件 */

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        CHART_DATA,
        'get',
        this.oQuery,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    // 获取条码表数据。
    fetchBarcodeTableData () {
      this.barcodeTableData.loading = true
      this.tableFetched = true
      this.detailTip = ''
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        BARCODE_TABLE_DATA,
        'get',
        this.oQuery,
        this.requestBarcodeDataSucess,
        this.requestBarcodeDataFail,
        this.requestBarcodeDataError
      )
    },
    // 获取条码数据成功。
    requestBarcodeDataSucess (aoData) {
      this.barcodeTableData.loading = false
      if (aoData.length) {
        // 若有数据。
        this.barcodeTableData.show = true
        this.barcodeTableData.data = aoData.map(o => {
          o.list = []
          // 是否已请求详情数据。
          o.fetched = false
          return o
        })
      } else {
        // 若无数据，影藏tab。
        this.barcodeTableData.show = false
        // 激活曲线图。
        this.fetchChartData()

        this.detailTip = '暂无数据。'
      }
    },
    // 获取条码数据失败。
    requestBarcodeDataFail () {
      this.barcodeTableData.loading = false
      this.barcodeTableData.show = false
      this.detailTip = '暂无数据。'
      // 激活曲线图。
      this.fetchChartData()
    },
    // 获取条码数据错误。
    requestBarcodeDataError () {
      this.barcodeTableData.loading = false
      this.barcodeTableData.show = false
      this.detailTip = '暂无数据。'
      // 激活曲线图。
      this.fetchChartData()
    },
    getFilters () {
      let filters = this.condition
      for (let i in filters) {
        if (filters[i] === '' || i === '_tag') {
          delete filters[i]
        }
      }
      /* 为了将获取到的 barcode等转换为对应的中文 */
      let b = window.Rt.utils.getObjectEntries(filters)// Object.entries(filters)
      let a = this.dataName

      b.forEach(o =>
        a.forEach(function (x) {
          if (o[0] === x.itemCode) {
            o[0] = x.itemName
          }
        })
      )
      return b
      /* 为了将获取到的 barcode等转换为对应的中文 */
    },
    // 请求成功 --获取曲线图数据。
    requestSucess (oData) {
      this.loading = false
      if (!oData.length) {
        // 如果查询结果为空
        this.error = true
        this.chartShow = false
        // 数据不存在时，直接返回。
        return 0
      } else {
        this.error = false
        let optionArr = []
        let tableDataArr = []
        oData.forEach(element => {
          element.isWarn = '#606266'
          _.forEach((element.list), (el) => {
            if (element.maxValue === element.minValue) {
              return false
            } else if (parseInt(el.value) > parseInt(element.maxValue) || parseInt(el.value) < parseInt(element.minValue)) {
              element.isWarn = 'red'
              return false
            }
          })
        })
        let optionsData = oData // 获取到的data
        // debugger
        optionsData.map((data, index) => {
          if (data.valueType === 1) {
            optionArr.push(this.initOption(data, index))
            tableDataArr.push(this.setTableData(data, index))
            return optionArr
          } else {
          /* 没有图就加入一个空的对象 */
            optionArr.push({ option: null })
          /* 做成表格 */
            tableDataArr.push(this.setTableData(data, index))
            return tableDataArr
          }
        })
        tableDataArr.forEach(e => {
          let value = optionArr.some(el => {
            return el.optionModal && el.optionModal.series[0].name === e.filename
          })

          if (!value) {
            e.value = '表格'
          }
        })
        this.options = optionArr // 将处理后的 option 放入 options 中
        this.tableDatas = tableDataArr // 将处理后的 tableData 放入 tableData 中
        this.$nextTick(() => {
          if (this.options[0].index === 0) {
          // 如果第一个tabs有图表，则渲染
            this.initEcharts(this.options[0].optionModal, 0)
            this.setChartEvent()
          }
        })
      }
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
      this.error = true
      this.chartShow = false
      // 提示信息。
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.loading = false
      this.styleObject.minWidth = 0
      this.error = true
      this.chartShow = false
      console.log('数据库查询出错。')
      console.log(err)
    },
    // 选中修改。
    tabChange (oTab) {
      if (oTab === 'charts') {      // 若为曲线图。
        if (!this.chartFetched) {   // 若曲线图未获取数据。
          this.fetchChartData()
        } else if (this.chartShow) {
          this.$nextTick(() => {
            this.nowEchart.resize()
          })
        }
      } else {                      // 若为条码表。
        if (!this.tableFetched) {   // 若条码表未获取数据。
          this.fetchBarcodeTableData()
        }
      }
    },
    /* 根据刷选条件显示行 */
    updateRow (value) {
      let odata
      if (value !== '') {
        let reg = new RegExp('\\w*' + value + '\\w*')
        odata = this.barcodeTableData.data.filter(el => {
          return reg.test(el.barcode) === true
        })
      } else {
        odata = this.barcodeTableData.data
      }
      return odata
    },
    // 获取条码对应的详情数据。
    expandRow (row, expanded) {
      if (expanded) {
        // 若为展开。
        let rowData = this.barcodeTableData.data.filter(
          o => o.barcode === row.barcode
        )[0]

        if (!rowData.fetched) {
          // 若为第一次打开，获取详情数据。
          rowData.fetched = true
          this.$register.sendRequest(
            this.$store,
            this.$ajax,
            BARCODE_DETAIL_DATA,
            'get',
            Object.assign({ barcode: row.barcode }, this.oQuery),
            aoData => {
              aoData.forEach(o => {
                let oFilter = rowData.list.filter(
                  item => item.varStdId === o.varStdId
                )[0]
                let standard = false  // 标准是否存在
                if (o.maxValue === o.minValue && o.minValue === 0) { // 如果上下限都等于0 则代表没有上下限规则
                  standard = false
                } else {
                  standard = true
                }
                if (oFilter) {
                  oFilter.params.push({
                    pickTime: new Date(o.pickTime).Format('hh:mm:ss'),
                    value: o.value,
                    isWarn: (parseInt(o.value) > parseInt(o.maxValue) || parseInt(o.value) < parseInt(o.minValue)) && standard ? 'red' : '#606266'
                  })
                } else {
                  rowData.list.push({
                    varStdId: o.varStdId,
                    description: o.description,
                    varUnit: o.varUnit,
                    params: [
                      {
                        pickTime: new Date(o.pickTime).Format('hh:mm:ss'),
                        value: o.value,
                        isWarn: (parseInt(o.value) > parseInt(o.maxValue) || parseInt(o.value) < parseInt(o.minValue)) && standard ? 'red' : '#606266'
                      }
                    ]
                  })
                }
              })
            }
          )
        }
      }
    },
    /* 获取高度函数 */
    adjustHeight () {
      let getHeight = 0
      getHeight = Math.floor(
        this.viewHeight -
          this.outerHeight(document.querySelector('#parameter .condition')) -
          this.outerHeight(
            document.querySelector('#parameter #content-title')
          ) -
          this.outerHeight(
            document.querySelector('#parameter .el-tabs__nav-scroll')
          )
      )
      return getHeight
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      if (!el) {
        return 0
      }
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    /* 设置table实际高度 */
    setFlexBase () {
      if (document.querySelector('#parameter')) {
        this.routerContent = document.querySelector('#parameter').offsetHeight
        this.flexbase = this.adjustHeight()
      }
    },
    // 设置图形表高度。
    setChartTableHeight () {
      let chartTableHeight =
        this.flexbase -
        30 - // 条码表/曲线图tab
        57 - // 曲线图参数tab
        35 - // 表格标题
        10 - // 表格margin-bottom
        // 30 - // 遏制按钮的高度
        20

      return chartTableHeight
    },
    // 设置条码表高度。
    setBarcodeTableHeight () {
      let barcodeTableHeight =
        this.flexbase -
        30 - // 条码表/曲线图tab
        50 - // 条码筛选框
        20 // 表格margin

      return barcodeTableHeight
    },
    /* 处理每个tableData */
    setTableData (data, index) {
      let tableData = {
        isWarn: data.isWarn,
        filename: '名称',
        unit: '',
        description: '',
        varStdId: '',
        columns: [
          {
            name: '条码',
            prop: 'barcode',
            width: ''
          },
          {
            name: '检测值',
            prop: 'value',
            width: ''
          },
          {
            name: '采集时间',
            prop: 'pickTime',
            width: ''
          }
        ],
        id: 0,
        data: [],
        value: '图形'
      }
      tableData.varStdId = data.varStdId
      tableData.unit = data.varUnit
      tableData.filename = data.description
      const maxValue = data.maxValue  // 最大值
      const minValue = data.minValue  // 最小值
      let isWarn = false              // 不存在上下限就不存在 `警告`
      if (maxValue !== minValue) {    // 存在上下限
        isWarn = true
      }
      tableData.data = data.list.map(el => {
        let arr = {}
        arr.value = el.value
        arr.pickTime = el.pickTime
        arr.barcode = el.barcode || ''
        arr.checked = false
        // 上下限存在且数值不在范围内
        arr.isWarn = isWarn && (parseInt(el.value) > parseInt(maxValue) || parseInt(el.value) < parseInt(minValue))
        return arr
      })

      return tableData
    },
    /* 处理每个option */
    initOption (data, index) {
      /* 定义option模板 */
      let barcodes = data.list.map(el => {
        return {
          barcode: el.barcode,
          axisValue: el.pickTime
        }
      })
      let optionModal = {
        title: {
          // text: 'XX 参数图表',
          textStyle: {
            fontSize: 16,
            fontFamily: 'Microsoft YaHei',
            fontWeight: '400'
          },
          left: 4
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let barcode = barcodes.find((el, index) => {
              return el.axisValue === params[0].axisValue
            }).barcode
            if (barcode === null) {
              return `
                ${params[0].name}
                <br/>
                <div>
                    ${params[0].marker}
                    ${params[0].seriesName}：
                    ${params[0].value}
                </div>
              `
            } else {
              return `
                ${params[0].name}
                <br/>
                <div>
                    ${params[0].marker}
                    条码：
                    ${barcode}
                </div>
                <div>
                    ${params[0].marker}
                    ${params[0].seriesName}：
                    ${params[0].value}
                </div>
              `
            }
          }
        },
        legend: {
          data: ['XX参数']
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          },
          right: 2
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            start: 0,
            end: 100,
            filterMode: 'empty'
          }

        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: function (val, index) {
              return new Date(val).Format()
            },
            textStyle: {
              color: '#333'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 50,
          max: 400,
          axisLabel: {
            formatter: '{value} ',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            show: false
          }
        },
        visualMap: {
          show: false,
          // pieces: [
          // {
          //     gt: 0,
          //     lte: 4,
          //     color: '#e60012'
          // }, {
          //     gt: 4,
          //     lte: 21,
          //     color: '#abcc52'
          // }, {
          //     gt: 21,
          //     lte: 100,
          //     color: '#e60012'
          // }],
          outOfRange: {
            color: '#999'
          }
        },
        series: [
          {
            name: 'XX参数',
            type: 'line',
            //  smooth: true,
            //  smoothMonotone: "x",
            //  symbol: 'circle',  //曲线
            data: [],
            markLine: {
              // data: [
              //     {
              //         yAxis: 21,
              //         name: '上限',
              //         lineStyle: {
              //             normal: {
              //                 color: "#febf00",
              //                 width: 2
              //             }
              //         }
              //     },
              //     {
              //         yAxis: 4,
              //         name: '下限',
              //         lineStyle: {
              //             normal: {
              //                 color: "#febf00",
              //                 width: 2
              //             }
              //         }
              //     }
              // ]
            }
          }
        ]
      }

      /* 设置option */
      // optionModal.title.text = data.description //设置图表名称
      optionModal.legend.data[0] = data.description // 设置参数名称
      optionModal.xAxis.data = data.list.map(el => {
        return el.pickTime
      }) // 设置横坐标值
      optionModal.yAxis.axisLabel.formatter = data.varUnit
        ? '{value}' + data.varUnit
        : '{value}' // 设置纵坐标单位
      optionModal.series[0].name = data.description // 设置参数名称
      optionModal.series[0].data = data.list.map(el => {
        return el.value
      }) // 设置纵坐标值

      /* 设置纵坐标的起始值 */
      const arrY = optionModal.series[0].data // Y轴的所有值
      const yMax = Math.max(...arrY) // 获取Y轴最大值
      const yMin = Math.min(...arrY) // 获取Y轴最小值
      const maximum = data.maxValue // 获取上限值
      const minimum = data.minValue // 获取下限值

      if (data.minValue === data.maxValue) {
        // 没有上下限的时候（上限值 === 下限值）
        optionModal.visualMap.pieces = []
        optionModal.visualMap.pieces.push({
          gt: yMin - 1, // 设置下限
          lte: yMax + 1, // 设置上限
          color: '#abcc52' // 设置颜色
        })
        // optionModal.visualMap.pieces[0].gt = yMin   //设置下限
        // optionModal.visualMap.pieces[0].lte = yMax  //设置上限
        // optionModal.visualMap.pieces[0].color = '#abcc52' //设置颜色
      } else {
        optionModal.series[0].markLine.data = []
        optionModal.series[0].markLine.data.push({
          yAxis: data.maxValue, // 设置上限值
          name: '上限',
          lineStyle: { normal: { color: '#febf00', width: 2 } } // 上限的样式
        })
        // optionModal.series[0].markLine.data[0].yAxis = data.maxValue           //设置上限值
        // optionModal.series[0].markLine.data[0].name = '上限'
        // optionModal.series[0].markLine.data[0].lineStyle = { normal:{color: "#febf00",width: 2}}  //上限的样式

        optionModal.series[0].markLine.data.push({
          yAxis: data.minValue, // 设置上限值
          name: '下限',
          lineStyle: { normal: { color: '#febf00', width: 2 } } // 下限的样式
        })
        // optionModal.series[0].markLine.data[1].yAxis = data.minValue           //设置下限值
        // optionModal.series[0].markLine.data[1].name = '下限'
        // optionModal.series[0].markLine.data[1].lineStyle = { normal:{color: "#febf00",width: 2}}  //下限的样式

        /* 设置颜色变化的上下限 */
        optionModal.visualMap.pieces = []
        optionModal.visualMap.pieces.push({
          gt: data.minValue - 100 < 0 ? 0 : data.minValue - 100,
          lte: data.minValue, // 设置下限
          color: '#e60012' // 设置低于下限颜色
        })
        // optionModal.visualMap.pieces[0].gt = (data.minValue - 100) < 0 ? 0 : (data.minValue - 100)
        // optionModal.visualMap.pieces[0].lte = data.minValue  //设置下限
        // optionModal.visualMap.pieces[0].color = '#e60012'    //设置低于下限颜色

        optionModal.visualMap.pieces.push({
          gt: data.minValue, // 设置下限
          lte: data.maxValue, // 设置上限
          color: '#abcc52' // 设置正常颜色
        })
        // optionModal.visualMap.pieces[1].gt = data.minValue   //设置下限
        // optionModal.visualMap.pieces[1].lte = data.maxValue  //设置上限
        // optionModal.visualMap.pieces[1].color = '#abcc52'    //设置正常颜色

        optionModal.visualMap.pieces.push({
          gt: data.minValue, // 设置上限
          lte: data.maxValue + 100,
          color: '#e60012' // 设置正常颜色
        })

        // optionModal.visualMap.pieces[2].gt = data.maxValue   //设置上限
        // optionModal.visualMap.pieces[2].lte = data.maxValue + 100
        // optionModal.visualMap.pieces[2].color = '#e60012'    //设置高于上限颜色
      }

      optionModal.yAxis.min = Math.ceil(Math.min(yMin, minimum) * 0.9) // 设置Y轴开始值为 最小值或最小合格值的0.9倍
      optionModal.yAxis.max = Math.ceil(Math.max(yMax, maximum) * 1.1) // 设置Y轴结束值为 最大值或最大合格值的1.1倍
      // console.log(optionModal)

      let obj = {
        index: index,
        rendered: false,
        optionModal: optionModal
      }

      return obj
    },
    /* 绘制图表 */
    initEcharts (option, index) {
      // debugger
      if (this.options[index].rendered) {
        return 0
      } else {
        this.options[index].rendered = true
        let chart = document.getElementById('charts' + index)
        let echart = this.$echarts.init(chart)
        echart.setOption(option)
        //              this.myEcharts.push(echart)  //将生成的echarts实例对象放到 ' this.myEcharts ' 中
        this.myEcharts.push({
          index,
          echart
        })
      }
    },
    /* 当窗口大小变化，自适应大小 */
    updateEcharts () {
      // 图形存在时，则做resize处理。
      let oEchart = this.myEcharts.filter(o => o.index === this.tabPaneNum)[0]
      oEchart && oEchart.echart.resize()
    },
    // 设置图表事件。
    setChartEvent () {
      this.nowEchart.on('datazoom', this.getChartTime)
    },
    /* 监听dataZoom 事件,获取时间 */
    getChartTime () {
      // console.log(this.nowEchart.getOption())
      // console.log(this.nowEchart.getOption().dataZoom[0])

      let oData = this.nowEchart.getOption().xAxis[0].data               // 横坐标的所有值
      const min = Date.parse(new Date(oData[0]))                         // 最小时间
      const max = Date.parse(new Date(oData[oData.length - 1]))          // 最大时间
      const difValue = max - min                                         // 起始时间的差 绝对值

      const minPer = this.nowEchart.getOption().dataZoom[0].start / 100  // 当前开始时间  占总时间百分比
      const maxPer = this.nowEchart.getOption().dataZoom[0].end / 100    // 当前结束时间  占总时间百分比

      const newStratTime = new Date(minPer * difValue + min).Format()    // 选中的开始时间
      const newEndTime = new Date(maxPer * difValue + min).Format()      // 选中的结束时间
      console.log(`开始时间:${newStratTime}`)
      console.log(`结束时间:${newEndTime}`)
      return {newStratTime, newEndTime}
    },
    /* 监听窗口大小 更新echarts的大小 */
    addEvent () {
      window.addEventListener('resize', this.updateEcharts)
      window.addEventListener('resize', this.setFlexBase)
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

      if (oTable instanceof Array) {
        oTable = oTable[0]
      }
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
    // 切换tabs
    chartTabChange (tab, event) {
      const index = +tab.index // 当前第几个tabs
      this.tabPaneNum = index
      this.activeChart = `chart${index}`

      // 判断当前是否存在图形。
      if (this.options[index].optionModal) {
        // 存在图形处理。
        if (!this.options[index].rendered) {
          this.$nextTick(() => {
            this.initEcharts(this.options[index].optionModal, index)
            this.setChartEvent()
          })
        } else {
          this.$nextTick(() => {
            this.updateEcharts()
          })
        }
      }
    },
    // 切花switch
    switchChange (value) {
      if (value === `图形`) {
        this.$nextTick(() => {
          this.updateEcharts()
        })
      }
    },
    // 表格内选择时间
    chooseTime (value, objArr, index) {
      let arr = objArr.filter((el, index) => {
        if (el.checked) {
          el.index = index
          return el
        }
      })
      if (arr.length > 2) {
        if (arr[0].index !== index) {
          objArr[arr[0].index].checked = false
        } else {
          objArr[arr[1].index].checked = false
        }
      }
    },
    // 显示可疑品列表
    showSuspiciousList () {
      const value = this.tableDatas[this.tabPaneNum].value
      let oQuery = {
        equipmentName: this.condition.equipmentName,  // 设备名称
        shiftStartTime: this.condition.startTime,     // 开始时间
        shiftEndTime: this.condition.endTime,         // 结束时间
        equipmentId: this.oQuery.equipmentId,         // 设备ID
        code: this.code
      }
      if (value === '表格') {
        let oData = this.tableDatas[this.tabPaneNum].data
        let arr = oData.filter(el => {
          return el.checked
        })
        if (arr.length !== 2) {
          this.$message({
            showClose: true,
            message: '请选择起始时间',
            type: 'error'
          })
        } else {
          this.$router.replace({
            path: '/process/restrain',
            query: Object.assign({}, {startTime: arr[0].pickTime, endTime: arr[1].pickTime}, oQuery)
          })
        }
      } else {
        let oDate = this.getChartTime()
        this.$router.replace({
          path: '/process/restrain',
          query: Object.assign({}, {startTime: oDate.newStratTime, endTime: oDate.newEndTime}, oQuery)
        })
      }
    },
    // 隐藏监控视频。
    hideVideoDialog () {
      this.videoForm.visible = false
    },
    // 打开监控视频。
    showVideoDialog (time, row) {
      let myVideoForm = {
        visible: true,
        equipmentId: this.oQuery.equipmentId,         // 设备ID
        equipmentName: this.condition.equipmentName,  // 设备名称
        shiftStartTime: this.condition.startTime     // 开始时间
      }
      if (this.activeName === 'charts') {
        const value = this.tableDatas[this.tabPaneNum].value
        if (value === '表格') {
          let oData = this.tableDatas[this.tabPaneNum].data
          let arr = oData.filter(el => {
            return el.checked
          })
          if (arr.length !== 2) {
            this.$message({
              showClose: true,
              message: '请选择起始时间',
              type: 'error'
            })
          } else {
            this.videoForm = Object.assign({}, {startDate: arr[0].pickTime, endDate: arr[1].pickTime}, myVideoForm)
          }
        } else {
          let oDate = this.getChartTime()
          this.videoForm = Object.assign({}, {startDate: oDate.newStratTime, endDate: oDate.newEndTime}, myVideoForm)
        }
      } else if (this.activeName === 'table') {
        let dateTime = row['maxPickTime'].split(' ')[0] + ' ' + time
        let _time = new Date(dateTime).getTime()  // 点击的时间
        let startDate = new Date(_time - 1000 * 60 * 10).Format()
        let endDate = new Date(_time + 1000 * 60 * 10).Format()
        this.videoForm = Object.assign({}, {startDate, endDate}, myVideoForm)
      }
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
.contentBox {
  & > .el-tabs {
    & > .el-tabs__header {
      border-bottom: none;
      margin: 0;

      .el-tabs__item {
        background-color: #fff;
        border: 2px solid #42af8f;
        height: 30px;
        line-height: 30px;

        &.is-active {
          background-color: #42af8f;
          color: #fff;
        }
      }
      .el-tabs__active-bar {
        display: none;
      }
    }
  }
  .chart {
    .error {
      margin-top: 20px;
    }
    .el-tabs {
      .el-tabs__header {
        border-bottom-color: #ccc;
        .el-tabs__nav-wrap {
          .el-tabs__nav-scroll {
            .el-tabs__nav {
              .el-tabs__item {
                color: #666;
                &:hover {
                  color: #333;
                }
              }
              .is-active {
                color: #42af8f;
              }
            }
          }
        }
      }
      .el-tabs__content {
        overflow: auto;
      }
    }
  }
}
.el-switch__label {
  span {
    font-size: 12px;
    top: 4.5px;
  }
}

#parameter .charts {
  width: calc(100% - 2px);
  box-sizing: border-box;
  min-height: 400px;
}

#parameter .inner-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  .condition {
      border: 2px solid #42af8f;
      padding: 20px 12px;
      margin-bottom: 20px;
    }
  .content-title {
    margin-top: 0;
    height: 20px;
    line-height: 20px;
  }
  .contentBox {
    display: flex;
    flex: 1 1;
    flex-direction: column;

    .el-tabs {
      display: flex;

      height: 100%;
      flex-direction: column;

      .el-tabs__content {
        flex: 1 1;

        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .barcode-input {
      margin-top: 20px;
      .el-form {
        display: inline-block;

        .el-form-item {
          margin-bottom: 0;
        }
        .el-input {
          width: 300px;
        }
      }
      span {
        float: right;
      }
      .table-handle {
        .icon {
          &:hover {
            cursor: pointer;
          }
        }
      }
    }

    .content-table {
      margin: 10px 0;
    }
  }
  .content-tables {
    margin-top: 0;
    margin-bottom: 10px;
    .tableData {
      font-size: 14px;
      text-indent: 0;
      display: flex;
      border-left: 0;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      margin-top: 0;
      .table-handle {
        margin-right: 5px;
        i {
          margin: 5px;
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
  }
  .btn-box {
    display: flex;
    justify-content: center;
  }
}

#parameter .table {
  .el-table__body-wrapper {
    overflow-x: hidden;
  }
  .error {
    margin-top: 20px;
  }
  .isWarn {
    color: red
  }
  .el-table__expanded-cell {
    padding: 5px 10px 5px 50px;
  }
  .expand-form {
    .el-form-item {
      margin: 5px 10px;
    }
    .expand-lable {
      display: flex;
      .el-form-item__label {
        flex-basis: 70px;
      }
      .el-form-item__content {
          .expand-span {
            margin:  0 10px;
          }
        }
      .el-form-item__content {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
