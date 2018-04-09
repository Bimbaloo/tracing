<template>
    <div id="app" class="report-wrapper">
        <div class="report-container" ref='restrainsReport'>
            <div class="page-icon" v-show="!isPageEdited">
                <i class="icon icon-20 icon-edit" title="修改" @click="setPageEditedState"></i>
				<i class="icon icon-20 icon-download" title="下载" @click="beforeDownloadPage('restrainsReport', $event)"></i>
            	<i class="icon icon-20 icon-print" title="打印" @click="beforePrintPage('restrainsReport', $event)"></i>
			</div>
            <div class="report-header">
                <h1 class="title">遏制报告</h1>
                <div class="tag report-time">
                    <span>报告人: {{ loginName }}</span>
                    <span>报告时间: {{ new Date().Format('yyyy-MM-dd hh:mm:ss') }}</span>
                </div>
            </div>
            <div class="report-main" :style="{height: isPageEdited ? contentHeight+'px' : '', overflow: isPageEdited ? 'auto' : 'inherit'}">
                <div class="report-item report-question-describe">
                    <h2 class="item-title">问题描述</h2>
                    <ul class="item-content">
                        <li  class="descripe-item" v-for="(question,key) in pageData.describe" :key="key">
                            <el-row>
                                <el-col :span="4"><span class="descripe-item-title">{{ getDescripeDisplay(key).title }}</span></el-col>
                                <el-col :span="4"><span class="descripe-item-name">{{ getDescripeDisplay(key).name }}</span></el-col>
                                <el-col :span="16">
                                    <span v-if="!isPageEdited" class="descripe-item-value">{{ question }}</span>
                                    <el-input v-else v-model="pageData.describe[key]"></el-input>
                                </el-col>
                            </el-row>
                        </li>
                    </ul>
                </div>
                <div class="report-item report-question-analysis">
                    <h2 class="item-title">问题分析</h2>
                    <div class="item-content">
                        <div :class="['item-handle', {'hide': !isPageEdited}]">
                            <el-button class="btn" type="primary" @click="addNewAnalysisItem">新增</el-button>
                            <el-button class="btn" type="primary" @click="delAnalysisItem">删除</el-button>
                        </div>
                        <el-table
                            :data="pageData.analysis"
                            :max-height="800"
                            border
                            ref="analysisTable"
                            @selection-change="selectionChange"
                            style="width: 100%">
                            <el-table-column
                                v-if="isPageEdited"
                                align="center"
                                type="selection"
                                width="50"
                            ></el-table-column>
                            <el-table-column
                                align="center"
                                label="图片">
                                <template slot-scope="scope">
                                    <el-upload
                                        :data-index="scope.$index"
                                        :class="['upload-demo', {'hideUpload': !isPageEdited}]"
                                        :action="oUrl.upload"
                                        :on-success="uploadImage"
                                        :before-upload="beforeUploadImage"
                                        :on-preview="previewImage"
                                        :before-remove="beforeRemoveImage"
                                        :file-list="scope.row.imgs"
                                        :disabled="!isPageEdited"
                                        list-type="picture-card">
                                            <div v-if="isPageEdited">
                                                <i class="el-icon-upload"></i>
                                            </div>
                                        </el-upload>
                                </template>
                            </el-table-column>
                            <el-table-column
                                align="center"
                                label="描述">
                                    <template slot-scope="scope">
                                        <el-input v-if="isPageEdited" type="textarea" v-model="scope.row.content"></el-input>
                                        <span v-else>{{ scope.row.content }}</span>
                                    </template>
                                </el-table-column>
                        </el-table>
                    </div>
                </div>
                <div class="report-item report-question-reason">
                    <h2 class="item-title">问题原因</h2>
                    <div class="item-content">
                        <el-row>
                            <el-col :span="24">
                                <span v-if="!isPageEdited">{{ pageData.reason }}</span>
                                <el-input v-else type="textarea" :rows="3" v-model="pageData.reason"></el-input>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div class="report-item report-question-suggest">
                    <h2 class="item-title">处置意见或建议</h2>
                    <div class="item-content">
                        <el-row>
                            <el-col :span="24">
                                <span v-if="!isPageEdited">{{ pageData.suggest }}</span>
                                <el-input v-else type="textarea" :rows="3" v-model="pageData.suggest"></el-input>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div class="report-item report-question-summary">
                    <h2 class="item-title">总结</h2>
                    <div class="item-content">
                        <el-row>
                            <el-col :span="24">
                                <span v-if="!isPageEdited">{{ pageData.summary }}</span>
                                <el-input v-else type="textarea" :rows="3" v-model="pageData.summary"></el-input>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div class="report-item report-question-readme" v-show="isPageEdited">
                    <h2 class="item-title">备注</h2>
                    <div class="item-content">
                        <el-row>
                            <el-col :span="24">
                                <span v-if="!isPageEdited">{{ pageData.readme }}</span>
                                <el-input v-else type="textarea" :rows="3" v-model="pageData.readme"></el-input>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <div class="report-item report-question-table">
                    <h2 class="item-title">遏制清单</h2>
                    <div class="item-content">
                  			<div class='condition-message'>
                            <span v-for="infor in information" :key="infor.value">{{infor.value}}：{{infor.key}}</span>
                  			</div>
                        <v-report :kill-progress="killProgress" :query="filters.handleId"  type="restrainDetails"></v-report>
                    </div>
                </div>
            </div>
            <div class="report-footer" v-show="isPageEdited">
                <el-button class="btn" type="primary" @click="submitChange">确定</el-button>
                <el-button class="btn" type="primary" @click="resetChange">取消</el-button>
            </div>
        </div>

        <!-- 打印配置 -->
        <el-dialog title="报告内容" center :visible.sync="dialogFormVisible" width="440px">
            <el-form :model="dialogConfigForm">
                <el-form-item>
                    <el-col :span="8" v-for="(config,key) in dialogConfigForm" :key="key">
                        <el-checkbox :label="config.name" v-model="dialogConfigForm[key].value">{{config.name}}</el-checkbox>
                    </el-col>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="downOrPrintPage('restrainsReport')">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="dialog.imageVisible">
            <img width="100%" :src="dialog.imageUrl" alt="" />
        </el-dialog>
    </div>
</template>

<script>
import report from 'components/report/report.vue'
import rasterizeHTML from 'rasterizehtml'
// import fnP from 'assets/js/public.js'

export default {
  components: {
    'v-report': report
  },
  props: {},
  data () {
    return {
      oUrl: {
        getList: window.HOST + '/api/v1/suppressreport/list-by-handle',
        save: window.HOST + '/api/v1/suppressreport/saveOrUpdate',
        upload: window.HOST + '/api/v1/uploadFile'
      },
      dialogFormVisible: false,
      isDownload: false,
      filters: {},
      dialogConfigForm: {
        describe: {
          name: '问题描述',
          value: true
        },
        analysis: {
          name: '问题分析',
          value: true
        },
        reason: {
          name: '问题原因',
          value: true
        },
        suggest: {
          name: '处置意见或建议',
          value: true
        },
        summary: {
          name: '总结',
          value: true
        },
        readme: {
          name: '备注',
          value: true
        },
        table: {
          name: '遏制清单',
          value: true
        }
      },
            // 是否处于编辑状态
      isPageEdited: false,
          // 未编辑前的数据。
      oBeforeData: {},
      // 预览图片
      dialog: {
        imageVisible: false,
        imageUrl: ''
      },
      killProgress: false,
          // 内容区域高度。
      contentHeight: 200,
      analysisSelectedIndex: [],
      pageData: {
        describe: {
          what: '',
          when: '',
          where: '',
          who: '',
          howMany: '',
          productTrace: ''
        },
        analysis: [],
        reason: '',
        suggest: '',
        summary: '',
        readme: ''
      }
    }
  },
  computed: {
    loginName () {
      return this.$store.state.loginModule.nickname !== null
        ? this.$store.state.loginModule.nickname
        : ''
    },
    query: function () {
      let url = location.search // 获取url中"?"符后的字串
      let oRequest = {}
      if (url.indexOf('?') !== -1) {
        let strs = url.substr(1).split('&')

        for (let i = 0; i < strs.length; i++) {
          oRequest[strs[i].split('=')[0]] = decodeURIComponent(
            strs[i].split('=')[1]
          )
        }
      }
      return oRequest
    },
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
          name: '解除遏制时间'
        },
        {
          prop: 'doOperator',
          name: '开始遏制人员'
        },
        {
          prop: 'endDescription',
          name: '解除遏制详情'
        },
        {
          prop: 'endOperator',
          name: '解除遏制人员'
        }
      ]
      let informationArr =
        Object.assign({}, this.filters) || {}
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
    }
  },
  created () {
          // 登录验证。
    this.$register.login(this.$store)

    let oConditions = sessionStorage.getItem('restrainReports_' + this.query.tag)

    if (oConditions) {
      oConditions = JSON.parse(oConditions)

      this.filters = oConditions
    } else {
      this.filters = {}
    }

    // 获取数据。
    this.fetchData()
  },
  mounted () {
    this.setHeight()
          // 窗口改变事件。
    window.onresize = () => {
      this.setHeight()
    }

    window.onbeforeunload = () => {
      this.killProgress = true
    }
  },
  methods: {
          /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
          // 设置table的高度
    setHeight () {
      let body = document.documentElement.clientHeight || document.body.clientHeight
      let header = document.querySelector('.report-header')
      let footer = document.querySelector('.report-footer')
      this.contentHeight = body - this.outerHeight(header) - this.outerHeight(footer) - 140
    },
        // 获取数据。
    fetchData () {
      this.$register.sendRequest(
              this.$store,
              this.$ajax,
              this.oUrl.getList,
              'get',
        {
          handle: this.filters.handleId
        },
              this.requestSucess,
              this.requestFail,
              this.requestError
            )
    },
    requestFail (sErrorMessage) {
      console.warn(sErrorMessage)
    },
    requestError (error) {
      console.warn(error)
      console.warn('查询出错。')
    },
        // 查询成功
    requestSucess (oData) {
      if (oData !== undefined) {
        // 设置数据。
        this.pageData = JSON.parse(oData.suppressContent)
      }
    },
        // 根据参数获取显示的内容值
    getDescripeDisplay (describe) {
      let oDis = {
        title: '',
        name: ''
      }
      switch (describe) {
        case 'what':
          oDis.title = '发生了什么?'
          oDis.name = 'What'
          break
        case 'when':
          oDis.title = '什么时候?'
          oDis.name = 'When'
          break
        case 'where':
          oDis.title = '什么地方?'
          oDis.name = 'Where'
          break
        case 'who':
          oDis.title = '谁发现?'
          oDis.name = 'Who'
          break
        case 'howMany':
          oDis.title = '多少数量?'
          oDis.name = 'How many'
          break
        case 'productTrace':
          oDis.title = '可追溯条件'
          oDis.name = 'Product traceability'
          break
      }
      return oDis
    },
        // 设置页面编辑状态
    setPageEditedState () {
      this.isPageEdited = true

      // 问题分析中 ，过滤没有图片及提示的代码。
      this.pageData.analysis = this.pageData.analysis.filter(o => o.imgs.length || o.content)
          // 保存数据
      this.oBeforeData = JSON.parse(JSON.stringify(this.pageData))
    },
    // 上传文件之前
    beforeUploadImage (index, $event) {},
    // 上传文件
    uploadImage (response, file, fileList, $event) {
      let jUpload = $event.parentElement
      let nIndex = Number(jUpload.getAttribute('data-index'))

      fileList[fileList.length - 1].url = response
          // 修改地址。
      this.pageData.analysis[nIndex].imgs = fileList
    },
    beforeRemoveImage (file, fileList, $event) {
      let jUpload = $event.parentElement
      let nIndex = Number(jUpload.getAttribute('data-index'))

      // 删除图片。
      let anImg = this.pageData.analysis[nIndex].imgs

      anImg = anImg.filter(o => o.uid != file.uid)

      this.pageData.analysis[nIndex].imgs = anImg
    },
    // 预览
    previewImage (file) {
      this.dialog.imageVisible = true
      this.dialog.imageUrl = file.url
    },
        // 保存修改内容
    submitChange () {
      // this.isPageEdited = false
      // this.$refs.analysisTable.clearSelection()
      // this.analysisSelectedIndex = []
          // 设置新的数据
      console.log(this.pageData)

      this.$register.sendRequest(
              this.$store,
              this.$ajax,
              this.oUrl.save,
              'put',
        {
          handle: this.filters.handleId,
          suppressContent: JSON.stringify(this.pageData)
        },
              () => {
                this.$message({
                  type: 'success',
                  message: '保存成功！'
                })
                this.isPageEdited = false
                this.$refs.analysisTable.clearSelection()
                this.analysisSelectedIndex = []
                    // 设置新的数据
                console.log(this.pageData)
              },
              (sError) => {
                console.warn(sError)
                this.$message('保存失败！')
              },
              (err) => {
                console.err(err)
              }
            )
    },
        // 取消修改内容
    resetChange () {
      this.isPageEdited = false
      this.$refs.analysisTable.clearSelection()
      this.analysisSelectedIndex = []
          // 恢复数据
      this.pageData = JSON.parse(JSON.stringify(this.oBeforeData))
      this.$nextTick(() => this.setHeight())
    },
    // 新增
    addNewAnalysisItem () {
        // 添加数据
      this.pageData.analysis.push({
        imgs: [],
        content: '',
        index: this.pageData.analysis.length ? (this.pageData.analysis[this.pageData.analysis.length - 1].index + 1) : 0
      })
    },
    // 删除
    delAnalysisItem (scope) {
        // 更新当前行。
      this.pageData.analysis = this.pageData.analysis.filter((o, index) => !this.analysisSelectedIndex.includes(index))
    },
    selectionChange (selection) {
      this.analysisSelectedIndex = selection.map(o => o.index)
    },
      // 下载页面
    beforeDownloadPage (refHtml, event) {
      this.isDownload = true
      this.dialogFormVisible = true
    },
      // 打印页面
    beforePrintPage () {
      this.isDownload = false
      this.dialogFormVisible = true
    },
    // 获取页面中的html
    getPageHtml (refHtml) {
      let oPage = this.$refs[refHtml]

      let sMain = ''
      // 根据打印配置获取所需显示的内容
      for (let param in this.dialogConfigForm) {
        if (this.dialogConfigForm[param].value) {
          sMain += `<div class="report-item report-question-${param}">
              ${oPage.querySelector('.report-question-' + param).innerHTML}
          </div>`
        }
      }

      let sHtml = `
        <div class="report-wrapper">
            <div class="report-container">
                <div class="report-header">${oPage.querySelector('.report-header').innerHTML}</div>
                <div class="report-main">
                    ${sMain}
                </div>
            </div>
        </div>
        <style>
            li {
                list-style: none;
            }
            .el-row {
                position: relative;
                box-sizing: border-box;
            }
            .el-row:after {
                content: "\\20";
                height: 0;
                display: block;
                clear: both;
            }
            [class*="el-col-"] {
                float: left;
                box-sizing: border-box;
            }
            .el-col-4 {
                width: 16.66667%;
            }
            .el-col-16 {
                width: 66.66667%;
            }
            .report-wrapper {
              padding: 20px;
              flex: 1 1;
            }
            .report-container {
              height: 100%;
              padding: 0 20px;
              background-color: #fff;
              position: relative;
              box-sizing: border-box;
          }
          .report-container .report-header .report-time {
              font-size: 14px;
              text-align: center;
          }
          .report-container .report-header .report-time span {
              display: inline-block;
              margin-left: 20px;
          }

          .report-container .report-header .title {
            height: 24px;
            font: normal 24px/1 "微软雅黑", arial, sans-serif;
            color: #333;
            text-align: center;
            margin: 28px auto;
          }

          .report-container .report-main {
              overflow: auto;
          }

        .report-container .report-main .report-item .item-title {
              height: 16px;
              line-height: 16px;
              text-indent: 10px;
              border-left: 4px solid #42af8f;
              font-size: 16px;
              margin: 20px 0;
          }
        .report-container .report-main .report-item .item-content {
            padding: 0 20px;
        }
        .report-container .hide,
        .report-container .hideUpload .el-upload--picture-card{
            display: none;
        }
        .report-container .report-question-analysis .upload-demo .el-upload-list {
          display: inline-block;
          // vertical-align: top;
          padding: 0;
        }
        .report-container .report-question-analysis .upload-demo .el-upload-list li {
          overflow: hidden;
          background-color: #fff;
          border-radius: 6px;
          box-sizing: border-box;
          Width: 148px;
          height: 148px;
          margin: 0 8px 8px 0;
          display: inline-block;
        }
        .report-container .report-question-analysis .upload-demo .el-upload-list li img {
          Width: 100%;
          height: 100%;
        }
        .report-main .report-question-describe .descripe-item {
              line-height: 34px;
          }
         .report-main .report-question-describe .descripe-item-name {
              font-weight: bold;
          }
          .report-container .report-main .content-title {
            text-indent: 10px;
            border-left: 4px solid #42af8f;
            font-size: 16px;
          }
          .report-container .report-main .inner-title .table-title {
            font-size: 14px;
            color: #42AF8F;
          }
          .report-container .report .inner-title,
          .report-container .report .content-table .table {
            display: block !important;
          }
          .report-main .condition-message {
            margin-top: 0;
            box-sizing: border-box;
            border: 1px solid #42af8f;
            padding: 10px;
            min-height: 40px;
            align-items: center;
            display: flex;
            flex-wrap: wrap;
          }
          .report-main .condition-message > span {
              line-height: 20px;
              display: inline;
              margin-right: 20px;
          }
          .report-main .report .el-table {
            // 显示表格
            display: block !important;
            font-size: 14px
          }
          .el-table .resize-triggers {
            display: none;
          }
          .el-table td.is-center, .el-table th.is-center {
            text-align: center;
          }
          .el-table thead th {
            height: 36px;
            background-color: #42af8f;
          }
          .el-table thead th .cell {
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
            //border: 1px solid #e4efec;
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
      return sHtml
    },
      // 打印或下载页面
    downOrPrintPage (refHtml) {
      this.dialogFormVisible = false
      let sHtml = this.getPageHtml(refHtml)

      if (this.isDownload) {
        window.Rt.utils.rasterizeImgHTML(rasterizeHTML, sHtml, {
          width: document.body.clientWidth
        }, '遏制报告')
      } else {
        window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml, {
          width: document.body.clientWidth
        })
      }
    }
  }
}
</script>

<style lang="less">
body {
  display: flex;
  flex-direction: column;
}

.report-wrapper {
  padding: 20px;
  flex: 1 1;
}

.report-container {
  height: 100%;
  border: 1px solid #ccc;
  padding: 0 20px;
  background-color: #fff;
  position: relative;
  box-sizing: border-box;

  .hide {
      display: none;
  }

  .page-icon {
    position: absolute;
    top: 30px;
    right: 20px;

    .icon {
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .report-time {
      font-size: 14px;
      text-align: center;

      span {
          display: inline-block;
          margin-left: 20px;
      }
  }

  .title {
    height: 24px;
    font: normal 24px/1 "微软雅黑", arial, sans-serif;
    color: #333;
    /*font-family: "微软雅黑";*/
    text-align: center;
    /*font-weight: normal;*/
    margin: 28px auto;
  }

  .report-main {
      // overflow: auto;
  }

  .report-footer {
      text-align: right;
      padding: 20px;
  }

  .report-main {
      .report-item {
          .item-title {
              height: 16px;
              line-height: 16px;
              text-indent: 10px;
              border-left: 4px solid #42af8f;
              font-size: 16px;
              margin: 20px 0;
          }
          .item-content {
              padding: 0 20px;

              .item-handle {
                  margin-bottom: 10px;
              }

              .upload-demo {
                  &.hideUpload {
                      .el-upload--picture-card {
                          display: none;
                      }
                  }
              }

              .condition-message {
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
          }
      }

      .report-question-describe {
          .descripe-item {
              line-height: 34px;
              .descripe-item-name {
                  font-weight: bold;
              }
          }
      }
  }
}



</style>
