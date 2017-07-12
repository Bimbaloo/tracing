<template>
	<div id="app">
		<v-header></v-header>
		<el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading">
			<el-col  @click="goToInit" :xs="9" :sm="7" :md="6" :lg="4" :class="[{ collapsed: collapse }, 'nav']">
				<v-catalog @init="treeDataInit" :catalog-data="catalogData"></v-catalog>
			</el-col>
			<el-col :xs="collapse?24:15" :sm="collapse?24:17" :md="collapse?24:18" :lg="collapse?24:20" class="router" ref="router">
				<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapse=true"></i>
				<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="collapse=false"></i>
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
	import catalog from 'components/catalog/catalog.vue'
	
	import $ from 'jquery'
//	import {aoTestData} from './data'
	import fnP from "assets/js/public.js"
	
	export default {
		components: {
			'v-header': header,
			'v-tree': tree,
			'v-catalog': catalog
		},
		data() {
			return {
				// 页面加载中动画。
				fullscreenLoading: false,
				// 侧栏是否收缩。
				collapse: false,
				url: HOST + "/api/v1/trace/up/trace-info",
				treeData: {},
				catalogData: [],
				params: [],
				ajaxData: []
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
			// 重置路由。
			this.$router.push("/");
			let sSelected = sessionStorage.getItem("trace_" + this.query.tag);
			if(sSelected) {
				this.params = JSON.parse(sSelected);
			}
			
			// 加载数据。
			this.fetchData();
				
//			this.fullscreenLoading = true;
//		    setTimeout(() => {
//		    	this.fullscreenLoading = false;
//		    	
//				this.$store.commit({
//					type: "updateData",
//					data: fnP.parseTreeData()
////					data: aoTestData
//				});
//				
//				// 格式化数据。
//				this.treeData = this.parseTreeData();
//				this.catalogData = this.parseCatalogData();
//		    }, 1000)
		},
		mounted() {
		},
		methods: {
			/**
			 *  恢复数据。
			 */
			treeDataInit() {
				this.treeData = this.parseTreeData();
			},
			/**
			 * 设置面板高度。
			 * @return {void}
			 */
			setPanelHeight() {
			},
			fetchData() {
				this.fullscreenLoading = true;
				
				this.$ajax.post(this.url, {
					"startPointDtos": this.params
				}).then((res) => {
						this.fullscreenLoading = false;
						if(!res.data.errorCode) {
//							this.rawData = res.data;
							this.ajaxData = res.data.data;
							this.$store.commit({
								type: "updateData",
								data: fnP.parseTreeData(this.ajaxData)
							});
							if(!this.rawData.length) {
								this.$message.warning('查无数据。');
							} else {
								// 格式化数据。
								this.treeData = this.parseTreeData();
								this.catalogData = this.parseCatalogData();
							}
						} else {
							this.$message.error(res.data.errorMsg.message);
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
							to: oData.key//oData.name
						})
						
						oData.subProcess.forEach(o => {
							o.group = oData.key;
							o.type = oData.type;
							aoDiagramData.push(o);
							
							if(o.parent) {
								aoDiagramLinkData.push({
									from: o.parent,
									to: o.key //o.name
								})
							}
						})
					}else {
						aoDiagramData.push(oData);
						aoDiagramLinkData.push({
							from: oData.parent,
							to: oData.key//oData.name
						})
					}
				})
					
				return {
					node: aoDiagramData,
					link: aoDiagramLinkData
				};
			},
	
			/**
			 * 获取左侧目录树数据。
			 * @return {void}
			 */
			parseCatalogData() {	
				let aoCopyData = [],
					aoCatalogData = [],
					oGroup = {},
					aCopy = $.extend(true, [], this.rawData); //Object.assign([], this.rawData)
		
				aCopy.forEach(oData => {
					if(oData.type != "1" && oData.subProcess && oData.subProcess.length) {
						oData.subProcess.forEach(o => {
							if(!o.parent) {
								o.parent = oData.parent;
							}
							o.type = oData.type;
							o.group = oData.key;
							aoCopyData.push(o);
							// 若当前节点在同一个group中无子节点，即为产线工序的最后一个节点
							if(oData.subProcess.every(sub => sub.parent != o.key)) {
								// 保存产线工序中的最后一个节点key。
								oGroup[oData.key] = o.key;
							}
							
						})
					}else {
						aoCopyData.push(oData);
					}
				})
				
				aoCopyData.map(o => {
					// 若节点的父节点为产线节点，则该节点的父节点重设为产线中的最后一个节点key。					
					if(oGroup[o.parent]) {
						return o.parent = oGroup[o.parent];
					}
				});
		
				for(let i = aoCopyData.length - 1; i >= 0; i--) {
					let oData = aoCopyData[i];

					if(oData.parent === "") {
						aoCatalogData.push(oData);

						aoCopyData.splice(i, 1);
						_findChildrenData(aoCopyData, oData.key, oData.key)
					}
				}

				return aoCatalogData;
				
				/**
				 * 递归查找子节点。
				 * @param {Array} aoCopyData
				 * @param {String} sKey
				 * @param {String} sParentKey
				 * @return {void}
				 */
				function _findChildrenData(aoCopyData, sKey, sParentKey) {
					for(let i = aoCopyData.length - 1; i >= 0; i--) {
						let oData = aoCopyData[i],
							sNewKey = "";

						if(oData && oData.parent === sKey) {
							oData.parent = sParentKey;
							aoCatalogData.push(oData);

							aoCopyData.splice(i, 1);

							if(oData.type != 1) {
								sNewKey = sParentKey;
							} else {
								sNewKey = oData.key;
							}

							if(aoCopyData.length) {
								_findChildrenData(aoCopyData, oData.key, sNewKey)
							}
						}
					}
				}
			},
			goToInit() {
				console.log(1)
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
</style>