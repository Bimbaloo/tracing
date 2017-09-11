<template>
	<div id="app" @mousedown="dragstar($event)"  @mouseup="dragend($event)" @mousemove="onMouseMove($event)">
		<v-header></v-header>
		<!-- <el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading"> -->
		<div class="content" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="拼命加载中">
			<!-- <el-col class="router" ref="router"> -->
			<div  class="router" ref="router">
				<div @mouseenter="showTable" @mouseleave="unShowTable" v-if="false">  <!--!fullscreen-->
					<i class="icon icon-20 icon-balance"></i>
					<div class="table-line" v-if="show"></div>
					<transition name="slide-fade">
						<el-table :data="tableData" border style="width:305px" id='table' v-if="show">
							<el-table-column prop="process" label="工序" width="61">
							</el-table-column>
							<el-table-column prop="ok" label="合格数" width="61">
							</el-table-column>
							<el-table-column prop="ng" label="不合格数" width="61">
							</el-table-column>
							<el-table-column prop="scrap" label="报废数" width="60">
							</el-table-column>
							<el-table-column prop="delay" label="滞留数" width="60">
							</el-table-column>
						</el-table>
					</transition>
				</div>
				<i class="icon icon-20 icon-report" @click="onReport" title="快速报告" v-if="!fullscreen"></i>
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
//	import {aoTestData} from './data'
	import fnP from "assets/js/public.js"
	// import {host} from 'assets/js/configs.js'

	// var HOST = window.HOST ? window.HOST: host

	export default {
		components: {
			'v-header': header,
			'v-tree': tree,
		},
		data() {
			return {
				/* 上下拖动功能添加属性 */
				treeHeight:400,  	 // 默认高度tree组件高度
				draggingY: false,	 //上下拖动功能启动
				_pageY:null,     	 //鼠标的纵向位置
				changeHeight:0,  	 //改变的高度
				// resizeUpdateY:0,     //监听父集div大小改变更新右边上半部(tree)

				// 页面加载中动画。
				fullscreenLoading: false,
				url: HOST + "/api/v1/trace/down/trace-info",
				urlType: {
					barcode: "/by-equipment-barcode",
					batch: "/by-equipment-batch",
					time: "/by-equipment-time"
				},
				treeData: {},
				// params: [],
				show: false,
                tableData: [],
				// filter: {},
				// 起点集或查询条件。
				points: {},
				// tip: "暂无数据" 
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
			resizeUpdateY () {
		    	return this.$store.state.resizeY
		    },    
			rawData () {
		    	return this.$store.state.rawData
		    },
			fullscreen () {
		    	return this.$store.state.fullscreen
		    },
		    // 树的数据全屏。
		   	treeFullscreen () {
		   		return this.$store.state.treeFullscreen
		   	},

			// 上下拖动功能
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
			// 组件创建完后获取数据
			// 此时 data 已经被 observed 了
			// 重置路由。
			this.$router.replace("/");
			let oFilter = sessionStorage.getItem("track_" + this.query.tag);
			
			if(oFilter) {
				this.points = JSON.parse(oFilter);
				// this.filter = oAll.filters;
				// this.params = oAll.selected;	
			}
			// 加载数据。
			this.fetchData();	

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
			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param, fnSu, fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu(param.data.data);
				}else {
					// 提示信息。
					console.warn(res.data.errorMsg.message);
					this.showMessage();
					// 失败后的回调函。
					fnFail && fnFail();
				}
			},	
			showMessage() {
				this.$alert('查无数据', '提示', {
					type: 'warn'
				});
			},
			fetchData() {
				this.fullscreenLoading = true;
				
				let sType = this.urlType[this.points.type] || '',
					oParam =  {
					"startPointDtos": this.points.selected || []
				}
				
				if(sType) {
					// 若为溯源页面的跳转。
					oParam = Object.assign({}, this.points.keys)
					delete oParam.equipmentName
				} 
				
				this.$ajax.post(this.url + sType, oParam).then((res) => {
					this.fullscreenLoading = false;

					this.judgeLoaderHandler(res, (data) => {
						if(!data.length) {
							console.log('查无数据。');
							this.showMessage();
							// this.$message.warn('查无数据。');
						} else {
							this.$store.commit({
								type: "updateData",
								data: data		//fnP.parseTreeData(data)
							});
							// 格式化数据。
							this.treeData = this.parseTreeData();
							this.tableData = this.parseTableData();
						}						
					})
				})
				.catch((err) => {
					this.fullscreenLoading = false;
					console.warn('查询出错！')
					this.showMessage();
				})
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
							to: oData.key //oData.name	
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
							to: oData.key //oData.name
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

					// 物料或工序。 增加连接线。
					let aoParents = oData.parents.split(",");
					aoParents.forEach( sParent => {
						aoDiagramLinkData.push({
							from: sParent,
							to: oData.key
						});
					})

					
				})
					
				return {
					node: aoDiagramData,
					link: aoDiagramLinkData
				}
			},	
			parseTableData() {			
				let aoData = this.rawData
				let _rawData = []
				aoData.forEach(oData => {
					if(!oData.isMaterialNode) {
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
            	sessionStorage.setItem("fastReport_" + tag, JSON.stringify(this.points));
            	// window.open("report.html?tag="+tag);
				window.open("trackReport.html?tag="+tag);
            },

			/* 拖动功能 */
			dragstar(e){   //鼠标按下，开始拖动
				if(e.target.id === 'changeDiagram'){
					this.treeHeight = this._treeHeight
					this.changeHeight = 0
					this.draggingY = true
					this._pageY = e.pageY
				}

			},
			dragend(e){ //鼠标松开，结束拖动

				this.draggingY = false  //关闭拖动功能

			},
			onMouseMove(e){ //拖动过程
				if(this.draggingY){
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
				// .tip {
				// 	position: absolute;
				// 	top: 100px;
				// 	left: 100px;
				// }
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
	// 快速报告。
	.icon-report {
		position: absolute;
		cursor: pointer;
		z-index: 100;
		right: 225px;
		top: 30px;
	}
	.table-line {
		position: absolute;
		width: 20px;
		height: 131px;
		left: 60px;
		top: 36px;
		background-color: rgba(255,255,255,0);
		z-index: 10
	}
	#table {
		font-size: 12px;
		position: absolute;
		left: 80px;
		top: 36px;
		z-index: 5;
		border: 0;
		&::before {
			height: 0
		}
		&::after {
			width: 0
		}
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

	.el-dialog__headerbtn {
		background-color: transparent;
		border: none;
		outline: none;
	}
</style>