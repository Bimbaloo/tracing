<!--设备列表-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">
            	工序&nbsp;—&nbsp;{{node.name}}
            </h2>
			<div class="content-panel">
				<!--设备-->
				<div class="equipment-list">
					<!--div class="btn-group">				
						<el-button :class="[{ actived: `${checkedEquipments.indexOf(info.equipmentId)>-1}`}, 'btn', 'btn-plain']" v-for="info in equipments" :key="info.equipmentId">{{info.equipmentName}}</el-button>
					</div-->				
					<el-checkbox-group v-model="checkedEquipments" class="btn-group" @change="handleCheckedEquipmentsChange">
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
				<div class="dimension">
					<el-radio-group v-model="slectedDimension" class="btn-group" >
						<el-radio-button v-for="name in dimension" :key="name" :label="name"></el-radio-button>
					</el-radio-group>
					<!--el-button class="btn btn-plain" v-for="name in dimension" :key="name">{{name}}</el-button-->
					<el-button class="btn btn-plain parameter" @click="parameterClick">工艺参数</el-button>
				</div>
			</div>
            <div v-if="error" class="error">
                {{ error }}
            </div>
            <div v-else class="content-list" v-loading.body="loading">
				<div class="handle">
					<label>视窗时间：</label><el-input v-model="windowTime" class="time"></el-input><label>小时</label>
					<div class="legend">
						<span v-for="state in states" :key="state.key" style="{background-color: state.color}">{{state.name}}</span>
					</div>
				</div>
				<div class="analysis"></div>
				<div class="timeline"></div>
			</div>
        </div>
    </div>      
</template>

<script>

    export default {
        data () {
            return {
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1000px"
                },
                url: "/process/detail",
                // 点击的工序节点信息。
                node: {},
				dimension: ["质量", "事件", "维护", "工具", "加工"],
                loading: false,
                error: null,
				checkboxIf: false,
				checkAll: true,
				checkedEquipments: [],
				equipments: [],
				isIndeterminate: false,
				slectedDimension: "",
				// 视窗时间，默认为2小时。
				windowTime: 2,
				// 设备状态。
				states: [{
					key: "run",
					name: "加工",
					color: "#72b733"
				},{
					key: "stop",
					name: "停机",
					color: "#fac41b"
				},{
					key: "debug",
					name: "调试",
					color: "#009aff"
				},{
					key: "close",
					name: "关机",
					color: "#cccccc"
				}]
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		   }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
			this.setEquipmentList();
            this.fetchData();
        },
        mounted () {

        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            // '$route': 'fetchData'
        },
        methods: {
			/**
			 * 设置设备列表。
			 * @return {void}
			 */
			setEquipmentList () {
				let sKey = this.$route.query && this.$route.query.key,
				// 提取选中的工序节点数据。
					oNode = this.rawData.filter(o => o.key == sKey)[0] || {};

				this.node = oNode;	
				// this.node.outputInfo && this.node.outputInfo.map(o => o.actived = true);	
				this.equipments = this.node.outputInfo;
				this.equipments.forEach(o => this.checkedEquipments.push(o.equipmentId));
			},
			/**
			 * 获取数据。
			 * @return {void}
			 */
            fetchData () {
       
                this.error = null;
                this.loading = true;
				this.loading = false;
//              this.$get(this.url, {
//              	materialCode: this.node.materialCode,
//              	batchNo: this.node.batchNo,
//              	barcode: this.node.barcode
//              })
//              .then((res) => {
//                  this.loading = false;
//                  if(!res.errorCode) {
//                      oData.data = this.formatData(res.data);
//                      this.styleObject.minWidth = "1200px";
//                  }
//              })
//              .catch((err) => {
//                  this.loading = false;
//                  this.error = "查询出错。"
//                  this.styleObject.minWidth = 0;          
//              })
           	},
		   	handleCheckAllChange(event) {
				this.checkedEquipments = [];
				if(event.target.checked) {
					this.equipments.forEach(o => this.checkedEquipments.push(o.equipmentId));
				}
				
				this.isIndeterminate = false;
			},
			handleCheckedEquipmentsChange(value) {
				let checkedCount = value.length;
				this.checkAll = checkedCount === this.equipments.length;
				this.isIndeterminate = checkedCount > 0 && checkedCount < this.equipments.length;
			},
			// 工艺参数点击事件。
			parameterClick() {

			}
        }
    }  
</script>

<style lang="less">    
	.material-stock  {	
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
				&:hover {
					background-color: #ff9900;
				}
			}

			.equipment-list, .dimension {
				flex: 1 1;
				// display: table-cell;
				width: 50%;		
				padding: 20px;
				box-sizing: border-box;
				white-space: nowrap;

				.btn-group {
					flex: 1 0;
					white-space: nowrap;
					overflow: hidden;
					label {
						margin-right: 20px;						
					}
					.el-checkbox-button__inner, .el-radio-button__inner {
						padding: 6px 8px;
						border-radius: 0;
						border-color: #42af8f;
						border-width: 2px;
						border-left: 2px solid #42af8f;
					}
					 
				}
			}

			.equipment-list {
				text-align: left;
				border-right: 1px dashed #ccc;
				position: relative;
				display: flex;

				.select {
					flex: 0 50px;
					padding: 3px 0px 3px 10px;

					.btn {
						border: 1px solid #ccc;
						color: #999;
						font-size: 12px;
						height: 24px;
						padding: 0 10px;

						&:hover{
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

				.el-checkbox {
					margin: 10px 20px 0;
				}

			}	 
		}    
   	
    	.content-list {
			padding-top: 30px;
			.handle {
				.time {
					width: auto;
				}
				input {
					width: 60px;
					height: 30px;
					text-align: center;
					border-radius: 0;
				}
			}
			.legend {
				span {
					display: inline-block;
					width: 60px;
					height: 30px;
					line-height: 30px;
					text-align: center;
					color: #fff;
					margin-right: 20px;
				}
			}
    	}
    }
</style>
