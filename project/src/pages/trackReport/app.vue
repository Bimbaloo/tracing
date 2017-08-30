<template>
	<div id="app" class="report-wrapper" ref="fastreport">
		<div class="report-container">	
			<div class="page-icon">
				<i class="icon icon-20 icon-download" title="下载" @click="downloadHandle('fastreport', $event)"></i>
            	<i class="icon icon-20 icon-print" title="打印" @click="printHandle('fastreport', $event)"></i>
			</div>
			<div class="tag">
				<span>报告人：admin</span>
				<span>报告时间：{{new Date().Format("yyyy-MM-dd hh:mm:ss")}}</span>
			</div>
			<h1 class="title">快速报告</h1>
			<h2 class="content-title">查询条件</h2>
			<div class="condition" ref="condition">	
				<div class='condition-messsage'>
					<span v-for="(filter,index) in _filters" :key="index">
						{{filter[0]}} : {{filter[1]}}
					</span> 
				</div>	
				<div class='result-messsage' v-if="!type">
					<span style="cursor:pointer">结果集:</span>
					<span @click="dialogVisible('all')" label="all" style="cursor:pointer">共<i> {{result.whole}} </i>条,</span>
					<span @click="dialogVisible('selected')" label="selected" style="cursor:pointer">选中<i> {{result.selected}} </i>条,</span>
					<span @click="dialogVisible('filtered')" label="filtered" style="cursor:pointer">过滤<i> {{result.filter}} </i>条。</span>
				</div>
				
			</div>
			<el-dialog v-if="!type" title="结果集" :visible.sync="dialogTableVisible" size="large">
				<el-radio-group v-model="radio" @change="radioChange">
				    <el-radio-button label="all" class="btn-radio">全部</el-radio-button>
				    <el-radio-button label="selected" class="btn-radio">选中</el-radio-button>
				    <el-radio-button label="filtered" class="btn-radio">过滤</el-radio-button>
				</el-radio-group>				 				 
	            <div v-if="error" class="error">
	                {{ error }}
	            </div>
	            <div v-else class="content-table" >
	                <v-table :table-data="showData" :loading="!dialogState" :heights="500" v-if="dialogState"></v-table>  <!-- 真正的显示内容的table -->
					<v-table :table-data="gridData" :loading="!dialogState" :heights="500" v-else></v-table>              <!-- 为了在table组件未加载数据前撑开高度 -->
	            </div>     
			</el-dialog>
			<v-report :hasData="setWidth" :noData="removeWidth" :query="selected" type="trace"></v-report>
			<h2 class="content-title">审核</h2>
			<div class="condition-audit" >		
				<div class="tag">
					<span>签名：</span>
					<span>时间：</span>
				</div>
			</div>
		</div>
  	</div>
</template>

<script>
	import report from "components/report/report.vue"
	import table from "components/basic/table.vue"
	import html2canvas from 'html2canvas'
	import fnP from "assets/js/public.js"
	// import {host} from 'assets/js/configs.js'

	// var HOST = window.HOST ? window.HOST: host	
	// 数据名称接口。
    const TABLE_DATA_URL = HOST + "/api/v1/customized/items";

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
				// 追踪结果集。
				url: HOST + "/api/v1/trace/down/start-points",
				dataName:[],
				loading: false,
				error: "",
				// 快速报告查询类型。若为溯源页面跳转而来，该类型不为空。
				type: "",
                selected: [],
                gridData: {
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
                        name: "物料名称"
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
                    data: []
					// 	{
				    //   "barcode": "UN65457437520007057", 
				    //   "batchNo": "20160331A", 
				    //   "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				    //   "materialCode": "10000515", 
				    //   "materialSpec": "", 
				    //   "materialUnit": "kg", 
				    //   "quantity": 16, 
				    //   "happenTime": "2016-03-31 14:28:33", 
				    //   "personName": "李瑞娇", 
				    //   "equipmentName": "装配2.2线GP12", 
				    //   "equipmentCode": "RLSB1", 
				    //   "equipmentType": "", 
				    //   "processName": "GP12", 
				    //   "moldCode": "",
				    //   "bucketNo": ""
				    // },{
				    //   "barcode": "UN65457437520007066", 
				    //   "batchNo": "20160331A", 
				    //   "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				    //   "materialCode": "10000515", 
				    //   "materialSpec": "", 
				    //   "materialUnit": "kg", 
				    //   "quantity": 16, 
				    //   "happenTime": "2016-03-31 14:28:33", 
				    //   "personName": "李瑞娇", 
				    //   "equipmentName": "装配2.2线GP12", 
				    //   "equipmentCode": "RLSB1", 
				    //   "equipmentType": "", 
				    //   "processName": "GP12", 
				    //   "moldCode": "",
				    //   "bucketNo": ""
					// }
					
                },
            
				styleObject: {
					"min-width": "1200px"
				},
				result: {
					whole: 0,
					selected: 0,
					filter: 0
				},
				filters: {},
				dialogState:false
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
			},
			_filters: function() {
				let _filters = this.filters
				
				for(let i in _filters){
					if(_filters[i] === '' || i === '_tag'){
						delete _filters[i]
					}
				}
				/* 为了将获取到的 barcode等转换为对应的中文 */
				let b = Object.entries(_filters).filter(o => o[0] !== "equipmentId"),
					a = this.dataName;

				b.forEach(o =>
                    a.forEach(x => {
						this.setSpecialItem(x, o)

						if(o[0] === x.itemCode){
                            o[0] = x.itemName
						}
                    })
                )
				return b
				/* 为了将获取到的 barcode等转换为对应的中文 */
			}
		},
		created() {
			// 组件创建完后获取数据，
			// 此时 data 已经被 observed 了
			let oConditions = sessionStorage.getItem("fastReport_" + this.query.tag);
			
			if(oConditions) {
				oConditions = JSON.parse(oConditions);	
				
				if(!oConditions.type) {
					// 通过起点集查询。
					this.result.selected = (oConditions.selected && oConditions.selected.length) || 0;
					this.result.whole = oConditions.length || 0;
					this.result.filter = this.result.whole - this.result.selected;
					
					this.filters = oConditions.filters || [];
					this.selected = oConditions.selected || [];
				}else {
					// 溯源页面跳转。
					this.type = oConditions.type
					this.filters = oConditions.keys
					this.selected = oConditions
				}

			}

			this.fetchDataName()  //获取名称
		},
		mounted() {
			this.fetchData();
		},
		methods: {
			setSpecialItem (correspondingName, o) {
				let aValue = o[1].split(":")
				if((correspondingName.itemCode === "equipmentCode" || correspondingName.itemCode === "materialCode") && aValue[1]) {
					// 若为设备编码或物料编码,但值包含编码和名称。
					o[1] = aValue[1]
				}else if(correspondingName.itemCode === "equipmentCode" && o[0] === "equipmentName") {
					// 设备名称。
					o[1] = aValue[1]
				}
			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param, fnSu, fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu(param.data.data);
				}else {
					// 提示信息。
//					this.error = "查无数据";
					console.warn(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}
			},	
			fetchData () {
				this.error = "";
				this.gridData.data = [];
				// url:api/v1/trace/down/start-points
             	this.$post(this.url, fnP.parseQueryParam(this.filters))
             	.then((res) => {
					//debugger
					this.judgeLoaderHandler(res, (data) => {
						
						this.gridData.data = data;
						
						if(!data.length) {
							console.log('查无数据。');
						}else {
							this.gridData.data.forEach((o, index) => {
								if(this.selected.length && this.selected.filter(item => o.bucketNo === item.bucketNo).length) {
									// 标记为选中。
									o.tag = "selected";
								}else {
									o.tag = "filtered";
								}
							});
						}
              
                        this.showData = {
                        	columns: this.gridData.columns,
                        	data: this.gridData.data
                        }
						this.dialogState = true						
					})
             })
             .catch((err) => {
                this.gridData.loading = false;
//				this.error = "查无数据";
				console.warn("查询出错。");
             })
			},
			fetchDataName() {
				this.$ajax.get(TABLE_DATA_URL).then((res) => {
					this.judgeLoaderHandler(res, () => {
						// 获取对应的名称。
						//debugger

						this.dataName = res.data.data	
					});
				});
			},
			setWidth() {
				this.styleObject.minWidth = "1200px";
			},
			removeWidth() {
				this.styleObject.minWidth = 0;
			},
			radioChange(value) {
				if(value !== "all") {
					this.showData.data = this.gridData.data.filter(o => o.tag == value);
				}else {
					this.showData.data = this.gridData.data;
				}			
			},
			dialogVisible(value){
				
					this.dialogTableVisible = true;
					this.radio = value
					this.radioChange(value)
				
				
			},
			// 页面下载。
            downloadHandle (refHtml, event) {
				event.stopPropagation();
				
                let oRef = this.$refs[refHtml];
                if(!oRef) {
                    return;
                }
                window.Rt.utils.downloadHtml(html2canvas, oRef, "快速报告");     
            },
            // 页面打印。
            printHandle (refHtml, event) {
				event.stopPropagation();

                let oRef = this.$refs[refHtml];
                if(!oRef) {
                    return;
                }
                
                window.Rt.utils.printHtml(html2canvas,oRef);          
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
		
		.page-icon {
			position: absolute;
			top: 78px;
			right: 20px;

			.icon {
				margin-left: 10px;
				cursor: pointer;
			}
		}

		.title {
			height: 24px;
			font: normal 24px/1 "微软雅黑",arial,sans-serif;
			color: #333;
			/*font-family: "微软雅黑";*/
			text-align: center;
			/*font-weight: normal;*/
			margin: 28px auto;
		}
		
		&>.tag {
			position: absolute;
			top: 34px;
			left: 50%;
			margin-left: 80px;
			
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
		padding: 10px 12px;
		margin-bottom: 30px;
		font-size: 14px;
		.condition-messsage {
			line-height: 25px;
			span {
				margin-left: 10px
			}
		}
		.result-messsage {
			line-height: 25px;
			span:nth-child(1) {
				margin-left: 10px
			}
		}
		span {
			display: inline-block;
			&+span:nth-child(1) {
				margin-left: 60px;
			}
			// &+span:nth-child(2) {
			// 	margin-left: 60px;
			// }
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
	.condition-audit {
		border: 2px solid #42AF8F;
		padding: 20px 12px;
		margin-top: 30px;
		font-size: 14px;
		height: 70px;
		position: relative;
		.tag {
			position: absolute;
			right: 120px;
			top: 48px;
			span {
				display: block;
				line-height: 24px;
				&+span {
					margin-left: 0;
				}
			}
		}
	}

	.el-dialog__headerbtn {
		border: none;
    	outline: none;
    	background-color: transparent;
	}

	.error {
		height: 60px;
		line-height: 60x;
		text-align: center;
	}
	.el-loading-mask {
		z-index: 1000 ;
	}
</style>
