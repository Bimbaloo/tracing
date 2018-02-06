<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                    <el-form :model="ruleForm"  ref="ruleForm" class='el-form-input'>
                        <el-form-item label="条码：" > 
                             <el-input v-model="ruleForm.input" placeholder="请输入条码"  @change="updateRow" ></el-input>
                        </el-form-item>
                    </el-form>
                   
                </div>
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>fgb检验</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('fgbTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="fgbTable">
                <el-table :data="datas" stripe class="table" :row-key="tableData.data.prop" v-loading="loading" element-loading-text="拼命加载中" style="width: 100%" ref="multipleTable" @expand-change="dataEdit" :height="tableData.height">
                    <el-table-column v-if="!!column.show" v-for="column in columns" align="center" :type="column.type" :prop="column.prop" :label="column.name" :key="column.prop" :class-name="column.class" :width="column.width">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand table-form" v-if="column.type === 'expand'">
                                <!-- <el-form-item v-for="(prop,index) in props.row" v-if="!!setName(index) && setName(index) !== '采集时间' && setName(index) !=='条码'" :key="index">
                                    <span>{{ setName(index) }}：</span>
                                    <span>{{ prop }}</span>
                                </el-form-item> -->
                                <el-form-item 
                                :label="setName(index)" 
                                v-for="(prop,index) in props.row" 
                                :key="index"
                                v-if="!!setName(index) && setName(index) !== '采集时间：' && setName(index) !=='条码：'">
                                    <span :title="prop">{{ prop }}</span>
                                </el-form-item>
                            </el-form>
                            <div v-else :class="[ 'cell-content']">
                                {{ props.row[column.prop] }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
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

const url = window.HOST + '/api/v1/fgb/by-equipment-time'
const url2 = window.HOST + `/api/v1/fgb/by-dataid`
// const url = "static/fgb.json"
// const url2 = "static/fgb2.json"

export default {
  components: {
    'v-table': table
  },
  data () {
    return {
      excel: true,
      print: true,
      loading: false,
      sErrorMessage: '',
      empty: '暂无数据。',
      styleObject: {
        // "min-width": "1000px"
      },

      // loading: false,
      condition: {}, // 查询条件
      filters: {},
      dataName: [
        // 条件对应中文名
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
      /* fgb */
      tableData: {
        filename: 'fgb检验',
        columns: [
          {
            type: 'expand',
            width: '100',
            show: true // 是否在表头显示
          },
          {
            name: '条码',
            prop: 'value',
            show: true
          },
          {
            name: '采集时间',
            prop: 'pickTime',
            show: true
          }
        ],
        data: [],
        height: 1
      },

      routerContent: 0,
      ruleForm: {
        input: ''
      },
      expandedId: [] // 用于保存展开过的行的id
    }
  },
  created () {
    this.fetchData() // 获取数据
  },
  computed: {
    viewHeight: function () {
      return this.routerContent
    },
    resizeY: function () {
      return this.$store && this.$store.state.resizeY
    },
    fullscreen: function () {
      return this.$store && this.$store.state.fullscreen
    },
    /* 列信息 */
    columns: function () {
      return this.tableData.columns
    },
    /* 显示的行信息 */
    datas: function () {
      if (this.ruleForm.input === '') {
        return this.tableData.data
      } else {
        return this.updateRow(this.ruleForm.input)
      }
    }
  },
  mounted () {
    this.routerContent = document.querySelectorAll('.el-tabs')[0].offsetHeight // 获取初始高度
    this.tableData.height = this.adjustHeight()
  },
  updated () {},
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      // 当是质检时，更新数据
      if (to.meta.title === 'fgbReport') {
        this.fetchData()
      }
    },
    /* 上下拖动时，重新设置table大小变化 */
    resizeY: 'setTbaleHeight',
    /* 全屏大小时，重新设置table大小 */
    fullscreen: 'setTbaleHeight'
  },
  methods: {
    getFilters () {
      let filters = this.condition
      for (let i in filters) {
        if (filters[i] === '' || i === '_tag') {
          delete filters[i]
        }
      }
      /* 为了将获取到的 barcode等转换为对应的中文 */
      let b = Object.entries(filters)
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
    // 判断调用接口是否成功。
    judgeLoaderHandler (param, fnSu, fnFail) {
      let bRight = param.data.errorCode

      // 判断是否调用成功。
      if (!bRight) {
        // 调用成功后的回调函数。
        fnSu && fnSu()
      } else {
        // 提示信息。
        console.log(param.data.errorMsg.message)
        // 失败后的回调函。
        fnFail && fnFail()
      }
    },
    // 显示提示信息。
    showMessage () {
      this.$message({
        message: this.sErrorMessage,
        duration: 3000
      })
    },
    // 请求成功。
    requestSucess (oData) {
      this.loading = false
      this.tableData.data = oData
      this.setTbaleHeight()
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
      // 提示信息。
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.loading = false
      this.styleObject.minWidth = 0
      console.log('数据库查询出错。')
      console.log(err)
    },
    // 获取数据。
    fetchData () {
      this.loading = true
      let oQuery = {}
      Object.keys(this.$route.query).forEach(el => {
        if (el === 'equipmentId' || el === 'startTime' || el === 'endTime') {
          oQuery[el] = this.$route.query[el]
        }
        if (el === 'equipmentName' || el === 'startTime' || el === 'endTime') {
          this.condition[el] = this.$route.query[el]
        }
      })
      this.filters = this.getFilters()
      /* 测试数据 */
      // oQuery = {
      //     "equipmentId": "69",
      //     "startTime": "2017-08-28 19:00:00",
      //     "endTime": "2017-08-28 20:00:00"
      // }

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        url,
        'get',
        oQuery,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
      // this.$get(url, oQuery)
      //     .then((res) => {
      //         this.loading = false;

      //         this.judgeLoaderHandler(res, () => {
      //             this.tableData.data = res.data.data
      //         });
      //     })
      //     .catch((err) => {
      //         this.loading = false;
      //         this.styleObject.minWidth = 0;
      //         console.log("数据库查询出错。")
      //     })
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
    // 获取高度。
    adjustHeight () {
      let ntable = 0
      ntable = Math.floor(
        this.viewHeight -
        (document.querySelector('.condition')
          ? this.outerHeight(document.querySelector('.condition'))
          : 0) -
        (document.querySelector('.router-path')
          ? this.outerHeight(document.querySelector('.router-path'))
          : 0) -
        56 - //   this.outerHeight(document.querySelector(".content-title.outTitle"))
        20 - // 表格margin-bottom
          40
      )
      return ntable
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    /* 设置table实际高度 */
    setTbaleHeight () {
      if (this.$route.meta.title === 'fgbReport') {
        this.routerContent = document.querySelectorAll(
          '.el-tabs'
        )[0].offsetHeight // 获取初始高度
        this.tableData.height = this.adjustHeight()
      }
    },
    /* 根据新获取的检验值，找到对应的中文 */
    setName (val) {
      let cName = this.tableData.columns.find(el => {
        return el.prop === val
      })
      return cName ? cName.name + '：' : false
    },
    /* 根据新获取的检验值，设置中文名和英文名对应关系 */
    dataEdit (row, expanded) {
      let Id = row.dataId
      if (!!expanded && !this.expandedId.some(el => el === Id)) {
        // 如果展开的话
        let dataId = {
          dataId: Id
        }

        this.$register.sendRequest(
          this.$store,
          this.$ajax,
          url2,
          'get',
          dataId,
          oData => {
            oData.forEach(el => {
              let newData = {
                name: `${el.description}`,
                prop: `${el.description}`
              }
              this.tableData.columns.push(newData)
              this.$set(row, `${el.description}`, `${el.value}${el.varUnit}`)
            })
            this.expandedId.push(Id)
          },
          sErrorMessage => {
            // 提示信息。
            console.log(sErrorMessage)
          },
          err => {
            console.log(err)
          }
        )
      }
    },
    /* 根据刷选条件显示行 */
    updateRow (value) {
      let odata
      if (value !== '') {
        let reg = new RegExp('\\w*' + value + '\\w*')
        odata = this.tableData.data.filter(el => {
          return reg.test(el.value) === true
        })
      } else {
        odata = this.tableData.data
      }
      return odata
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
.el-table__expanded-cell {
  background-color: #f4fcf9;
  padding: 0;
  .table-form {
    margin: 0;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .el-form-item {
      line-height: 40px;
      margin-right: 0;
      margin-bottom: 0;
      box-sizing: border-box;
      width: 33.3%;
      padding-left: 100px;
      display: flex;
      .el-form-item__label {
        flex-basis: 100px;
        text-align: right;
      }
      .el-form-item__content {
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
    }
  }
}
.el-input {
  width: 180px;
}
.el-input__inner {
  border-radius: 0;
  height: 30px;
}
@media screen and (max-width: 1400px) {
  .el-table__expanded-cell {
    .table-form {
      .el-form-item {
        padding-left: 60px;
      }
    }
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
      &:hover {
        cursor: pointer;
      }
    }
  }
  .table-table {
    i {
      margin: 5px;
    }
  }
}

.el-form-input {
  display: inline-block;
  margin-left: 60px;
  width: 240px;
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
