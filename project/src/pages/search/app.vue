<template>
  <div id="app" v-loading="loading">
    <header>
      <img :src="logo" />
    </header>
    <v-tooltip :config="true" :back="false"></v-tooltip>
    <div class="search-tab-content">
      <el-tabs  element-loading-text="拼命加载中"
      v-model="activeKey"
      type="border-card"
      class="search-tab">
        <el-tab-pane
        :key="category.key"
        v-for="category in categories"
        :label="category.title"
        :name="category.key">
          <v-panel
          :category="category"
          :label-width="labelWidth"
          :handle-submit="handleSubmit"></v-panel>
        </el-tab-pane>
      </el-tabs>
      <div class="link-suppress-list" v-show="activeKey === 'suppress'" v-if="supression" @click="linkSuppressList">遏制列表</div>
    </div>
    <footer>
      <img class="version" :src="version" />
      <span class="version-info">版本: {{ v }}</span>
    </footer>
    <div
    :class="['history-box',{ 'min-history-box': !showHistory },{ 'max-history-box': showHistory }]"
    :style="{zIndex: historyZindex}"
    @mouseover="historyZindex = 2"
    @mouseleave="historyZindex = 0" >
      <i class="el-icon-arrow-left" @click="showHistory = !showHistory" v-show="showHistory"></i>
      <i class="el-icon-arrow-right" @click="showHistory = !showHistory" v-show="!showHistory"></i>
      <div class='history-title' v-show="showHistory" >
        <h2>查询记录</h2>
        <h3 class="clear-history" @click="clearHistory">清空查询记录</h3>
      </div>
      <div class='history-panal' v-show="showHistory" >
        <ul class='history-content' v-for="(ul,index) in liData" :key="index">
          <li class="ecorded-time">
            <h3>{{ul.date}}</h3>
          </li>
          <li class="history-messages-everyday" v-for="data in ul.data" @click="findId(data.id)" :data-id='data.id' :key="data.id">
            <ul class='information-record'>
              <li>
                <span class='circle'></span>
              </li>
              <li class="ecorded-data">{{data.time}}</li>
              <li class="ecorded-module">{{data.oData.tab}}</li>
              <li class='records'>
                <ul class="detail-record-box">
                  <li class="detail-record"
                  v-for="(li,index) in data.oData.keys"
                  :key="index"
                  v-if="li[1]">{{li[0]}}：{{li[1]}}</li>
                </ul>
              </li>
            </ul>
            <i class="el-icon-error" @click.stop.self="deleteId(data.id)"></i>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import tooltip from 'components/header/tooltip.vue'
import logo from '../../static/logo.png' // 'assets/img/logo-w.png'
import version from 'assets/img/version.png'
import panel from 'components/panel/panel.vue'
import fnP from 'assets/js/public.js'
import { bus } from 'assets/js/bus.js'
import * as Fetch from 'assets/js/loginFn.js'

const MODULE_ITEM_URL = window.HOST + '/api/v1/customized/modules'
// const MODULE_ITEM_URL = './static/modules.json'
// 数据名称接口。
const TABLE_DATA_URL = window.HOST + '/api/v1/customized/items'

export default {
  components: {
    'v-panel': panel,
    'v-tooltip': tooltip
  },
  data () {
    return {
      showList: false,
      logo,
      version,
      v: window.VERSION,
      activeKey: 'stock',
      categories: [],
      labelWidth: '100px',
      handleSubmit: this._submitForm,
      sErrorMessage: '',
      loading: false,
      showHistory: true,
      dataName: [
        {
          itemCode: 'stock',
          itemName: '查出库'
        },
        {
          itemCode: 'trace_down',
          itemName: '追踪'
        },
        {
          itemCode: 'trace_up',
          itemName: '溯源'
        },
        {
          itemCode: 'resume',
          itemName: '履历'
        },
        {
          itemCode: 'suppress',
          itemName: '遏制'
        },
        {
          itemCode: 'qtSuppress',
          itemName: '质检遏制'
        },
        {
          itemCode: 'link_repair',
          itemName: '断链'
        }
      ],
      myLocalStorage: [],
      historyZindex: 0,
      message: ''
    }
  },
  computed: {
    liData () {
      return this.switchData(this.myLocalStorage)
    },
    // 是否支持遏制。
    supression () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.supression
      )
    },
    // 是否支持断链修复。
    linkRepair () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.linkRepair
      )
    }
  },
  created () {
    let history = localStorage.getItem('history')
    if (history) {
      this.myLocalStorage = JSON.parse(history)
      this.myLocalStorage.forEach(data => {
        delete data.oData.keys._tag
      })
    } else {
      this.myLocalStorage = []
    }

    let dataName = localStorage.getItem('dataName')
    if (dataName) {
      let oData = JSON.parse(dataName)
      this.dataName = oData.concat(this.dataName)
    }

    // 登录验证。
    this.$register.login(this.$store)
    // 获取配置数据。
    this.$register.getVersion(this.$store, this.$ajax, this.fetchData)

    this.fetchDataName() // 获取名称
  },
  methods: {
    // 获取数据。
    fetchData () {
      this.loading = true

      // 请求判断。
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        MODULE_ITEM_URL,
        'get',
        null,
        oData => {
          // 请求成功。
          this.loading = false
          // 设置tab数据。
          this.setCategories(oData)
        },
        sErrorMessage => {
          // 请求失败。
          this.loading = false
          this.sErrorMessage = sErrorMessage
          this.showMessage()
        }
      )
    },
    // 设置tab数据。
    setCategories (oData) {
      let unSuport = []
      if (!this.supression) {
        unSuport.push('suppress')
      }
      if (!this.linkRepair) {
        unSuport.push('link_repair')
      }

      this.categories = fnP.parseData(oData)
      if (unSuport.length) {
        // 获取打开的功能模块。
        this.categories = this.categories.filter(o => {
          return unSuport.indexOf(o.key) < 0
        })
      }

      this.categories.forEach(o => {
        o.active = {
          radio: '1',
          keys: {}
        }
      })
    },
    // 显示提示信息。
    showMessage () {
      this.$message({
        message: this.sErrorMessage,
        duration: 3000,
        type: 'error'
      })
    },

    _submitForm (oConditions) {
      if (!oConditions) {
        this.$message({
          message: this.message,
          type: 'error'
        })
      } else {
        oConditions.tab = this.activeKey
        this.updateRecord(oConditions)
        let sTage = (+new Date()).toString().substr(-5)

        sessionStorage.setItem(
          'searchConditions-' + sTage,
          JSON.stringify(oConditions)
        )
        // 跳转。
        location.assign(
          this.categories.filter(o => o.key === this.activeKey)[0].url +
            '.html?tag=' +
            sTage
        )
      }
    },
    // itemCode和SearchCode 转换
    itemCodeToSearchCode (oConditions) {
      let data = [...this.dataName]
      let keys = oConditions.keys
      let keysArr = []
      for (let i in keys) {
        if (!keys[i]) {
          delete keys[i]
        } else {
          keysArr.push(i)
        }
      }
      // 自定义的searchCode
      let isUser = []
      // opType 种类
      let opType = []
      // 输出的错误
      this.message = '不能存在多个操作类型的选项：'
      keysArr.forEach(key => {
        data.forEach(el => {
          if (key === el.itemCode && !!el.opType) {
            isUser.push(el)
          }
        })
      })
      isUser.forEach(el => {
        if (!opType.includes(el.opType)) {
          opType.push(el.opType)
        }
        this.message += `${el.itemName}为${el.opTypeName}类型；`
      })
      this.message = this.message.substr(0, this.message.length - 1) + '。'
      if (opType.length > 1) {
        return false
      } else {
        this.message = ''
        // console.log(isUser)
        // console.log(opType)
        keysArr.forEach(key => {
          isUser.forEach(el => {
            if (el.itemCode === key) {
              keys[`${el.searchCode}`] = keys[key]
              delete keys[key]
            }
          })
        })
        keys['opType'] = opType[0]
        // console.log(keys)
        oConditions.keys = keys
        // console.log(oConditions)
        return oConditions
      }
    },
    switchData (oldData) {
      let newData = []
      let oData = []
      if (oldData.length > 50) {
        oData = oldData.slice(0, 50)
      } else {
        oData = JSON.parse(JSON.stringify(oldData))
      }
      oData.forEach((el, i) => {
        let a = {
          date: '',
          data: []
        }
        a['date'] = el.dateTime.split(' ')[0]
        el.time = el.dateTime.split(' ')[1]
        el.oData.keys = window.Rt.utils.getObjectEntries(el.oData.keys)// Object.entries(el.oData.keys)
        a['data'].push(el)
        newData.push(a)
        for (let j = i + 1; j < oData.length; j++) {
          if (a['date'] === oData[j].dateTime.split(' ')[0]) {
            oData[j].time = oData[j].dateTime.split(' ')[1]
            oData[j].oData.keys = window.Rt.utils.getObjectEntries(oData[j].oData.keys)// Object.entries(oData[j].oData.keys)
            a['data'].push(oData[j])
            oData.splice(j, 1)
            j = j - 1
          }
        }
      })
      newData.forEach(e => {
        e.data.forEach(el => {
          this.dataName.forEach(data => {
            if (data.itemCode === el.oData.tab) {
              el.oData.tab = data.itemName
            }
          })
          el.oData.keys.forEach(arr => {
            this.dataName.forEach(data => {
              if (data.itemCode === arr[0]) {
                arr[0] = data.itemName
              }
            })
          })
        })
      })
      return newData
    },
    // 获取名称成功。
    requestNameSucess (oData) {
      // 获取对应的名称。
      oData = oData.filter(el => {
        return !!el.itemName
      })
      let dataName = localStorage.getItem('dataName')
      if (!dataName || dataName !== JSON.stringify(oData)) {
        localStorage.setItem('dataName', JSON.stringify(oData))
        this.dataName = oData.concat(this.dataName)
      }
    },
    // 获取 Items
    getCustomizedItems () {
      return new Promise((resolve, reject) => {
        resolve(this.$register.getBeforeDispatchData(
          'getCustomizedItems',
          this.$store,
          this.$ajax,
          null,
          TABLE_DATA_URL
        ))
      })
    },
    // 获取查询条件的key:value
    fetchDataName () {
      // this.$register.sendRequest(
      //   this.$store,
      //   this.$ajax,
      //   TABLE_DATA_URL,
      //   'get',
      //   null,
      //   this.requestNameSucess,
      //   this.requestFail,
      //   this.requestError
      // )
      Fetch.$get(this.$store, TABLE_DATA_URL)
      .then(oData => {
        this.requestNameSucess(oData)
      })
      .catch(err => {
        console.warn(err)
      })
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      console.warn(sErrorMessage)
    },
    // 请求错误。
    requestError (error) {
      console.warn(error)
      console.warn('查询出错。')
    },
    /* 生成随机数函数 */
    guid () {
      function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    },
    // 点击历史记录后，填充
    findId (listId) {
      let historyList = this.myLocalStorage.find(el => {
        return el.id === listId
      })
      let searchTitle = false // 查询方案id
      let searchObj = {}
      let categorie = this.categories.find(e => {
        return e.key === historyList.oData.tab
      })
      categorie.list.forEach(e => {
        if (e.title === historyList.oData.title) {
          searchTitle = true
          searchObj = e
          // console.log("找到了")
        }
      })
      if (
        (!!historyList && searchTitle) ||
        (!!historyList &&
          historyList.oData.tab !== 'trace' &&
          historyList.oData.tab !== 'track' &&
          searchTitle
        )
      ) {
        historyList.oData.radio = searchObj.key
        this.activeKey = historyList.oData.tab
        this.$nextTick(() => {
          bus.$emit('id-selected', historyList.oData)
        })
      } else {
        this.$message('这条记录好像找不到了。。')
        // console.log("没找到")
      }
    },
    // 单条记录删除
    deleteId (listId) {
      this.$confirm('此操作将永久该条记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        this.myLocalStorage = this.myLocalStorage.filter(e => {
          return e.id !== listId
        })
        localStorage.setItem('history', JSON.stringify(this.myLocalStorage))
        this.$nextTick(function () {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
      .catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 新增和更新历史记录
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
    },
    // 清空历史记录
    clearHistory () {
      this.$confirm('此操作将永久删除全部记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          localStorage.removeItem('history')
          this.myLocalStorage = []
          this.$nextTick(function () {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 可疑品列表查询
    linkSuppressList () {
      location.assign(`restrain.html?tag=${(+new Date()).toString().substr(-5)}#/suppressList/1?personCode=&startTime=&endTime=&_tag=` + (+new Date()).toString().substr(-5))
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
  display: table;
  background: url(../../assets/img/bg.jpg);
  // background-size: cover;
  min-height: 630px;
}

#app {
  display: table-cell;
  vertical-align: middle;
}

header {
  text-align: center;
  margin-top: -30px;

  img {
    margin-bottom: 10px;
  }
}

footer {
  position: fixed;
  left: 50%;
  margin-left: -150px;
  bottom: 30px;

  .version {
    vertical-align: middle;
  }
  .version-info {
    font-size: 13px;
    color: #cccccc;
    vertical-align: middle;
  }
}

.login-info {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 14px;
  color: #fff;

  .el-icon-arrow-down {
    display: inline-block;
    padding-left: 10px;
  }
}

.el-tooltip__popper {
  padding: 0;
} // 设置相关列表。
.info-list {
  width: 90px; // border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 3px 3px #888;
  padding: 10px 0;

  li {
    color: #999;
    text-align: center;
    padding: 10px 0;

    &:hover {
      background: #dedede;
      color: #666;
      cursor: pointer;
    }
  }
}

.panel-title {
  padding: 10px 0; // 19
  .el-radio + .el-radio {
    margin-left: 60px;
  }
}

.panel-content {
  /*margin-left: -100px;*/
  padding: 0 80px;
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

.el-select-dropdown__wrap {
  max-height: 230px;
}

.search-tab-content {
  position: relative;
  width: 1080px;
  margin: 0 auto;
  z-index: 1;
  .link-suppress-list {
    position: absolute;
    bottom: 30px;
    right: 40px;
    color: #42af8f;
    cursor: pointer;
    font-size: 14px;
  }
}

.search-barcode {
  position: absolute;
  bottom: 40px;
  right: 30px;
  cursor: pointer;
  color: #42af8f;
  text-decoration: underline;
}

.search-tab {
  /*width: 1080px;*/
  height: 750px;
  /*margin: 0 auto;*/
  border: none;
  box-shadow: none;

  &.el-tabs--border-card {
    & > .el-tabs__header {
      background-color: #d9dee4;
      .el-tabs__nav {
        display: flex;
        justify-content: space-around;
        width: 100%;

        .el-tabs__item {
          height: 42px;
          line-height: 42px;
          /*width: 180px;*/
          //width: 270px; // 216
          //width: 216px; // 216
          flex: 1;
          padding: 0;
          text-align: center;
          font-size: 16px;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          color: #666;

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
    .el-form-item {
      margin-bottom: 18px;
    }
    .form-button {
      .btn:first-child {
        margin-left: 100px;
      }
    }
  }
}
.el-tab-pane {
    .panel {
      .panel-content {
        .panel-content-wrap {
          .el-form {
            .form-conditions {
              max-height: 520px;
              overflow: auto;
            }
          }
        }
      }
    }
  }
.el-message-box__headerbtn {
  border: none;
  outline: 0;
  padding: 0;
}
.el-message-box__btns {
  .el-button {
    width: 80px;
    height: 30px;
    padding: 0;
    box-sizing: border-box;
    border-radius: 0;
  }
}

.history-box {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.1);
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  &.max-history-box {
    transition: width 0.5s ease;
    width: 400px;
  }
  &.min-history-box {
    transition: width 0.5s ease;
    width: 50px;
  }
  .el-icon-arrow-left,
  .el-icon-arrow-right {
    position: absolute;
    right: 20px;
    top: 20px;
    color: #fff;
    cursor: pointer;
  }
  .history-title {
    box-sizing: border-box;
    margin-top: 50px;
    & > h2 {
      color: #fff;
      text-align: center;
      margin-bottom: 10px;
    }
    & > h3 {
      font-size: 14px;
      color: #fff;
      text-align: right;
      margin-right: 20px;
      &:hover {
        cursor: pointer;
        color: #42af8f;
      }
    }
  }
  .history-panal {
    box-sizing: border-box;
    padding-left: 15px;
    padding-right: 15px;
    flex: 1;
    overflow: auto;
    .history-content {
      margin-bottom: 30px;
      > li {
        margin: 20px;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
      }
      .ecorded-time {
        & > h3 {
          font-size: 14px;
          color: 14px;
          text-align: left;
          color: #ffffff;
        }
      }
      .history-messages-everyday {
        &:hover {
          cursor: pointer;
          & > i {
            opacity: 1;
            color: #42af8f;
          }
          .information-record {
            color: #42af8f;
            .circle {
              border-color: #42af8f;
              position: relative;
            }
            .circle:before {
              content: "";
              border: 2px solid #42af8f;
              border-radius: 50%;
              width: 2px;
              height: 2px;
              display: inline-block;
              position: absolute;
              left: 2px;
              top: 2px;
            }
          }
        }
        .information-record {
          display: flex;
          color: #e5e5e5;
          font-size: 12px;
          line-height: 15px;
          & > li {
            margin-right: 10px;
            .circle {
              border: 2px solid #fff;
              border-radius: 50%;
              width: 10px;
              height: 10px;
              display: inline-block;
            }
          }
          .records {
            flex: 1;
            .detail-record-box {
              display: flex;
              flex-wrap: wrap;
              flex-direction: column;
              .detail-record {
                //margin-right: 10px;
                word-break: break-all;
              }
            }
          }
        }
        i {
          opacity: 0;
          font-size: 14px;
        }
      }
    }
  }
}

@media screen and (max-height: 800px) {
  footer {
    bottom: 10px;
  }
  .el-select-dropdown__wrap {
    max-height: 230px;
  }
  .search-tab {
    max-height: 540px;
    display: flex;
    flex-direction: column;

    &.el-tabs--border-card {
      & > .el-tabs__header {
        height: 40px;
        .el-tabs__item {
          height: 32px;
          line-height: 32px;

          &:hover {
            color: #333;
          }

          &.is-active {
            color: #42af8f;
            border-top-color: #42af8f;
          }
        }
      }

      /deep/.el-form-item {
        margin-bottom: 18px;

        .el-form-item__label {
          font-size: 14px;
          padding: 6px 10px 6px 0;
        }
        .el-form-item__content,
        .el-select {
          line-height: 24px;
          .el-input {
            font-size: 14px;
            .el-input__inner {
              height: 24px !important; //color: #999
            }
            .el-input__prefix {
              .el-icon-time {
                line-height: 24px;
              }
            }
            .el-input__suffix {
              .el-input__suffix-inner {
                .el-input__icon {
                  line-height: 24px;
                }
              }
            }
          }
        }
      }
    }
  }
  .el-tab-pane {
    .panel {
      .panel-content {
        .panel-content-wrap {
          padding: 0;
          .el-form {
            .form-conditions {
              max-height: 350px;
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
@media screen and (max-width: 1400px) {
  footer {
    bottom: 10px;
  }
  .el-select-dropdown__wrap {
    max-height: 230px;
  }
  .search-tab {
    max-height: 540px;
    display: flex;
    flex-direction: column;

    &.el-tabs--border-card {
      & > .el-tabs__header {
        height: 40px;
        .el-tabs__item {
          height: 32px;
          line-height: 32px;

          &:hover {
            color: #333;
          }

          &.is-active {
            color: #42af8f;
            border-top-color: #42af8f;
          }
        }
      }

      /deep/.el-form-item {
        margin-bottom: 18px;

        .el-form-item__label {
          font-size: 14px;
          padding: 6px 10px 6px 0;
        }
        .el-form-item__content,
        .el-select {
          line-height: 24px;
          .el-input {
            font-size: 14px;
            .el-input__inner {
              height: 24px !important; //color: #999
            }
            .el-input__prefix {
              .el-icon-time {
                line-height: 24px;
              }
            }
            .el-input__suffix {
              .el-input__suffix-inner {
                .el-input__icon {
                  line-height: 24px;
                }
              }
            }
          }
        }
      }
    }
  }
  .el-tab-pane {
    .panel {
      .panel-content {
        .panel-content-wrap {
          padding: 0;
          .el-form {
            .form-conditions {
              max-height: 350px;
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
</style>
