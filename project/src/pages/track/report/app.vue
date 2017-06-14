<template>
	<div id="app" class="report-wrapper">
		<div class="report-container">	
			<div class="tag">
				<span>报告人：</span>
				<span>报告时间：{{new Date().Format("yyyy-MM-dd hh:mm:ss")}}</span>
			</div>
			<h1 class="title">快速报告</h1>
			<h2 class="content-title">查询条件</h2>
			<div class="condition" ref="condition">		
				<span v-for="filter in Object.entries(filters)">
					{{filter[0]}} : {{filter[1]}}
				</span>
				<span @click="dialogTableVisible = true" style="cursor:pointer">结果集 : 共<i> {{result.whole}} </i>条，选中<i> {{result.selected}} </i>条，过滤<i> {{result.filter}} </i>条。</span>
			</div>
			<el-dialog title="结果集" :visible.sync="dialogTableVisible" size="large">
				<el-radio-group v-model="radio" @change="radioChange">
				    <el-radio-button label="all" class="btn-radio">全部</el-radio-button>
				    <el-radio-button label="selected" class="btn-radio">选中</el-radio-button>
				    <el-radio-button label="filtered" class="btn-radio">过滤</el-radio-button>
				</el-radio-group>				 				 
				<!--<div class="loading" v-if="gridData.loading">
	                Loading...
	            </div>-->
	            <div v-if="gridData.error" class="error">
	                {{ gridData.error }}
	            </div>
	            <div v-else class="content-table">
	                <v-table :table-data="showData" :loading="gridData.loading"></v-table>    
	            </div>     
			</el-dialog>
			<v-report :hasData="setWidth" :noData="removeWidth" :query="selected" type="trace"></v-report>
		</div>
  	</div>
</template>

<script>
	import report from "components/report/report.vue"
	import table from "components/basic/table.vue"

	export default {
		components: {
			'v-report': report,
			'v-table': table
		},
		data() {
			return {
				dialogTableVisible: false,
				radio: "all",
				showData: {
					columns: [],
					data: []
				},
                gridData: {
                	// 追踪结果集。
                    url: "/trace/tracereverse",
//                  loading: false,
                    error: null,
                    selected: [],
                    columns: [{
                        type: "index",
                        name: "序号",
                        width: "50"
                    },{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "batchNo",
                        name: "批次号"
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名字"
                    },{
                        prop: "materialSpec",
                        name: "物料规格"
                    },{
                        prop: "materialUnit",
                        name: "物料单位"
                    },{
                        prop: "quantity",
                        name: "数量"
                    },{
                        prop: "happenTime",
                        name: "加工时间"
                    },{
                        prop: "personName",
                        name: "操作人"
                    },{
                        prop: "equipmentName",
                        name: "设备名称"
                    },{
                        prop: "equipmentCode",
                        name: "设备编码"
                    },{
                        prop: "equipmentType",
                        name: "设备类型"
                    },{
                        prop: "processName",
                        name: "工序名称"
                    },{
                        prop: "moldCode",
                        name: "模号"
                    }],
                    data: [{
				      "barcode": "UN65457437520007057", 
				      "batchNo": "20160331A", 
				      "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				      "materialCode": "10000515", 
				      "materialSpec": "", 
				      "materialUnit": "kg", 
				      "quantity": 16, 
				      "happenTime": "2016-03-31 14:28:33", 
				      "personName": "李瑞娇", 
				      "equipmentName": "装配2.2线GP12", 
				      "equipmentCode": "RLSB1", 
				      "equipmentType": "", 
				      "processName": "GP12", 
				      "moldCode": "",
				      "bucketNo": ""
				    },{
				      "barcode": "UN65457437520007066", 
				      "batchNo": "20160331A", 
				      "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				      "materialCode": "10000515", 
				      "materialSpec": "", 
				      "materialUnit": "kg", 
				      "quantity": 16, 
				      "happenTime": "2016-03-31 14:28:33", 
				      "personName": "李瑞娇", 
				      "equipmentName": "装配2.2线GP12", 
				      "equipmentCode": "RLSB1", 
				      "equipmentType": "", 
				      "processName": "GP12", 
				      "moldCode": "",
				      "bucketNo": ""
				    }]
                },
            
				styleObject: {
					"min-width": "1200px"
				},
				result: {
					whole: 0,
					selected: 0,
					filter: 0
				},
				selected: [],
				filters: {}
			}
		},
		computed: {
			query: function() {
				let url = location.search; //获取url中"?"符后的字串 
				let oRequest = {}; 
				if (url.indexOf("?") != -1) { 
					let strs = url.substr(1).split("&"); 
					
					for(let i = 0; i < strs.length; i ++) { 
						oRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]); 
					} 
				} 
				return oRequest; 
			}
		},
		created() {
			// 组件创建完后获取数据，
			// 此时 data 已经被 observed 了

			let oConditions = sessionStorage.getItem("fastReport_" + this.query.tag);
			
			if(oConditions) {
				oConditions = JSON.parse(oConditions);
				
				this.result.selected = oConditions.selected.length;
				this.result.whole = oConditions.length;
				this.result.filter = this.result.whole - this.result.selected;
				this.filters = oConditions.filters;
				this.selected = oConditions.selected;
			}

		},
		mounted() {
			this.fetchData(this.gridData);
		},
		methods: {
			fetchData (oData) {
//              oData.error = oData.data = null;

//              this.$get(oData.url, this.filters)
//              .then((res) => {
//
//                  if(!res.errorCode) {
//                      oData.data = res.data;

                        oData.data.forEach((o, index) => {
                        	if(this.selected.length && this.selected.filter(item => o.bucketNo === item.bucketNo).length) {
                        		// 标记为选中。
                        		o.tag = "selected";
                        	}else {
                        		o.tag = "filtered";
                        	}
                        });
                        
                        this.showData = {
                        	columns: oData.columns,
                        	data: oData.data
                        }
//                  }
//              })
//              .catch((err) => {
//                  oData.loading = false;
//                  oData.error = "查询出错。"
//              })
            },
			setWidth() {
				this.styleObject.minWidth = "1200px";
			},
			removeWidth() {
				this.styleObject.minWidth = 0;
			},
			radioChange(value) {
//				debugger
				if(value !== "all") {
					this.showData.data = this.gridData.data.filter(o => o.tag == value);
				}else {
					this.showData.data = this.gridData.data;
				}			
			}
		}
	}
</script>

<style lang="less" >
	body {
		display: flex;
		flex-direction: column;
	}
	
	.report-wrapper {
		padding: 20px;
		flex: 1 1;
	}

	.report-container {
		height: 100%;
		border: 1px solid #ccc;
		padding: 0 20px;
		background-color: #fff;
		position: relative;
		
		.title {
			height: 24px;
			font: normal 24px/1 "微软雅黑",arial,sans-serif;
			color: #333;
			/*font-family: "微软雅黑";*/
			text-align: center;
			/*font-weight: normal;*/
			margin: 28px auto;
		}
		
		.tag {
			position: absolute;
			top: 32px;
			right: 20px;
			
			span {
				display: inline-block;
				&+span {
					margin-left: 30px;
				}
				
			}
		}
	}
	.condition {
		border: 2px solid #42AF8F;
		padding: 20px 12px;
		margin-bottom: 30px;
		font-size: 14px;
		
		span {
			display: inline-block;
			&+span {
				margin-left: 60px;
			}
		}
		
		.condition-line+.condition-line {
			margin-top: 10px;
		}
		
		i {
			color: #42AF8F;
			font-style: normal;
			font-weight: 600;
		}
	}
</style>