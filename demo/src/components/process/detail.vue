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
						<div v-for="obj in dimension" :key="obj.type" class="list-wrap" @mouseenter="showButton(obj, $event)" @mouseleave="hideButton(obj, $event)">
							<el-checkbox-button :label="obj.type">{{obj.name}}</el-checkbox-button>
							<div class="link-line" v-show="obj.show"></div>
							<div class="list-btn-wrap" v-show="obj.show">
								<span v-for="item in obj.list" @click="listButtonClick(item)" :class="{fgb: item.name=='FGB'}">{{item.name}}</span>
							</div>
						</div>						
					</el-checkbox-group>
					<!--el-radio-group v-model="selectedDimension" class="btn-group" >
						<el-radio-button v-for="obj in dimension" :key="obj.type" :label="obj.type">{{obj.name}}</el-radio-button>
					</el-radio-group-->
					<!--el-button class="btn btn-plain" v-for="name in dimension" :key="name">{{name}}</el-button-->
					<el-button class="btn btn-plain parameter" @click="parameterClick">工艺</el-button>
				</div>
			</div>
			<v-equipment :equipments="equipments" :checked-equipments="checkedEquipments" :dimension-data="selectedDimension" :window-time="windowTime"></v-equipment>
        </div>
    </div>      
</template>

<script>
	import equipment from "components/equipment/list"

    export default {
		components: {
			'v-equipment': equipment
		},
        data () {
            return {
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1000px"
                },
                // 点击的工序节点信息。
                node: {},
                equipments: [],
                checkedEquipments: [],
				// 视窗时间，默认为2小时。
				windowTime: {
					interval: 2,
					start: "",
					end: "",
					min: 2,
					max: 2,
					left: 0
				},
				dimension: [{
					name: "质量",
					type: "3",
					show: false,
                    list: [{
						name: "质检",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "送检",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "FGB",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    }]
				}, {
					name: "加工",
					type: "2",
					show: false,
					list: [{
						name: "投产表",
						router: "/process/product",
						query: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "事件",
					type: "4",
					show: false,
					list: [{
						name: "事件记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "维护",
					type: "5",
					show: false,
					list: [{
						name: "维护记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "工具",
					type: "6",
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
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            // '$route': 'fetchData'
        },
        methods: {
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
					this.$router.push({path: oData.router, query: oQuery});
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
						case "equipmentId": 
							oParam[param] = this.node[param];
							break;
						case "startTime":
							oParam[param] = this.windowTime.start;
							break;
						case "endTime":
							oParam[param] = this.windowTime.end;
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
				oData.show = true;
				this.$nextTick(function () {
					// DOM 更新了
					let node = event.target.querySelector(".list-btn-wrap");
					node.style.left = (event.target.offsetLeft + 24 - node.clientWidth/2) + "px";					
				})
			},
			hideButton(oData, event) {
				oData.show = false;
			}
         }
    }  
</script>

<style lang="less"> 
	.content-panel {
		position: relative;
	}
	.list-wrap {
		display: inline-block;
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
</style>
