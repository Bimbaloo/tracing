<template>
	<div class="post">
    	<h2 class="content-title">查询结果集</h2>
    	<div class="btn-wrapper">	
    		<el-button class="btn btn-plain" @click="onTrack">追踪</el-button>
    		<el-button class="btn btn-plain" @click="onReport">快速报告</el-button>
    	</div>
        <div class="router-content" ref="routerContent">
	        <div class="innner-content">
	            <div v-if="gridData.error" class="error" style="margin-top: 10px;">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table" >
				    <v-table
				    	:table-data="gridData"
				    	:heights="gridData.height"
				    	:loading="gridData.loading"
				    ></v-table>
	            </div>     
	       </div>   
    	</div> 
    </div>
</template>

<script>
	import table from "components/basic/ag-table.vue"
	import fnP from "assets/js/public.js"

    export default {
        components: {
            'v-table': table
        },
        data () {
            return {
                tdResize: true,       // 是否允许拖动table大小
                dataFilter: true,    // 是否启用过滤功能    
                gridData: {
                    url:  HOST + "/api/v1/trace/down/start-points",
                    loading: false,
                    error: null,
                    height: 200,
                    selected: [],  
                    gridOptions: {
//		            	enableColResize: true,
//			    		enableSorting: true,
//			    		rowSelection: "multiple",
//			    		rowHeight: 40,
//			    		headerHeight: 40,
//			    		rowClass: 'row-style',
//			    		rowDeselection: true,
//			    		enableRangeSelection: true,
//			    		suppressRowClickSelection: true,
//			    		suppressLoadingOverlay: true,
//			    		overlayNoRowsTemplate: "暂无数据"
		            },
		            columns: [],
                    data: []
                },
            }
        },
        mounted () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
            this.fetchPage();
        },
        watch: {
        	// 如果路由有变化，会再次执行该方法
			'$route': 'fetchPage'
        },
        methods: {
        	getColumns() {
        		return [{
	    			width: 30, 
	                checkboxSelection: true,
	                headerCheckboxSelection: true,
	                pinned: true,
	                suppressSorting: true
                },{
					headerName: "序号",
            		field: "index",
            		pinned: true,
                    width: 50
                },{
                    field: "barcode",
                    headerName: "条码",
                    width: 120,
                    pinned: true
//              },{
//                  field: "processName",
//                  headerName: "工序名称",
//                  width: 120
//              },{
//                  field: "processCode",
//                  headerName: "工序编码",
//                  width: 80
                },{
                	field: "processCode",
                	headerName: "工序",
                	width: 120,
                	cellRenderer: function(params) {
						return params.data.processCode + ":" + params.data.processName
	                }
                },{
                    field: "materialCode",
                    headerName: "物料编码"
                },{
                    field: "materialName",
                    headerName: "物料名称",
                    width: 300
                },{
                    field: "materialUnit",
                    headerName: "单位",
                    width: 50
//              },{
//                  field: "equipmentName",
//                  headerName: "设备名称",
//                  width: 120
//              },{
//                  field: "equipmentCode",
//                  headerName: "设备编码"
                },{
                	field: "equipmentCode",
                	headerName: "设备",
                	width: 150,
                	cellRenderer: function(params) {
						return params.data.equipmentCode + ":" + params.data.equipmentName
	                }
                },{
                    field: "batchNo",
                    headerName: "批次",
                    width: 150
                },{
                    field: "happenTime",
                    headerName: "加工时间",
                    width: 160
//                  sort: 'asc'
                },{
                    field: "moldCode",
                    headerName: "模号"
                },{
                    field: "quantity",
                    headerName: "数量",
                    width: 50
                },{
                    field: "personName",
                    headerName: "操作人"
                }]
        	},
        	// 查询。
            fetchPage() {
            	this.fetchData(this.gridData);
            },
        	// 获取高度。
            adjustHeight() {
            	let nHeight = 0;
            	
            	nHeight = this.$refs.routerContent.clientHeight - 50
            	
            	return nHeight;
            },
            // 根据时间排序。
            sortByTime (a, b) {
                return Date.parse(b.happenTime.replace(/-/g,"/"))-Date.parse(a.happenTime.replace(/-/g,"/"));
            },
        	// 获取数据。
            fetchData (oData) {
                oData.error = null;
                oData.data = [];
                oData.height = this.adjustHeight();
                oData.loading = true;
				
                let sPath = oData.url;

                this.$register.sendRequest(this.$store, this.$ajax, sPath, "post", fnP.parseQueryParam(this.$route.query), (oResult) => {
					
					// 请求成功。
                    oData.loading = false;	
                   
                   // 数据处理- 排序， 索引
                   	let aResult = oResult.sort(this.sortByTime),
                   		aColumns = this.getColumns()
                   	
                   	aResult = oResult.map((o, n) => {
                    	return Object.assign({}, o, {
                    		index: n+1
                    	})
                    })
                   	
                   	
                    // 判断是否需要moldCode列， 数据全为null时隐藏
					let isMold = aResult.some( o => o.moldCode)      
                    
                    if(!isMold) {
                    	// 修改该列隐藏。
                    	aColumns.filter( o => o.field === 'moldCode')[0].hide = true;
                    }
                    
					oData.data = aResult;
					oData.columns = aColumns;
                    
				}, (sErrorMessage) => {
					// 请求失败。
					oData.loading = false;
					// 提示信息。
					console.log(sErrorMessage);
				}, (err) => {
					// 请求错误。
					oData.loading = false;
					console.log("接口查询出错。");
                })
            },
            // 选中处理。
            setSession () {
            	let aSelected = [];
            	
            	this.gridData.selected.forEach(o => {
            		let oSelected = {};
            		// 解构赋值。
            		({ doId: oSelected.doId, barcode: oSelected.barcode, batchNo: oSelected.batchNo, productionMode: oSelected.productionMode, materialCode: oSelected.materialCode, bucketNo: oSelected.bucketNo} = o);
            			
            		aSelected.push(oSelected);
            	})
                    
                return {
                    length: this.gridData.data.length,
                    selected: aSelected,
                    filters: this.$route.query
                }
            },
            onTrack (event) {
                // 保存参数。
                if(this.gridData.data && this.gridData.selected.length) {
		            let oReportFilter = this.setSession(),
		                tag = new Date().getTime().toString().substr(-5);// 生成唯一标识。
		        	            	
		        	sessionStorage.setItem("track_" + tag, JSON.stringify(oReportFilter));
//		            window.open("track/index.html?tag="+tag);  
					window.open("trackIndex.html?tag="+tag);
				}else {
					this.$message("没有数据追踪");
				}
            },
            onReport (event) {
            	// 当gridData.data 为null时处理
            	if(this.gridData.data && this.gridData.selected.length) {
	            	let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
	            		oReportFilter = this.setSession();
	            	
	            	sessionStorage.setItem("fastReport_" + tag, JSON.stringify(oReportFilter));
//	          		window.open("track/report.html?tag="+tag);
	            	window.open("trackReport.html?tag="+tag);
            	}else {
            		this.$message("没有数据报告");
            	}
            }
        }
    }  
</script>

<style lang="less">
	.error {
		border: 2px solid #42AF8F;
	    padding: 20px 12px;
	    margin-bottom: 30px;
	    font-size: 14px;
	    color: red;
	}
</style>
