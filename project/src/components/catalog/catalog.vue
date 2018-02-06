<template>
	<div id="catalog" style="height: 100%;"></div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import warehouse from 'assets/img/warehouse.png'
	import workshop from 'assets/img/workshop.png'
	import rework from 'assets/img/rework.png'
	import barcodeManage from 'assets/img/barcodeManage.png'
	import {onDoubleClickNode} from 'assets/js/go-util'

	const HIGHLIGHT_BG_COLOR = "#f5efdc";//"#fff";
	
	export default {
		props: {
			catalogData: Array,	//Object
			// resize:{
			// 	type: Number,
      		// 	required: false
			// }
		},
		data() {
			return {			
				catalog: null
			}
		},
		computed: {
			// 树形图是否放大。
			treeFullscreen () {
				return this.$store.state.treeFullscreen
			},
			resize () {
				return this.$store.state.resize
			},
			key () {
				return this.$store.state.key
			},
			chrome () {
				return this.$store.state.chrome
			},
			root () {
				return this.$store.state.root
			}, 
			type () {
				return this.$store.state.type
			},
		    // 版本信息数据。
			isOpDbBeforeRefact() {
				return this.$store.state.versionModule && this.$store.state.versionModule.isOpDbBeforeRefact
			}
		},
		mounted() {
			this.drawCatalog();
		},
		watch: {
		  // 如果 question 发生改变，这个函数就会运行
		  catalogData: function () {			
				this.catalog && (this.catalog.model = new go.TreeModel(this.catalogData));	
			},
			key: function() {
				if(this.type == "tree") {
					// 若点击树节点。
					this.setCatalogSelection();
				}
			},
			/* 外部父div大小变化，视图大小更新 */
			resize: 'updateCanvas'
		},
		methods: {
			// 根据节点类型 获取图标。
			getNodeIcon(sType) {
				switch(sType) {
					// 物料
					case "material":
						return material
						break;
					// 条码管理
					case "barcodeManage":
						return barcodeManage
						break;
					// 返工
					case "rework":
						return rework
						break;
					// 工序
					case "process":
						return process
						break;
					// 车间操作
					case "workshop":
						return workshop
						break;
					// 仓库操作
					case "warehouse":
						return warehouse
						break;
					default:
						break;
				}
			},
			/**
			 * 初始化左侧树。
			 * @return {void}
			 */
			drawCatalog() {				
				let $ = this.$;
					
				this.catalog =
					$(go.Diagram, 'catalog', {
						contentAlignment: go.Spot.TopLeft,
						allowZoom: false,
						allowMove: false,
						allowCopy: false,
						allowDelete: false,
						allowHorizontalScroll: true,
						allowVerticalScroll: true,
						hasHorizontalScrollbar: this.chrome,
						hasVerticalScrollbar: this.chrome,
						layout: $(go.TreeLayout, {
							alignment: go.TreeLayout.AlignmentStart,
							angle: 0,
							compaction: go.TreeLayout.CompactionNone,
							layerSpacing: 30,
							layerSpacingParentOverlap: 1,
							nodeIndent: 2,
							nodeIndentPastParent: 0.88,
							nodeSpacing: 0,
							setsPortSpot: false,
							setsChildPortSpot: false
						}),
						click: (e) => {
							// 更新高亮的数据。
//							this.$store.commit({
//								type: "updateHeighted",
//								data: []
//							})
//							this.$emit("init");
						}
					});

				this.catalog.nodeTemplate =
					$(go.Node, {
							// no Adornment: instead change panel background color by binding to Node.isSelected	            
							click: (e, node) => {
								// 溯源中虚构的物料节点不能点击
								if(node.data.isCustom) {
									// 其他节点取消选中
									this.catalog.nodes.each(o => {
										if(o.data.key != node.data.key) {										
											o.isSelected = false;
											o.background = null;
											o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
										}
									})
									
									return
								}
								
								let sNodeKey = node.data.linkKey || node.data.key
								this.catalog.nodes.each(o => {
									if(o.data.key != node.data.key) {										
										o.isSelected = false;
										o.background = null;
										o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
									}
								})
								
								let aRoot = [],
									aSublings = []
									
								node.data.sublings.forEach( o => {
									let sKey = node.data.isMaterialNode ? o.key : o.parent
									
									if(!aRoot.includes(sKey)) {
										aRoot.push(sKey)
									}
									
									aSublings.push(o.key)
								})
								
								this.$store.commit({
									type: "updateType",
									key: "catalog"
								});
								this.$store.commit({
									type: "updateKey",
									key: sNodeKey
								});
								// 更新高亮的数据。
								this.$store.commit({
									type: "updateHeighted",
									data: aSublings	//node.data.sublings
								})

//								if(this.treeFullscreen) {
//									this.$store.commit({
//										type: "updateTreeFullscreen",
//										key: false
//									});
//
//									this.$emit('recoverSize')
//									
//									this.updateCanvas()
//								}

								this.$store.commit({
									type: "updateKey",
									key: node.data.key
								});

			
								// 点击节点信息展示。
								let nodeType = node.data.nodeType  //被点击节点的 nodeType
								
								if(nodeType === 101 || nodeType === 102 || nodeType === 103 || nodeType === 111 || nodeType === 112) {  // 仓库操作     
									this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
										nodeType: nodeType
									})
									this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
										detailInfos: node.data.detailInfos
									})
									this.$store.commit('updateNum')
									this.$router.replace({ 
										path: "/warehouse", 
										query: {
											"detailInfos": node.data.detailInfos,
											"nodeType": node.data.nodeType,
											"_tag":  new Date().getTime().toString().substr(-5)
										}
									})
								}else if(nodeType === 8 || nodeType === 11 || nodeType === 14 || nodeType === 15 || nodeType === 10002 || nodeType === 2 || nodeType === 7) { 					// 车间操作     
									this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
										nodeType: nodeType
									})
									this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
										detailInfos: node.data.detailInfos
									})
									this.$store.commit('updateNum')

									this.$router.replace({ 
										path: "/workshop",
										query: {
											"detailInfos": node.data.detailInfos,
											"key": node.data.nodeType,
											"_tag":  new Date().getTime().toString().substr(-5)
										}										
									})
								}else if(nodeType === 205 || nodeType === 206 || nodeType === 202 || nodeType === 203) { 									// 条码管理     
									this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
										nodeType: nodeType
									})
									this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
										detailInfos: node.data.detailInfos
									})
									this.$store.commit('updateNum')
									this.$router.replace({ 
										path: "/barcodeManage",
										query: {
											"detailInfos": node.data.detailInfos,
											"key": node.data.nodeType,
											"_tag":  new Date().getTime().toString().substr(-5)
										}										
									})
								}else if(nodeType === 10003 || nodeType === 10004) { 
									// 物料
					
									// 显示内容.
									this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
									 	nodeType: nodeType
									})
									this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
									 	detailInfos: node.data.detailInfos
									})   
									this.$router.replace({ 
									 	path: "/stock",
									 	query: {
									 		"key": node.data.key,
								 			"_tag":  new Date().getTime().toString().substr(-5)
										}										
									})
										
								}else if(nodeType === 1 || nodeType === 6 || nodeType === 10001) { 	
									// 工序。
									this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
										nodeType: nodeType
									})
									this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
										detailInfos: node.data.detailInfos
									}) 

									this.$router.replace({ 
										path: "/process",
										query: {
											"detailInfos": node.data.detailInfos,
											"key": node.data.nodeType,
											"code": node.data.code,
											// "name": node.data.name,
											"_tag":  new Date().getTime().toString().substr(-5)
										}										
									})
								}

							},
							doubleClick: onDoubleClickNode
						},
						$("TreeExpanderButton", {
							position: new go.Point(-6, 8),
							width: 12,
							height: 12,
							cursor: "pointer",
							"ButtonBorder.fill": "rgba(245,200,13, 0.8)",
							"ButtonBorder.stroke": null,
							"_buttonFillOver": "rgb(245,200,13)",
							"_buttonStrokeOver": null
							//                    "ButtonIcon.stroke": "white",
							//                    "ButtonIcon.strokeWidth": 2
						}),
						$(go.Panel, "Horizontal", {
								position: new go.Point(5, 0)
							},
							//                new go.Binding("background", "isSelected", function (s) { return (s ? "white" : null); }).ofObject(),

							$(go.Picture, {
									width: 16,
									height: 16,
									margin: new go.Margin(0, 0, 0, 2),
									imageStretch: go.GraphObject.Uniform,
								},
								new go.Binding("source", "iconType", this.getNodeIcon)
							),
							$(go.TextBlock, {
									name: "TB",
									font: "12pt Helvetica, 微软雅黑, sans-serif",
									stroke: "#fff",
									margin: new go.Margin(4, 5, 4, 5)
								},
								new go.Binding("text", "name", s => s)
							)
						) // end Horizontal Panel
					); // end Node

				// 设置选中样式。
				this.catalog.nodeTemplate.selectionAdornmentTemplate =
					$(go.Adornment, "Spot",
						$(go.Panel, "Auto", {
								defaultAlignment: go.Spot.Left,
								padding: new go.Margin(0, 10, 0, 0)// b,l,t,r
							},
							$(go.Shape, {
								fill: HIGHLIGHT_BG_COLOR,	//"rgb(255,255,255)",
								stroke: "rgb(245,200,13)",
								strokeWidth: 1
							}),
							$(go.Picture, {
									position: new go.Point(0, 0),
									width: 16,
									height: 16,
									background: null,
									margin: new go.Margin(0, 5, 0, 2),
									imageStretch: go.GraphObject.Uniform
								},
								new go.Binding("source", "iconType", this.getNodeIcon)
							),
							$(go.Placeholder) // this represents the selected Node
						),

						$(go.TextBlock, {
								row: 1,
								font: "12pt Helvetica, 微软雅黑, sans-serif",
								stroke: "#333333",
								margin: 5
							},
							new go.Binding("text", "name")
						)
					);

				this.catalog.linkTemplate =
					$(go.Link, {
							selectable: false,
							routing: go.Link.Orthogonal,
							fromEndSegmentLength: 4,
							toEndSegmentLength: 4,
							fromSpot: new go.Spot(0.001, 1, 7, 0), //new go.Spot(0,0.5, 0, 0),
							toSpot: go.Spot.Left
						},
						$(go.Shape, {
							stroke: "#e8b54b", //rgb(245,200,13)
							strokeWidth: 1
						})
					);

			},
			// 设置选中节点样式。
			setCatalogSelection() {
//				let oNode = this.catalog.findNodeForKey(this.key);
//				let oSublingNode = null
//				
//				this.catalog.nodes.each(o => {
//					// 当前节点的同名节点
//					if(o.data.sublings.some(o1 => o1.key == this.key)) {
//						oSublingNode = o;
//					}
//					o.isSelected = false;
//					o.background = null;
//					o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
//				})
//				
//				oNode = oNode ? oNode: oSublingNode
//				
//				if(oNode) {
//					oNode.background = HIGHLIGHT_BG_COLOR;	//"white";
//					oNode.isSelected = true;
//					oNode.findObject("TB").stroke = "#333";
//				}
				
				// 设置样式。
				this.catalog.nodes.each(o => {
					// 当前节点的同名节点
					if(o.data.sublings.some(o1 => o1.key == this.key)) {
						o.background = HIGHLIGHT_BG_COLOR;	//"white";
						o.isSelected = true;
						o.findObject("TB").stroke = "#333";
					}else {
						o.isSelected = false;
						o.background = null;
						o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
					}
				})
			},
			/* 大小自适应 */
			updateCanvas(){
				//debugger
				this.catalog.requestUpdate()
			}
		}
	}
</script>

<style lang="less">
	#catalog {
		canvas {
			outline: none;
		}
	}
</style>
