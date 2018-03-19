<template>
	<div class="router-content suspicious">
		<div class="error" v-if="isOpDbBeforeRefact">
			暂时不支持遏制
		</div>
		<div v-else>
			<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="isRestrained">遏制</el-button>
			<div class="innner-content" :style="styleObject">
			<!--h2 class="title">遏制详情</h2-->
			<!-- <h2 class="content-title" v-if="!isrestrainHtml">查询条件</h2> -->
			<div class="condition" v-if="'materialCode' in oQuery && !isrestrainHtml">
				<span>物料编码：{{oQuery.materialCode}}</span><span>批次：{{oQuery.batchNo}}</span>
			</div>
			<div class="condition" v-if="'equipmentId' in oQuery">
				<span>设备名称：{{equipmentName}}</span><span>开始时间：{{oQuery.startTime}}</span><span>结束时间：{{oQuery.endTime}}</span>
			</div>
			<h2 class="title">可疑品列表</h2>
			<!-- 遏制中，只当显示的是可疑品列表，才会在监听路由时调用接口 -->
			<v-report :kill-progress="killProgress" v-if="$route.meta.title=='restrain'" :hasData="setWidth" :noData="removeWidth" ></v-report>
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
      isRestrained: window.location.hash.includes('/suppress/1'),
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
      this.isRestrained = window.location.hash.includes('/suppress/1')
      this.killProgress = false
    }
  },
  methods: {
    // 可疑品列表。
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
            let oConditions = Object.assign(
              { doDescription: self.doDescription },
              this.$route.query
            )

            this.$post(this.url, oConditions)
            .then((oData) => {
              console.log(oData)
              if (oData.data.errorCode === 1) { // 接口出错
                this.$message.error('接口出错')
                console.log(oData.data.errorMsg.message)
                self.doDescription = ''
                done()
              } else if (oData.data.errorCode === 0) {
                this.isRestrained = false
                const handle = oData.data.data.handle
                sessionStorage.setItem('handleID', handle)
                instance.confirmButtonLoading = false
                this.$message.success('遏制成功')
                let restrain = {...this.$route.query, ...{'handleID': handle, 'description': this.doDescription, 'suppressTime': new Date().Format('yyyy-MM-dd hh:mm:ss')}}
                self.doDescription = ''
                sessionStorage.setItem('restrain', JSON.stringify(restrain))
                window.open('/restrainReport.html?' + '_tag=' + new Date().getTime().toString().substr(-5))

                done()
              }
            })
            .catch(err => {
              instance.confirmButtonLoading = false
              this.$message.error('遏制失败')
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
    },
    setWidth () {
      this.styleObject.minWidth = '1000px'
    },
    removeWidth () {
      this.styleObject.minWidth = 0
    }
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

<style lang="less">
.error {
	border: 2px solid #42af8f;
  padding: 20px 12px;
  margin: 20px;
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
    right: 20px;
    //	top: 45px;
  }

  .condition {
    border: 2px solid #42af8f;
    padding: 20px 12px;
    margin-bottom: 30px;

    span {
      display: inline-block;
      & + span {
        margin-left: 60px;
      }
    }
  }
}

.message {
  textarea {
    font-family: "微软雅黑";
  }
}
</style>
