<!--检验节点路由-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
        </div>
        <div class="path-btn">
        	<el-button class="btn btn-plain btn-restrain" @click="showSuspiciousList" v-if="batchIf && !restrainIf">可疑品</el-button>
            <el-button class="btn btn-plain btn-restrain" @click="showRestrain" v-if="supression && restrainIf && hasSupressionList">遏制</el-button>
        </div>
        <div class="router-path">
            <span class="path-item" @click="checkStock">检验明细</span>
            <span class="path-item" v-if="restrainIf">>可疑品</span>
        </div>
        <!-- 遏制数据不需要缓存 -->
        <keep-alive>
	        <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
</template>

<script>
import fnP from 'assets/js/public.js'

export default {
  data () {
    return {
      // 右下详情内容区域全屏标识。
      key: this.$route.params.key,
      material: {},
      batch: {},
      restrain: {},
      batchIf: false,
      restrainIf: false,
      // btnShowRestrain: false, // 临时屏蔽遏制
      description: '',
      url: '/trace/v1/materialbatchsuppress'
    }
  },
  computed: {
    fullscreen () {
      return this.$store.state.fullscreen
    },
    // 是否支持遏制。
    supression () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.supression
      )
    },
    nodeType () {
      return this.$store && this.$store.state.nodeType
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
    this.setRouteQuery()
  },
  watch: {},
  methods: {
    // 明细
    checkStock (event) {
      if (event.target.parentNode.lastElementChild === event.target) {
        // 若为最后一个节点，则不可点击。
        return false
      }
      this.$router.replace({ path: `/stock`, query: this.material })
    },
    // 可疑品
    showSuspiciousList () {
      let sKey = this.$route.params.key
      let sPath = ''
      if (sKey !== undefined && sKey !== '') {
        sPath = `/stock/${sKey}/restrain`
      } else {
        sPath = '/stock/restrain'
      }
      this.$router.replace({ path: sPath, query: this.$route.query })
    },
    // 遏制
    showRestrain () {
      const h = this.$createElement
      let bSucess = false
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
            value: self.description
          },
          on: {
            blur: function (event) {
              self.description = event.target.value
            }
          }
        }),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'

            let oConditions = Object.assign(
              { description: self.description },
              this.$route.query
            )
            done()
            instance.confirmButtonLoading = false
            bSucess = true
            // 隐藏遏制按钮。
            self.restrainIf = false
            let sSerializion = ''
            for (let p in oConditions) {
              sSerializion += `&${p}=${oConditions[p]}`
            }
            sSerializion = sSerializion.substring(1)
            // 遏制成功，打开到遏制报告。
            window.open('restrain/report.html?' + sSerializion)
          } else {
            done()
          }
        }
      }).then(action => {
        if (action === 'confirm') {
          if (bSucess) {
            this.$message.success('提交成功！')
          } else {
            this.$message.error('提交失败！')
          }
        }
      })
    },
    setRouteQuery () {
      let aHref = this.$route.path.split('/')
      let sType = aHref[aHref.length - 1]
      let oQuery = fnP.parseQueryParam(this.$route.query)

      if (sType === 'batch') {
        this.batch = oQuery
      } else if (sType === 'restrain') {
        this.restrain = oQuery
      } else {
        this.material = oQuery
      }
    },
    setPathVisible (to) {
      let aPath = to.path.split('/')
      let sType = aPath[aPath.length - 1]

      if (sType === 'batch') {
        this.batchIf = true
        this.restrainIf = false
      } else if (sType === 'restrain') {
        this.batchIf = true
        this.restrainIf = true
      } else {
        this.batchIf = false
        this.restrainIf = false
      }
    },
    fullScreenClick () {
      // 详情全屏按钮点击事件。
      this.$store.commit({
        type: 'updateFullscreen',
        key: true
      })
    },
    restoreScreenClick () {
      // 详情还原按钮点击事件。
      this.$store.commit({
        type: 'updateFullscreen',
        key: false
      })
    }
  },
  // beforeRouteEnter (to, from, next) {
  //     // 在渲染该组件的对应路由被 confirm 前调用
  //     // 不！能！获取组件实例 `this`
  //     // 因为当钩子执行前，组件实例还没被创建
  // },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
    //          console.log("to:");
    //          console.log(to);
    //          console.log("from:");
    //          console.log(from);
    //          console.log("next:");
    //          console.log(next);

    this.key = this.$route.params.key
    this.setRouteQuery()
    // 设置path可见性。
    this.setPathVisible(to)
    next()
  }
  // beforeRouteLeave (to, from, next) {
  //     // 导航离开该组件的对应路由时调用
  //     // 可以访问组件实例 `this`
  // }
}
</script>

<style lang="less">
.material-stock {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .view-icon {
    position: absolute;
    cursor: pointer;
    top: 15px;
    right: 10px;
    z-index: 10;
  }

  .path-btn {
    position: absolute;
    top: 10px;
    right: 50px;
    z-index: 10;
  }
  .router-path {
    flex: 0 50px;
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #ccc;
    font-size: 16px;
    box-sizing: border-box;
  }

  .router-content {
    flex: 1 1;
    overflow: auto;

    .btn-restrain {
      right: 10px;
      //	top: 65px;
      z-index: 10;
    }

    .table {
      .batch {
        cursor: pointer;
        color: #f90;
        .cell {
          font-weight: 600;
        }
      }
    }
  }
}
</style>
