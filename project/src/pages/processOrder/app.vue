<template>
	<div id="app">
		<WipTitle :title="title" />
		
		<div class="main">
			<ProcessOrderTable :table-data="totalData" 
				@delete-by-id="deleteById"
				@save="save" />
		</div>
	</div>
</template>

<script>
	import $ from 'jquery';
	import ProcessOrderTable from 'components/wip/processOrderTable.vue';
	import WipTitle from 'components/wip/wipTitle.vue';
	import {host} from 'assets/js/configs.js'

	var HOST = window.HOST ? window.HOST: host
	const url = HOST + '/api/v1/wip/order';
    
    export default {
    	components: {
    		'ProcessOrderTable': ProcessOrderTable,
    		'WipTitle': WipTitle
    	},
    	data() {
    		return {
    			title: '设置工序顺序',
    			totalData: [],//总数据
    		}
    	},
    	created: function () {
    		this.$ajax.get(url).then(function (res) {
    			if (res.errorCode) {
    				console.log(res.errorMsg);
    				return;
    			}
    			
    			let arr = res.data.data || [];
    			if (arr.length) {
    				arr.forEach(function (item) {
    					item.flag = true;//更新的数据(update)
    				});
    			}
    			arr.push(this.createNewLine());
      			this.totalData = arr;
    		}.bind(this));
    	},
    	methods: {
    		createNewLine: function () {
    			return {
    				"id": 0,
					"location": null,
					"process": null,
					"processCode": null,
					"processOrder": null,
					"putType": null,
					"putOrder": null,
					"flag": false//新添加的数据(insert)
				}
    		},
    		addHandler: function (data) {
				data.flag = true;
				const arr = $.extend(true, [], this.totalData);
				arr.pop();
				this.totalData = arr.concat(data, this.createNewLine());
    		},
    		openPrompt: function (result) {//弹窗提示：后台交互状态
				let msg = '';
				let type = '';
				if (!result || result.errorCode) {
					msg = '操作失败，请检查数据!';
					type = 'error';
				}
				else {
					msg = result.data.message;
					type = result.data.state;
				}
				
				this.$message({
		          	showClose: true,
		          	message: msg,
		          	type: type,
		          	duration: 2000
		        });
			},
			callback: function (res, func) {
				const result = res.data;
				this.openPrompt(result);
				if (!result.errorCode && result.data && result.data.state !== 'error') {
					if (func && typeof func === "function" && result.data.item) {
						func(result.data.item);
					}
				}
			},
    		save: function (item) {
    			//将item入库 
    			if (!item) {
    				return;
    			}
    			
    			if (item.flag) {//update
    				this.$ajax.put(url, item)
	    				.then(function (res) {
	    					this.callback(res);
	    				}.bind(this))
	    				.catch(function (error) {
						    this.openPrompt();
					  	}.bind(this));
    			}
    			else {//insert
    				this.$ajax.post(url, item)
	    				.then(function (res) {
	    					this.callback(res, this.addHandler);
	    				}.bind(this))
	    				.catch(function (error) {
						    this.openPrompt();
					  	}.bind(this));
    			}
    		},
    		deleteFromTotalData: function (item) {//点击删除并请求成功时，从总数据中删除id相同的项
    			const arr = $.extend(true, [], this.totalData);
    			const len = arr.length;
				for (let i = 0; i < len; i++) {
					const obj = arr[i];
					if (obj.id === item.id) {
						arr.splice(i, 1);
						break;
					}
				}
				this.totalData = arr;
    		},
    		deleteById: function (item) {
    			if (!item.id) {
    				//清除当前行
    				const arr = $.extend(true, [], this.totalData);
					arr.pop();
					this.totalData = arr.concat(this.createNewLine());
				
    				const result = {
    					errorCode: 0,
    					data: {
    						message: '删除成功!',
							state: 'success'
						}
    				};
    				this.openPrompt(result);
    				return;
    			}
    			
    			this.$ajax.put(url + '/delete', item).then(function (res) {
    				this.callback(res, this.deleteFromTotalData);
    			}.bind(this))
    			.catch(function (error) {
				    this.openPrompt();
			  	}.bind(this));
    		}
    	}
    }
</script>

<style>
	#app {
		width: 100%;
		height: 100%;
		padding: 20px;
	}
	.main {
		width: 90%;
		margin: 0 auto;
		background: #fff;
		border-radius: 5px;
		height: 90%;
		padding: 10px 28px 10px;
		overflow: auto;
	}
</style>