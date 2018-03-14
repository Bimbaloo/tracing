<template>
	<div id="app" class="report-wrapper">
		<div class="report-container">
			<h1 class="title">遏制清单</h1>
			<h2 class="content-title">查询条件</h2>
			<!-- <div class="condition">
				<div class="condition-line"><span>遏制人：{{nickname}}</span><span>遏制时间：{{restrainQuery.suppressTime}}</span><span>遏制描述：{{params.description}}</span></div>
				<div class="condition-line"><span>物料编码：{{params.materialCode}}</span><span>批次：{{params.batchNo}}</span></div>
			</div> -->
			<div class='condition-table'>
        <span v-for="infor in information" :key="infor.value">{{infor.value}}：{{infor.key}}</span>
      </div>
      <v-report :kill-progress="killProgress" :hasData="setWidth" :noData="removeWidth" :query="restrainQuery.handleID" type="restrainDetails"></v-report>
		</div>
  	</div>
</template>

<script>
import report from 'components/report/report.vue'
const URL = window.HOST + '/api/v1/suppress/list' // 遏制列表
// const oCondition = {
//   endTime: null,
//   personName: null,
//   startTime: null
// }
export default {
  components: {
    'v-report': report
  },
  data () {
    return {
      styleObject: {
        'min-width': '1200px'
      },
      restrainQuery: null,
      listInfor: {},
      killProgress: false
    }
  },
  computed: {
    // 是否支持遏制。
    supression () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.supression
      )
    },
    nickname: function () {
      return this.$store.state.loginModule.nickname
    },
    params: function () {
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
      let informationArr = Object.assign({}, this.listInfor) || {}
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
    this.$register.login(this.$store)
    this.$register.getVersion(this.$store, this.$ajax, () => {
      // 获取数据。
      if (!this.supression) {
        // 若不支持遏制。
        this.$message.error('暂无权限。')
      }
    })
    this.restrainQuery = JSON.parse(sessionStorage.getItem('restrain'))
    this.getListhData()
  },
  mounted () {
    window.onbeforeunload = () => {
      this.killProgress = true
    }
  },
  methods: {
    setWidth () {
      this.styleObject.minWidth = '1200px'
    },
    removeWidth () {
      this.styleObject.minWidth = 0
    },
    // 获取遏制列表信息
    getListhData (oCondition) {
      // debugger
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
      this.listInfor = oData.find(el => {
        return el.handle === this.restrainQuery.handleID
      })
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
  box-sizing: border-box;

  .title {
    height: 24px;
    font: normal 24px/1 "微软雅黑", arial, sans-serif;
    color: #333;
    /*font-family: "微软雅黑";*/
    text-align: center;
    /*font-weight: normal;*/
    margin: 28px auto;
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
</style>
