<!--设备列表-->
<template>
    <div class="content-list">
		<div class="handle clear">
			<label>视窗时间：</label><el-input v-model="windowTime" class="time"></el-input><label>小时</label>
			<div class="legend">
				<span v-for="state in states" :key="state.key" :style="{backgroundColor: state.color}">{{state.name}}</span>
			</div>
		</div>
		<div class="analysis">
			<div v-for="info in equipments">
				<label @click="showEquiomentDetail(info)">{{info.equipmentName}}</label>
				<v-equipmentLine :event-data="eventData[info.equipmentId]" :dimension-data="dimensionData"><v-equipmentLine>
			</div>
		</div>
		<div class="timeline">
			<div class="line clear">
				<i class="icon icon-20 icon-start"></i>
				<i class="icon icon-20 icon-end"></i>
			</div>
			<div class="setting clear">
				<div class="start">		    
					<span v-if="startIf" @dblclick="startIf=false">{{datetime.start}}</span>
					<div v-else class="edit">
						<v-datetime :form-data="datetime" key-data="start"></v-datetime>
						<span class="edit-icon">
							<i class="el-icon-circle-check" @click="saveStart"></i>
							<i class="el-icon-circle-cross" @click="cancelStart"></i>
						</span>
					</div>
				</div>
				<div class="end">
					<span v-if="endIf" @dblclick="endIf=false">{{datetime.end}}</span>
					<div v-else class="edit">
						<v-datetime :form-data="datetime" key-data="end"></v-datetime>
						<span class="edit-icon">
							<i class="el-icon-circle-check" @click="saveEnd"></i>
							<i class="el-icon-circle-cross" @click="cancelEnd"></i>
						</span>
					</div>
				</div>
			</div>					
		</div>   
    </div>      
</template>

<script>
	import DateTime from 'components/basic/dateTime.vue'
	import EquipmentLine from 'equipmentLine.vue'

    export default {
		props: {
			equipments: Array,
			checkedEquipments: Array,
			dimensionData: [Array, String]
		},
		components: {
			'v-datetime': DateTime,
			'v-equipmentLine': EquipmentLine
		},
        data () {
            return {
                url: "/process/detail",
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
				}],				
				startIf: true,
				endIf: true
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		  	},
			datetime () {
				let start = "",
					end = "";
				this.checkedEquipments.forEach((id, index) => {
					let equipment = this.equipments.filter(o => o.equipmentId == id)[0];
					if(equipment) {
						let sTemp = equipment.startTime,
							eTemp = equipment.endTime
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
				return {
					start: start,
					initStart: start,
					end: end,
					initEnd: end
				}
			}
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
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
			 * 获取数据。
			 * @return {void}
			 */
            fetchData () {    
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
			// 保存开始时间。
			saveStart () {
				this.datetime.start = new Date(this.datetime.start).Format("yyyy-MM-dd hh:mm:ss");
				this.datetime.initStart = this.datetime.start;
				this.startIf=true;
			},
			// 取消保存开始时间。
			cancelStart () {
				this.datetime.start = this.datetime.initStart;
				this.startIf=true;
			},
			// 保存结束时间。
			saveEnd () {
				this.datetime.end = new Date(this.datetime.end).Format("yyyy-MM-dd hh:mm:ss");
				this.datetime.initEnd = this.datetime.end;
				this.endIf=true;
			},
			// 取消保存结束时间。
			cancelEnd () {
				this.datetime.end = this.datetime.initEnd;
				this.endIf=true;
			},
			/**
			 * 跳转到单设备分析。
			 * @param {Object} oData
			 * @return {void}
			 */
			showEquiomentDetail (oData) {
				
			}
        }
    }  
</script>

<style lang="less">    
	.material-stock  {	  	
    	.content-list {
			padding-top: 30px;

			.handle {
				padding: 0 170px 0 150px;
				.time {
					width: auto;
				}
				input {
					width: 60px;
					height: 30px;
					text-align: center;
					border-radius: 0;
				}

				.legend {
					float: right;
					span {
						display: inline-block;
						width: 60px;
						height: 30px;
						line-height: 30px;
						text-align: center;
						color: #fff;
						margin-left: 20px;
					}
				}
			}

			.timeline {
				margin-top: 40px;
				.line {
					margin: 0 170px 0 150px;
					background: url(../../assets/img/line.png) repeat;
					.icon-start {
						background-color: #fff;
					}
					.icon-end {
						float: right;
						background-color: #fff;
					}
				}

				.setting {
					height: 30px;
					line-height: 30px;
					padding: 0 100px 0 60px;

					.start,.end {
						width: 180px;
						text-align: center;
					}
					.start {
						float: left;
					}
					.end {
						float: right;
					}
					.edit {
						position: relative;

						.edit-icon {
							position: absolute;
							right: -40px;
							top: 0;
							i {
								cursor: pointer;
								color: #bfd9d4;
								&:hover {
									color: #42af8f;
								}
							}
							i + i {
								margin-left: 5px;
							}
						}
					}
					.el-input__inner {
						height: 30px;
						border-radius: 0;
					}

				}

			}

    	}
    }
</style>
