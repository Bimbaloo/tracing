<template>
	<div id="app" class="report-wrapper">
		<div class="report-container">		
			<h1 class="title">遏制报告</h1>
			<h2 class="content-title">查询条件</h2>
			<div class="condition">
				<div class="condition-line"><span>遏制人：{{nickname}}</span><span>遏制时间：{{new Date().Format("yyyy-MM-dd hh:mm:ss")}}</span><span>遏制描述：{{params.description}}</span></div>
				<div class="condition-line"><span>物料编码：{{params.materialCode}}</span><span>批次：{{params.batchNo}}</span></div>
			</div>
			<v-report :hasData="setWidth" :noData="removeWidth"></v-report>
		</div>
  	</div>
</template>

<script>
	import report from "components/report/report.vue"

	export default {
		components: {
			'v-report': report
		},
		data() {
			return {
				styleObject: {
					"min-width": "1200px"
				}
			}
		},
		computed: {
			nickname: function() {
				return this.$store.state.loginModule.nickname;
			},
			params: function() {
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
			this.$register.login(this.$store);
		},
		methods: {
			setWidth() {
				this.styleObject.minWidth = "1200px";
			},
			removeWidth() {
				this.styleObject.minWidth = 0;
			}
		}
	}
</script>

<style lang="less">
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
		box-sizing: border-box;
		
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
	}

</style>