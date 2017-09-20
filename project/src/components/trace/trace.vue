<template>
    <div class="post">
    	<h2 class="content-title">查询结果集</h2>
    	<el-button class="btn btn-plain" @click="onTrace">溯源</el-button>
        <div class="router-content" ref="routerContent">
	        <div class="innner-content">
	            <div v-if="gridData.error" class="error" style="margin-top: 10px;">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table">
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
                    url: HOST + "/api/v1/trace/up/start-points",
                    loading: false,
                    error: null,
                    height: "200",
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
//			    		overlayNoRowsTemplate: "暂无数据",
			    		columnDefs: this.getColumns()
		            },
                    data: []
                }
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
        	// 获取显示列
        	getColumns() {
        		return [{
	    			width: 30, 
	    			// 该列为checkbox
	                checkboxSelection: true,
	                // 开启表头checkbox
	                headerCheckboxSelection: true,
	                // 固定
	                pinned: true,
	                // 不支持sort
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
                },{
                    field: "processName",
                    headerName: "工序名称",
                    width: 120
                },{
                    field: "processCode",
                    headerName: "工序编码",
                    width: 80
                },{
                    field: "equipmentName",
                    headerName: "设备名称",
                    width: 120
                },{
                    field: "equipmentCode",
                    headerName: "设备编码"
                },{
                    field: "modelName",
                    headerName: "设备类型"
                },{
                    field: "moldCode",
                    headerName: "模号"
                },{
                    field: "batchNo",
                    headerName: "批次号",
                    width: 150
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
                },{
                    field: "quantity",
                    headerName: "数量",
                    width: 50
                },{
                    field: "happenTime",
                    headerName: "加工时间",
                    width: 160
//                  sort: 'asc'
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
                    oData.data = oData.data.sort(this.sortByTime);		   
					oData.data = oResult.map((o, n) => {
                    	return Object.assign({}, o, {
                    		index: n+1
                    	})
                    })
					
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
            onTrace (event) {
            	if(this.gridData.data && this.gridData.selected.length) {
	            	let aSelected = [];
	            	this.gridData.selected.forEach(o => {
	            		let oSelected = {};
	            		// 解构赋值。
//	            		({ batchNo: oSelected.batchNo,materialName:oSelected.materialName,materialCode: oSelected.materialCode, bucketNo: oSelected.bucketNo} = o);
	            		({doId: oSelected.doId} = o);
	            		
	            		aSelected.push(oSelected);
	            	})
	
	            	let tag = new Date().getTime().toString().substr(-5);// 生成唯一标识。
	            	
	            	sessionStorage.setItem("trace_" + tag, JSON.stringify(aSelected));
	            	window.open("traceIndex.html?tag="+tag);
            	}else {
            		this.$message("没有数据溯源");
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
