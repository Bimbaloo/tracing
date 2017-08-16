<template>
    <div class="post">
    	<h2 class="content-title">查询结果集</h2>
    	<el-button class="btn btn-plain" @click="onTrace">溯源</el-button>
        <div class="router-content">
	        <div class="innner-content">
	            <div v-if="gridData.error" class="error" style="margin-top: 10px;">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table">
	                <v-table :table-data="gridData" :heights="gridData.height" :loading="gridData.loading" :resize="tdResize" :data-filter="dataFilter"></v-table>    
	            </div>   
	       </div>   
    	</div> 
    </div>
</template>

<script>
	import $ from "jquery"
    import table from "components/basic/table.vue"
	
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
                    height: "100%",
                    selected: [],
                    columns: [{
                        prop: "bucketNo",
                        name: "",
                        type: "selection",
                        width: "30",
                        fixed: true
                    },{
                        type: "index",
                        name: "序号",
                        width: "50",
                        fixed: true
                    },{
                        prop: "barcode",
                        name: "条码",
                        sortable: true,
                        fixed: true
                    },{
                        prop: "processName",
                        name: "工序名称",
                        width: "120",
                        sortable: true
                    },{
                        prop: "equipmentName",
                        name: "设备名称",
                        width: "120",
                        sortable: true
                    },{
                        prop: "equipmentCode",
                        name: "设备编码",
                        sortable: true
                    },{
                        prop: "equipmentType",
                        name: "设备类型",
                        sortable: true
                    },{
                        prop: "moldCode",
                        name: "模号",
                        sortable: true
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        width: "150",
                        sortable: true
                    },{
                        prop: "materialCode",
                        name: "物料编码",
                        sortable: true
                    },{
                        prop: "materialName",
                        name: "物料名称",
                        width: "300",
                        sortable: true
                    // },{
                    //     prop: "materialSpec",
                    //     name: "物料规格"
                    },{
                        prop: "materialUnit",
                        name: "单位",
                        width: "50",
                        sortable: true
                    },{
                        prop: "quantity",
                        name: "数量",
                        width: "50",
                        sortable: true
                    },{
                        prop: "happenTime",
                        name: "加工时间",
                        width: "160",
                        sortable: true
                    },{
                        prop: "personName",
                        name: "操作人",
                        sortable: true
                    }],
                    data: []
                },
            }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
            this.fetchPage();
        },
        watch: {
        	// 如果路由有变化，会再次执行该方法
			'$route': 'fetchPage'
        },
        methods: {
        	// 查询。
            fetchPage() {
            	this.fetchData(this.gridData);
            },
        	// 获取高度。
            adjustHeight() {
            	let jRouter = $(".router-content"),
            		jTable = jRouter.find(".content-table"),
            		nHeight = 0;
            	
            	nHeight = Math.floor(jRouter.height() - (jTable.outerHeight(true) - jTable.height()));
            	
            	return nHeight;
            },
        	// 获取数据。
            fetchData (oData) {
                oData.error = null;
                oData.data = [];
                oData.loading = true;

                let sPath = oData.url;
                
                this.$ajax.post(sPath, this.$route.query)
                .then((res) => {
                    oData.loading = false;
					oData.height = this.adjustHeight();
					
                    if(!res.data.errorCode) {
                        oData.data = res.data.data;
//						if(oData.number > 1000) {
//							this.$alert("查询结果集包含" + oData.number + "条数据，页面显示其中1000条，如需查询全部，请缩小条件范围进行精确查詢。", "提示", {
//					          	confirmButtonText: "确定",
//					          	callback: action => {
//						            this.$message({
//						              type: "info"
//						            });
//					        	}
//					        });
//						}
                    }else {
//                  	oData.error = res.data.errorMsg.message;
                    	// 当前是由于数据过多的提示，则显示出来。
                    	let sError = res.data.errorMsg.message;
                    	if(sError == "记录数量超过了2000，请缩小查询范围") {
                    		oData.error = sError;
                    	}else {
                    		// 其他错误，则直接console
                    		console.log(sError);
                    	}
                    }
                })
                .catch((err) => {
                    oData.loading = false;
//                  oData.error = "查询出错。";
                    console.log("接口查询出错。")
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
