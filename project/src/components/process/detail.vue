<!--设备详情-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">
            	{{node.equipmentName}}时间轴分析
            </h2>
			<div class="content-panel">
				<!-- 分析维度-->
				<div class="dimension">
                	<el-checkbox-group v-model="selectedDimension" class="btn-group">
						<div v-for="obj in dimension" :key="obj.type" :class="[obj.key, 'list-wrap']" @mouseenter="showButton(obj, $event)" @mouseleave="hideButton(obj, $event)">
							<el-checkbox-button :label="obj.type">{{obj.name}}</el-checkbox-button>
							<div class="link-line" v-show="obj.show"></div>
							<div class="list-btn-wrap" v-show="obj.show">
								<span v-for="(item,index) in obj.list" :key="index" @click="listButtonClick(item)" :class="{fgb: item.name=='FGB'}">{{item.name}}</span>
							</div>
						</div>						
					</el-checkbox-group>
					<!--el-radio-group v-model="selectedDimension" class="btn-group" >
						<el-radio-button v-for="obj in dimension" :key="obj.type" :label="obj.type">{{obj.name}}</el-radio-button>
					</el-radio-group-->
					<!--el-button class="btn btn-plain" v-for="name in dimension" :key="name">{{name}}</el-button-->
					<el-button :class="[{ 'nobtn': btnShow }, 'btn' , 'btn-plain' , 'parameter']" @click="parameterClick">工艺</el-button>
					<!-- <el-button class="btn btn-plain parameter" @click="parameterClick">工艺</el-button> -->  
				</div>
			</div>
			<v-equipment 
				:equipments="equipments" 
				:checked-equipments="checkedEquipments" 
				:dimension-data="selectedDimension" 
				:datetime="datetime"></v-equipment>
        </div>
    </div>      
</template>

<script>
	import equipment from "components/equipment/list"

	const sFineReportUrl = FINE_REPORT_HOST + "/WebReport/ReportServer?reportlet=";

    export default {
		components: {
			'v-equipment': equipment
		},
        data () {
            return {
				btnShow: true, //用与判断'工艺'按钮是否禁用
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1000px"
                },
                // 点击的工序节点信息。
                node: {},
                equipments: [],
                checkedEquipments: [],
				// 视窗时间，默认为30分钟。
				// windowTime: {
				// 	interval: 30,
				// 	start: "",
				// 	end: "",
				// 	min: 1,
				// 	max: 30,
				// 	left: 0
				// },
				datetime:{},
				dimension: [{
					name: "质量",
					type: "3",
					key: "quality",
					show: false,
                    list: [{
						name: "质检",
						cpt: "/QTReport.cpt",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "送检",
						cpt: "/QCReport.cpt",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "FGB",
						cpt: "/FGBReport.cpt&__bypagesize__=false",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    }]
				}, {
					name: "加工",
					type: "2",
					key: "work",
					show: false,
					list: [{
						name: "投产表",
						router: "/process/product",
						query: ["equipmentIdList", "startTime", "endTime"]  
                    }]
				}, {
					name: "事件",
					type: "4",
					key: "event",
					show: false,
					list: [{
						name: "事件记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "维护",
					type: "5",
					key: "repair",
					show: false,
					list: [{
						name: "维护记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "工具",
					type: "6",
					key: "tool",
					show: false,
					list: [{
						name: "刀模具记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}],
				selectedDimension: ["2", "3", "4", "5", "6"]
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		   }
        },
        created () {        
            this.node = this.$route.query;
            this.equipments = [this.node];
            this.checkedEquipments = [this.node.equipmentId];  
			this.setDateTime(); 
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            // '$route': 'fetchData'
			checkedEquipments: 'setDateTime'
        },
        methods: {
			setDateTime () {
				let start = "",
					end = "";
				this.checkedEquipments.forEach((id, index) => {
					let equipment = this.equipments.filter(o => o.equipmentId == id)[0];
					if(equipment) {
						let sTemp = equipment.shiftStartTime,
							eTemp = equipment.shiftEndTime
						if(!index) {
							start = sTemp;
							end = eTemp;
						}else{
							if(start > sTemp) {
								start = sTemp;
							}
							if(end < eTemp) {
								end = eTemp;
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
			// 工艺参数点击事件。
			parameterClick() {

			},
			/**
			 * 跳转按钮点击事件。
			 * @param {Object} oData
			 * @return {void}
			 */
			listButtonClick(oData) {
				if(oData.router) {				
					let oQuery = this.getParamter(oData.query);
					
					this.$router.replace({path: oData.router, query: oQuery});
				}

				if(oData.cpt) {
					let oParam = this.getParamter(oData.parameter),
						sPath = sFineReportUrl + oData.cpt;

					oData.parameter.forEach(p => {
						if(oParam[p]) {
							sPath += "&" + p + "=" + oParam[p]
						}						
					});
					window.open(sPath , "_blank");
				}
			},
			/**
			 * @param {Array}
			 * @return {Object}
			 */
			getParamter (aQuery) {
				let oParam = {};
				aQuery.forEach(param => {
					switch (param) {
						case "equipmentIdList":
							oParam[param] = this.node.equipmentId;
							break;
						case "equipmentId": 
							oParam[param] = this.node[param];
							break;
						case "startTime":
							oParam[param] = this.datetime.start;
							break;
						case "endTime":
							oParam[param] = this.datetime.end;
							break;
						case "processCode":
							oParam[param] = this.node.process;
							break;
						default:;
					}
				})
				return oParam;
			},
			showButton(oData, event) {

				// if(oData.name === '质量' || oData.name === '加工'){   // 临时屏蔽了'事件'、'维护'、'工具' 三个按钮
					oData.show = true;
					this.$nextTick(function () {
					// DOM 更新了
						let node = event.target.querySelector(".list-btn-wrap");
						node.style.left = (event.target.offsetLeft + 24 - node.clientWidth/2) + "px";					
					})
				// }
				
			},
			hideButton(oData, event) {
				oData.show = false;
			}
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
			.el-checkbox-button__inner {
				color: #fff;
				background-color: @color;			
			}
		}

		.el-checkbox-button__inner {
			.border-color(@color);				
		}

		.el-checkbox-button.is-checked .el-checkbox-button__inner {
			color: #fff;
			background-color: @color;
			border-color: @color;
			box-shadow: -1px 0 0 0 @color;
		}

		&:hover,&:focus {
			.el-checkbox-button__inner {
				color: #fff;
				background-color: @color;
				.border-color(@color);	
			}
		}
	}

	.content-panel {
		position: relative;
	}

	.list-wrap {
		display: inline-block;
		/* 临时屏蔽该按钮 */
		// label.el-checkbox-button.is-checked {
		// 	span:nth-child(3) {
		// 		background: rgb(204, 204, 204) ;
		// 		color: #fff;
		// 		cursor: default ;
		// 		border: 2px solid #ccc 
		// 	}
		// }
		// label:nth-child(4) {
		// 	span {
		// 		background: rgb(204, 204, 204) ;
		// 		color: #fff ;
		// 		cursor: default ;
		// 		border: 2px solid #ccc 
		// 	}
		// }
		// label:nth-child(5) {
		// 	.el-checkbox-button__inner {
		// 		background: rgb(204, 204, 204) ;
		// 		color: #fff ;
		// 		cursor: default ;
		// 		border: 2px solid #ccc 
		// 	}
		// }
	}

	.link-line {
		position: absolute;
		// border-right: 2px solid #42af8f;
		width: 48px;
		height: 10px;
		background: url(../../assets/img/division.png) center center no-repeat;
	}

	.list-btn-wrap {
		position: absolute;
		border: 1px solid #42af8f;
		padding: 6px 10px;
		top: 60px;
		background-color: #fff;

		
		span {
			display: inline-block;
			cursor: pointer;
			color: #42af8f;

			&+span {
				margin-left: 10px;
			}

			// &:hover {
			// 	color: #42af8f;
			// }

			&.fgb {
				color: #f90;
			}
		}
	}

	.nobtn {
		background: rgb(204, 204, 204);
		border: none;
		color: #fff; // cursor: no-drop;
		cursor: auto;
	}

	// .list-wrap:nth-child(3) {
	// 	/* 临时屏蔽该按钮 */
	// 	.el-checkbox-button {
	// 		span {
	// 			background: rgb(204, 204, 204);
	// 			color: #fff;
	// 			cursor: default;
	// 			border: 2px solid #ccc !important
	// 		}
	// 	}
	// }
	// .list-wrap:nth-child(4) {
	// 	/* 临时屏蔽该按钮 */
	// 	.el-checkbox-button {
	// 		span {
	// 			background: rgb(204, 204, 204);
	// 			color: #fff;
	// 			cursor: default;
	// 			border: 2px solid #ccc !important
	// 		}
	// 	}
	// }
	// .list-wrap:nth-child(5) {
	// 	/* 临时屏蔽该按钮 */
	// 	.el-checkbox-button {
	// 		span {
	// 			background: rgb(204, 204, 204);
	// 			color: #fff;
	// 			cursor: default;
	// 			border: 2px solid #ccc !important
	// 		}
	// 	}
	// }

	.el-checkbox-button:first-child .el-checkbox-button__inner {
		border-radius: 0;
		border-left-width: 2px;
	}
	.dimension {

		.el-checkbox-button__orig-checkbox:checked+.el-checkbox-button__inner {
			box-shadow: none;
		}
		.quality {
			.button-color(@quality)

		}
		.work {
			.button-color(@work)

		}
		.event {
			.button-color(@event)

		}	
		.repair {
			.button-color(@repair)

		}
		.tool {
			.button-color(@tool)
		}
	}
	

</style>
