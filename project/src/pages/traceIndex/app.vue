<template>
	<div id="app" @mousedown="dragstar($event)"  @mouseup="dragend($event)" @mousemove="onMouseMove($event)">
		<v-header :config="false" :back="false"></v-header>
		<!-- <el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading"> -->
		<div class="content" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="拼命加载中">
			<!-- <el-col  @click="goToInit" :xs="9" :sm="7" :md="6" :lg="4" :class="[{ collapsed: collapse }, 'nav']"> -->
			<div :style="{ flexBasis: reversedMessage+'px'}" :class="[{ collapsed: collapse }, 'nav']">	
				<v-catalog @init="treeDataInit" :catalog-data="catalogData"></v-catalog>
			</div>
			<!-- <div :xs="collapse?24:15" :sm="collapse?24:17" :md="collapse?24:18" :lg="collapse?24:20" class="router" ref="router"> -->
			<div  class="router">
				<div id='changeWidth' class='changeWidth'></div>
				<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapseTree"></i>
				<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="expandTree"></i>
				<div class="router-container" ref="routerContainer">
					<v-tree :tree-data="treeData" :class="{hide: fullscreen}" :style="{ flexBasis: _treeHeight+'px',flexGrow:_treeFullscreen}" @recoverSize="recoverTree"></v-tree>
					<div id='changeDiagram' :class="[{hide: treeFullscreen},{hide: fullscreen},'changeDiagram']"></div>
					<div class="view" ref="view" :class="{hide: treeFullscreen}">
						<router-view></router-view>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	import tree from 'components/tree/tree.vue'
	import catalog from 'components/catalog/catalog.vue'
	
	import $ from 'jquery'
	import fnP from "assets/js/public.js"

	export default {
		components: {
			'v-header': header,
			'v-tree': tree,
			'v-catalog': catalog
		},
		data() {
			return {
				/* 左右拖动功能添加属性 */
				_pageX:null,          //鼠标的横向位置
				changeWidth:0,        //改变的宽度
				LayoutLeftWidth: 325, //默认宽度
				draggingX: false,	  //左右拖动功能启动
				// resizeUpdate:0,       //监听父集div大小改变更新左侧图形

				/* 上下拖动功能添加属性 */
				treeHeight:300,  	 // 默认高度tree组件高度
				draggingY: false,	 //上下拖动功能启动
				_pageY:null,     	 //鼠标的纵向位置
				changeHeight:0,  	 //改变的高度
				// resizeUpdateY:0,     //监听父集div大小改变更新右边上半部(tree)

				// 页面加载中动画。
				fullscreenLoading: false,
				// 侧栏是否收缩。
				collapse: false,
				url: HOST + "/api/v1/trace/up/trace-info",
				treeData: {},
				catalogData: [],
				params: []
			}
		},
		computed: {
			resizeUpdate () {
		    	return this.$store.state.resize
		    },
		    resizeUpdateY () {
		    	return this.$store.state.resizeY
		    },
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
		    // 表格数据全屏。
			fullscreen () {
		    	return this.$store.state.fullscreen
		    },
		   	// 树的数据全屏。
		   	treeFullscreen () {
		   		return this.$store.state.treeFullscreen
		   	},
			reversedMessage() {
				let _width = this.LayoutLeftWidth+this.changeWidth
				return _width
			  },
			_treeFullscreen() {
				if(!!this.treeFullscreen){
					return 1
				}else{
					return 0
				}
			},
			_treeHeight() {
				let _height = this.treeHeight+this.changeHeight
				return _height
			}
		},
		created() {
			// 登录验证。
			this.$register.login(this.$store);

			// 组件创建完后获取数据
			// 此时 data 已经被 observed 了
			// 重置路由。
			if(window.screen.availHeight>1000){   // 根据屏幕分辨率设置 上半部默认高度
				this.treeHeight = 300
			}else {
				this.treeHeight = 155
			}

			this.$router.replace("/");
			let sSelected = sessionStorage.getItem("trace_" + this.query.tag);
			if(sSelected) {
				this.params = JSON.parse(sSelected);
			}
			
			// 加载数据。
			this.fetchData();
		},
		mounted() {
		},
		methods: {
			/**
			 *  恢复数据。
			 */
			treeDataInit() {
				this.treeData = this.parseTreeData();
				// 重置路由。
				this.$router.replace("/");

			},
			/**
			 * 设置面板高度。
			 * @return {void}
			 */
			setPanelHeight() {
			},

			// // 判断调用接口是否成功。
			// judgeLoaderHandler(param, fnSu, fnFail) {
			// 	let bRight = param.data.errorCode;
				
			// 	// 判断是否调用成功。
			// 	if(!bRight) {
			// 		// 调用成功后的回调函数。
			// 		fnSu && fnSu(param.data.data);
			// 	}else {
			// 		// 提示信息。
			// 		console.warn(param.data.errorMsg.message);
			// 		this.showMessage();
			// 		// 失败后的回调函。
			// 		fnFail && fnFail();
			// 	}
			// },	
			showMessage() {
				this.$alert('查无数据', '提示', {
					type: 'warn'
				});
			},
			// 请求成功。
			requestSucess(oData) {
				this.fullscreenLoading = false;
				if(!oData.length) {
					console.log('查无数据。');
					this.showMessage();
					// this.$message.warn('查无数据。');
				} else {
					this.$store.commit({
						type: "updateData",
						data: oData		//fnP.parseTreeData(data)
					});
					// 格式化数据。
					this.treeData = this.parseTreeData();
					this.catalogData = this.parseCatalogData();
				}							
			},
			// 请求失败。
			requestFail(sErrorMessage) {
				this.fullscreenLoading = false;
				// 提示信息。
				console.warn(sErrorMessage);
				this.showMessage();
			},
			// 请求错误。
			requestError(err) {
				console.log(err)
				this.fullscreenLoading = false;
				console.warn('查询出错！')
				this.showMessage();
			},
		
			fetchData() {
				this.fullscreenLoading = true;
				
				this.$register.sendRequest(this.$store, this.$ajax, this.url, "post", {
					"startPointDtos": this.params
				}, this.requestSucess, this.requestFail, this.requestError)
				// this.$ajax.post(this.url, {
				// 	"startPointDtos": this.params
				// }).then((res) => {
				// 	this.fullscreenLoading = false;
				// 	this.judgeLoaderHandler(res, (data) => {
				// 		if(!data.length) {
				// 			console.log('查无数据。');
				// 			this.showMessage();
				// 			// this.$message.warn('查无数据。');
				// 		} else {
				// 			this.$store.commit({
				// 				type: "updateData",
				// 				data: data		//fnP.parseTreeData(data)
				// 			});
				// 			// 格式化数据。
				// 			this.treeData = this.parseTreeData();
				// 			this.catalogData = this.parseCatalogData();
				// 		}						
				// 	})
				// })
				// .catch((err) => {
				// 	console.log(err)
				// 	this.fullscreenLoading = false;
				// 	console.warn('查询出错！')
				// 	this.showMessage();
				// })
			},
			
			/**
			 * 设置右侧图表树结构数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseTreeData1() {
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
			 * 设置右侧图表树结构数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseTreeData() {		
				let aoData = fnP.parseTreeData(this.rawData),		//this.rawData,
					aoDiagramData = [],
					aoDiagramLinkData = [];
				
				aoData.forEach(oData => {	
					// 树节点。		
					if(oData.isMaterialNode) {
						// 若为物料节点。
						oData.category = "simple";
					}else {
						// 若为工序节点。
						if(oData.isGroup) {
							// 若为group
							let oLastGroupItem = aoData.filter(o => oData.key === o.group).sort((a, b) => a.processSeq < b.processSeq)[0]
							if(oLastGroupItem) {
								// 取最后一道工序的产出。
								oData.processInfoList = oLastGroupItem.processInfoList
							}
						}
						if(oData.processInfoList.length) {
							// 有数据。
							oData.materialName = oData.processInfoList[0].materialName;
						}
						oData.category = "simple";
					}	
					
					aoDiagramData.push(oData);
					let aoParents = oData.parents.split(",");
					aoParents.forEach( sParent => {
						aoDiagramLinkData.push({
							from: sParent,
							to: oData.key,
							fromPort: "FROM",
							toPort: "TO"
						});
					});

					// // 注释节点。
					// if(oData.isMaterialNode && oData.materialInfoList.length) {
					// 	// 若为物料，且有数据。
					// 	aoDiagramData.push({
					// 		key: oData.key + "comment",
					// 		items: oData.materialInfoList.map(o => {
					// 			return {
					// 				batch: o.batchNo || '-', 
					// 				sum: o.sumQuantity
					// 			}
					// 		}),
					// 		category: "materialComment"
					// 	})
					// 	aoDiagramLinkData.push({
					// 		from: oData.key,
					// 		to: oData.key + "comment",
					// 		category: "Comment"
					// 	});
					// }else if(oData.processInfoList.length){
					// 	// 若为工序，且有数据。
					// 	aoDiagramData.push({
					// 		key: oData.key + "comment",
					// 		material: oData.processInfoList[0].materialName || '-',
					// 		items: oData.processInfoList.map(o => {
					// 			return {
					// 				equipment: o.equipmentName || '-',
					// 				batch: o.batchNo || '-', 
					// 				sum: o.sumQuantity
					// 			}
					// 		}),
					// 		category: "processComment"
					// 	})
					// 	aoDiagramLinkData.push({
					// 		from: oData.key,
					// 		to: oData.key + "comment",
					// 		category: "Comment",
					// 		fromPort: "TEXTBLOCK",
					// 		toPort: "COMMENT"
					// 	});
					// }
				})		
				return {
					node: aoDiagramData,
					link: aoDiagramLinkData
				}
			},
	
		
			/**
			 * 获取左侧目录树数据。
			 * @return {Array}
			 */
			parseCatalogData() {	
				let aoCatalogData = [],
					aoCopyData = $.extend(true, [], this.rawData); //Object.assign([], this.rawData)
						
				for(let i = aoCopyData.length - 1; i >= 0; i--) {
					let oData = aoCopyData[i];

					if(oData && oData.parents === "") {
						oData.parent = "";
						aoCatalogData.push(oData);

						aoCopyData.splice(i, 1);
						_findChildrenData(aoCopyData, oData.key, oData.key)
					}
				}

				// 返回数据。
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

						if(oData && oData.parents.split(",").includes(sKey)) {
							// 当前元素的子级。
							oData.parent = sParentKey;
							aoCatalogData.push(oData);
							
							aoCopyData.splice(i, 1);
							
							if(oData.isMaterialNode) {
								sNewKey = oData.key;
							}else {
								sNewKey = sParentKey;
							}
							
							if(aoCopyData.length) {
								_findChildrenData(aoCopyData, oData.key, sNewKey)
							}
						}
					}
				}
			},
			// 收缩左侧树。
			collapseTree() {
				this.collapse = true;
				this.$store.commit({
					type: "updateResize",
					key: 0
				});
			},
			expandTree() {
				this.collapse = false;
				this.$store.commit({
					type: "updateResize",
					key: this.LayoutLeftWidth
				});
			},
			/* 拖动功能 */
			dragstar(e){   //鼠标按下，开始拖动
				if(e.target.id === 'changeWidth'){
					this.LayoutLeftWidth = this.reversedMessage
					this.changeWidth = 0
					this.draggingX = true;
					this._pageX = e.pageX
					if(this.collapse){
						this.collapse = false
					}
				}else if(e.target.id === 'changeDiagram'){
					this.treeHeight = this._treeHeight
					this.changeHeight = 0
					this.draggingY = true;
					this._pageY = e.pageY
				}
			},
			dragend(e){ //鼠标松开，结束拖动
				this.draggingX = false  //关闭拖动功能
				this.draggingY = false  //关闭拖动功能
				// this.resizeUpdate = this.reversedMessage //改变 changeWidth 的值，触发 canvas 大小更新
				this.$store.commit({
					type: "updateResize",
					key: this.reversedMessage
				});
			},
			onMouseMove(e){ //拖动过程
				if(this.draggingX){
					this.changeWidth = e.pageX-this._pageX
				}else if(this.draggingY){
					this.changeHeight = e.pageY-this._pageY
					// this.resizeUpdateY = this._treeHeight //改变 resizeUpdateY 的值，触发 canvas 大小更新
					this.$store.commit({
						type: "updateResizeY",
						key: this._treeHeight
					});
				}
				
			},
			/* tree组件恢复默认大小 */
			recoverTree(){  
				this.changeHeight = 0
			}  
		},
		watch: {
			_treeHeight: function () {
				let viewHeight = document.querySelector(".router").offsetHeight
				let	maxTreeHeight = viewHeight - 40 -20 -100  
				if(this._treeHeight > maxTreeHeight && !this.treeFullscreen){  //底部内容不得小于100px
					this.treeHeight = maxTreeHeight
					this.changeHeight = 0

				}else if(this._treeHeight < 130 && !this.treeFullscreen){      //顶部内容不得小于130px
					this.treeHeight = 130
					this.changeHeight = 0
				}
			},
			reversedMessage: function(){
				if(this.reversedMessage < 50 && !this.collapse){  //左边内容不得小于50px
					this.LayoutLeftWidth = 50
					this.changeWidth = 0

				}
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
			display:flex;
			.changeWidth {
				position: absolute;
				left: -1px;
				color: #42AF8F;
				cursor: e-resize;
				width:20px;
				//background-color:rgba(0,0,0,0.1);
				height:100%;
				top:0;
				z-index:2
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
			//	flex-grow: 1;
				flex: 1 1 auto;
				.btn-collapse {
					position: absolute;
					left: 2px;
					top: 50%;
					color: #42AF8F;
					font-weight: bold;
					font-size: 16px;
					z-index:3;
					cursor: pointer;
				}
			}
			.router-container {
				/*border: 1px solid #ccc;
		        background-color: #fff;
		        padding: 0 20px;*/
				box-sizing: border-box;
				//width: 100%;
				//height: 100%;
				position: absolute;
				left: 20px;
				right: 20px;
				top: 20px;
				bottom: 20px;
				/*overflow: auto;*/
				display: flex;
				flex-direction: column;
				.diagram {
					border: 1px solid #ccc;
					box-sizing: border-box;
					background-color: #fff;
					/*flex: 0 400px;*/
					flex: 1 1;
					//margin-bottom: 20px;

					&.hide {
						display: none;
					}
				}
				.changeDiagram {
					//background-color: #fff;
					width: 100%;
    				height: 10px;
    				flex-basis: 20px;
					z-index: 3;
					cursor:n-resize;
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
					// overflow: auto;
					position: relative;
					height: 50px;
					
					&.hide {
						display: none;
					}
				}
			}
		}
	}
</style>