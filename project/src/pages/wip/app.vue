<template>
	<div id="app" >
		<WipTitle :title="title" />
		
		<div class="main">
			<Banner :column-names="columns"
				@change-state="changeState" 
				@save-data="save"
				@search="searchByKeys" />
			
			<!-- 分页组件 -->
			<div class="block">
			    <el-pagination
			      	@size-change="handleSizeChange"
			      	@current-change="handleCurrentChange"
			      	:current-page="currentPage"
			      	:page-sizes="pageSizes"
			      	:page-size="pageSize"
			      	layout="total, sizes, prev, pager, next, jumper"
			      	:total="totalSize">
			    </el-pagination>
		  	</div>
			
			<WipTable :table-data="totalData" :column-names="columns" :loading="loading"
				@select-item="selectHandler" />
		</div>

	</div>
</template>

<script>
	import $ from 'jquery';
	import Banner from 'components/wip/banners.vue';
	import WipTable from 'components/wip/wipTable.vue';
	import WipTitle from 'components/wip/wipTitle.vue';
	import {host} from 'assets/js/configs.js'

	var HOST = window.HOST ? window.HOST: host	
    const url = HOST + '/api/v1/wip/prod';
    
    export default {
    	components: {
    		'WipTable': WipTable,
    		'Banner': Banner,
    		'WipTitle': WipTitle
    	},
    	data() {
    		return {
    			title: '标记异常在制品',
    			totalData: [],//总数据
    			selectedData: [],//被选中的数据
    			flag: true,//显示(true)或隐藏(false)
    			totalSize: 0,
    			pageSize: 25,
		      	pageSizes: [25, 50, 100],//每页显示行数
		        currentPage: 1,
		        columns: [
		        	{ label: '地点', value: 'address'},
		        	{ label: '工序', value: 'process'}, 
		        	{ label: '工序编码', value: 'processCode'},
		        	{ label: '生产设备', value: 'device'},
		        	{ label: '设备编码', value: 'deviceCode'},
		        	{ label: '生产人员', value: 'worker'},
		        	{ label: '人员编码', value: 'workerCode'},
		        	{ label: '生产时间', value: 'prodTime'},
		        	{ label: '生产班次', value: 'prodTurn'},
		        	{ label: '物料类型', value: 'materialType'},
		        	{ label: '批次号', value: 'batchId'},
		        	{ label: '条码', value: 'barCode'}
	        	],
	        	searchObj: null,
	        	loading: false,
	        	tableHeight: 0
    		}
    	},
    	created: function () {
    		this.getDataByPage();
    	},
    	methods: {
    		handleSizeChange(size) {//改变每页行数
	      		this.pageSize = size;
	      		this.getDataByPage();
	      	},
	      	handleCurrentChange(page) {//跳转页
	      		this.currentPage = page;
	      		this.getDataByPage();
	      	},
    		getDataByPage: function () {
    			this.loading = true;
    			const param = {
    				'page': this.currentPage - 1,
				   	'size': this.pageSize, 
				   	'flag': this.flag
    			};
    			if (this.searchObj) {
    				param.model = this.searchObj;
    			}
    			
    			this.$ajax.put(url, param).then(function (res) {
    				this.loading = false;
	    			if (res.errorCode) {
	    				console.log(res.errorMsg);
	    				return;
	    			}
	    			
	    			this.totalSize = res.data.data.total;
					this.totalData = res.data.data.list;
	    		}.bind(this));
    		},
    		changeState: function (state) {
    			this.flag = state;
    			this.getDataByPage();
    		},
    		openPrompt: function (code) {
				let msg = "保存成功!";
				let type = 'success';
				if (code) {
					msg = '保存失败，请检查数据!';
					type = 'error';
				}
				
				this.$message({
		          	showClose: true,
		          	message: msg,
		          	type: type,
		          	duration: 2000
		        });
			},
    		save: function () {
    			const params = {
    				'list': this.selectedData,
					'page': this.currentPage - 1, 
					'size': this.pageSize, 
					'flag': this.flag
    			};
    			this.$ajax.post(url, params).then(function (res) {
    				this.openPrompt(res.errorCode);
    				if (res.errorCode) {
	    				console.log(res.errorMsg);
	    				return;
	    			}
    				
    				this.totalSize = res.data.data.total;
					this.totalData = res.data.data.list;
    				this.selectedData = [];//保存成功，重置勾选数据
    			}.bind(this))
    			.catch(function (error) {
				    this.openPrompt(1);
			  	}.bind(this));
    		},
    		selectHandler: function (arr) {//勾选或修改备注时调用：添加到selectedData，在保存按钮触发时使用
    			const type = $.type(arr);
    			if (type === 'object') {
    				arr = [arr];
    			}
    			else if (!arr.length) {
    				return;
    			}
    			
    			const selectedArr = $.extend(true, [], this.selectedData);
    			const len = selectedArr.length;
    			arr.forEach(function (row) {
    				let exist = false;
    				for (let i = 0; i < len; i++) {
    					let obj = selectedArr[i];
    					if (row.id === obj.id) {
    						obj = row;
    						exist = true;
    						break;
    					}
    				}
    				if (!exist) {
    					selectedArr.push(row);
    				}
    			});
    			
    			this.selectedData = selectedArr;
    		},
    		searchByKeys: function (obj) {
    			this.searchObj = obj;
    			this.getDataByPage();
    		}
    	}
    }
</script>

<style>
	html, body {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
	#app {
		width: 100%;
		height: 100%;
	}
	.main {
		width: 90%;
		margin: 0 auto;
		background: #fff;
		border-radius: 5px;
		height: 90%;
		padding: 10px 28px 10px;
	}
	.block {
		margin: 20px 0;
	}
</style>