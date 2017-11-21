<!--自定义字段名称脚本-->
<template>
    <div class="content-factory">
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
					<a href="item.link"><i class="icon icon-24 icon-open" title="打开"></i></a>
					<i class="icon icon-24 icon-edit" title="编辑"></i>
					<i class="icon icon-24 icon-delete" title="删除"></i>
				</div>				
			</div>
		</div>
		<div class="item-wrap">
			<img :src="icon" alt="增加模块" @click="newLink" style="cursor:pointer;" title="新增模块"/>
		</div>
		<el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
			<el-form :model="oCurrentData" label-width="80px">
				<el-form-item label="名称">
					<el-input 
					v-model="oCurrentData.name" 
					auto-complete="off" 
					:maxlength="10" 
					style="width:80%;"></el-input>
					还可输入<span class="highlight">{{10-(oCurrentData.name && oCurrentData.name.length)||0}}</span>个字
				</el-form-item>
				<el-form-item label="链接">
					<el-input 
					v-model="oCurrentData.link" 
					auto-complete="off" 
					placeholder="请输入跳转链接。例：http:127.0.0.1:8010/config.html或config.html"
					style="width:95%;"></el-input>
				</el-form-item>
				<el-form-item label="设备">
					<el-select 
					v-model="oCurrentData.equipmentIds" 
					multiple 
					placeholder="请选择设备"
					 style="width:95%;">
						<el-option
						v-for="item in aoEquipment"
						:key="item.equipmentId"
						:label="item.equipmentName"
						:value="item.equipmentId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="参数">
					<el-checkbox-group v-model="oCurrentData.parameters">
						<el-checkbox 
						v-for="oParameter in aoParameter" 
						:label="oParameter.value" 
						name="type" 
						:key="oParameter.value">{{oParameter.name}}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
			</div>
		</el-dialog>		
    </div>
</template>

<script>
	import $ from "jquery"
	//表格数据接口http://192.168.20.176:8080
	const TABLE_DATA_URL= HOST + "/api/v1/customized/items"
	const EQUIPMENT_DATA_URL = HOST + + "/api/v1/basicinfo/equipments"

	const EXAMPLE_DATA = [{
		id: 1,
		name: "FGB",
		dimension: "quality",
		link: "https://www.baidu.com/"
	}, {
		id: 2,
		name: "工艺参数",
		dimension: "parameter",
		link: "https://cn.bing.com/"
	}]

	const oNewModule = {
		title: "",
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
				oCurrentData: {},
				// 编辑前的数据。
				oBefore: {},
				// 弹窗名称。
				dialogTitle: "",
				// 弹窗可见性。
				dialogVisible: false,
	            // 提示信息。
				sErrorMessage: "",
				// 设备。
				aoEquipment: [{
					equipmentId: 1,
					equipmentName: "设备1"
				}, {
					equipmentId: 2,
					equipmentName: "设备2"
				}],
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
				}]
	        }
	    },
        created() {
        	this.$store.commit({
				type: "updateEdit",
				key: false
			});
			
			// 获取设备数据。 
			this.$register.sendRequest(this.$store, this.$ajax, EQUIPMENT_DATA_URL, "get", null, (oData) => {
				// 保存工厂定制数据。
				debugger
				this.aoEquipment = JSON.parse(JSON.stringify(oData))
			}, (sErrorMessage)=>{
				this.sErrorMessage = sErrorMessage;
				this.showMessage();          
			})
			
			//获取字段接口数据 TABLE_DATA_URL	
			// this.$register.sendRequest(this.$store, this.$ajax, TABLE_DATA_URL, "get", null, (oData) => {
				// 保存工厂定制数据。
				this.aoCustom = JSON.parse(JSON.stringify(EXAMPLE_DATA))
			// }, (sErrorMessage)=>{
			// 	this.sErrorMessage = sErrorMessage;
			// 	this.showMessage();          
			// })
			
        },
        computed: {
	        // 是否编辑的状态。
	        edit () {
	          return this.$store.state.edit
	        }
	    },
	    mounted() {
          // 离开改页面处理
          	let self = this
          	window.onbeforeunload = () => {
          		if(self.edit) {
          			// 提示需要保存。
          			return false
          		}
          	}
        },
        watch: {
          	oBefore: {
            	handler: "changeState",
            	deep: true
          	}
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
        	showMessage() {
        		this.$message({
        			message: this.sErrorMessage,
        			duration: 3000
        		});
			},
			// 添加链接。
			newLink() {
				// 打开弹窗。
				this.dialogVisible = true
				this.dialogTitle = "新建链接"
				this.oCurrentData = JSON.parse(JSON.stringify(oNewModule))
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
		display: table;
		
	    .item-wrap {

			// line-height: 80px;
			text-align: center;
			vertical-align: middle;

			display: table-cell;
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