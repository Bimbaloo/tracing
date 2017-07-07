<template>
	<div id="app">
		<v-header></v-header>
		<el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading">
			<el-col class="router" ref="router">
				<div @mouseenter="showTable" @mouseleave="unShowTable" v-if="!fullscreen">
					<i class="icon icon-20 icon-balance"></i>
					<transition name="slide-fade">
						<el-table :data="tableData" border style="width:305px" id='table' v-if="show">
							<el-table-column prop="process" label="工序" width="61">
							</el-table-column>
							<el-table-column prop="ok" label="合格数" width="61">
							</el-table-column>
							<el-table-column prop="ng" label="不合格数" width="61">
							</el-table-column>
							<el-table-column prop="scrap" label="报废数"   width="60">
							</el-table-column>
							<el-table-column prop="delay" label="滞留数"   width="60">
							</el-table-column>
						</el-table>
					</transition>
				</div>
				<i class="icon icon-20 icon-report" @click="onReport" title="快速报告" v-if="!fullscreen"></i>
				<div class="router-container" ref="routerContainer">
					<v-tree :tree-data="treeData" :class="{hide: fullscreen}"></v-tree>
					<div class="view" ref="view">
						<router-view></router-view>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	import tree from 'components/tree/tree.vue'	
	import {aoTestData} from './data'

	export default {
		components: {
			'v-header': header,
			'v-tree': tree,
		},
		data() {
			return {
				// 页面加载中动画。
				fullscreenLoading: false,
				url: "/track/track-main",
				treeData: {},
				params: [],
				show: false,
                tableData: [],
				filter: {}
			}
		},
		computed: {
			query () {
				let url = location.search; //获取url中"?"符后的字串 
				let oRequest = {};
				if(url.indexOf("?") != -1) {
					let strs = url.substr(1).split("&");

					for(let i = 0; i < strs.length; i++) {
						oRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
					}
				}
				return oRequest;
			},		    
			rawData () {
		    	return this.$store.state.rawData
		    },
			fullscreen () {
		    	return this.$store.state.fullscreen
		    }
		},
		created() {
			// 组件创建完后获取数据
			// 此时 data 已经被 observed 了
			let oFilter = sessionStorage.getItem("track_" + this.query.tag);
			if(oFilter) {
				this.filter = JSON.parse(oFilter);
				this.params = oFilter.selected;		
			}

			// 加载数据。
//			this.fetchData();	
			this.fullscreenLoading = true;
		    setTimeout(() => {
		    	this.fullscreenLoading = false;
		    	
				this.$store.commit({
					type: "updateData",
					data: aoTestData
				});

				// 格式化数据。
				this.treeData = this.parseTreeData();
				this.tableData = this.parseTableData();
		    }, 1000)
		},
		mounted() {
			// this.$refs.view.style.height = this.$refs.view.clientHeight + "px"
		},
		methods: {
			/**
			 * 设置面板高度。
			 * @return {void}
			 */
			setPanelHeight() {
				let self = this;
				
				debugger
				
			},
			fetchData() {
				this.fullscreenLoading = true;
				
				this.$get(this.url, this.params)
					.then((res) => {
						this.fullscreenLoading = false;
						if(!res.errorCode) {
//							this.rawData = res.data;
							this.$store.commit({
								type: "updateData",
								data: res.data
							});
							if(!this.rawData.length) {
								this.$message.warning('查无数据。');
							} else {
								// 格式化数据。
								this.treeData = this.parseTreeData();
								this.catalogData = this.parseCatalogData();
								this.tableData = this.parseTableData();
							}
						} else {
							this.$message.error('查询出错！');
						}
					})
					.catch((err) => {
						this.fullscreenLoading = false;
						this.$message.error('查询出错！');
					})
			},

			/**
			 * 设置右侧图表树结构数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseTreeData() {
				let aoData = this.rawData,
					aoDiagramData = [],
					aoDiagramLinkData = [],
					oGroup = {};
				
				aoData.forEach(oData => {
					if(oData.type != "1" && oData.subProcess && oData.subProcess.length) {
						let oGroup = Object.assign({}, oData);
						delete oGroup.subProcess;
						oGroup.isGroup = true;
						
						aoDiagramData.push(oGroup);
						aoDiagramLinkData.push({
							from: oData.parent,
							to: oData.name
						})
						
						oData.subProcess.forEach(o => {
							o.group = oData.key;
							o.type = oData.type;
							aoDiagramData.push(o);
							
							if(o.parent) {
								aoDiagramLinkData.push({
									from: o.parent,
									to: o.name
								})
							}
						})
					}else {
						aoDiagramData.push(oData);
						aoDiagramLinkData.push({
							from: oData.parent,
							to: oData.name
						})
					}
				})
					
				return {
					node: aoDiagramData,
					link: aoDiagramLinkData
				};
			},			
			parseTableData() {			
				let aoData = this.rawData
				let _rawData = []
				aoData.forEach(oData => {
					if(oData.type === "2") {
						_rawData.push({
							"process":oData.process,
							"ok": oData.ok,
							"ng": oData.ng,
							"scrap": oData.scrap,
							"delay": oData.delay,
						})
					}
				})
				return 	_rawData
				
			},
			/* 是否展示 */
			showTable(){
				this.show = true
			},
			unShowTable(){
				this.show = false
			},
			/**
			 * 生成快速报告。
			* @param {Object} event
			* @returns {void}
			 */
            onReport (event) {
            	let tag = new Date().getTime().toString().substr(-5);// 生成唯一标识。      	
            	sessionStorage.setItem("fastReport_" + tag, JSON.stringify(this.filter));
            	window.open("report.html?tag="+tag);
            }
		}
	}
</script>

<style lang="less">
	html,
	body {
		height: 100%;
	}
	
	body {
		background-color: #f2f2f2;
		font-family: 微软雅黑;
		color: #333;
		font-size: 14px;
		overflow: hidden;
	}
	
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		.content {
			flex: 1;
			.icon-balance {
				position: absolute;
				left: 40px;
				top: 35px;
				z-index: 10
			}
			.nav {
				border-right: 1px solid #ccc;
				box-sizing: border-box;
				height: 100%;
				background-color: #2e3840;
				
				&.collapsed {
					display: none;
				}
			}
			.router {
				padding: 20px;
				box-sizing: border-box;
				height: 100%;
				position: relative;
				.btn-collapse {
					position: absolute;
					left: 2px;
					top: 50%;
					color: #42AF8F;
					font-weight: bold;
					font-size: 16px;
					cursor: pointer;
				}
			}
			.router-container {
				/*border: 1px solid #ccc;
		        background-color: #fff;
		        padding: 0 20px;*/
				box-sizing: border-box;
				width: 100%;
				height: 100%;
				/*overflow: auto;*/
				display: flex;
				flex-direction: column;
				.diagram {
					border: 1px solid #ccc;
					box-sizing: border-box;
					background-color: #fff;
					flex: 0 400px;
					margin-bottom: 20px;

					&.hide {
						display: none;
					}
				}
				.view {
					border: 1px solid #ccc;
					// box-sizing: border-box;
					background-color: #fff;
					flex: 1 1;
					padding: 0 20px;
					overflow: auto;
					position: relative;
					height: 50px;
				}
			}
		}
	}
	// 快速报告。
	.icon-report {
		position: absolute;
		cursor: pointer;
		z-index: 100;
		right: 120px;
		top: 40px;
	}

	#table {
		font-size: 12px;
		position: absolute;
		left: 70px;
		top: 40px;
		z-index: 5;
		.cell{
			text-align: center;
			padding-left: 0;
			padding-right: 0;
		}
		th {
			height: 24px;
			border-color: #fff
		}
		td {
			height: 24px;
			border-color: #fff
		}
		thead {
			.cell {
				background-color: #ff9900;
				color: #fff
			}
		}
		tbody {
			.cell {
				background-color: #eaeef2;
				color: #666
			}
		}
		
	}

	.slide-fade-enter-active {
		transition: all .3s ease;
	}

	.slide-fade-leave-active {
		transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
	}

	.slide-fade-enter,
	.slide-fade-leave-active {
		transform: translateX(10px);
		opacity: 0;
	}

	
</style>