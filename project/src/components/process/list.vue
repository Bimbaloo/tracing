<!--设备列表-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">
            	工序&nbsp;—&nbsp;{{node.name}}
            </h2>
			<div class="content-panel" v-if="equipments.length">
				<!--设备-->
				<div class="equipment-list" @click.self="checkboxIf=false">
					<!--div class="btn-group">				
						<el-button :class="[{ actived: `${checkedEquipments.indexOf(info.equipmentId)>-1}`}, 'btn', 'btn-plain']" v-for="info in equipments" :key="info.equipmentId">{{info.equipmentName}}</el-button>
					</div-->				
					<el-checkbox-group v-model="checkedEquipments" class="btn-group" @change="handleCheckedEquipmentsChange" @click.self="checkboxIf=false">
						<el-checkbox-button v-for="info in equipments" :label="info.equipmentId" :key="info.equipmentId">{{info.equipmentName}}</el-checkbox-button>
					</el-checkbox-group>
					<div class="select">
						<el-button class="btn btn-plain" @click="checkboxIf=!checkboxIf">更多</el-button>
					</div>	
					<!--设备多选列表-->
					<div class="equipment-checkbox" v-if="checkboxIf">
						<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
						<el-checkbox-group v-model="checkedEquipments" @change="handleCheckedEquipmentsChange">
							<el-checkbox v-for="info in equipments" :label="info.equipmentId" :key="info.equipmentId">{{info.equipmentName}}</el-checkbox>
						</el-checkbox-group>
					</div>									
				</div>
				<!-- 分析维度-->
				<div class="dimension" @click.self="dimensionClick">
					<el-radio-group v-model="slectedDimension" class="btn-group">
						<el-radio-button v-for="obj in dimension" :key="obj.type" :label="obj.type" :class="obj.key">{{obj.name}}</el-radio-button>
					</el-radio-group>
					<!--el-button class="btn btn-plain" v-for="name in dimension" :key="name">{{name}}</el-button-->
					<el-button :class="[{ 'nobtn': btnShow }, 'btn' , 'btn-plain' , 'parameter']" @click="parameterClick">工艺</el-button>
				</div>
			</div>			
			<v-equipment v-if="bShowEq" 
				:equipments="equipments" 
				:checked-equipments="checkedEquipments" 
				:dimension-data="slectedDimension" 
				:process="node.process" 
				:datetime="datetime">
			</v-equipment>
			<div v-else class="empty">{{empty}}</div>
		</div>
		
    </div>      
</template>

<script>
import equipment from 'components/equipment/list'

export default {
  components: {
    'v-equipment': equipment
  },
  data () {
    return {
      btnShow: true, // 用与判断'工艺'按钮是否禁用
      styleObject: {
        'min-width': '1000px'
      },
      // 点击的工序节点信息。
      node: {},
      dimension: [
        {
          name: '质量',
          type: '3',
          key: 'quality'
        },
        {
          name: '加工',
          type: '2',
          key: 'work'
        },
        {
          name: '事件',
          type: '4',
          key: 'event'
        },
        {
          name: '维护',
          type: '5',
          key: 'repair'
        },
        {
          name: '工具',
          type: '6',
          key: 'tool'
        }
      ],
      checkboxIf: false,
      checkAll: true,

      equipments: [],
      checkedEquipments: [],
      // 视窗时间，默认为30分钟。
      // windowTime: {
      // interval: 30,
      // start: "",
      // end: "",
      // min: 1,
      // max: 30,
      // left: 0
      // },
      datetime: {},
      slectedDimension: '',
      isIndeterminate: false,
      empty: '暂无数据。'
    }
  },
  computed: {
    rawData () {
      return this.$store.state.rawData
    },
    processKey () {
      return (this.$route.query && this.$route.query.key) || ''
    },
    bShowEq () {
      return (
        this.equipments.length &&
        this.equipments.some(o => o.shiftStartTime && o.shiftEndTime)
      )
    }
  },
  created () {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    this.setEquipmentList()
    this.setDateTime()
  },
  mounted () {},
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: 'setEquipmentList'
    // checkedEquipments: 'setDateTime'
  },
  methods: {
    setDateTime () {
      let start = ''
      let end = ''
      this.checkedEquipments.forEach((id, index) => {
        let equipment = this.equipments.filter(o => o.equipmentId === id)[0]
        if (equipment) {
          let sTemp = equipment.shiftStartTime
          let eTemp = equipment.shiftEndTime
          if (!index) {
            start = sTemp
            end = eTemp
          } else {
            if (start > sTemp) {
              start = sTemp
            }
            if (end < eTemp) {
              end = eTemp
            }
          }
        }
      })

      this.datetime = {
        start: start,
        initStart: start,
        end: end,
        initEnd: end
      }
    },
    // 单选按钮点击事件。
    dimensionClick (event) {
      this.slectedDimension = ''
    },
    /**
     * 设置设备列表。
     * @return {void}
     */
    setEquipmentList () {
      this.slectedDimension = '' // 路由变化时，选择状态清空
      this.equipments = []

      // let aoData = this.rawData
      let oNode = null
      // 提取选中的工序节点数据。
      let aoFilter = this.rawData.filter(o => o.key === this.processKey)
      if (aoFilter.length) {
        oNode = aoFilter[0]
      } else {
        // 节点在子工序中。
        this.rawData.map(o => {
          if (o.subProcess) {
            let aoNode = o.subProcess.filter(
              item => item.key === this.processKey
            )
            if (aoNode.length) {
              oNode = aoNode[0]
            }
          }
        })
      }

      this.node = oNode || {}
      this.checkedEquipments = []

      let oEquipments = {}
      this.node.processInfoList &&
        this.node.processInfoList.forEach(o => {
          if (!oEquipments[o.equipmentId]) {
            oEquipments[o.equipmentId] = []
          }
          oEquipments[o.equipmentId].push(o)
        })

      for (let p in oEquipments) {
        let sStart = ''
        let sEnd = ''

        oEquipments[p].sort((a, b) => a.shiftStartTime > b.shiftStartTime)
        // 最早班次开始时间。
        sStart = oEquipments[p][0].shiftStartTime
        oEquipments[p].sort((a, b) => a.shiftEndTime < b.shiftEndTime)
        // 最晚班次结束时间。
        sEnd = oEquipments[p][0].shiftEndTime

        this.equipments.push({
          equipmentId: oEquipments[p][0].equipmentId,
          equipmentName: oEquipments[p][0].equipmentName,
          shiftStartTime: sStart,
          shiftEndTime: sEnd
        })
      }

      this.equipments.forEach(o => this.checkedEquipments.push(o.equipmentId))
    },
    handleCheckAllChange (event) {
      this.checkedEquipments = []
      if (event.target.checked) {
        this.equipments.forEach(o =>
          this.checkedEquipments.push(o.equipmentId)
        )
      }

      this.isIndeterminate = false
    },
    handleCheckedEquipmentsChange (value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.equipments.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.equipments.length
    },
    // 工艺参数点击事件。
    parameterClick () {}
  }
}
</script>

<style lang="less">
@import "../../assets/css/base.less";

.border-color(@style) {
  border-color: @style;
  border-left-color: @style;
}
.button-color(@color) {
  &.is-active {
    .el-radio-button__inner {
      color: #fff;
      background-color: @color;
    }
  }

  .el-radio-button__inner {
    .border-color(@color);
  }

  &:hover,
  &:focus {
    .el-radio-button__inner {
      color: #fff;
      background-color: @color;
      .border-color(@color);
    }
  }
}
.material-stock {
  .el-radio-button:first-child .el-radio-button__inner {
    border-left: 2px solid rgb(191, 217, 212);
    border-radius: 0;
    box-shadow: none;
  }
  .el-checkbox-button__inner,
  .el-radio-button__inner {
    padding: 6px 8px;
    border-radius: 0;
    border-color: #42af8f;
    border-width: 2px;
    border-left: 2px solid #42af8f;
  }
  .content-panel {
    border: 1px solid #ccc;
    // padding: 10px;
    display: flex;
    box-sizing: border-box;
    width: 100%;
    text-align: center;
    vertical-align: middle;

    .btn {
      width: auto;
      padding: 0 10px;
    }
    .parameter {
      border-color: #ff9900;
      display: inline-block;
      vertical-align: middle;
      margin-bottom: 0;

      &:hover {
        background-color: #ff9900;
      }
      &:focus {
        color: #fff; //#1f3d37;
        background-color: #ff9900;
      }
    }

    .equipment-list,
    .dimension {
      flex: 1 1;
      // display: table-cell;
      width: 50%;
      padding: 20px;
      box-sizing: border-box;
      white-space: nowrap;

      .nobtn {
        background: rgb(204, 204, 204);
        border: none;
        color: #fff; // cursor: no-drop;
        cursor: auto;
      }

      .btn-group {
        // flex: 1 0;
        white-space: nowrap;
        overflow: hidden;
        display: inline-block;
        vertical-align: middle;

        label {
          margin-right: 20px;
        }
        /* 临时屏蔽该按钮 。只是维度屏蔽*/
        // label.el-radio-button:nth-child(3) {
        // 	span {
        // 		background: rgb(204,204,204);
        // 		color: #fff;
        // 		cursor:default;
        // 		border: 2px solid #ccc
        // 	}
        // }
        // label.el-radio-button:nth-child(4) {
        // 	span {
        // 		background: rgb(204,204,204);
        // 		color: #fff;
        // 		cursor:default;
        // 		border: 2px solid #ccc
        // 	}
        // }
        // label.el-radio-button:nth-child(5) {
        // 	span {
        // 		background: rgb(204,204,204);
        // 		color: #fff;
        // 		cursor:default;
        // 		border: 2px solid #ccc
        // 	}
        // }
        .el-radio-button:last-child .el-radio-button__inner,
        .el-checkbox-button:last-child .el-checkbox-button__inner {
          border-radius: 0;
        }
      }
    }

    .dimension {
      .quality {
        .button-color(@quality);
      }
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        box-shadow: none;
      }
      .work {
        .button-color(@work);
      }
      .event {
        .button-color(@event);
      }
      .repair {
        .button-color(@repair);
      }
      .tool {
        .button-color(@tool);
      }
    }

    .equipment-list {
      text-align: left;
      border-right: 1px dashed #ccc;
      position: relative;
      display: flex;

      .el-checkbox-button:first-child .el-checkbox-button__inner {
        border-left-color: #42af8f;
      }
      .select {
        flex: 0 50px;
        padding: 3px 0px 3px 10px;

        .btn {
          border: 1px solid #ccc;
          color: #999;
          font-size: 12px;
          height: 24px;
          padding: 0 10px;

          &:hover {
            border-color: #42af8f;
            color: #42af8f;
            background-color: #fff;
          }
        }
      }
    }

    .equipment-checkbox {
      position: absolute;
      top: 71px;
      left: 0;
      width: 100%;
      border: 1px solid #42af8f;
      box-sizing: border-box;
      white-space: normal;
      padding-bottom: 10px;
      background-color: #fff;
      z-index: 10;

      .el-checkbox {
        margin: 10px 20px 0;
      }
    }
  }
}
</style>
