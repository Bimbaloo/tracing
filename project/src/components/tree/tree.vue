<template>
	<div class="diagram">
		<div class="icons">
			<i class="icon icon-20 icon-exportImg" @click="onSvaeImgHandler" title="生成图片"></i>
			<i class="icon icon-20 icon-print" @click="onPrintImgHandler" title="打印图片"></i>
			<i class="icon icon-20 icon-fullScreen" v-if="!treeFullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
		</div>
		<div id="tree" style="height: 100%;"></div>
		<div id="overview"></div>
	</div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import {onNodeSelectionChange, onClickNode, onContextClickNode, onDoubleClickNode, tooltipTextConverter, zoomDiagram} from 'assets/js/go-util'

	export default {
		props: {
			treeData: Object,
			flexBasis:{
				type: Number,
      			required: false
			}
		},
		data() {
			return {
				tree: null,
				overview: null,
				flag: true
			}
		},
		watch: {
		    // 如果 发生改变，这个函数就会运行
		    treeData: function() {
		    	this.data = Object.assign({}, this.treeData);
		    },
		    data: function () {	
		    	if(this.tree) {		    		
		    		this.tree.model = new go.GraphLinksModel(this.data.node, this.data.link);	    		
		    	}				
		    },
		    key: function() {
		    	if(this.type == "catalog") {

		    		this.$nextTick(function() {    		
		    			this.setSelection();
		    		})
		    	}
		    },
		    root: function() {
		    	this.redrawTree();
			},
			flexBasis: function(){
				this.updateCanvas()
			}
		},
		computed: {
			data () {
				return Object.assign({}, this.treeData);
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
		    // 树的数据全屏。
		   	treeFullscreen () {
		   		return this.$store.state.treeFullscreen
		   	}
		},
		created() {
		},		
		mounted() {
			this.drawTree();
			this.createOverview();
		},
		methods: {
			fullScreenClick() {
                // 详情全屏按钮点击事件。
				this.$store.commit({
					type: "updateTreeFullscreen",
					key: true
				});
				this.updateCanvas()
            },
            restoreScreenClick() {
                // 详情还原按钮点击事件。
  				this.$store.commit({
					type: "updateTreeFullscreen",
					key: false
				});
				this.recoverSize() 
				this.updateCanvas()
            },
			/**
			 * 设置gojs图形。
			 * @param {Object} oData
			 * @param {String} sId
			 * @return {Object}
			 */
			drawTree() {
				let $ = this.$;

				this.tree =
					$(go.Diagram, 'tree', {
						// define the layout for the diagram
						contentAlignment: go.Spot.LeftCenter,
						allowMove: false,
						allowZoom: true,
						allowCopy: false,
						allowDelete: false,
						allowHorizontalScroll: true,
						hasHorizontalScrollbar: this.chrome,
						hasVerticalScrollbar: this.chrome,
						allowVerticalScroll: true,
						
			//          initialAutoScale:go.Diagram.Uniform,
						layout: $(go.TreeLayout, {
							nodeSpacing: 20,
							layerSpacing: 33
						}),
			//	        layout: $(go.LayeredDigraphLayout, {layerSpacing: 33, columnSpacing: 6}),
						doubleClick: (e, node) => {
							zoomDiagram(this.tree, this.flag);
							this.flag = !this.flag;
						}							
					});

				let tooltipTemplate =
					$(go.Adornment, "Auto", {
							isShadowed: true
						},
						$(go.Shape, "Rectangle", {
							fill: "white",
							stroke: "#dedede"
						}),
						$(go.TextBlock, {
								font: "14pt Helvetica, 微软雅黑, sans-serif",
								stroke: "#333333",
								wrap: go.TextBlock.WrapFit,
								desiredSize: new go.Size(1000, NaN),
								alignment: go.Spot.Center,
								margin: 4
							},
							new go.Binding("text", "", tooltipTextConverter))
					);

				// Define a simple node template consisting of text followed by an expand/collapse button
				this.tree.nodeTemplate =
					$(go.Node, "Horizontal", {
							selectionChanged: onNodeSelectionChange,
							click: (e, node) => {
//								onClickNode(e, node, this.tree, this.catalog)
								if(this.treeFullscreen) {
									this.restoreScreenClick();
								}
								
								this.$store.commit({
									type: "updateType",
									key: "tree"
								});
								this.$store.commit({
									type: "updateKey",
									key: node.data.key
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
									
									this.$router.push({ 
										path: "/process",
										query: {
											"key": node.data.key,
											"_tag":  new Date().getTime().toString().substr(-5)
										}										
									})
								}
							},
							doubleClick: onDoubleClickNode,
							contextClick: onContextClickNode,
							alignment: go.Spot.Center,
							toolTip: tooltipTemplate,
						}, // this event handler is defined below
						new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), //
						$(go.Panel, "Table", {
								width: 24,
								defaultAlignment: go.Spot.Center
							},
							$(go.RowColumnDefinition, {
								row: 0,
								height: 20
							}),
							$(go.Picture, {
									width: 20,
									height: 20,
									background: null,
									margin: new go.Margin(0, 0, 0, 4),
									imageStretch: go.GraphObject.Uniform,
								},
								new go.Binding("source", "type", s => s == 1 ? material : process)
							)
						),
						$(go.TextBlock, {
								name: "TB",
								row: 1,
								font: "14pt Helvetica, 微软雅黑, sans-serif",
								stroke: "#333333",
								margin: 5,
								//	                  	textValidation:onEditName
							},
							new go.Binding("text", "showName").makeTwoWay() //
						),
						//	              new go.Binding("editable","editable"),
						$("TreeExpanderButton", {
							width: 12,
							height: 12,
							cursor: "pointer",
							"ButtonBorder.fill": "#ccc",
							"ButtonBorder.stroke": null,
							"_buttonFillOver": "#b8b8b8",
							"_buttonStrokeOver": null,
							click: (e, button) => {
		
								let node = button.part;
								if(node instanceof go.Adornment) node = node.adornedPart;
								if(!(node instanceof go.Node)) return;
								let diagram = node.diagram;
								if(diagram === null) return;
								let cmd = diagram.commandHandler;
								if(node.isTreeExpanded) {
									if(!cmd.canCollapseTree(node)) return;
								} else {
									if(!cmd.canExpandTree(node)) return;
								}
								e.handled = true;
								
								let sGroup = node.data.group;
								
								if(node.isTreeExpanded) {
									cmd.collapseTree(node);
								} else {
									cmd.expandTree(node);
								}
							}
						})
					);

				// 设置选中样式。
				this.tree.nodeTemplate.selectionAdornmentTemplate =
					$(go.Adornment, "Spot", {
							isShadowed: true
						},
						$(go.Panel, "Auto", {
								defaultAlignment: go.Spot.Left
							},
							$(go.Shape, {
								fill: "#ffffff",
								stroke: "#F09900",
								strokeWidth: 1
							}),

							$(go.Picture, {
									position: new go.Point(0, 0),
									width: 20,
									height: 20,
									background: null,
									margin: new go.Margin(0, 0, 0, 2),
									imageStretch: go.GraphObject.Uniform,
								},
								new go.Binding("source", "type", s => s == 1 ? material : process)
							),
							$(go.Placeholder) // this represents the selected Node
						),

						$(go.TextBlock, {
								row: 1,
								font: "14pt Helvetica, 微软雅黑, sans-serif",
								stroke: "#333333",
								margin: 5
							},
							new go.Binding("text", "showName")
						)
					); // end Adornment

				this.tree.linkTemplate =
					$(go.Link, // the whole link panel
						new go.Binding("points").makeTwoWay(), {
							curve: go.Link.Bezier,
							toShortLength: 0,
							selectable: false,
							corner: 0
				//	        adjusting: go.Link.Stretch,
						},
				//      new go.Binding("curviness", "curviness"),
						$(go.Shape, // the link shape
							{
								stroke: "#999",
								strokeWidth: 3
							})
					);

				// define the group template
				this.tree.groupTemplate =
					$(go.Group, "Auto", { // define the group's internal layout
							layout: $(go.TreeLayout, {
		//						angle: 90,
		//						arrangement: go.TreeLayout.ArrangementHorizontal,
		//						isRealtime: false
							}),
							// the group begins unexpanded;
							// upon expansion, a Diagram Listener will generate contents for the group
							isSubGraphExpanded: false,
							// when a group is expanded, if it contains no parts, generate a subGraph inside of it
							subGraphExpandedChanged: (group) => {
								if(group.memberParts.count === 0) {
		//							randomGroup(group.data.key);
								}
							},

							click: (e, node) => {
								node.findObject("processExpanderButton").click(e, node.findObject("processExpanderButton"));
							},
							cursor: "pointer",
						},
						$(go.Shape, "Rectangle", {
							fill: null,
							stroke: "gray",
							strokeWidth: 2
						}),
						$(go.Panel, "Vertical", {
								defaultAlignment: go.Spot.Left,
								margin: 4
							},
							$(go.Panel, "Horizontal", {
									defaultAlignment: go.Spot.Top
								},
								// the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
								$("SubGraphExpanderButton", {
									name: "processExpanderButton",
									width: 0,
									height: 0,
									cursor: "pointer",
									"ButtonBorder.fill": null, //"#fcbb3a",
									"ButtonBorder.stroke": null,
									"_buttonFillOver": null, //"#f9a216",
									"_buttonStrokeOver": null
								}),
								$(go.TextBlock, {
										font: "bold 12pt Helvetica, 微软雅黑, sans-serif",
										margin: 4,
										stroke: "#169bd5"
									},
									new go.Binding("text", "showName"))	// key
							),
							// create a placeholder to represent the area where the contents of the group are
							$(go.Placeholder, {
								padding: new go.Margin(0, 10)
							})
						) // end Vertical Panel
					); // end Group
					
					
					this.tree.nodeTemplateMap.add("Comment",
				      $(go.Node,  // this needs to act as a rectangular shape for BalloonLink,
				        { background: "transparent" },  // which can be accomplished by setting the background.
				        $(go.TextBlock,
				          { stroke: "brown", margin: 3 },
				          new go.Binding("text"))
				      ));
				
				    this.tree.linkTemplateMap.add("Comment",
				      // if the BalloonLink class has been loaded from the Extensions directory, use it
				      $((typeof BalloonLink === "function" ? BalloonLink : go.Link),
				        $(go.Shape,  // the Shape.geometry will be computed to surround the comment node and
				                     // point all the way to the commented node
				          { stroke: "brown", strokeWidth: 1, fill: "lightyellow" })
				      ));

			},

			/**
			 * 创建缩略图。
			 * @param {Object} oDiagram
			 * @param {String} sId
			 * @return {Object}
			 */
			createOverview() {
				this.overview = this.$(go.Overview, 'overview', {
					observed: this.tree
				});
			},
			
			/**
			 * 展开右侧节点。
			 * @param {Object} oData
			 * @return {void}
			 */
			redrawTree() {	
				this.tree.nodes.each(o => {
					if(!o.data.group) {				
						o.visible = false
					}
				});
				
				let oRoot = this.tree.findNodeForKey(this.root);
				oRoot.visible = true;
				
				oRoot.findTreeChildrenNodes().each(o => {
					o.visible = true;
				})
				oRoot.findTreeParts().each(o => {
					o.visible = true;
				})
			},
//			设置选中。
			setSelection() {
				if(!this.data.node.some(o => o.key == this.key)) {
					return;
				}
			    this.tree.nodes.each(obj => {
			    	// 取消选中样式。
			    	obj.isSelected = false;
					obj.background = null;
			    	obj.findObject("TB") && (obj.findObject("TB").stroke = "#333");
			    });
				
				let oData = this.treeData.node.filter(o => o.key == this.key)[0],
					oNode = this.tree.findNodeForKey(oData.key);
				
				if(oNode) {				
					oNode.isSelected = true;
					oNode.background = "white";
					oNode.findObject("TB") && (oNode.findObject("TB").stroke = "#333");
				}

				if(oData.group) {
					// 若节点在组合中。
					if(!this.tree.findNodeForKey(oData.group).isSubGraphExpanded) {
						this.tree.findNodeForKey(oData.group).expandSubGraph();
					}
				}
			},

			/**
			* 生成图片。
			* @param {Object} event
			* @returns {void}
			*/
			onSvaeImgHandler(event) {
				var oImage = this.tree.makeImage({
					scale: 1,
					maxSize: new go.Size(Infinity, Infinity),
		//			  background: "rgb(248,248,240)"
					}),
					// 图片地址。
					sImage = oImage.src;
				
				var w=window.open('about:blank','image from canvas');
				w.document.write("<img src='"+sImage+"' alt='from canvas'/>");	
			},	
			/**
			* 打印图片。
			* @param {Object} event
			* @returns {void}
			*/
			onPrintImgHandler(event) {
				var oImage = this.tree.makeImage({
					scale: 1,
					maxSize: new go.Size(Infinity, Infinity),
					background: "rgb(248,248,240)"
					}),
					// 图片地址。
					sImage = oImage.src;
				var w=window.open('about:blank','image from canvas');

				w.document.write("<img src='"+sImage+"' alt='from canvas'/>");
				setTimeout(function(){
					// 判断是否为ie浏览器。
					if(!!window.ActiveXObject || "ActiveXObject" in window) {
						w.document.write('<OBJECT classid="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2" height=0 id="wb" name="wb" width=0></OBJECT>');
						var wb = w.document.getElementById("wb");
						// 打印预览。
						wb.execwb(7,1);
					}else {
						// 打印。
						w.print();
					}

					// ie浏览器下打印必须要这行。			
		//			w.document.close();
		//			w.focus();
					
					// 关闭窗口。
					w.close();
				}, 200);
			},
			updateCanvas(){
				
				this.tree.requestUpdate()
			},
			recoverSize(){
				this.$emit('recoverSize')
			}
	
		}
	}
</script>

<style lang="less">
	.diagram {
		display: flex;
		flex-direction: column;
	}
	.icons {
		position: relative;
		flex: 0 40px;
		text-align: right;
		padding-right:20px;
		
		.icon-exportImg,
		.icon-print,
		.icon-fullScreen,
		.icon-restoreScreen {
			cursor: pointer;
			margin: 10px;
			vertical-align: middle;
			
			/*position: absolute;
			top: 10px;
			right: 20px;
			z-index: 100;
			cursor: pointer;*/
		}
		
		// .icon-exportImg {
		// 	/*right: 60px;*/
		// }
	}
	
	#tree {
		flex: 1 1;

		canvas {
			outline: none;
		}
	}
	
</style>