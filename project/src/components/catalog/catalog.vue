<template>
	<div id="catalog" style="height: 100%;"></div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import {onDoubleClickNode} from 'assets/js/go-util'

	export default {
		props: {
			catalogData: Array,
			resize:{
				type: Number,
      			required: false
			}
		},
		data() {
			return {			
				catalog: null
			}
		},
		computed: {
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
			resize: function(){
				this.updateCanvas();
			}
		},
		methods: {
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
							this.$emit("init");
						}
					});

				this.catalog.nodeTemplate =
					$(go.Node, {
							// no Adornment: instead change panel background color by binding to Node.isSelected	            
							click: (e, node) => {
								this.catalog.nodes.each(o => {
									if(o.data.key != node.data.key) {										
										o.isSelected = false;
										o.background = null;
										o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
									}
								})
								
								let sRootKey = node.data.key;
								if(node.data.parent &&　node.data.type != "1") {
									sRootKey　= node.findTreeParentNode().data.key;				
								}		

								this.$store.commit({
									type: "updateType",
									key: "catalog"
								});
								this.$store.commit({
									type: "updateKey",
									key: node.data.key
								});
								this.$store.commit({
									type: "updateRoot",
									key: sRootKey
								});
								
								if(node.data.type == "1") {
									// 根据物料节点查询仓储信息。        
									this.$router.push({ 
										path: "/stock", 
										query: {
											"key": node.data.key,
											"_tag":  new Date().getTime().toString().substr(-5)
										}
									})
								}else {
									// debugger
									this.$router.push({ 
										path: "/process",
										query: {
											"key": node.data.key,
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
								new go.Binding("source", "type", s => s == 1 ? material : process)
							),
							$(go.TextBlock, {
									name: "TB",
									font: "12pt Helvetica, 微软雅黑, sans-serif",
									stroke: "#fff",
									margin: new go.Margin(4, 5, 4, 5)
								},
								new go.Binding("text", "showName", s => s)
							)
						) // end Horizontal Panel
					); // end Node

				// 设置选中样式。
				this.catalog.nodeTemplate.selectionAdornmentTemplate =
					$(go.Adornment, "Spot",
						$(go.Panel, "Auto", {
								defaultAlignment: go.Spot.Left
							},
							$(go.Shape, {
								fill: "rgb(255,255,255)",
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
								new go.Binding("source", "type", s => s == 1 ? material : process)
							),
							$(go.Placeholder) // this represents the selected Node
						),

						$(go.TextBlock, {
								row: 1,
								font: "12pt Helvetica, 微软雅黑, sans-serif",
								stroke: "#333333",
								margin: 5
							},
							new go.Binding("text", "showName")
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
				let oNode = this.catalog.findNodeForKey(this.key);
				
				this.catalog.nodes.each(o => {
					o.isSelected = false;
					o.background = null;
					o.findObject("TB") && (o.findObject("TB").stroke = "#fff");
				})
				
				if(oNode) {
					oNode.background = "white";
					oNode.isSelected = true;
					oNode.findObject("TB").stroke = "#333";
				}
//				let nodeInmenutree = null;
//				if(oCatalog) {
//					nodeInmenutree = oCatalog.findNodeForKey(node.data.key);
//			
//					oCatalog.nodes.each(obj => {
//						obj.isSelected = false;
//				    	obj.background = null;
//				    	obj.findObject("TB").stroke = "#fff";
//				    });
//				}
//			    
//			    if(node.isSelected){
//			//  	goPage.pageHandler.getVerboseInfo(node);
//			    	
//			    	if(nodeInmenutree) {
//				    	nodeInmenutree.background = "white";
//				    	nodeInmenutree.isSelected = true;
//				    	nodeInmenutree.findObject("TB").stroke = "#333";    		
//			    	}
//			
//			        node.background = "#40484a";
//			        node.findObject("TB") && (node.findObject("TB").stroke = "#fff");
//			
//			    }else {    	
//					node.background = null;
//			        
//			        if(nodeInmenutree) {
//			        	nodeInmenutree.isSelected = false;
//			        }
//			    }				
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