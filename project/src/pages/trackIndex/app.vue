<template>
	<div id="app" @mousedown="dragstar($event)"  @mouseup="dragend($event)" @mousemove="onMouseMove($event)">
		<v-header :config="true" :back="false" :tool="false"></v-header>
		<!-- <el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading"> -->
		<div class="content">
			<!-- <el-col class="router" ref="router"> -->
			<div :style="{ flexBasis: reversedMessage+'px'}" :class="[{ collapsed: collapse }, 'nav']">
				<v-catalog @init="treeDataInit" :catalog-data="catalogData"></v-catalog>
			</div>
			<div class="router" ref="router">
				<v-dTree
					v-if="fullscreenLoading"
					:dialog-visible="fullscreenLoading"
					:progress-id="progressId"></v-dTree>
				<div id='changeWidth' class='changeWidth'></div>
				<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapseTree"></i>
				<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="expandTree"></i>

				<div class="router-container" ref="routerContainer">
					<div @mouseenter="showTable" @mouseleave="unShowTable" v-if="false">
						<i class="icon icon-20 icon-balance"></i>
						<div class="table-line" v-if="show"></div>
						<transition name="slide-fade">
							<el-table :data="tableData" border style="width:305px" id='table' v-if="show">
								<el-table-column prop="process" label="工序" width="61">
								</el-table-column>
								<el-table-column prop="ok" label="合格数" width="61">
								</el-table-column>
								<el-table-column prop="ng" label="不合格数" width="61">
								</el-table-column>
								<el-table-column prop="scrap" label="报废数" width="60">
								</el-table-column>
								<el-table-column prop="delay" label="滞留数" width="60">
								</el-table-column>
							</el-table>
						</transition>
					</div>
					<i class="icon icon-20 icon-report" @click="onReport" title="快速报告" v-if="!fullscreen"></i>

					<v-tree :tree-data="treeData" :class="{hide: fullscreen}" :style="{ flexBasis: _treeHeight+'px',flexGrow:_treeFullscreen}" @recoverSize="recoverTree"></v-tree>
					<div id='changeDiagram' :class="[{hide: treeFullscreen},{hide: fullscreen},'changeDiagram']"></div>
					<div class="view" ref="view" :class="{hide: treeFullscreen}">
						<router-view></router-view>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import header from 'components/header/header.vue'
import tree from 'components/tree/tree.vue'
import catalog from 'components/catalog/catalog.vue'
import dialogTree from 'components/basic/dialogProgressTree.vue'

import fnP from 'assets/js/public.js'
import $ from 'jquery'

export default {
  components: {
    'v-header': header,
    'v-tree': tree,
    'v-catalog': catalog,
    'v-dTree': dialogTree
  },
  data () {
    return {
      /* 左右拖动功能添加属性 */
      _pageX: null, // 鼠标的横向位置
      changeWidth: 0, // 改变的宽度
      LayoutLeftWidth: 225, // 默认宽度
      draggingX: false, // 左右拖动功能启动
      // resizeUpdate:0,       //监听父集div大小改变更新左侧图形

      /* 上下拖动功能添加属性 */
      treeHeight: 300, // 默认高度tree组件高度
      draggingY: false, // 上下拖动功能启动
      _pageY: null, // 鼠标的纵向位置
      changeHeight: 0, // 改变的高度
      // resizeUpdateY:0,     //监听父集div大小改变更新右边上半部(tree)
      // 页面加载中动画。
      fullscreenLoading: false, // 弹窗进度加载
      // 侧栏是否收缩。
      collapse: true,
      url: window.HOST + '/api/v1/trace/down/trace-info',
      // url:"static/track.json",
      urlType: {
        barcode: '/by-equipment-barcode',
        batch: '/by-equipment-batch',
        time: '/by-equipment-time'
      },
      treeData: {},
      catalogData: [],
      // params: [],
      show: false,
      tableData: [],
      // filter: {},
      // 起点集或查询条件。
      points: {},
      progressId: new Date()
        .getTime()
        .toString()
        .substr(-5), // 当前进程标记。
      cancelProgressUrl: window.HOST + '/api/v1/request/kill/'
      // tip: "暂无数据"
    }
  },
  computed: {
    query () {
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
    resizeUpdate () {
      return this.$store.state.resize
    },
    resizeUpdateY () {
      return this.$store.state.resizeY
    },
    rawData () {
      return this.$store.state.rawData
    },
    fullscreen () {
      return this.$store.state.fullscreen
    },
    // 树的数据全屏。
    treeFullscreen () {
      return this.$store.state.treeFullscreen
    },
    reversedMessage () {
      let _width = this.LayoutLeftWidth + this.changeWidth
      return _width
    },
    // 上下拖动功能
    _treeFullscreen () {
      if (this.treeFullscreen) {
        return 1
      } else {
        return 0
      }
    },
    _treeHeight () {
      let _height = this.treeHeight + this.changeHeight
      return _height
    },
    // 版本信息数据。
    isOpDbBeforeRefact () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isOpDbBeforeRefact
      )
    }
  },
  created () {
    // 进入时设置页面的进程标记。
    window.Rt.utils.cookie('progressId', this.progressId)
    // 登录验证。
    this.$register.login(this.$store)

    // 组件创建完后获取数据
    // 此时 data 已经被 observed 了
    // 重置路由。
    if (window.screen.availHeight > 1000) {
      // 根据屏幕分辨率设置 上半部默认高度
      this.treeHeight = 300
    } else {
      this.treeHeight = 155
    }

    this.$router.replace('/')
    let oFilter = sessionStorage.getItem('track_' + this.query.tag)

    if (oFilter) {
      this.points = JSON.parse(oFilter)
      // this.filter = oAll.filters;
      // this.params = oAll.selected;
    }

    // 获取版本信息配置
    this.$register.getVersion(this.$store, this.$ajax, this.fetchData)
    // this.$store.dispatch('getVersion').then(() => {
    //  获取数据。
    //   this.fetchData();
    // })

    // 获取配置数据。
    // this.$store.dispatch('getConfig').then(() => {
    //   获取数据。
    //   this.fetchData();
    // })
  },
  mounted () {
    // this.$refs.view.style.height = this.$refs.view.clientHeight + "px"

    window.onbeforeunload = () => {
      // 离开页面时，调用接口，清除进程。
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
    }
  },
  methods: {
    /**
     *  恢复数据。
     */
    treeDataInit () {
      this.treeData = fnP.getTreeData(
        this.rawData,
        'track',
        this.isOpDbBeforeRefact
      ) // this.parseTreeData()this.parseTreeData();
      // 重置路由。
      this.$router.replace('/')
    },
    /**
     * 设置面板高度。
     * @return {void}
     */
    setPanelHeight () {},
    /**
     * 错误提示信息。
     * @param {String} str
     */
    showMessage (str) {
      let sTip = str || '查无数据'
      this.$alert(sTip, '提示', {
        type: 'warn'
      })
    },
    // 关闭进程。
    setProgressEndHandle () {
      // 调用接口。
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        this.cancelProgressUrl + this.progressId,
        'post',
        null
      )
    },
    // 关闭进度页面。
    closeProgressDialog () {
      setTimeout(() => {
        this.fullscreenLoading = false
      }, 2000)
    },
    // 登录验证失败后跳转到登录页面之前
    requestToLogin () {
      this.closeProgressDialog()
    },
    // 请求成功。
    requestSucess (oData) {
      this.closeProgressDialog()

      if (!oData.nodeDtoList.length) {
        console.log('查无数据。')
        this.showMessage()
      } else {
        this.$store.commit({
          type: 'updateData',
          data: oData.nodeDtoList // fnP.parseTreeData(data)
        })

        // 显示提示信息。解决内存泄漏问题
        if (oData.message) {
          this.$notify.info({
            showClose: false,
            message: oData.message
          })
        }

        // 格式化数据。
        this.treeData = fnP.getTreeData(
          this.rawData,
          'track',
          this.isOpDbBeforeRefact
        ) // this.parseTreeData();
        this.catalogData = fnP.getCatalogData(this.rawData, 'track') // fnP.getTrackCatalogData(this.rawData)

        // 展开左侧导航树
        this.$nextTick(() => {
          this.expandTree()
        })
      }
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.closeProgressDialog()
      // 提示信息。
      console.warn(sErrorMessage)
      this.showMessage(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.closeProgressDialog()
      console.warn(err)
      this.showMessage('查询出错！')
    },
    fetchData () {
      let sType = this.urlType[this.points.type] || ''
      let oParam = {
        startPointList: this.points.selected || []
      }

      if (sType) {
        // 若为溯源页面的跳转。
        oParam = Object.assign({}, this.points.keys)
        delete oParam.equipmentName
      }

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        this.url + sType,
        'post',
        oParam,
        this.requestSucess,
        this.requestFail,
        this.requestError,
        this.requestToLogin
      )
      this.fullscreenLoading = true
    },
    parseTableData () {
      let aoData = this.rawData
      let _rawData = []
      aoData.forEach(oData => {
        if (!oData.isMaterialNode) {
          _rawData.push({
            process: oData.process,
            ok: oData.ok,
            ng: oData.ng,
            scrap: oData.scrap,
            delay: oData.delay
          })
        }
      })
      return _rawData
    },
    /**
     * 获取左侧目录树数据。
     * @return {Array}
     */
    parseCatalogData () {
      let aoCatalogData = []
      let aoCopyData = $.extend(true, [], this.rawData) // Object.assign([], this.rawData)

      for (let i = aoCopyData.length - 1; i >= 0; i--) {
        let oData = aoCopyData[i]

        if (oData && oData.parents === '') {
          oData.parent = ''

          let aKey = _getKeysOfSameName(oData)
          // 修改数据。--- 修改名称，增加同层key值。
          oData = Object.assign({}, oData, {
            name:
              aKey.length - 1
                ? oData.name + '(' + aKey.length + ')'
                : oData.name,
            sublings: aKey
          })

          aoCatalogData.push(oData)
          aoCopyData.splice(i, 1)
          _findChildrenData(aoCopyData, oData.key, oData.key)
        }
      }

      // 返回数据。
      return aoCatalogData

      /**
       * 递归查找子节点。
       * @param {Array} aoCopyData
       * @param {String} sKey
       * @param {String} sParentKey
       * @return {void}
       */
      function _findChildrenData (aoCopyData, sKey, sParentKey) {
        for (let i = aoCopyData.length - 1; i >= 0; i--) {
          let oData = aoCopyData[i]
          let sNewKey = ''

          if (oData && oData.parents.split(',').includes(sKey)) {
            // 当前元素的子级。
            if (oData.isMaterialNode) {
              oData.parent = ''
              sNewKey = oData.key
            } else {
              sNewKey = sParentKey
              oData.parent = sParentKey
            }

            let aKey = _getKeysOfSameName(oData)
            // 修改数据。--- 修改名称，增加同层key值。
            let oNewData = Object.assign({}, oData, {
              name:
                aKey.length - 1
                  ? oData.name + '(' + aKey.length + ')'
                  : oData.name,
              sublings: aKey
            })

            aoCopyData.splice(i, 1)
            aoCatalogData.push(oNewData)

            if (aoCopyData.length) {
              _findChildrenData(aoCopyData, oData.key, sNewKey)
            }
          }
        }
      }

      /**
       * 通过名称获取相同的名称的数据的key中。
       * @param {Object} oFilter
       * @return {Array}
       */
      function _getKeysOfSameName (oFilter) {
        let aKeys = []

        for (let i = aoCopyData.length - 1; i >= 0; i--) {
          let oData = aoCopyData[i]

          if (oData.name === oFilter.name && oData.key !== oFilter.key) {
            // 保存相同的数据。
            aKeys.push(oData.key)
            // 更改其他数据的parent值。-- 把相同的数据删掉后，以该数据为parent的值，将会找不到
            _changeParentByKey(oData.key, oFilter.key)
            // 删除该数据数据。
            aoCopyData.splice(i, 1)
          }
        }

        aKeys.push(oFilter.key)

        // 返回数据。
        return aKeys
      }

      /**
       * 修改parent为当前key值-> 保留下的key值。
       * @param {String} sKey
       * @param{String} sNewKey
       */
      function _changeParentByKey (sKey, sNewKey) {
        aoCopyData.filter(o => {
          let aParent = o.parents.split(',')
          let nIndex = aParent.indexOf(sKey)

          if (nIndex > -1) {
            // 修改parnets中key 为newkey
            aParent[nIndex] = sNewKey
            o.parents = aParent.join(',')
          }
        })
      }
    },
    /* 是否展示 */
    showTable () {
      this.show = true
    },
    unShowTable () {
      this.show = false
    },
    /**
     * 生成快速报告。
     * @param {Object} event
     * @returns {void}
     */
    onReport (event) {
      let tag = new Date()
        .getTime()
        .toString()
        .substr(-5) // 生成唯一标识。
      sessionStorage.setItem('fastReport_' + tag, JSON.stringify(this.points))
      // window.open("report.html?tag="+tag);
      window.open('trackReport.html?tag=' + tag)
    },

    // 收缩左侧树。
    collapseTree () {
      this.collapse = true
      this.$store.commit({
        type: 'updateResize',
        key: 0
      })
    },
    expandTree () {
      this.collapse = false
      this.$store.commit({
        type: 'updateResize',
        key: this.LayoutLeftWidth
      })
    },
    /* 拖动功能 */
    dragstar (e) {
      // 鼠标按下，开始拖动
      if (e.target.id === 'changeWidth') {
        this.LayoutLeftWidth = this.reversedMessage
        this.changeWidth = 0
        this.draggingX = true
        this._pageX = e.pageX
        if (this.collapse) {
          this.collapse = false
        }
      } else if (e.target.id === 'changeDiagram') {
        this.treeHeight = this._treeHeight
        this.changeHeight = 0
        this.draggingY = true
        this._pageY = e.pageY
      }
    },
    dragend (e) {
      // 鼠标松开，结束拖动
      this.draggingX = false // 关闭拖动功能
      this.draggingY = false // 关闭拖动功能
      // this.resizeUpdate = this.reversedMessage //改变 changeWidth 的值，触发 canvas 大小更新
      this.$store.commit({
        type: 'updateResize',
        key: this.reversedMessage
      })
    },
    onMouseMove (e) {
      // 拖动过程
      if (this.draggingX) {
        this.changeWidth = e.pageX - this._pageX
      } else if (this.draggingY) {
        this.changeHeight = e.pageY - this._pageY
        // this.resizeUpdateY = this._treeHeight //改变 resizeUpdateY 的值，触发 canvas 大小更新
        this.$store.commit({
          type: 'updateResizeY',
          key: this._treeHeight
        })
      }
    },
    /* tree组件恢复默认大小 */
    recoverTree () {
      this.changeHeight = 0
    }
  },
  watch: {
    _treeHeight: function () {
      let viewHeight = document.querySelector('.router').offsetHeight
      let maxTreeHeight = viewHeight - 40 - 20 - 100
      if (this._treeHeight > maxTreeHeight && !this.treeFullscreen) {
        // 底部内容不得小于100px
        this.treeHeight = maxTreeHeight
        this.changeHeight = 0
      } else if (this._treeHeight < 130 && !this.treeFullscreen) {
        // 顶部内容不得小于130px
        this.treeHeight = 130
        this.changeHeight = 0
      }
    },
    reversedMessage: function () {
      if (this.reversedMessage < 50 && !this.collapse) {
        // 左边内容不得小于50px
        this.LayoutLeftWidth = 50
        this.changeWidth = 0
      }
    }
  }
}
</script>

<style lang="less">
html,
body {
  height: 100%;
}

body {
  background-color: #f2f2f2;
  font-family: 微软雅黑;
  color: #333;
  font-size: 14px;
  overflow: hidden;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    flex: 1;
    display: flex;

    .icon-balance {
      position: absolute;
      left: 40px; // 20
      top: 35px; // 10
      z-index: 10;
    }
    .changeWidth {
      position: absolute;
      left: -1px;
      color: #42af8f;
      cursor: e-resize;
      width: 20px;
      //background-color:rgba(0,0,0,0.1);
      height: 100%;
      top: 0;
      z-index: 2;
    }
    .nav {
      border-right: 1px solid #ccc;
      box-sizing: border-box;
      height: 100%;
      background-color: #2e3840;

      &.collapsed {
        display: none;
      }
    }
    .router {
      padding: 20px;
      box-sizing: border-box;
      height: 100%;
      position: relative;
      flex: 1 1 auto;
      .btn-collapse {
        position: absolute;
        left: 2px;
        top: 50%;
        color: #42af8f;
        font-weight: bold;
        font-size: 16px;
        z-index: 3;
        cursor: pointer;
      }
    }
    .router-container {
      /*border: 1px solid #ccc;
		        background-color: #fff;
		        padding: 0 20px;*/
      box-sizing: border-box;
      /*width: 100%;
				height: 100%;*/
      position: absolute;
      left: 20px;
      right: 20px;
      top: 20px;
      bottom: 20px;
      /*overflow: auto;*/
      display: flex;
      flex-direction: column;
      .diagram {
        border: 1px solid #ccc;
        box-sizing: border-box;
        background-color: #fff;
        /*flex: 0 400px;*/
        flex: 1 1;
        //margin-bottom: 20px;

        &.hide {
          display: none;
        }
      }
      .changeDiagram {
        //background-color: #fff;
        width: 100%;
        height: 10px;
        flex-basis: 20px;
        z-index: 3;
        cursor: n-resize;
        &.hide {
          display: none;
        }
      }
      .view {
        border: 1px solid #ccc;
        // box-sizing: border-box;
        background-color: #fff;
        flex: 1 1;
        padding: 0 20px;
        // overflow: auto;
        position: relative;
        height: 50px;
        .material-stock {
          .suspicious {
            position: static;
            .btn-restrain {
              right: 40px;
              top: 10px;
            }
          }
        }
        &.hide {
          display: none;
        }
      }
    }
  }
}
// 快速报告。
.icon-report {
  position: absolute;
  cursor: pointer;
  z-index: 100;
  right: 200px;
  top: 10px;
}
.table-line {
  position: absolute;
  width: 20px;
  height: 131px;
  left: 60px;
  top: 36px;
  background-color: rgba(255, 255, 255, 0);
  z-index: 10;
}
#table {
  font-size: 12px;
  position: absolute;
  left: 80px;
  top: 36px;
  z-index: 5;
  border: 0;
  &::before {
    height: 0;
  }
  &::after {
    width: 0;
  }
  .cell {
    text-align: center;
    padding-left: 0;
    padding-right: 0;
  }
  th {
    height: 24px;
    border-color: #fff;
  }
  td {
    height: 24px;
    border-color: #fff;
  }
  thead {
    .cell {
      background-color: #ff9900;
      color: #fff;
    }
  }
  tbody {
    .cell {
      background-color: #eaeef2;
      color: #666;
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-active {
  transform: translateX(10px);
  opacity: 0;
}

.el-dialog__headerbtn {
  background-color: transparent;
  border: none;
  outline: none;
}

// 进度弹窗
.progress-dialog-wrap {
  text-align: center;
}
.v-modal-enter {
  -webkit-animation: v-modal-in 0.2s ease;
  animation: v-modal-in 0.2s ease;
}
</style>
