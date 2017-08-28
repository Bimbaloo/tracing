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
	                <v-table :table-data="gridData" :heights="gridData.height" :loading="gridData.loading" :resize="tdResize" :data-filter="dataFilter" v-if="!gridData.loading" ></v-table>
                    <v-table :table-data="gridData" :heights="gridData.height" :loading="gridData.loading" :resize="tdResize" :data-filter="dataFilter" v-show="gridData.loading" ></v-table>    
	            </div>   
	       </div>   
    	</div> 
    </div>
</template>

<script>
	import $ from "jquery"
    import table from "components/basic/table.vue"
	import fnP from "assets/js/public.js"
	import {host} from 'assets/js/configs.js'

    var HOST = window.HOST ? window.HOST: host
    	
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
                        width: "120",
                        sortable: true,
                        fixed: true
                    },{
                        prop: "processName",
                        name: "工序名称",
                        width: "120",
                        sortable: true
                    },{
                        prop: "processCode",
                        name: "工序编码",
                        width: "80",
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
                        prop: "modelName",
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
        	// 查询。
            fetchPage() {
            	this.fetchData(this.gridData);
            },
        	// 获取高度。
            adjustHeight() {
            	let jRouter = $(".router-content"),
            		jTable = jRouter.find(".content-table"),
            		nHeight = 0;
            	
//          	nHeight = Math.floor(jRouter.height() - (jTable.outerHeight(true) - jTable.height()));
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
		                
                this.$ajax.post(sPath, fnP.parseQueryParam(this.$route.query))
                .then((res) => {
                    oData.loading = false;
//					oData.height = this.adjustHeight();
					
                    if(!res.data.errorCode) {
                    	// 正常 0
                        oData.data = $.extend(true, [], res.data.data)
                        oData.data = oData.data.sort(this.sortByTime);
                    }else if(res.data.errorCode == "1"){
                    	// console 异常信息。
                    	console.warn(res.data.errorMsg.message);
                    }else {
                    	// 其他，显示异常信息。
                    	oData.error = res.data.errorMsg.message;
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
