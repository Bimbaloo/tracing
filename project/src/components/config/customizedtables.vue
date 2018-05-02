<template>
  <div class="content-inner content-wraps">
    <div class="query-items">
      <div class="query-item" v-for='option in modules' :key="option.tableCodeNames">
        <div class="query-header">
          <span class="header-title">{{option.name}}</span>
          <div class="header-icon">
            <!-- 编辑。 -->
            <i @click.stop="editState(option)" v-show="!option.state" title="编辑" class="icon el-icon-edit"></i>
            <!-- 取消。 -->
            <i @click.stop="cancelState(option)" v-show="option.state" title="取消" class="icon icon-20 icon-exit"></i>
            <!-- 保存。 -->
            <i @click.stop="saveState(option)" v-show="option.state" title="保存" class="icon icon-20 icon-save"></i>
          </div>
        </div>
        <div class="content-item">
          <el-transfer
            style="text-align: left; display: inline-block"
            v-model="option.columns"
            filterable
            :titles="['可选项', '已选项']"
            @change="handleChange"
            :props="{
              key: 'itemCode',
              label: 'itemName'
            }"
            :data="userDefinedItems">
          </el-transfer>
        </div>
        <!-- 遮罩层 -->
        <div class="modal" v-show="!option.state"></div> 
      </div>
    </div>
  </div>
</template>

<script>
import 'assets/css/common.less'
import {mapGetters} from 'vuex'
const TABLE_COLUMNS_GET = window.HOST + '/api/v1/customized/tables'
const TABLE_COLUMNS_PUT = window.HOST + '/api/v1/customized/tablecolumn'
export default {
  name: 'customizedtables',
  components: {

  },
  data () {
    return {
      modules: [
        {
          name: '出库明细表',
          tableCodeNames: 'outboundTable',
          state: 0,       // 0=>默认；1=>编辑
          columns: []
        },
        {
          name: '入库明细表',
          tableCodeNames: 'storageTable',
          state: 0,       // 0=>默认；1=>编辑
          columns: []
        },
        {
          name: '投入明细表',
          tableCodeNames: 'doInTable',
          state: 0,       // 0=>默认；1=>编辑
          columns: []
        },
        {
          name: '产出明细表',
          tableCodeNames: 'doOutTable',
          state: 0,       // 0=>默认；1=>编辑
          columns: []
        },
        {
          name: '起点明细表',
          tableCodeNames: 'startPointsTable',
          state: 0,       // 0=>默认；1=>编辑
          columns: []
        }
      ]
    }
  },
  created () {
    this.modules.forEach(option => {
      option.columns = this.tablesColumns[option.tableCodeNames].map(el => {
        return el.itemCode
      })
    })
  },
  computed: {
    ...mapGetters(
      {
        // 已定义的自定义字段
        userDefinedItems: 'userDefinedItems',
        // tableCode对应表
        tableCodeNames: 'tableCodeNames',
        // tablesColumn
        tablesColumns: 'tablesColumns'
      }
    ),
    // 出库明细表已定义的
    outboundTableColumns () {
      return this.tablesColumns['outboundTable'] || []
    },
    // 入库明细表已定义的
    storageTableColumns () {
      return this.tablesColumns['storageTable'] || []
    },
    // 投入明细表已定义的
    doInTableColumns () {
      return this.tablesColumns['doInTable'] || []
    },
    // 产出明细表已定义的
    doOutTableColumns () {
      return this.tablesColumns['doOutTable'] || []
    },
    // 起点明细表已定义的
    startPointsTableColumns () {
      return this.tablesColumns['startPointsTable'] || []
    }
  },
  watch: {
    'outboundTableColumns': function () {
      let num = this.modules.findIndex(el => el.tableCodeNames === 'outboundTable')
      this.modules[num].columns = this.outboundTableColumns.map(el => {
        return el.itemCode
      })
    },
    'storageTableColumns': function () {
      let num = this.modules.findIndex(el => el.tableCodeNames === 'storageTable')
      this.modules[num].columns = this.storageTableColumns.map(el => {
        return el.itemCode
      })
    },
    'doInTableColumns': function () {
      let num = this.modules.findIndex(el => el.tableCodeNames === 'doInTable')
      this.modules[num].columns = this.doInTableColumns.map(el => {
        return el.itemCode
      })
    },
    'doOutTableColumns': function () {
      let num = this.modules.findIndex(el => el.tableCodeNames === 'doOutTable')
      this.modules[num].columns = this.doOutTableColumns.map(el => {
        return el.itemCode
      })
    },
    'startPointsTableColumns': function () {
      let num = this.modules.findIndex(el => el.tableCodeNames === 'startPointsTable')
      this.modules[num].columns = this.startPointsTableColumns.map(el => {
        return el.itemCode
      })
    }
  },
  methods: {
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
    },
    // 修改 tablesColumns 并更新
    setCustomizedItems (oQuery) {
      return new Promise((resolve, reject) => {
        resolve(this.$register.sendRequest(
          this.$store,
          this.$ajax,
          TABLE_COLUMNS_PUT,
          'put',
          oQuery,
          this.getCustomizedTablesColumns,
          sErrorMessage => {
            // 提示信息。
            console.log(sErrorMessage)
            this.showMessage(sErrorMessage)
          }
        ))
      })
    },
    handleChange (value, direction, movedKeys) {
      console.log(value, direction, movedKeys)
    },
    // 编辑状态
    editState (option) {
      option.state = 1
    },
    // 取消
    cancelState (option) {
      option.state = 0
      option.columns = this.tablesColumns[option.tableCodeNames].map(el => {
        return el.itemCode
      })
    },
    // 保存
    saveState (option) {
      let oQuery = {
        'tableCode': option.tableCodeNames,
        'columns': option.columns.map(el => {
          return {
            'itemCode': el
          }
        })
      }
      this.setCustomizedItems(oQuery)
        .then(_ => {
          option.state = 0
        })
    }
  },
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    next(vm => {
      // 初始化编辑状态
      vm.modules.forEach(option => {
        option.columns = vm.tablesColumns[option.tableCodeNames].map(el => {
          return el.itemCode
        })
      })
    })
    next()
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`

    // 初始化编辑状态
    this.modules.forEach(option => {
      option.columns = this.tablesColumns[option.tableCodeNames].map(el => {
        return el.itemCode
      })
    })
    next()
  }
}
</script>

<style lang="less" scoped>
@green: #42AF8F;
@gray: #b3b3b3;

.content-inner {
  .query-items {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 30px 50px 20px 50px;
    overflow: auto;
    .query-item {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 550px;
      height: 500px;
      border: 2px solid @gray;
      margin-bottom: 30px;
      .query-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        flex-basis: 40px;
        color: #fff;
        background-color: @gray;
        .header-title {
          line-height: 40px;
        }
        .header-icon {
          font-size: 20px;
          &:hover {
            cursor: pointer;
          }
        }
      }
      .modal {
        position: absolute;
        box-sizing: border-box;
        width: 100%;
        top: 40px;
        bottom: 0px;
        z-index: 9;
      }
      .content-item {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        /deep/.el-transfer {
          .el-transfer-panel__body {
            height: 350px;
            .el-checkbox-group {
              height: 295px;
            }
          }
        }
      }
      &:hover {
        border-color:@green;
        .query-header {
          background-color: @green;
        }
      }
    }
  }
}

</style>
