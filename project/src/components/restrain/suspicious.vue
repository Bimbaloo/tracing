<template>
	<div class="router-content suspicious">
		<div class="error" v-if="isOpDbBeforeRefact" style="margin:20px;">
			暂时不支持遏制
		</div>
		<div class="suspicious-content" v-else>
			<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="isRestrained && hasSupressionList">遏制</el-button>
			<div class="inner-content">
        <div class="condition" v-if="'materialCode' in oQuery && !isrestrainHtml">
          <span>物料编码：{{oQuery.materialCode}}</span><span>批次：{{oQuery.batchNo}}</span>
        </div>
        <div class="condition" v-if="'barcode' in oQuery && !isrestrainHtml">
          <span>条码：{{oQuery.barcode}}</span>
        </div>
        <div class="condition" v-if="'equipmentId' in oQuery">
          <span>条码：{{equipmentName}}</span><span>开始时间：{{oQuery.startTime}}</span><span>结束时间：{{oQuery.endTime}}</span>
        </div>
        <h2 class="title">可疑品列表</h2>
        <!-- 遏制中，只当显示的是可疑品列表，才会在监听路由时调用接口 -->
        <div class="report-box">
          <v-report :kill-progress="killProgress" v-if="$route.meta.title=='restrain'" :type='type'></v-report>
        </div>
      </div>
		</div>
	</div>

</template>

<script>
import report from 'components/report/report.vue'

export default {
  components: {
    'v-report': report
  },
  data () {
    return {
      isRestrained: window.location.hash.includes('/suppress/1') || window.location.hash.includes('/suppress/4'),
      doDescription: '',
      url: window.HOST + '/api/v1/suppress/do-by-batch', // 根据物料和批次遏制
      styleObject: {
        'min-width': '1000px'
      },
      equipmentName: '',
      killProgress: false
    }
  },
  computed: {
    // 版本信息数据。
    isOpDbBeforeRefact () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isOpDbBeforeRefact
      )
    },
    isrestrainHtml () {
      return window.location.pathname.includes('restrain')
    },
    oQuery () {
      return this.$route.query
    },
    type () {
      return this.$route.meta.type || window.sessionStorage.getItem('type') || null
    },
    // 是否有可疑品信息
    hasSupressionList () {
      return (
        this.$store.state.supressionModule &&
        this.$store.state.supressionModule.hasSupressionList
      )
    }
  },
  created () {
    this.equipmentName = this.oQuery.equipmentName
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    // this.fetchData();
  },
  watch: {
    // 如果路由有变化，会再次执行该方法- 当前页面没有缓存，每次都是重新创建
    $route: function () {
      if (this.$route.meta.title === 'restrain') {
        this.equipmentName = this.oQuery.equipmentName
      }
      this.isRestrained = window.location.hash.includes('/suppress/1') || window.location.hash.includes('/suppress/4')
      this.killProgress = false
    }
  },
  methods: {
    // 可疑品列表
    suppres () {
      const h = this.$createElement
      let self = this
      this.$msgbox({
        title: '提示',
        message: h('el-input', {
          attrs: {
            type: 'textarea',
            rows: 4,
            placeholder: '请输入遏制描述信息'
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
            instance.confirmButtonText = '遏制中...'
            let oConditions = {}
            let oUrl = ''

            oUrl = this.url
            oConditions = Object.assign(
                { doDescription: self.doDescription },
                this.$route.query
              )

            this.$register.sendRequest(
              this.$store,
              this.$ajax,
              oUrl,
              'post',
              oConditions,
              oData => {
                console.log(oData)
                this.isRestrained = false
                const handle = oData.handle
                sessionStorage.setItem('handleID', handle)
                instance.confirmButtonLoading = false
                this.$message.success('遏制成功')
                let restrain = {...this.$route.query, ...{'handleID': handle, 'description': this.doDescription, 'suppressTime': new Date().Format('yyyy-MM-dd hh:mm:ss')}}
                sessionStorage.setItem('restrain', JSON.stringify(restrain))
                window.open('restrainReport.html?' + '_tag=' + new Date().getTime().toString().substr(-5))

                done()
              },
              // 失败
              (err) => {
                instance.confirmButtonLoading = false
                this.$message.error(err)
                console.log(err)
                done()
              },
              this.requestError
            )
          } else {
            done()
          }
        }
      })
    },
    // 请求错误。
    requestError (err) {
      console.log(err)
    }
    // setWidth () {
    //   this.styleObject.minWidth = '1000px'
    // },
    // removeWidth () {
    //   this.styleObject.minWidth = 0
    // }
  },
  // 遏制页面离开时，关闭进程(可疑品：查出库，物料)
  beforeRouteLeave (to, from, next) {
    this.killProgress = true
    setTimeout(() => {
      next()
    }, 500)
  },
  // 遏制页面离开(遏制页面)
  beforeRouteUpdate (to, from, next) {
    this.killProgress = true
    setTimeout(() => {
      next()
    }, 500)
  }
}
</script>

<style lang="less" scoped>
.error {
	border: 2px solid #42af8f;
  padding: 20px 12px;
  font-size: 14px;
  color: red;
}
.el-message-box {
  .el-textarea__inner {
    border-radius: 0;
  }
  .el-button {
    border-radius: 0;
    padding: 7px 15px;
  }
  .el-message-box__headerbtn {
    padding: 0;
    border: none;
  }
  .el-message-box__content {
    padding: 0 20px;
  }
}

.router-content {
  flex: 1 1;
  overflow: auto;
  position: relative;

  .btn-restrain {
    position: absolute;
    right: 0px;
    //	top: 45px;
  }

  .condition {
    border: 2px solid #42af8f;
    padding: 20px 12px;

    span {
      display: inline-block;
      & + span {
        margin-left: 30px;
      }
    }
  }
}

.message {
  textarea {
    font-family: "微软雅黑";
  }
}
.suspicious {
  display: flex;
  flex-direction: column;
  .suspicious-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    .inner-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      .report-box {
        flex: 1;
        overflow: auto;
      }
    }
  }
}

</style>
