<template>
	<div id="app">
		<v-header></v-header>
		<el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading">
			<el-col :xs="9" :sm="7" :md="6" :lg="4" :class="[{ collapsed: collapse }, 'nav']">
				<v-catalog :catalog-data="catalogData"></v-catalog>
			</el-col>
			<el-col :xs="collapse?24:15" :sm="collapse?24:17" :md="collapse?24:18" :lg="collapse?24:20" class="router">
				<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapse=true"></i>
				<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="collapse=false"></i>
				<div class="router-container" ref="routerContainer">
					<v-tree :tree-data="treeData"></v-tree>
					<div class="view">
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
	
	import {aoTestData} from './data'
	
	export default {
		components: {
			'v-header': header,
			'v-tree': tree,
			'v-catalog': catalog
		},
		data() {
			return {
				fullscreenLoading: false,
				// 侧栏是否收缩。
				collapse: false,
				url: "/trace/trace-main",
				rawData: [],
				treeData: {},
				catalogData: [],
				params: []
			}
		},
		computed: {
			query: function() {
				let url = location.search; //获取url中"?"符后的字串 
				let oRequest = {};
				if(url.indexOf("?") != -1) {
					let strs = url.substr(1).split("&");

					for(let i = 0; i < strs.length; i++) {
						oRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
					}
				}
				return oRequest;
			}
		},
		created() {
			// 组件创建完后获取数据
			// 此时 data 已经被 observed 了
			let sSelected = sessionStorage.getItem("trace_" + this.query.tag);
			if(sSelected) {
				this.params = JSON.parse(sSelected);
			}

			// 加载数据。
//			this.fetchData();	
			this.fullscreenLoading = true;
		    setTimeout(() => {
		    	this.fullscreenLoading = false;
				this.rawData = aoTestData;
				// 格式化数据。
				this.treeData = this.parseTreeData();
				this.catalogData = this.parseCatalogData();
		    }, 1000)
		},
		mounted() {
			
		},
		methods: {
			fetchData() {
				this.fullscreenLoading = true;
				
				this.$get(this.url, this.params)
					.then((res) => {
						this.fullscreenLoading = false;
						if(!res.errorCode) {
							this.rawData = res.data;
							if(!this.rawData.length) {
								this.$message.warning('查无数据。');
							} else {
								// 格式化数据。
								this.treeData = this.parseTreeData();
								this.catalogData = this.parseCatalogData();
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
					oTempData = {},
					oData = {},
					oGroup = {};

				for(let i = aoData.length - 1; i >= 0; i--) {
					oTempData = {};
					oData = aoData[i];

					oTempData.show_name = oData.show_name;
					oTempData.name = oData.name;
					oTempData.key = oData.name;
					oTempData.code = oData.code;
					oTempData.level = oData.level;
					oTempData.parent = oData.parent;
					oTempData.type = oData.type;

					let sGroup = oData.remark;
					oTempData.group = sGroup;

					// 获取子组
					aoData.forEach(oFilter => {
						if(oFilter.remark && oFilter.parent == oData.name && oFilter.remark != sGroup) {
							if(oTempData.childGroup) {
								oTempData.childGroup += ",";
							} else {
								oTempData.childGroup = "";
							}
							oTempData.childGroup += oFilter.remark;
						}
					})
					aoDiagramData.push(oTempData);

					if(sGroup) {
						// 产线型工序。
						if(!oGroup[sGroup]) {
							oGroup[sGroup] = [];
							aoDiagramData.push({
								show_name: sGroup,
								name: sGroup,
								key: sGroup,
								type: "3",
								isGroup: true
							})
						}

					}

					aoDiagramLinkData.push({
						from: oData.parent,
						to: oData.name
					})
				}
		
				return {
					node: aoDiagramData,
					link: aoDiagramLinkData
				};
			},

			/**
			 * 获取树形数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseCatalogData() {
			
				let aoData = this.rawData,
					aoCopyData = [],
					aoCatalogData = [];

				aoData.forEach(oData => {
					aoCopyData.push({
						"show_name": oData.show_name,
						"name": oData.name,
						"key": oData.name,
						"type": oData.type,
						"group": oData.remark,
						"parent": oData.parent
					})
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
//				this.$store.commit({
//					type: "updateCatalog",
//					catalog: this.catalog,
//					data: this.catalogData
//				});
				
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
					flex: 1 1;
					margin-bottom: 20px;
				}
				.view {
					border: 1px solid #ccc;
					box-sizing: border-box;
					background-color: #fff;
					flex: 1 1;
				}
			}
		}
	}
</style>