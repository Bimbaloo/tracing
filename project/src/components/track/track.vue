<template>
	<div class="post">
    	<h2 class="content-title">查询结果集</h2>
    	<div class="btn-wrapper">	
    		<el-button class="btn btn-plain" @click="onTrack">追踪</el-button>
    		<el-button class="btn btn-plain" @click="onReport">快速报告</el-button>
    	</div>
        <div class="router-content">
	        <div class="innner-content">
	            <div v-if="gridData.error" class="error" style="margin-top: 10px;">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table" >
	                <v-table :table-data="gridData" :heights="gridData.height" :loading="gridData.loading"></v-table>    
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
                gridData: {
                    url:  HOST + "/api/v1/trace/down/start-points",
                    loading: false,
                    error: null,
                    height: "100%",
                    selected: [],
                    columns: [{
                        prop: "bucketNo",
                        name: "",
                        type: "selection",
                        width: "30"
                    },{
//                      prop: "index",
                        type: "index",
                        name: "序号",
                        width: "50"
                    },{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        width: "150"
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名称",
                        width: "300"
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
                        name: "加工时间",
                        width: "160"
                    },{
                        prop: "personName",
                        name: "操作人"
                    },{
                        prop: "equipmentName",
                        name: "设备名称",
                        width: "120"
                    },{
                        prop: "equipmentCode",
                        name: "设备编码"
                    },{
                        prop: "equipmentType",
                        name: "设备类型"
                    },{
                        prop: "processName",
                        name: "工序名称",
                        width: "120"
                    },{
                        prop: "moldCode",
                        name: "模号"
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
                    	if(sError == "起点记录太多，请更换查询条件") {
                    		oData.error = sError;
                    	}else {
                    		// 其他错误，则直接console
                    		console.log(sError);
                    	}
                    }
                })
                .catch((err) => {
                    oData.loading = false;
//                  oData.error = "查询出错。"
                    console.log("接口查询出错。")
                })
            },
            setSession () {
            	let aSelected = [];
            	this.gridData.selected.forEach(o => {
            		let oSelected = {};
            		// 解构赋值。
            		({ batchNo: oSelected.batchNo,iokey: oSelected.iokey, productionMode: oSelected.productionMode, materialName: oSelected.materialName, materialCode: oSelected.materialCode, bucketNo: oSelected.bucketNo} = o);
            			
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
