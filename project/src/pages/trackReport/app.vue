<template>
	<div id="app" class="report-wrapper" >
		<!-- 显示节点 -->
		<div class="report-container" ref="fastreport">
			<div class="page-icon">
				<i class="icon icon-20 icon-download" title="下载" @click="downloadHandle('fastreport', $event)"></i>
            	<i class="icon icon-20 icon-print" title="打印" @click="beforePrint('fastreport', $event)"></i>
			</div>
			<h1 class="title">快速报告</h1>
			<h2 class="content-title">查询条件</h2>
			<div class='condition-messsage'>
				<span v-for="(filter,index) in filtersList" :key="index">
					{{filter[0]}} : {{filter[1]}}
				</span>
				<span v-show="!this.filters.materialCode && gridData.data[0]" class="default-message" >物料：{{gridData.data[0] ? gridData.data[0]["materialCode"] : ""}}</span>
				<span v-show="!this.filters.processName && gridData.data[0]" class="default-message" >工序：{{gridData.data[0] ? gridData.data[0]["processName"] : ""}}</span> 
			</div>
			<div class='condition-list' @click="active.message = !active.message">
				<span>查询明细
					<i class="el-icon-d-arrow-right icon" v-show="!active.message"></i>
				</span>
			</div>
			<div class="content-table condition-table" v-show="active.message">
				<div class='materialBox' v-for="equipment in equipmentTimes">
					<div class='material'>{{equipment['name']}}：</div>
					<div class='time' >
						<span v-for='time in equipment["time"]'>{{time}}</span>
					</div>
				</div>
			</div>
			<v-report :hasData="setWidth" :noData="removeWidth" :query="selected" type="trace"></v-report>
		</div>
		
		<!--<v-report :hasData="setWidth" :noData="removeWidth" :query="selected" type="trace" :showTables='["summary","inStocks","outStocks","inMakings"]'></v-report>-->
		<el-dialog title="打印选项" :visible.sync="dialogFormVisible" @close="printHandle('fastreport')" size="tiny">
            <el-form :model="form">
                <el-form-item label="报告人：" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" :placeholder="this.$store.state.loginModule.nickname"></el-input>
					<el-input v-show="false"></el-input>
                </el-form-item>
				<el-form-item :label-width="formLabelWidth">
					<el-checkbox v-model="form.printRemark">是否打印备注栏</el-checkbox>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogFormVisible = false,printReport = true">确 定</el-button>
            </div>
        </el-dialog>
	  </div>
</template>

<script>
	import report from "components/report/report.vue"
	import table from "components/basic/table.vue"
	import html2canvas from 'html2canvas'
	import rasterizeHTML from 'rasterizehtml'
	import fnP from "assets/js/public.js"

	// 数据名称接口。
    const TABLE_DATA_URL = HOST + "/api/v1/customized/items";

	export default {
		components: {
			'v-report': report,
			'v-table': table
		},
		data() {
			return {
				dialogFormVisible: false,
                form: {
					name: '',
					printRemark: true
                },
                formLabelWidth: '120px',

				printRemark: false, // 是否打印备注栏
//				nickname: "",   	// 报告人
				printReport: false, // 是否打印
				active: {			// 条件列是否显示
					message: false
				},
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
                        prop: "equipmentName",
                        name: "设备"
                    },{
                        prop: "happenTime",
                        name: "加工时间"
                    }],
                    data: []
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
				filtersList: [],
				//dialogState:false
				equipmentTimes:[]
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
			nickname: function() {
				return this.form.name || ((this.$store.state.loginModule.nickname !== null) ? this.$store.state.loginModule.nickname : "")
			}
		},
		created() {
			// 登录验证。
			this.$register.login(this.$store);

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
					this.filters = Object.assign({}, oConditions.keys)
					this.selected = oConditions
				}

			}
			this.fetchDataName()  //获取名称
		},
		mounted() {
			this.fetchStartPointsData();
		},
		methods: {
			setFilters () {
				
				let oFilters = this.filters,
					aoFilters = []
				
				for(let param in oFilters){
					if(oFilters[param] === '' || param === '_tag'){
						delete oFilters[param]
					}else {
						/* 为了将获取到的 barcode等转换为对应的中文 */
						let aValue = this.setSpecialItem(param, oFilters[param])
						aValue && aoFilters.push(aValue)				
					}
				}
				this.filtersList = aoFilters 
			},
			// 获取对应的中文。
			setSpecialItem (param, sValue) {
				
				if(param === "equipmentName") {
					// 设备名称。
					param = "equipmentCode"
				}

				let oItem = this.dataName.filter(o => o.itemCode === param)[0]

				if(oItem) {
					if(typeof sValue === "string") {
						let oParam = {};
						oParam[param] = sValue;
						sValue = fnP.parseQueryParam(oParam, 1)[param]
					}

					return [oItem.itemName, sValue]
				}
				
			},
			// 起点请求成功。
			requestStartPointsSucess(oData) {
				//console.log(oData)
				this.gridData.data = oData;
				
				let myData = JSON.parse(JSON.stringify(this.gridData.data))
				let needArr = []
				let selectedArr = []
				this.selected.forEach((o, index) => {
					selectedArr.push(myData.find(e=> o.bucketNo === e.bucketNo))
				})
				selectedArr.forEach((el,i)=>{
					let obj = {
						"name":"",
						"time":[]
					}
					obj["name"] = el["equipmentName"]
					obj["time"].push(el["happenTime"])
					needArr.push(obj)
					for (let j = i+1 ; j < selectedArr.length; j++){
						if (el["equipmentName"] === selectedArr[j]["equipmentName"]){
							obj["time"].push(selectedArr[j]["happenTime"])
							selectedArr.splice(j, 1)
							j=j-1   
						}
					}
				})
				this.equipmentTimes = needArr


				if(!oData.length) {
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
				//this.dialogState = true	
			},
			// 请求失败。
			requestFail(sErrorMessage) {
				console.warn(sErrorMessage);
			},
			// 请求错误。
			requestError(error) {
              	// this.gridData.loading = false;
				// this.error = "查无数据";
				console.warn(error);
				console.warn("查询出错。");
			},
			fetchStartPointsData () {
				this.error = "";
				this.gridData.data = [];
				
				if(this.type) {
					return;
				}

				this.$register.sendRequest(this.$store, this.$ajax, this.url, "post", fnP.parseQueryParam(this.filters), this.requestStartPointsSucess, this.requestFail, this.requestError)
			},
			// 获取名称成功。
			requestNameSucess(oData) {
				// 获取对应的名称。
				this.dataName = oData	
				this.setFilters()
			},
			fetchDataName() {
				this.$register.sendRequest(this.$store, this.$ajax, TABLE_DATA_URL, "get", null, this.requestNameSucess, this.requestFail, this.requestError)
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
			//
			beforePrint(){
				this.dialogFormVisible = true
			},
			// 打印页面。
			printHandle(refHtml, event) {
				let oTable = this.$refs[refHtml];
				
	            if (!this.printReport) {
	                return;
	            }
	            
	            // 修改报告人信息。
	           	let nickname = this.form.name || ((this.$store.state.loginModule.nickname !== null) ? this.$store.state.loginModule.nickname : "")
	             
	            let sHtml = `
	                <div class="report-wrapper">
	                    <div class="report-container">
	                    	<div class="tag report-time">
								<span>报告人：${nickname}</span>
								<span>报告时间：${new Date().Format("yyyy-MM-dd hh:mm:ss")}</span>
							</div>
							${oTable.innerHTML}
							${this.form.printRemark ?
			            		`<div class="readmine">
								<h2 class="content-title">备注</h2>
								<div class="condition-audit">		
									<div class="tag">
										<span>签名：</span>
										<span>时间：</span>
									</div>
								</div>
							</div>`: ''}
	                    </div>
	                    
	                    <style>
		                    body {
								display: flex;
								flex-direction: column;
							}
							
							.report-wrapper {
								padding: 20px;
								flex: 1 1;
							}
		                    .report-container .table {
		                    	display: block !important;
		                    }
	                    	.report-container {
	                    		width: 100%;
	                    		height: 100%;
								background-color: #fff;
								position: relative;
								box-sizing: border-box;
	                    	}
	                    	
	                    	.report-container .content-table {
	                    		display: block !important;
	                    	}
	                    	.report-container .page-icon {
	                    		display: none
	                    	}
	                    	.report-container .title {
	                    		height: 24px;
								font: normal 24px/1 "微软雅黑",arial,sans-serif;
								color: #333;
								text-align: center;
								margin: 28px auto;
	                    	}
	                    	.report-container .content-title,
	                    	.report-container .content-title .table-title{
	                    		font-size: 16px;
	                    		height: 16px;
    							line-height: 16px;
	                    	}
	                    	.report-container .content-title {
    							text-indent: 10px;
	                    		border-left: 4px solid #42af8f;
	                    	}
	                    	.report-container .inner-title .table-title {
	                    		font-size: 16px;
	                    		color: #42AF8F;
	                    	}
	                    	.report-container >.tag {
	                    		position: absolute;
								font-size: 14px;
								top: 60px;
								right: 20px;
	                    	}
	                    	.report-container >.tag span {
	                    		display:　inline-block;
	                    	}
	                    	.report-container >.tag span + span {
	                    		margin-left: 30px
	                    	}
	                    	.report-container .condition-messsage {
	                    		box-sizing: border-box;
								padding-left: 10px;
	                    	}
	                    	.report-container .condition-messsage span {
	                    		font-size: 14px;
								margin-right: 30px
	                    	}
	                    	.report-container .condition-messsage .default-message {
	                    		color: #999;
								margin-right: 10px;
	                    	}
	                    	.report-container .condition-list {
	                    		box-sizing: border-box;
								padding-left: 10px;
								cursor: pointer;
	                    	}
	                    	.report-container .condition-list span {
	                    		font-size: 14px;
								line-height: 40px;
								color: #42AF8F
	                    	}
	                    	.report-container .condition-list .icon {
	                    		font-size: 12px;
								margin-bottom: 3px;
	                    	}
	                    	.report-container .condition-table {
	                    		margin-top: 0;
								box-sizing: border-box;
								border: 1px solid #42AF8F;
								padding: 10px;
	                    	}
	                    	.report-container .condition-table .materialBox {
	                    		display: flex;
								box-sizing: border-box;
								padding-left: 10px;
								color: #666;
								margin-bottom: 20px;
								font-size: 14px;
	                    	}
	                    	.report-container .condition-table .materialBox .material {
								line-height: 20px;
							}
	                    	.report-container .condition-table .materialBox .time {
	                    		display: flex;
								flex: 1;
								flex-wrap: wrap;
								height: auto;
	                    	}
	                    	.report-container .condition-table .materialBox .time > span {
	                    		margin-left: 10px; 
								line-height: 20px;
	                    	}
	                    	.report-container .report .inner-title,
	                    	.report-container .report .content-table.inner {
							  display: block !important;
							}
	                    	.report-container .report .error {
	                    		height: 60px;
							    text-align: center;
	                    	}
	                    	.report-container .readmine .condition-audit {
	                    		border: 2px solid #42AF8F;
								padding: 20px 12px;
								margin-top: 30px;
								font-size: 14px;
								height: 70px;
								position: relative;
	                    	}
	                    	.report-container .readmine .condition-audit .tag {
	                    		position: absolute;
								right: 120px;
								top: 48px;
	                    	}
	                    	.report-container .readmine .condition-audit .tag span {
	                    		display: block;
								line-height: 24px;
	                    	}
	                    	.report-container .readmine .condition-audit .tag span + span {
	                    		margin-left: 0;
	                    	}
	                    	.report-container .el-table {
								// 显示表格
								display: block !important;
								font-size: 14px
	                    	}
							.el-table {
							}
	                        .el-table td.is-center, .el-table th.is-center {
	                            text-align: center;
	                        }
	                        .el-table thead th {
	                            height: 36px;
	                            background-color: #42af8f;
	                        }
	                        .el-table thead th .cell {
	                            color: #fff;
	                        }
		                    .el-table__body-wrapper tr:nth-child(even) {
		                        background-color: #fafafa;
		                    }
		                    .el-table__body-wrapper tr:nth-child(odd) {
		                        background-color: #fff;
		                    }
	                        .el-table__body-wrapper td {
	                        	white-space: normal;
	    						word-break: break-all;
	                        }
	                        .el-table__body-wrapper .cell {
	                            min-height: 30px;
	                            line-height: 30px;
	                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
	                            //	border: 1px solid #e4efec;
	                            box-sizing: border-box;
	                        }
	                        .el-table__body-wrapper .batch .cell > div {
	                            color: #f90;
	                        	font-weight: 600
	                        }
	                        .el-table__empty-block {
	                            text-align: center;	
	                        }
	                    </style>
	                </div>
	            `;
	
	            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml, {
	            	width: document.body.clientWidth
	            });
	            this.printReport = false
			},
			//高度函数
			outerHeight(el) {
				var height = el.offsetHeight;
				var style = getComputedStyle(el);

				height += parseInt(style.marginTop) + parseInt(style.marginBottom);
				return height;
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
		box-sizing: border-box;
		
		.page-icon {
			position: absolute;
			top: 30px;
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
		
	}
	.report-container {
		.condition-messsage {
			box-sizing: border-box;
			padding-left: 10px;
			span {
				font-size: 14px;
				margin-right: 30px
			}
			
			.default-message {
				color: #999;
				margin-right: 10px;
			}
		}
		.condition-list {
			box-sizing: border-box;
			padding-left: 10px;
			cursor: pointer;
			span {
				font-size: 14px;
				line-height: 40px;
				color: #42AF8F
			}
			.icon {
				font-size: 12px;
				margin-bottom: 3px;
			}
		}
		.condition-table {
			margin-top: 0;
			box-sizing: border-box;
			border: 1px solid #42AF8F;
			padding: 10px;
			.materialBox {
				display: flex;
				box-sizing: border-box;
				padding-left: 10px;
				color: #666;
				margin-bottom: 5px;
				font-size: 14px;
				&:last-child {
					margin-bottom: 0;
				}
				.material {
					line-height: 20px;
				}
				.time {
					display: flex;
					flex: 1;
					flex-wrap: wrap;
					max-height: 400px;
					overflow-y: auto;
					&>span {
						margin-left: 10px; 
						line-height: 20px;
					}
				}
			}
			
		}
	}
	
	.readmine {
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
	}
	// .clone {
	// 	position: absolute;
	// 	left: 20px;
	// 	right: 20px;
	// 	top: 0;
	// 	 bottom: 0;
	// }

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
	.el-dialog--tiny {
		/*max-width: 420px;*/
		width: 420px;
	}
	.el-dialog__body {
		.el-form-item {
			margin-bottom: 0; 
		}
		.el-input {
			.el-input__inner{
				height: 30px;
				border-radius: 0;
				width: 200px;
				border-color: #ddd;
			}
		}
	}
	.el-dialog__footer {
		text-align: center;
		.dialog-footer {
			.el-button {
				border-radius: 0
			}
		}
	}
</style>
