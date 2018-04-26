<template>
    <div id="app">
        <v-header :config="false" :back="'search.html'" :tool="false"></v-header>
        <div class="pbody">
            <div class="sidebar">
                <div class="sidebar-item" v-for="(item,index) in sidebarItems" :key="index" :class="{active: isActive==index}" @click="turnTo(item.src,index)">
                    <div class="logo-item" :class="item.img"></div>
                    <span class="logo-item-text">{{item.text}}</span>
                </div>
            </div>

            <div class="content-bg">
            	<div class="content-wrap">
	                <div class="content">
                        <!--<keep-alive>-->
	                        <router-view></router-view>
                        <!--</keep-alive>-->
	                </div>
            	</div>
            </div>
        </div>
    </div>
</template>

<script>
import header from 'components/header/header.vue'
const TABLE_DATA_URL = window.HOST + '/api/v1/customized/items'
const TABLE_COLUMNS_GET = window.HOST + '/api/v1/customized/tables'

export default {
  components: {
    'v-header': header
  },
  data () {
    return {
      isActive: 0,
      sidebarItems: [
        {
          text: '自定义查询入口',
          img: '',
          src: '/query'
        }, {
          text: '自定义字段',
          img: 'field',
          src: '/field'
        }, {
          text: '自定义表格显示列',
          img: 'field',
          src: '/customizedtables'
        }, {
          text: '工厂定制',
          img: 'factory',
          src: '/factory'
        }
      ]
    }
  },
  created () {
    // 登录验证。
    this.$register.login(this.$store)
    this.getCustomizedItems()
    this.getCustomizedTablesColumns()
    this.$router.replace('/query')
  },
  computed: {
    // 是否编辑的状态。
    edit () {
      return this.$store.state.edit
    },
    ModuleOrderListEdit () {
      return this.$store.state.ModuleOrderListEdit
    }
  },
  methods: {
    turnTo (routerLink, index) {
      let self = this // edit只是处理模块
      if (
        (self.edit || self.ModuleOrderListEdit) &&
        self.isActive !== index &&
        self.isActive === 0
      ) {
        // 存在未保存，是否处理。  ---- 确定与取消按钮交换
        self.$confirm('内容未保存，是否离开本页?', '提示', {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          cancelButtonClass: 'button-cancel el-button--primary',
          confirmButtonClass: 'button-confirm',
          type: 'warning',
          callback: (action, instance) => {
            if (action === 'cancel') {
              // 取消操作。还在当前页面。
              return false
            } else {
              // 确定操作。离开当前页面。 页面缓存不能使用，否则状态更新不了
              this.$store.commit({
                type: 'updateEdit',
                key: false
              })
              this.$store.commit({
                type: 'updateModuleOrderListEdit',
                key: false
              })
              self.isActive = index
              self.$router.replace({ path: routerLink })
              return true
            }
          }
        })
      } else {
        self.isActive = index
        self.$router.replace({ path: routerLink })
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
    // 获取 tablesColumns
    getCustomizedTablesColumns () {
      return new Promise((resolve, reject) => {
        resolve(this.$register.getBeforeDispatchData(
          'getCustomizedTablesColumns',
          this.$store,
          this.$ajax,
          null,
          TABLE_COLUMNS_GET
        ))
      })
    }
  }
}
</script>

<style lang="less">
html,
body {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  .pbody {
    display: flex;
    flex: 1;
    flex-direction: row;
  }
  .el-dialog__headerbtn,
  .el-pagination__rightwrapper {
    border-width: 0;
    background-color: transparent;
    outline: none;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    flex: 0 0 180px;
    background: #ffffff;
    .sidebar-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100px;
      text-align: center;
      cursor: pointer;
      &:hover,
      &.active {
        background: #42af8f;
        color: #ffffff;
        .logo-item {
          background-position: 0 0;
          &.field {
            background-position: 0 -30px;
          }
          &.factory {
            background-position: 0 -60px;
          }
        }
      }
      .logo-item {
        height: 30px;
        width: 30px;
        margin: 20px auto 0;
        background: url("../../assets/img/img01.png")no-repeat;
        background-position: -30px 0;
        &.field {
          background-position: -30px -30px;
        }
        &.factory {
          background-position: -30px -60px;
        }
      }
      .logo-item-text {
        line-height: 40px;
      }
    }
  }
  .content-bg {
    width: 100%;
    /*height: 100%;*/
    background: #cccccc;
    padding: 20px;
    display: flex;

    .content-wrap {
      flex: 1;
      //  position: relative;
      display: flex;

      /deep/.content {
        // position: absolute;
        // width: 100%;
        // height: 100%;
        display: flex;
        flex: 1;
        background: #ffffff;
        & > .content-inner {
          display: flex;
          flex: 1;
          flex-direction: column;
        }
      }
    }
  }
}
.el-message-box__headerbtn {
  background: transparent;
  border: none;
}
.el-message-box__btns {
  .button-cancel {
    float: right;
    margin-left: 10px;
  }
  .button-confirm {
    margin-left: 0;
    background: #ffffff;
    border-color: rgb(191, 217, 212);
    color: rgb(31, 61, 55);
  }
}

.v-modal-enter {
  -webkit-animation: v-modal-in 0.2s ease;
  animation: v-modal-in 0.2s ease;
}
</style>
