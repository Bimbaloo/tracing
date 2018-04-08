<!--设备分析路由--><!--投产表/设备分析-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon" v-if="!bRestrain">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
        </div>
        <el-tabs v-model="activeName" @tab-click="tabChange">
            <el-tab-pane label="投产表" name="product">		
                <v-product :is-in-chart="false"></v-product>           
            </el-tab-pane>
            <el-tab-pane label="设备分析" name="equipment">
                <div class="path-btn">
                    <el-button class="btn btn-plain btn-restrain" @click="showRestrain" v-if="btnShowRestrain && restrainIf">遏制</el-button>
                </div>
                <div class="router-path">
                    <router-link 
                        class="path-item" 
                        v-for="(oRoute,index) in aoRoute" 
                        :key="index" 
                        :to="{path: oRoute.path, query: oRoute.query}" 
                        replace><span v-if="index">></span>{{oRoute.name}}</router-link>
                </div>
                <!-- 目前是时间轴及投产需要缓存 -->
                <keep-alive>
                    <router-view v-if="$route.meta.keepAlive"></router-view>  
                </keep-alive>
                <router-view v-if="!$route.meta.keepAlive"></router-view>  
            </el-tab-pane>
        </el-tabs>        

    </div>
</template>

<script>
import product from 'components/process/product.vue'

export default {
  components: {
    'v-product': product
  },
  data () {
    return {
      // 默认展示的tab。
      activeName: 'product',
      // 是否为遏制页面。
      bRestrain: location.pathname.indexOf('restrain') > -1,
      // 右下详情内容区域全屏标识。
      key: this.$route.params.key,
      oQuery: {},
      operations: {
        chart: '时间轴',
        product: '投产表',
        storesReturned: '退料',
        transfer: '结转',
        qtReport: '质检',
        qcReport: '送检',
        fgbReport: 'fgb检验',
        tool: '工具记录',
        event: '事件记录',
        repair: '维修记录',
        spotReport: '点检记录',
        restrain: '可疑品',
        parameter: '工艺参数'
      },
      aoRoute: [],
      restrainIf: false,
      btnShowRestrain: false, // 临时屏蔽遏制
      description: '',
      url: '/trace/v1/materialbatchsuppress'
    }
  },
  computed: {
    fullscreen () {
      return this.$store && this.$store.state.fullscreen
    },
    treeFullscreen: function () {
      return this.$store && this.$store.state.treeFullscreen
    },
    processCode () {
      return this.$route.query.code
    },
    activeTabChange () {
      return this.$store && this.$store.state.activeTabChange
    }
  },
  created () {
    this.initRoute()
  },
  watch: {
    processCode: function () {
      this.activeName = 'product'
      this.initRoute()
    },
    activeTabChange: function () {
      this.activeName = this.activeTabChange
    },
    treeFullscreen: function () {
      // 设置tab选中的宽度。首次进入工序节点时处理。
      if (!this.treeFullscreen) {
        let oTabHead = document.querySelector(
          '.material-stock > .el-tabs .el-tabs__header'
        )
        let oTabHeadActive = oTabHead.querySelector('.el-tabs__active-bar')
        let oTabHeadItem = oTabHead.querySelector('.el-tabs__item')

        oTabHeadActive.style.width = oTabHeadItem.offsetWidth + 'px'
      }
    }
  },
  methods: {
    // tab切换。
    tabChange (oTab) {
      // tab切换后要更新表格高度。
      this.$store.commit({
        type: 'updateTabChange',
        key: oTab.name
      })

      if (oTab.name === 'equipment') {
        // 若为设备分析。
        if (!this.$route.meta.title) {
          // 若未引入图形页面。
          this.$router.replace({
            path: '/process/chart',
            query: {
              // "detailInfos": this.$route.query.detailInfos,
              key: this.$route.query.key,
              code: this.processCode,
              _tag: this.$route.query._tag
            }
          })
        }
      }
    },
    // 初始化路由设置。
    initRoute () {
      let sRoute = this.$route.path
      let aPath = sRoute.split('/')
      let sType = aPath[aPath.length - 1]

      if (sType === 'process') {
        sType = 'chart'
        sRoute = '/process/chart'
      }

      this.aoRoute = []
      this.oQuery = {}

      // 保存查询条件。
      this.oQuery[sType] = this.$route.query

      // 设置面包屑路由。
      this.aoRoute.push({
        name: this.operations[sType],
        path: sRoute,
        query: this.oQuery[sType]
      })
    },
    setPathVisible (to) {
      let aPath = to.path.split('/')
      let sType = aPath[aPath.length - 1]

      // 遏制
      if (sType === 'restrain') {
        this.restrainIf = true
      } else {
        this.restrainIf = false
      }
    },
    // 设置路由。
    setRouteQuery (from, to) {
      if (from.fullPath === to.fullPath) {
        // 已跳转成功。
        return
      }
      let sFromRoute = from.path
      let sToRoute = to.path
      let aFromPath = sFromRoute.split('/')
      let aToPath = sToRoute.split('/')
      let sFromType = aFromPath[aFromPath.length - 1]
      let sToType = aToPath[aToPath.length - 1]

      // 如果是在设备分析中其他页面，点击tree上的节点（目前选中的节点） 需设置activeName
      if (!to.meta.title) {
        this.$store.commit({
          type: 'updateTabChange',
          key: 'product'
        })
        this.activeName = 'product'

        let sType = 'chart'
        let sRoute = '/process/chart'

        // 重置时间轴路由
        this.aoRoute = []
        this.oQuery = {}

        // 保存查询条件。
        this.oQuery[sType] = this.$route.query

        // 设置面包屑路由。
        this.aoRoute.push({
          name: this.operations[sType],
          path: sRoute,
          query: this.oQuery[sType]
        })

        return
      }

      if (sFromRoute === '/process') {
        return
      }

      // 保存查询条件。
      this.oQuery[sToType] = to.query // this.$route.query

      if (sToType === 'chart' && to.query.key && !to.query.startTime) {
        // 树节点跳转。
        this.oQuery = {}
        this.oQuery[sToType] = to.query
        this.aoRoute = []

        this.aoRoute.push({
          name: this.operations[sToType],
          path: sToRoute,
          query: this.oQuery[sToType]
        })
      } else if (sFromType === 'chart' && sToType !== 'chart') {
        // 从设备分析跳转到其他页面。
        // 添加开始时间，结束时间。因为可以跳转到设备分析的时候，开始时间结束时间有修改。
        Object.assign(this.oQuery[sFromType], {
          startTime: to.query.startTime,
          endTime: to.query.endTime,
          shiftStartTime: to.query.shiftStartTime,
          shiftEndTime: to.query.shiftEndTime
        })

        // 保存跳转的时间。
        this.aoRoute[0].query = this.oQuery[sFromType]

        this.aoRoute.push({
          name: this.operations[sToType],
          path: sToRoute,
          query: this.oQuery[sToType]
        })
      } else if (sToType === 'chart') {
        // 从其他页面跳回设备分析。
        let oRoute = this.aoRoute.shift()
        this.aoRoute = []
        this.aoRoute.push(oRoute)
      } else if (sFromType === 'product') {
        // 从投产表跳到其他页面。
        this.aoRoute.push({
          name: this.operations[sToType],
          path: sToRoute,
          query: this.oQuery[sToType]
        })
      } else if (sToType === 'product') {
        // 从其他页面跳到投产表
        this.aoRoute.pop()
      } else if (sFromType === 'parameter') {
        // 从工艺参数跳到其他页面。
        this.aoRoute.push({
          name: this.operations[sToType],
          path: sToRoute,
          query: this.oQuery[sToType]
        })
      } else if (sToType === 'parameter') {
        // 从其他页面跳到工艺参数
        this.aoRoute.pop()
      }
    },
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
        // self.description = "";
      })
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
    this.key = this.$route.params.key
    this.setRouteQuery(from, to)
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

<style lang="less" scoped>
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
    top: 0px;
    right: 50px;
    z-index: 10;
  }

  .router-path {
    flex: 0 16px;
    height: 16px;
    line-height: 16px;
    border-bottom: none;
    // border-left: 4px solid #42af8f;
    font-size: 14px;
    box-sizing: border-box;
    padding: 0 5px;
    margin-bottom: 10px;
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

<style lang="less">
.router-content {
  .innner-content {
    .condition {
      border: 2px solid #42af8f;
      padding: 20px 12px;
      margin-bottom: 20px;
    }
  }
}
.material-stock {
  & > .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    & > .el-tabs__content {
      flex: 1 1;

      & > .el-tab-pane {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
