<template>
    <div class="content-query content-inner">
		<div :class="['query-lists-container',{ 'no-border': !ModuleOrderListEdit }]">
			<div class="list-edit" v-show="!ModuleOrderListEdit">
				<span class="list-title">自定义排序</span>
				<el-switch
					active-text=""
  					inactive-text=""
					inactive-color="#bfcbd9" 
					v-model="ModuleOrderListEdit">
				</el-switch>
			</div>
			<div class="list-header" v-show="ModuleOrderListEdit">
				<span class="list-title">自定义排序</span>
				<span class="list-edit">
					<i class="icon el-icon-circle-close"  @click.stop="hideEditQueryState()" title="取消"></i>
					<i class="icon el-icon-circle-check"  @click.stop="saveEditQueryState('保存')" title="保存"></i>
				</span>
			</div>
			<div class="list-main" v-show="ModuleOrderListEdit">
				<div class="list-message">
					<span>系统将根据拖动的顺排列</span>
					<span>拖动</span>
				</div>
				<ul class="list-container">
					<li class="query-list" 
						v-for="item in category"
						v-if="showItem(item)"
						v-dragging="{ list: category, item: item, group: 'category' }"
						:key="item.moduleCode">
						<span class="name-list">{{item.moduleName}}</span>
						<i class="icon icon-14 icon-move"></i>
					</li>
				</ul>
			</div>
		</div>
		<div class="query-items">
			<div class="query-item" 
				v-for="(item,index) in category"
				v-if="showItem(item)"
				:item-id = "index"
				:key = "item.moduleCode">
				<div class="query-header">
					<span class="header-title"> {{ item.moduleName }} </span>
					<div class="header-icon">
						<!-- 编辑。 -->
						<i @click.stop="showEditState(item.moduleCode,index)" title="编辑" v-show="!oBefore[item.moduleCode].bEdit" v-if="oBefore[item.moduleCode].isEdit" class="icon el-icon-edit"></i>
						<!-- 取消。 -->
						<i @click.stop="hideEditState(item.moduleCode,index)" title="取消" v-show="oBefore[item.moduleCode].bEdit" class="icon icon-20 icon-exit"></i>
						<!-- 保存。 -->
						<i @click.stop="saveModuleValue(item.moduleCode,item.moduleOrder)" title="保存" v-show="oBefore[item.moduleCode].bEdit" class="icon icon-20 icon-save"></i>
						<!-- 增加。 -->
						<i @click.stop="showModal(item.moduleCode,index)" title="增加" v-show="oBefore[item.moduleCode].bEdit" class="icon el-icon-plus"></i>
					</div>
				</div>
				<div class="content-item">
					<li class="item-module"
						v-for="(listItem,indexList) in item.groups"
						:data-id = "indexList"
						:key = "indexList"
						@mouseover="isShow=index*10+indexList"
						@mouseleave="isShow=null">
						<span class="name-item">{{ listItem.groupName }}</span>
						<div class="name-icon" :class="{'item-show-transition':oBefore[item.moduleCode].bEdit && isShow==index*10+indexList}">
							<!-- 上移。 -->
							<i v-if="indexList" 
								@click.stop="changeOrder(item.moduleCode,index,indexList-1,indexList)"
								class="icon el-icon-arrow-up"></i>
							<!-- 下移。 -->
							<i v-if="indexList != item.groups.length-1" 
								@click.stop="changeOrder(item.moduleCode,index,indexList,indexList+1)" 
								class="icon el-icon-arrow-down"></i>
							<!-- 修改。 -->
							<i @click.stop="showModal(item.moduleCode,index,indexList)" v-if="listItem.groupName !== '物流码' && listItem.groupName !== '条码' && listItem.groupName !== '物料' && listItem.groupName !== '设备'" class="icon el-icon-edit"></i>
							<!-- 删除。 -->
							<i @click.stop="delItem(index,indexList)" v-if="listItem.groupName != '物流码'" class="icon el-icon-delete"></i>
						</div>
					</li>
				</div>
			</div>
    	</div>
    	<v-trans
    		:v-if="showTransfer"
    		:dialog-show="showTransfer"
    		:transfer-data="getAllFilter()"
    		:checked-data="getTransferData().aChecked"
    		:title="getTransferData().title"
        :category="category"
        :nModuleIndex="nModuleIndex"
    		@hideModal="hidePopModal"
    	></v-trans>
    </div>
</template>

<script>
import 'assets/css/common.less'
// import $ from 'jquery'
import Transfer from 'components/config/newTrans.vue'

// 表格接口。
const TABLE_DATA_URL = window.HOST + '/api/v1/customized/items'

// 自定义项列表接口。
const MODULE_ITEM_URL = window.HOST + '/api/v1/customized/modules'
// const MODULE_ITEM_URL = "static/modules.json";

// 排序接口
const MODULE_ORDER = window.HOST + `/api/v1/customized/modules/update-order`

export default {
  name: 'newquery',
  components: {
    'v-trans': Transfer
  },
  data () {
    return {
      // 所有字段对应的数据。
      aoTable: [],
      // 自定义条件数据。
      category: [],
      // 临时保存自定义条件数据。
      categoryCopy: [],
      // 临时保存数据，
      oBefore: {
        stock: {
          bEdit: false,
          value: {},
          isEdit: false
        },
        trace_down: {
          // 追踪
          bEdit: false,
          value: {},
          isEdit: false
        },
        trace_up: {
          // 溯源
          bEdit: false,
          value: {},
          isEdit: false
        },
        resume: {
          bEdit: false,
          value: {},
          isEdit: false
        },
        suppress: {
          // 遏制
          bEdit: false,
          value: {},
          isEdit: false
        },
        link_repair: {
          // 链路修复
          bEdit: false,
          value: {},
          isEdit: false
        }
      },
      // 是否显示弹窗。
      showTransfer: false,
      isShow: null,
      // 当前编辑的模块。
      sCurrentModule: '',
      nModuleIndex: '',
      nItemIndex: '',
      // 错误提示信息
      sErrorMessage: '',
      // 是否可编辑
      editable: true,
      oldModuleOrderList: []
    }
  },
  created () {
    this.$store.commit({
      type: 'updateEdit',
      key: false
    })

    // 获取配置数据。
    this.$register.getVersion(this.$store, this.$ajax, this.fetchData)
  },
  computed: {
    // 是否编辑的状态。
    edit () {
      return this.$store.state.edit
    },
    ModuleOrderListEdit: {
      get () {
        return this.$store.state.ModuleOrderListEdit
      },
      set (isBoolean) {
        this.$store.commit({
          type: 'updateModuleOrderListEdit',
          key: isBoolean
        })
      }
    },
    moduleOrderList () {
      return this.getModuleOrderList()
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
  watch: {
    oBefore: {
      handler: 'changeState',
      deep: true
    }
  },
  mounted () {
    // 离开改页面处理(刷新、关闭页面等操作)
    let self = this
    window.onbeforeunload = () => {
      if (self.edit || this.ModuleOrderListEdit) {
        // 提示需要保存。
        return false
      }
    }
      // 监听拖动的组件
    this.$dragging.$on('dragged', ({ value }) => {})
    // 监听到拖动结束
    this.$dragging.$on('dragend', data => {})
  },
  methods: {
    // 是否显示item项。
    showItem (item) {
      let bShow = true

      switch (item.moduleCode) {
        // 遏制
        case 'suppress':
          bShow = this.supression
          break
        // 断链
        case 'link_repair':
          bShow = this.linkRepair
          break
        default:
          break
      }

      return bShow
    },
    // 获取数据。
    fetchData () {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        TABLE_DATA_URL,
        'get',
        null,
        oData => {
          // 成功后的回调函数。
          this.aoTable = oData
          // 调用接口数据。
          this.$nextTick(() => {
            this.$register.sendRequest(
              this.$store,
              this.$ajax,
              MODULE_ITEM_URL,
              'get',
              null,
              oResult => {
                oResult.sort((a, b) => a.moduleOrder > b.moduleOrder) // 排序
                oResult.forEach(el => {
                  // 模块是否可编辑
                  if (el.editable === 1) {
                    this.oBefore[el.moduleCode].isEdit = true
                  }
                })
                this.category = [].concat.call(oResult)
                this.categoryCopy = [].concat.call(oResult)
                this.oldModuleOrderList = this.getModuleOrderList()
              },
              sErrorMessage => {
                // 提示信息。
                this.showMessage(sErrorMessage)
              }
            )
          })
        },
        sErrorMessage => {
          // 提示信息。
          this.showMessage(sErrorMessage)
        }
      )
    },
    // 编辑状态。
    changeState (oldValue, newValue) {
      let isEdit = false
      for (let o in newValue) {
        if (newValue[o].bEdit) {
          isEdit = true
        }
      }
      this.$store.commit({
        type: 'updateEdit',
        key: isEdit
      })
    },
    // 提示信息。
    showMessage (sErrorMessage) {
      this.$message({
        message: sErrorMessage,
        duration: 3000
      })
    },
    // 表格数据处理。--- 获取表格中配置的条件的数据。
    getAllFilter () {
      let aData = []
      aData = this.aoTable.map(o => {
        return {
          key: o.itemCode,
          label: o.itemName
        }
      })
      if (this.getTransferData().title !== '物流码') {
        aData = aData.filter(e => e.key !== 'traceCode')
      }

      // 返回数据。
      return aData
    },
    // 表格数据处理，根据key值获取其名称。
    getNameByKeyParam (sKey) {
      let aFilterd = this.aoTable.filter(o => o.itemCode === sKey)

      if (aFilterd && aFilterd.length) {
        return aFilterd[0].itemName
      } else {
        return ''
      }
    },
    // 显示模块项的编辑模式。
    showEditState (sModule, nIndex) {
      // 设置模块为编辑模式，并保存当前模块中所有的筛选条件。
      this.oBefore[sModule].bEdit = true
      // 备份当前状态
      let oData = this.category[nIndex]
      this.oBefore[sModule].value = JSON.parse(JSON.stringify(oData))
    },
    // 取消模块项的编辑模式。
    hideEditState (sModule, nIndex) {
      // 设置模块为正常模式，重置当前模块中所有的筛选条件。
      this.oBefore[sModule].bEdit = false
      // 从保存的数据中恢复。
      let oData = this.oBefore[sModule].value
      this.$set(this.category, nIndex, oData)
    },
    // 保存当前模块的数据。
    async saveModuleValue (sModule, index) {
      // 参数。
      let oResult = this.category[index - 1]

      // 判断当前是否可以保存。
      if (!oResult.groups.length) {
        // 当前项为空，则提示。
        this.showMessage('模块下至少有一个条件组合')
      } else {
        this.save(oResult)
      }
    },
    // 某个module保存
    save (oQuery) {
      oQuery.groups.forEach((el, index) => {
        el.groupOrder = index + 1
      })
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        MODULE_ITEM_URL,
        'put',
        oQuery,
        () => {
          this.oBefore[oQuery.moduleCode].bEdit = false
          this.showMessage('保存成功')
        },
        sErrorMessage => {
          this.showMessage('保存失败')
          console.log(sErrorMessage)
        },
        err => {
          this.showMessage('保存失败')
          console.log(err)
        }
      )
    },
    // 获取transfer显示的值。
    getTransferData () {
      let oData = {
        // 标题：
        title: '',
        // 选中key值。
        aChecked: []
      }

      if (this.sCurrentModule && this.nItemIndex >= 0) {
        // 当前是编辑，模式。--- 获取所需的值。
        let oItem = this.category[this.nModuleIndex].groups[this.nItemIndex]
        oData = {
          title: oItem.groupName,
          aChecked: (function () {
            let aData = []
            oItem.groupItems.forEach(function (o) {
              aData.push(o.itemCode)
            })

            return aData
          })()
        }
      }
      // 返回数据。
      return oData
    },
    // 显示弹窗。
    showModal (sModule, nParentIndex, nIndex) {
      this.showTransfer = true
      // 如果nIndex不存在，则表示是增加显示，否则为修改。---- 获取数据。
      this.sCurrentModule = sModule
      this.nModuleIndex = nParentIndex
      this.nItemIndex = nIndex
    },
    // 隐藏弹窗。-- 返回的数据。
    hidePopModal (oResult) {
      // 弹窗隐藏。
      this.showTransfer = false // !this.showTransfer
      this.sCurrentModule = ''
      // debugger
      if (oResult) {
        // 存在数据， 则更新或，增加项。
        let oValue = {
          groupName: oResult.title,
          groupOrder: 0,
          editable: 1,
          groupItems: function () {
            let aValue = []
            aValue = oResult.aItem.map((o, index) => {
              let obj = this.aoTable.find(e => {
                return e.itemCode === o
              })
              return {
                itemCode: o,
                itemName: obj[1],
                itemOrder: index + 1,
                visible: 1
              }
            })
            return aValue
          }.bind(this)()
        }

        // 判断当前是增加还是更新。
        if (this.nItemIndex !== undefined) {
          // 修改。
          this.$set(
            this.category[this.nModuleIndex].groups,
            this.nItemIndex,
            oValue
          )
        } else {
          this.category[this.nModuleIndex].groups.push(oValue)
        }
      }
    },
    // 删除模块中的项。 参数为索引中。
    delItem (nParentIndex, nIndex) {
      // 显示数据删除。
      this.category[nParentIndex].groups.splice(nIndex, 1)
    },
    // 移动前项。
    changeOrder (sModule, nParentIndex, nPrev, nNext) {
      // 移动数据。
      let oPrev = this.category[nParentIndex].groups[nPrev]
      this.$set(
        this.category[nParentIndex].groups,
        nPrev,
        this.category[nParentIndex].groups[nNext]
      )
      this.$set(this.category[nParentIndex].groups, nNext, oPrev)
      // 这样互相交换，需鼠标移开才能看到效果。
      // [this.category[nParentIndex].groups[nPrev],this.category[nParentIndex].groups[nNext]] = [this.category[nParentIndex].groups[nNext],this.category[nParentIndex].groups[nPrev]]
      console.log(this.category[nParentIndex])
    },
    // 顺序改变保存
    async saveEditQueryState () {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        MODULE_ORDER,
        'post',
        this.moduleOrderList,
        oData => {
          this.$store.commit({
            type: 'updateModuleOrderListEdit',
            key: false
          })
          // 修改顺序。
          this.category.forEach(o => {
            o.moduleOrder = this.moduleOrderList.moduleOrderList.filter(
              om => om.moduleCode === o.moduleCode
            )[0].moduleOrder
          })
          this.categoryCopy = [].concat(this.category)
          this.$message({
            message: '保存成功',
            duration: 1000
          })
        },
        sErrorMessage => {
          this.category = [].concat(this.categoryCopy)
          this.$message({
            message: `保存失败，请重试`,
            duration: 1000
          })
        }
      )

      //    const stateChange = await this.sendResult().then(e => e.status);
      //    if (stateChange) {
      //      this.$store.commit({
      //        type: "updateModuleOrderListEdit",
      //        key: true
      //      });
      //      this.categoryCopy = [].concat(this.category);
      //      this.$message({
      //        message: stateChange,
      //        duration: 1000
      //      });
      //    } else {
      //      this.category = [].concat(this.categoryCopy);
      //      this.$message({
      //        message: `保存失败，请重试`,
      //        duration: 1000
      //      });
      //    }
    },
    // 发送改变顺序请求
    sendResult () {
      return new Promise((resolve, reject) => {
        this.$ajax
          .post(MODULE_ORDER, this.moduleOrderList)
          .then(e => {
            return resolve(e)
          })
          .catch(err => {
            return reject(err)
          })
      })
    },
    // 顺序改变取消
    hideEditQueryState (e) {
      this.category = [].concat(this.categoryCopy) // 从备份中还原
      this.setModuleOrderList(false) // 取消编辑状态
    },
    // 获取顺序
    getModuleOrderList () {
      let arr = []
      this.category.forEach((el, index) => {
        arr.push({
          moduleCode: `${el.moduleCode}`,
          moduleOrder: index + 1
        })
      })
      const obj = { moduleOrderList: arr }
      return obj
    },
    // 编辑顺序
    setModuleOrderList (isBoolean) {
      this.$store.commit({
        type: 'updateModuleOrderListEdit',
        key: isBoolean
      })
    }
  }
}
</script>

<style lang="less">
.content {
  overflow: auto;
}
.content-query {
  display: flex;
  flex-direction: column;
  position: relative;
  .query-lists-container {
    position: absolute;
    width: 240px;
    left: 50px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    z-index: 10;
    .list-edit {
      align-items: center;
      height: 50px;
      display: flex;
      .list-title {
        font-size: 14px;
        color: #333;
      }
      .el-switch {
        margin-left: 20px;
      }
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      background-color: #f5f8fa;
      align-items: center;
      height: 50px;
      border-bottom: 1px solid #ccc;
      & > span {
        margin-left: 20px;
        margin-right: 20px;
      }
      .list-title {
        font-size: 14px;
        color: #333;
      }
      .list-edit {
        display: flex;
        justify-content: space-between;
        min-width: 50px;
        & > .icon {
          color: #999;
          // &:nth-child(1) {
          // 	margin-right: 10px;
          // }
          // &:nth-child(2) {
          // 	margin-left: 10px;
          // }
          &:hover {
            color: #42af8f;
            cursor: pointer;
          }
        }
      }
    }
    .list-main {
      background-color: #fff;
      box-sizing: border-box;
      .list-message {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 30px;
        font-size: 12px;
        color: #999;
        margin: 0 20px;
      }
      .list-container {
        .query-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 32px;
          color: #333;
          font-size: 14px;
          padding: 0 20px;
          cursor: pointer;
          &:hover {
            box-shadow: 1px 1px 10px 1px #888888;
          }
        }
      }
    }
  }
  .no-border {
    border: none;
  }
  .query-lists {
    display: flex;
    flex-basis: 40px;
    margin-bottom: 20px;
    background: #e5e9f2;
    justify-content: center;
    // span {
    // 	display: flex;
    // 	flex-basis: 40px;
    // 	justify-content: center;
    .query-list {
      min-width: 120px;
      background-color: #d3dce6;
      text-align: center;
      box-sizing: border-box;
      padding: 10px;
      margin-left: 2px;
      margin-right: 2px;
    }
    // }
  }
  .query-items {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 30px 50px 20px 50px;
    overflow: auto;
    .query-item {
      width: 400px;
      border: 2px solid #b3b3b3;
      margin: 20px 0;

      .query-header {
        display: flex;
        justify-content: space-between;
        height: 40px;
        color: #ffffff;
        padding: 0 20px 0 20px;
        background: #b3b3b3;

        .header-title,
        .header-icon {
          line-height: 40px;
        }

        .header-icon {
          cursor: pointer;
          font-size: 20px;

          .icon {
            margin-right: 10px;
            vertical-align: middle;

            &:last-child {
              margin-right: 0;
            }
          }
        }
        .add-item {
          margin-top: 20px;
        }
      }
      .content-item {
        height: 500px;
        padding: 20px 10px 0px 10px;
        overflow: auto;

        .item-module {
          /*display: flex;
						justify-content: space-between;*/
          padding: 5px;
          margin-bottom: 10px;
          background: #e6e6e6;
          position: relative;
          overflow: hidden;

          .name-item,
          .name-icon {
            line-height: 36px;
          }

          .name-item {
            display: block;
            width: 100%;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .name-icon {
            position: absolute;
            right: 5px;
            /*top: 5px;*/
            line-height: 36px;
            cursor: pointer;
            bottom: -26px;
            opacity: 0;

            .icon {
              margin-right: 10px;

              &:last-child {
                margin-right: 0;
              }
            }

            &.item-show-transition {
              /*display: none;*/
              transition: all ease 0.8s;
              bottom: 0px;
              opacity: 1;
            }

            &.item-show-enter,
            &.item-show-leave {
              transition: all ease 0.8s;
              opacity: 0;
              bottom: -26px;
            }
          }

          .btn-item {
            margin-top: 8px;

            &.hide {
              display: none;
            }
            .edit-item {
              display: inline-block;
              margin-right: 5px;
            }
            .close-btn {
              display: inline-block;
              width: 20px;
              height: 20px;
              background: url("../../assets/img/img02.png") no-repeat;
              background-position: 0 -40px;
              cursor: pointer;
              &:hover {
                background-position: -20px -40px;
              }
            }
          }
        }
      }
      &:hover {
        border: 2px solid #42af8f;

        .query-header {
          background: #42af8f;
        }
        .item-module {
          background: #d9f0e9;
        }
      }
    }
  }
}
</style>
