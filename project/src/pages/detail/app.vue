<template>
  <div id="app" @mousedown="dragstar($event)"  @mouseup="dragend($event)" @mousemove="onMouseMove($event)">
    <v-header :config="true" :back="'search.html'"></v-header>
     <div class="content">
      <div :style="{ width: reversedMessage+'px'}" :class="[{ collapsed: collapse }, 'nav']">
        <div class="flex-wraps">
          <el-tabs v-model="activeKey" type="border-card" class="search-tab" ref="searchTab" @tab-click="handleClick" v-bind:style="{ height: searchTab,position:'absolute' }">
            <el-tab-pane :key="category.key" v-for="category in categories" :label="category.title" :name="category.key">
              <v-panel :active-tab="activeKey" :panel-height="panelHeight" :category="category" :label-width="labelWidth" :radioChange="adjustTabHeight" :handle-submit="handleSubmit"></v-panel>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div  class="router">
        <div class="flex-wraps">
          <div id='changeWidth' class='changeWidth'></div>
          <i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapse=true"></i>
          <i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="
          LayoutLeftWidth = reversedMessage;
          changeWidth = 0;
          collapse=false"></i>
          <div class="router-container" ref="routerContainer">
            <div v-if="tip" class="tip"></div>
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import header from 'components/header/header.vue'
import panel from 'components/panel/panel.vue'
import dialog from 'components/basic/dialogBarcode.vue'
import fnP from 'assets/js/public.js'

const MODULE_ITEM_URL = window.HOST + '/api/v1/customized/modules'

export default {
  components: {
    'v-header': header,
    'v-panel': panel,
    'v-dialog': dialog
  },
  data () {
    return {
      /* 拖动功能添加属性 */
      _pageX: null,
      changeWidth: 0,
      LayoutLeftWidth: 360, // 修改detail页面左侧默认宽度
      dragging: false,

      collapse: false, // 侧栏是否收缩。
      activeKey: 'trace',
      categories: [],
      labelWidth: '70px',
      searchTab: '100%',
      panelHeight: '100%',
      tip: true,
      handleSubmit: this._submitForm,
      sErrorMessage: '',
      tag: '',
      myLocalStorage: [] // 查询记录
      // modulesConfig: [{
      //   "name": "查出库",
      //   "key": "stock",
      //   "switch": 1,
      //   "select": 0
      // }, {
      //   "name": "溯源",
      //   "key": "trace",
      //   "switch": 1,
      //   "select": 1,
      // }, {
      //   "name": "追踪",
      //   "key": "track",
      //   "switch": 1,
      //   "select": 0,
      // }]
    }
  },
  computed: {
    // 工厂配置数据。
    // configData() {
    //   return this.$store.state.customModule.config
    // },
    // 配置模块。
    // modulesConfig() {
    //   return this.configData.modules
    // },
    reversedMessage () {
      let _width = this.LayoutLeftWidth + this.changeWidth
      return _width
    }
  },
  created () {
    // 登录判断。
    this.$register.login(this.$store)

    // 获取配置数据。
    this.$register.getVersion(this.$store, this.$ajax, this.fetchData)
    // this.$store.dispatch('getVersion').then(() => {//getConfig
    //   // 获取数据。
    //   this.fetchData();
    // })

    // 保存查询记录
    let history = localStorage.getItem('history')
    if (history) {
      this.myLocalStorage = JSON.parse(history)
      this.myLocalStorage.forEach(data => {
        delete data.oData.keys._tag
      })
    } else {
      this.myLocalStorage = []
    }
  },
  mounted () {
    let that = this
    that.setParamBlockHeight()

    window.onresize = () => {
      //      that.adjustTabHeight,
      that.setParamBlockHeight()
    }
  },
  methods: {
    fetchData () {
      this.tag = location.search.split('=')[1]
      let oData = sessionStorage.getItem('searchConditions-' + this.tag)

      // session 中获取
      if (oData) {
        oData = JSON.parse(oData)
        // this.activeKey = oData.tab;
      } else if (window.location.hash.length > 2) {
        // 清空了cookie后，url中有参数。则获取url中的参数。
        oData = this.getSearchData()
        // this.activeKey = oData.tab;
      }

      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        MODULE_ITEM_URL,
        'get',
        null,
        oResult => {
          // 请求成功。
          this.setCategories(oData, oResult)

          if (oData || window.location.hash.length > 2) {
            this.activeKey = oData.tab
          }

          this.$nextTick(() => {
            if (oData) {
              this._submitForm(oData)
            }
          })
        },
        this.requestFail,
        this.requestError
      )
    },
    // 设置tab数据。
    setCategories (oData, oResult) {
      this.categories = fnP
        .parseData(oResult)
        .filter(
          o => o.key !== 'restrain' && o.key !== 'link' && o.key !== 'resume'
        )
      // .filter(o => {
      //   let oItem = this.modulesConfig.find(item => {
      //     return o.key === item.key
      //   });
      //   if(oItem) {
      //     return o.key!="restrain" && o.key!="link" && o.key != "resume" && !!oItem.switch
      //   }else {
      //     return o.key!="restrain" && o.key!="link" && o.key != "resume"
      //   }
      // })
      // .map(o => {
      //   let oItem = this.modulesConfig.find(item => {
      //     return o.key === item.key
      //   });
      //   if(oItem) {
      //     o.select = oItem.select
      //     o.name = oItem.name
      //   }
      //   return o
      // })

      // 设置激活的tab。
      // let oSelect = this.categories.find(o => !!o.select)
      // this.activeKey = (oSelect && oSelect.key) || this.categories[0].key

      this.categories.forEach(o => {
        if (oData && oData.tab === o.key) {
          o.active = oData
        } else {
          o.active = {
            radio: '1',
            keys: {}
          }
        }
      })
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      // 提示信息。
      this.sErrorMessage = sErrorMessage
      this.showMessage()
    },
    // 请求错误。
    requestError (err) {
      console.log(err)
    },
    getSearchData () {
      let oData = {
        tab: '',
        keys: {},
        radio: '1'
      }
      let aHref = location.href.split('?')
      let aParams = aHref[2].split('&')
      let aInfo = aHref[1].split('/')

      // 设置tab和radio
      oData.tab = aInfo[aInfo.length - 2]
      oData.radio = aInfo[aInfo.length - 1]

      // 设置keys。
      aParams.forEach(o => {
        let aAttr = o.split('=')
        oData.keys[aAttr[0]] = decodeURIComponent(aAttr[1])
      })

      // 返回参数。
      return oData
    },
    // // 判断调用接口是否成功。
// judgeLoaderHandler(param,fnSu,fnFail) {
//   let bRight = param.data.errorCode;

//     // 判断是否调用成功。
//     if(!bRight) {
//       // 调用成功后的回调函数。
//       fnSu && fnSu();
//     }else {
//       // 提示信息。
//       this.sErrorMessage = param.data.errorMsg.message;
//       this.showMessage();
//       // 失败后的回调函。
//       fnFail && fnFail();
//     }
// },
    // 显示提示信息。
    showMessage () {
      this.$message({
        message: this.sErrorMessage,
        duration: 3000
      })
    },
    getKeys (sKey) {
      let oSearch = this.categories.filter(o => o.key === sKey)[0].active.keys
      // 加时间戳。生成标记-- 点击查询可多次
      oSearch._tag = new Date()
        .getTime()
        .toString()
        .substr(-5)
      return oSearch
    },
    handleClick (tab, event) {
      // console.log(tab, event);
    },
    // 调整面板高度。
    adjustTabHeight () {
      let oSearchTab = this.$refs.searchTab.$el
      if (oSearchTab.scrollHeight > oSearchTab.clientHeight) {
        this.searchTab = oSearchTab.scrollHeight + 'px'
      } else {
        this.searchTab = '100%'
      }
    },
    // 调整面板中参数设置的高度。
    setParamBlockHeight () {
      let oSearchTab = this.$refs.searchTab.$el

      this.panelHeight = oSearchTab.clientHeight - 80
    },
    // 数据提交
    _submitForm (oConditions) {
      this.tip = false

      let sPath = '/' + this.activeKey
      oConditions.tab = this.activeKey
      this.updateRecord(oConditions)
      // console.log(oConditions);
      sessionStorage.setItem(
        'searchConditions-' + this.tag,
        JSON.stringify(oConditions)
      )

      //        if(this.activeKey == "stock") {
      // 若为查出库。
      sPath = sPath + '/' + oConditions.radio
      //        }

      // 修改下拉参数值。
      this.$router.replace({
        path: sPath,
        query: this.getKeys(this.activeKey)
      })
    },
    dragstar (e) {
      // 鼠标按下，开始拖动
      //  console.log('开始')
      if (e.target.id === 'changeWidth') {
        this.LayoutLeftWidth = this.reversedMessage
        this.changeWidth = 0
        this.dragging = true
        this._pageX = e.pageX

        if (this.collapse) {
          this.collapse = false
        }
      }
    },
    dragend (e) {
      // 鼠标松开，结束拖动

      // console.log('结束')
      this.dragging = false
      e.stopPropagation = true
    },
    onMouseMove (e) {
      // 拖动过程

      if (this.dragging) {
        // console.log('开始动了')
        this.changeWidth = e.pageX - this._pageX
      }
    },
    /* 生成随机数函数 */
    guid () {
      function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return (
        S4() +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        S4() +
        S4()
      )
    },
    // 保存查询记录
    updateRecord (oConditions) {
      // debugger
      delete oConditions.keys._tag
      let oData = oConditions
      let isRepetition = true // 默认不重复
      let n // 记录和第几个重复
      this.myLocalStorage.forEach(data => {
        delete data.oData.keys._tag
      })
      isRepetition = this.myLocalStorage.some((el, j) => {
        if (JSON.stringify(el.oData) === JSON.stringify(oConditions)) {
          n = j
        }
        return JSON.stringify(el.oData) === JSON.stringify(oConditions)
      })
      if (!isRepetition) {
        let obj = {
          id: this.guid(),
          dateTime: new Date().Format(),
          oData
        }
        delete obj.oData.keys._tag
        this.myLocalStorage.unshift(obj)
        this.myLocalStorage.forEach(data => {
          delete data.oData.keys._tag
        })
        localStorage.setItem('history', JSON.stringify(this.myLocalStorage))
      } else {
        // debugger
        let olddata = this.myLocalStorage.splice(n, 1)[0]
        olddata.id = this.guid()
        let newTime = new Date().Format()
        olddata.dateTime = newTime
        delete olddata.oData.keys._tag
        this.myLocalStorage.unshift(olddata)
        this.myLocalStorage.forEach(data => {
          delete data.oData.keys._tag
        })
        localStorage.setItem('history', JSON.stringify(this.myLocalStorage))
      }
    }
  },
  watch: {
    // 如果 左边小于260px 直接收缩
    reversedMessage: function () {
      // console.log('走你')
      if (this.reversedMessage <= 275 && !this.collapse) {
        this.collapse = true
      }
    },
    collapse: function () {
      // 侧边栏展开时默认325
      if (!this.collapse) {
        // 修改当展开时，每次都是原始宽度
        this.changeWidth = 0
        this.LayoutLeftWidth = 360
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
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    display: flex;
    flex: 1;

    .nav {
      display: flex;
      border-right: 1px solid #ccc;
      box-sizing: border-box;
      /*height: 100%;*/

      &.collapsed {
        display: none;
      }
    }

    .router {
      display: flex;
      padding: 20px;
      box-sizing: border-box;
      /*height: 100%;*/
      position: relative;
      flex-grow: 1;
      .btn-collapse {
        position: absolute;
        left: -18px; // 2px;
        top: 50%;
        color: #42af8f;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
      }
    }

    .flex-wraps {
      flex: 1;
      position: relative;
      .changeWidth {
        position: absolute;
        left: -20px;
        color: #42af8f;
        cursor: e-resize;
        width: 20px;
        //background-color:rgba(0,0,0,0.1);
        height: 100%;
        top: 0;
      }
    }

    .router-container {
      position: absolute;
      border: 1px solid #ccc;
      background-color: #fff;
      padding: 0 20px;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: auto;

      .post {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .tip {
        height: 100%;
        background: url("../../assets/img/tip.png") no-repeat center center;
      }
    }
  }
}

.panel-title {
  padding: 30px 0;
  .el-radio + .el-radio {
    margin-left: 20px;
  }
}

.el-tabs--border-card {
  & > .el-tabs__header {
    border-bottom: none;

    .el-tabs__item {
      margin-right: 0;
      margin-left: 0;
      border: none;
      box-sizing: content-box;
      padding: 0;
    }
  }
}

.el-tabs__nav-wrap {
  margin-bottom: 0;
}

.search-tab {
  width: 100%;
  border: none;
  box-shadow: none;

  &.el-tabs--border-card {
    & > .el-tabs__header {
      background-color: #d9dee4;

      .el-tabs__nav {
        width: 100%;
      }

      .el-tabs__item {
        height: 42px;
        line-height: 42px;
        width: 130px;
        text-align: center;
        font-size: 16px;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        color: #666;
        width: 33%;

        &:last-child {
          width: 34%;
        }

        &:hover {
          color: #333;
        }

        &.is-active {
          color: #42af8f;
          border-top-color: #42af8f;
        }
      }
    }
  }

  // .form-button {
  //   margin-top: 80px;
  // }
}
</style>


<style lang="less">
@media screen and (max-width: 1400px) {
  #app {
    .search-tab {
      &.el-tabs--border-card {
        & > .el-tabs__content {
          .el-tab-pane {
            .panel-content {
              .panel-content-wrap {
                padding: 0;
                .el-form {
                  .form-conditions {
                    /*max-height: 330px;*/
                    overflow: auto;
                    .el-form-item {
                      padding: 0 28px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
