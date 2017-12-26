<!--自定义字段名称脚本-->
<template>
    <div class="content-factory">
    	<div class="legend-list">
    		<span class="item-title">维度:</span>
    		<div class="item-legend" v-for="item in aoDimension" v-if="item.show">
    			<span :class="['item-block', `${item.value}`]"></span>
    			<span class="item-name">{{ item.name }}</span>
    		</div>
    	</div>
		<div 
		v-for="item in aoCustom"
		:key="item.id"
		class="item-wrap">
			<div 
			class="name" 
			:class="item.dimension"
			@mouseenter="showHandleIcons"
			@mouseleave="hideHandleIcons">
				{{item.name}}
				<div class="handle">
					<a :href="item.link" target="_blank"><i class="icon icon-24 icon-open" title="打开"></i></a>
					<i class="icon icon-24 icon-edit" title="编辑" @click="editItem(item)"></i>
					<i class="icon icon-24 icon-delete" title="删除" @click="deleteItem(item)"></i>
				</div>				
			</div>
		</div>
		<div class="item-wrap">
			<img :src="icon" alt="增加模块" @click="newLink" style="cursor:pointer;" title="新增模块"/>
		</div>
		<div v-if="dialogVisible">
		<el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false">
			<el-form :model="oCurrentData" label-width="80px" :rules="rules" ref="ruleForm">
				<el-form-item label="名称" prop="name">
					<el-input 
					v-model="oCurrentData.name" 
					auto-complete="off" 
					:maxlength="10" 
					style="width:80%;"></el-input>
					还可输入<span class="highlight">{{10-(oCurrentData.name && oCurrentData.name.length)||0}}</span>个字
				</el-form-item>
				<el-form-item label="链接" prop="link">
					<el-input 
					v-model="oCurrentData.link" 
					auto-complete="off" 
					placeholder="请输入跳转链接。例：http://127.0.0.1:8010/config.html或config.html"
					style="width:95%;"></el-input>
				</el-form-item>
				<el-form-item label="设备" prop="equipmentIds">
					<el-select 
					v-model="oCurrentData.equipmentIds" 
					multiple 
					filterable 
    				clearable
					placeholder="请选择设备"
					style="width:95%;">
						<el-option
							v-for="item in aoEquipment"
							:key="item.equipmentId"
							:label="`${item.equipmentId}:${item.equipmentName}`"
							:value="`${item.equipmentId}:${item.equipmentName}`">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="维度" prop="dimension">
					<el-radio-group v-model="oCurrentData.dimension">
						<el-radio 
						v-for="oDimension in aoDimension" 
						v-if="oDimension.show"
						:label="oDimension.value" 
						:key="oDimension.value">{{oDimension.name}}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="参数" prop="parameters">
					<el-checkbox-group v-model="oCurrentData.parameters">
						<el-checkbox 
						v-for="oParameter in aoParameter" 
						:label="oParameter.value" 
						:key="oParameter.value">{{oParameter.name}}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="submit">确 定</el-button>
			</div>
		</el-dialog>	
		</div>
	
    </div>
</template>

<script>
	import $ from "jquery"
	// 链接模块数据接口。
	const MODULE_DATA_URL= HOST + '/api/v1/customized/equipment-analysis/items'
	// 模块添加。
	const MODULE_ADD_DATA_URL = HOST + '/api/v1/customized/equipment-analysis/items'
	// 模块修改。
	const MODULE_EDIT_DATA_URL = HOST + '/api/v1/customized/equipment-analysis/items/'
	// 模块删除。
	const MODULE_DELETE_DATA_URL = HOST + '/api/v1/customized/equipment-analysis/items/'
	// 设备数据。
	const EQUIPMENT_DATA_URL = HOST + "/api/v1/basicinfo/equipmentIds"

	const EXAMPLE_DATA = [{
		id: 1,
		name: "FGB",
		dimension: "quality",
		equipmentIds: [1],
		link: "https://www.baidu.com/",
		parameters: ["equipmentId"]
	}, {
		id: 2,
		name: "工艺参数",
		dimension: "parameter",
		equipmentIds: [2],
		link: "https://cn.bing.com/",
		parameters: []
	}]

	const EQUIPMENT_DATA = [{
		equipmentId: 1,
		equipmentName: "设备1"
	}, {
		equipmentId: 2,
		equipmentName: "设备2"
	}]

	const oNewModule = {
		name: "",
		link: "",
		dimension: "",
		// 设备id。
		equipmentIds: [],
		// 参数。
		parameters: []
	}

	import icon from "assets/img/icon-add.png"

    export default{
	    data() {
	        return {
				icon,
				// 工厂定制数据。
				aoCustom: [],
				// 当前打开的配置数据或新建链接数据。
				oCurrentData: {
					name: "",
					link: "",
					dimension: "",
					// 设备id。
					equipmentIds: [],
					// 参数。
					parameters: []
				},
				// 原数据。
				oBefore: {
					name: "",
					link: "",
					dimension: "",
					// 设备id。
					equipmentIds: [],
					// 参数。
					parameters: []
				},
				// 弹窗名称。
				dialogTitle: "",
				// 弹窗可见性。
				dialogVisible: false,
	            // 提示信息。
				sErrorMessage: "",
				// 设备。
				aoEquipment: [],
				// 维度。
//				aoDimension: [],
				// 参数。
				aoParameter: [{
					name: "设备id(equipmentId)",
					value: "equipmentId"
				}, {
					name: "设备名称(equipmentName)",
					value: "equipmentName"
				}, {
					name: "开始时间(startTime)",
					value: "startTime"
				}, {
					name: "结束时间(endTime)",
					value: "endTime"
				}, {
					name: "工序编码(processCode)",
					value: "processCode"
				}],
				rules: {
					name: [
						{ required: true, message: '请输入模块名称', trigger: 'blur' }
					],
					link: [
						{ required: true, message: '请输入链接地址', trigger: 'blur' }
					],
					equipmentIds: [
						{ type: 'array', required: true, message: '请选择设备', trigger: 'change' }
					],
					dimension: [
						{ required: true, message: '请选择维度', trigger: 'change' }
					],
					parameters: [
						{ required: false }
					]
				}
	        }
	    },
        created() {
			// 获取设备数据。 
			this.$register.sendRequest(this.$store, this.$ajax, EQUIPMENT_DATA_URL, "get", null, (oData) => {
				this.aoEquipment = JSON.parse(JSON.stringify(oData.equipmentIdInfoList))
			}, (sErrorMessage)=>{
				this.sErrorMessage = sErrorMessage;
				this.showMessage();          
			})
			
			//获取模块数据 MODULE_DATA_URL	
			this.$register.sendRequest(this.$store, this.$ajax, MODULE_DATA_URL, "get", null, (oData) => {
				// 保存工厂定制数据。
				this.aoCustom = JSON.parse(JSON.stringify(oData.factoryCustomItemList))
			}, (sErrorMessage)=>{
				this.sErrorMessage = sErrorMessage;
				this.showMessage();          
			})
			
        },
        computed: {
        	// 是否支持工具。
		    toolManagement() {
		      return this.$store.state.versionModule && this.$store.state.versionModule.toolManagement
		    },
		    // 是否支持工艺。
		    processParameter() {
		      return this.$store.state.versionModule && this.$store.state.versionModule.processParameter
		    },
		    // 是否支持维护
		    equipmentMaintenance() {
		    	return this.$store.state.versionModule && this.$store.state.versionModule.equipmentMaintenance
		    },
		    // 维度信息。
		    aoDimension() {
		    	return [{
					name: "质量",
					value: "quality",
					show: true
				}, {
					name: "投产",
					value: "pool",
					show: true
				}, {
					name: "工单",
					value: "work",
					show: true
				}, {
					name: "事件",
					value: "event",
					show: true
				}, {
					name: "工具",
					value: "tool",
					show: this.toolManagement
				}, {
					name: "维护",
					value: "repair",
					show: this.equipmentMaintenance
				}, {
					name: "工艺",
					value: "parameter",
					show: this.processParameter
				}] 
		    }
	    },
	    mounted() {
          // 离开该页面处理
          	let self = this
          	window.onbeforeunload = () => {
          		if(self.edit) {
          			// 提示需要保存。
          			return false
          		}
          	}
        },
        watch: {
        },
        methods: {
			// 显示操作按钮。
			showHandleIcons(event) {
				$(event.target).removeClass("out").addClass("in")
			},
			// 隐藏操作按钮。
			hideHandleIcons(event) {
				$(event.target).removeClass("in").addClass("out")
			},
        	// 显示提示信息。
        	showMessage(sError) {
        		this.$message({
        			message: sError || this.sErrorMessage,
        			duration: 3000
        		});
			},
			// 添加链接。
			newLink() {
				// 打开弹窗。
				this.dialogVisible = true
				this.dialogTitle = "新建链接"
				this.oCurrentData = JSON.parse(JSON.stringify(oNewModule))
			},
			// 保存数据。
			submit() {
				// 关闭弹窗。
				
				console.log(this.oCurrentData)

				this.$refs.ruleForm.validate((valid) => {
					if (valid) {
						// 验证成功。
						this.dialogVisible = false

						if(this.oCurrentData.id) {
							let bEqual = true
							for(let p in this.oBefore) {
								if(this.oBefore[p] instanceof Array) {
									if(this.oBefore[p].length !== this.oCurrentData[p].length) {
										bEqual = false
										break
									}else {
										this.oBefore[p] = this.oBefore[p].sort()
										this.oCurrentData[p] = this.oCurrentData[p].sort()

										if(this.oBefore[p].some((value,index) => this.oCurrentData[p][index] !== value)) {
											bEqual = false
											break
										}
									}
								}else {
									if(this.oBefore[p] != this.oCurrentData[p]) {
										bEqual = false
										break
									}
								}
							}
							
							if(!bEqual) {
								// 修改配置。
								this.saveModule()
							}
							
						}else {
							// 新增链接。
							this.addModule()
						}
					}
				});
				
			},
			// 修改模块。
			editItem(item) {
				this.dialogVisible = true
				this.dialogTitle = "编辑模块"
				this.oCurrentData = $.extend(true, {}, item)
				this.oBefore = $.extend(true, {}, item)
			},
			// 删除模块。
			deleteItem(item) {
				this.oCurrentData = $.extend(true, {}, item)

				this.$confirm('确定删除该链接模块?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.deleteModule()
				})
			},
			// 新增模块。
			addModule() {
				this.$register.sendRequest(this.$store, this.$ajax, MODULE_ADD_DATA_URL, "post", this.oCurrentData, (oData) => {
					// 回传模块id。
					this.oCurrentData.id = oData.id
					// 新增模块。
					this.aoCustom.push(this.oCurrentData)
					this.showMessage("新增成功。")
				}, (sErrorMessage)=>{
					this.sErrorMessage = sErrorMessage
					this.showMessage("新增失败。")         
				})				
			},
			// 保存配置。
			saveModule() {
				this.$register.sendRequest(this.$store, this.$ajax, MODULE_EDIT_DATA_URL + this.oCurrentData.id, "put", this.oCurrentData, (oData) => {
					this.showMessage("修改成功。")
					// 修改数据
					this.aoCustom = this.aoCustom.map( o => {
						return o.id == this.oCurrentData.id ? this.oCurrentData : o
					})
				}, (sErrorMessage)=>{
					this.sErrorMessage = sErrorMessage
					this.showMessage("新增失败。")          
				})				
			},
			// 删除配置。
			deleteModule() {
				this.$register.sendRequest(this.$store, this.$ajax, MODULE_DELETE_DATA_URL + this.oCurrentData.id, "delete", null, (oData) => {
					this.showMessage("删除成功。")
					this.aoCustom = this.aoCustom.filter(o => o.id !== this.oCurrentData.id)
				}, (sErrorMessage)=>{
					this.sErrorMessage = sErrorMessage
					this.showMessage("删除失败。")          
				})				
			}
        }
    };
</script>

<style lang="less">
	// 引用基础定义。
    @import "../../assets/css/base.less";

	.dimension-color(@color) {
        background-color: @color
    }
	.content-factory {
		padding: 10px;
		/*display: table;*/
		
		.legend-list {
			padding: 10px 0 0 20px;
			
			.item-title {
				display: inline-block;
				vertical-align: middle;
				font-size: 12px;
			}
			.item-legend {
				
				text-align: center;
				vertical-align: middle;
				display: inline-block;
				padding: 0 10px;
				
				.item-block {
					display: inline-block;
					width: 20px;
					height: 10px;
					
					&.quality {
						.dimension-color(@quality)
					}
					&.pool {
						.dimension-color(@pool)
					}
					&.work {
						.dimension-color(@work)
					}
					&.event {
						.dimension-color(@event)
					}
					&.repair {
						.dimension-color(@repair)
					}
					&.tool {
						.dimension-color(@tool)
					}
					&.parameter {
						.dimension-color(@parameter)
					}
				}
				
				.item-name {
					font-size: 12px;
				}
			}
			
		}
	    .item-wrap {

			// line-height: 80px;
			text-align: center;
			vertical-align: middle;

			/*display: table-cell;*/
			display: inline-block;
			padding: 20px;
			width: 180px;
			height: 80px;				

			.name {
				width: 180px;
				height: 80px;	
				line-height: 80px;
				color: #fff;
				font-weight: bold;
				position: relative;
				overflow: hidden;

				&.quality {
					.dimension-color(@quality)
				}
				&.pool {
					.dimension-color(@pool)
				}
				&.work {
					.dimension-color(@work)
				}
				&.event {
					.dimension-color(@event)
				}
				&.repair {
					.dimension-color(@repair)
				}
				&.tool {
					.dimension-color(@tool)
				}
				&.parameter {
					.dimension-color(@parameter)
				}				
			}

			.handle {
				
				width: 180px;
				height: 80px;	
				line-height: 80px;
				.dimension-color(@green);		
				position: absolute;
				top: 80px;
				left: 0;

				.icon {
					cursor: pointer;
					margin: 10px;
				}
			}
		}

		.highlight {
			color: #42af8f;
			font-weight: bold;
		}

		.el-dialog__body {
			padding-bottom: 0;
		}

		.el-checkbox {
			width: 210px;
			&+.el-checkbox {
				margin-left: 0;
			}
		}

		.el-checkbox-group {
			white-space: normal;
		}

		.dialog-footer {
			text-align: center;

			.el-button {
				border-radius: 0;
				padding: 8px 15px;
			}
		}
	}

	@keyframes fadeIn {
		from {	
			top: 80px;
		}
		to {
			top: 0;
		}
	}

	@keyframes fadeOut {
		from {	
			top: 0;
		}
		to {
			top: 80px;
		}
	}

	.name.in .handle{
		animation-duration: 0.5s;
		animation-name: fadeIn;
		animation-fill-mode: forwards;
	}
	.name.out .handle{
		animation-duration: 0.5s;
		animation-name: fadeOut;
		animation-fill-mode: forwards;
	}
</style>