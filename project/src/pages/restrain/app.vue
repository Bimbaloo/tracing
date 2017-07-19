<template>
	<div id="app">
		<v-header></v-header>
		<el-tabs element-loading-text="拼命加载中"  type="border-card" class="search-tab" >
			<el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
			<el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
			<el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
			<el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
		</el-tabs>
	</div>
</template>


<script>
	import header from "components/header/header.vue"
	import panel from "components/panel/panel.vue"
	
	
	export default {
		// 页面组件。
		components: {
			"v-header": header,
			'v-panel': panel
		},
		// 页面数据。
		data() {
			return {}
		},
		// 计算属性。
		computed: {},
		// 创建时处理。mounted
		created() {},
		// 页面方法。
		methods: {}
		
	}
	
</script>
    					
<style lang="less">
	@green: #42af8f;
	@blue: #0099ff;
	@yellow: #fcc433;
	@red: #e86b59;
	@inVent: #00a656;
	
	body {
		background-color: #f2f2f2;
		font-size: 14px;
		overflow: hidden;
	}
	
	.el-button--text {
		border: 1px solid #42af8f;
		padding: 10px 15px;
	}
	
	.el-table .el-table__header thead tr th {
		
		background-color: @green;
		.cell {
			background-color: @green;
			color: #FFFFFF;
		}	
	}
	
	.domDown {
		position: absolute;
		z-index: 0;
	}
	.clone {
		position: absolute;
		z-index: -1;
		
		.isVis {
			visibility: hidden;
		}
		
		.table-title {
			text-align: center;
			/*margin: -25px 25px 25px;*/
			
			.title-text {
				font-size: 24px;
				margin-right: 10px;	
			}
			.title-subText {
				font-size: 16px;
				margin-left: 10px;
			}
		}
		.time-line;
		
		/*.item-node {
			.node-outer {
				border-radius: 0;
				.node-inner {
					border-radius: 0;
				}
			}
		}
		.sub-node {
			.node-outer {
				border-radius: 0;
				
				.node-inner {
					border-radius: 0;
				}
			}
		}*/
	}
	.resume-wraps {
		.resume-content-wrap {
			background-color: #FFFFFF;
			margin: 20px;
			
			&.full {
				margin: 0;
			}
			
			.resume-content {
				
				.filters {
					padding: 20px 20px 0;
					
					.el-form-item {
						display: inline-block;
						
						&.filters-code {
							width: 600px;
						}
					}
				}
				
				.line {
					width: 100%;
					height: 1px;
					background-color: #CCCCCC;
				}
				
				.resume-main {
					padding: 20px;
					
					.error {
						text-align: center;
					}
					
					.resume-handler {
						.resume-tabs {}
						.resume-icons {
							text-align: right;
							/*margin-top: -26px;*/
							color: @green;
							
							.resume-icon {
								cursor: pointer;
								margin-right: 10px;
								
								&:last-child {
									margin-right: 0;
								}
							}
						}
					}
					
					
					.resume-table,
					.resume-table-clone {
						
						.table-title {
							text-align: center;
							margin: -25px 25px 25px;
							
							.title-text {
								font-size: 24px;
								margin-right: 10px;	
							}
							.title-subText {
								font-size: 16px;
								margin-left: 10px;
							}
						}
						
						.table-main {
							
							.isVis {
								visibility: hidden;
							}
							
							.icon-down {
									transition: transfrom 1s linear;
									
								&.actived {
									transform: rotate(-180deg);
								}
							}
							.cell-info {
								&.actived {
									display: none;
								}
							}
							.table-item {
								padding: 10px;
								
								&.actived {
									display: none;
								}
							}
							
						}
					}
					
					.resume-timeLine {
						margin-top: 25px;
						color: #FFFFFF;
						/*height: 730px;*/
						overflow: auto;
						
						.time-line-content {
							.time-line;
						}
						
					}
					
					&.showDiff {
						background-image: url(../../assets/img/bg.jpg);
						/*background-color: #1d272f;*/
					}
					
				}
				
			}
			
		}
	}
	
	.time-line {
		padding: 20px 30px;
		
		.time-line-wrap {
			
			.line-item {
				color: @blue;
				font-size: 20px;
				/*display: flex;*/
				
				.item-date {
					display: inline-block;
					vertical-align: middle;
					/*width: 180px;*/
					padding: 0 25px;
					line-height: 40px;
					background: rgba(0,153,255,.3);
					border-radius: 20px;
				}
				.item-node {
					display: inline-block;
					vertical-align: middle;
					margin: 0 40px;
					
					&.bigSize {
						margin: 0 20px;
					}
				}
				.item-title {
					display: inline-block;
					vertical-align: middle;
					font-size: 24px;
				}
			}
			.item-line {
				width: 4px;
				height: 40px;
				background: @blue;
				position: relative;
				left: 216px;
				top: 0px;
			}
			.line-list {
				font-size: 18px;
				
				.list-sub {
					margin: 50px 0;
					display: flex;
					line-height: 24px;
					
					&.first {
						margin-top: 10px;
					}
					
					.sub-date {
						color: #CCCCCC;
						font-size: 16px;
						margin-left: 70px;
						
						&.last {
							margin-left: 74px;
						}
					}
					.sub-node {
						margin: 0 36px 0 70px;
					}
					.node-line {
						width: 4px;
						background: @blue;
						position: relative;
						left: 216px;
						top: 35px;
					}
					.sub-info {
						.sub-item {
							display: flex;
							
							.item-type {
								color: #fff;
								white-space: nowrap;
								margin-right: 4px;
								font-size: 20px;
							}
							.item-info {
								color: #e5e5e5;
							}
						}
						&.blue {
							.tips {
								color: @blue;
							}
						}
						&.yellow {
							.tips {
								color: @yellow;
							}
						}
						&.red {
							.tips {
								color: @red;
							}
						}
						&.green {
							.tips {
								color: @inVent;
							}
						}
					}
				}
			}
		}
						
		
	}
	
</style>