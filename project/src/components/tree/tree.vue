<template>
	<div class="diagram" ref="diagram">
		<div class="icons">
			<i class="icon icon-20 icon-hide" v-if="!tipsShow" @click="showTips"  title="显示详情"></i>
            <i class="icon icon-20 icon-show" v-else @click="hideTips"  title="隐藏详情"></i>
			<i class="icon icon-20 icon-exportImg" @click="onSvaeImgHandler" title="生成图片"></i>
			<i class="icon icon-20 icon-print" @click="onPrintImgHandler" title="打印图片"></i>
			<i class="icon icon-20 icon-fullScreen" v-if="!treeFullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
		</div>
		<div id="tree" style="height: 100%;"></div>
		<!--div id="overview"></div-->
	</div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import {onNodeSelectionChange, onClickNode, onContextClickNode, onDoubleClickNode, tooltipTextConverter, zoomDiagram} from 'assets/js/go-util'
	// import BalloonLink from 'assets/js/BalloonLink.js'

	// 注释背景颜色。
	var COMMENT_BGCOLOR = "rgba(66,175,143,0.4)";
	
	export default {
		props: {
			treeData: Object,
			// flexBasis:{      // 用于追溯页面上下拖动后视图大小更新
			// 	type: Number,
      		// 	required: false
			// },
			// resize: {		 // 用于追溯页面左右拖动后视图大小更新
			// 	type: Number,
      		// 	required: false
			// }
		},
		data() {
			return {
				// 默认隐藏详细。
				tipsShow: false,
				tree: null,
				overview: null,
				flag: true,
			}
		},
		watch: {
		    data: function () {	
		    	if(this.tree) {					
					if(this.tipsShow) {
						// 若需要显示详情。
						this.data.node.forEach(o => o.isMaterialNode ? (o.category = 'material'):(o.category = 'process'))
					}
					this.tree.model = new go.GraphLinksModel(this.data.node, this.data.link);	    	
					this.tree.model.linkFromPortIdProperty = "fromPort";
					this.tree.model.linkToPortIdProperty = "toPort";
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
			flexBasis: 'updateCanvas',
			resize: 'updateCanvas'
		},
		computed: {
			resize () {
		    	return this.$store.state.resize
		    },
			flexBasis () {
				return this.$store.state.resizeY
			},
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
			},
			// 选中样式。
			selectionAdornmentTemplate () {
				return this.$(go.Adornment, "Spot", {
						isShadowed: true
					},
					this.$(go.Panel, "Auto", {
							defaultAlignment: go.Spot.Left
						},
						this.$(go.Shape, {
							fill: "#ffffff",
							stroke: "#F09900",
							strokeWidth: 1
						}),

						this.$(go.Picture, {
								position: new go.Point(0, 0),
								width: 20,
								height: 20,
								background: null,
								margin: new go.Margin(0, 0, 0, 2),
								imageStretch: go.GraphObject.Uniform,
							},
							new go.Binding("source", "isMaterialNode", s => s ? material : process)
						),
						this.$(go.Placeholder) // this represents the selected Node
					),

					this.$(go.TextBlock, {
							row: 1,
							font: "14pt Helvetica, 微软雅黑, sans-serif",
							stroke: "#333333",
							margin: 5
						},
						new go.Binding("text", "name")
					)
				)
			},
			// 简单节点样式。
			simpleNodeTemplate() {
				return	this.$(go.Node, "Horizontal", 
						{ selectionObjectName: "SELECTION" },  // added this property!
						{
							selectionChanged: onNodeSelectionChange,//this.nodeSelectionChangeHandle,
							click: this.treeNodeClickHandle,
							doubleClick: onDoubleClickNode,
							contextClick: onContextClickNode,
							alignment: go.Spot.Center
						}, // this event handler is defined below
						new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), //
						this.$(go.Panel, "Auto", 
							this.$(go.Shape, "Rectangle", { name: "SELECTION", fill: "transparent", strokeWidth: 0, stroke: "#F09900" }),
							this.$(go.Panel, "Horizontal", 
								this.$(go.Picture, {
										width: 20,
										height: 20,
										background: null,
										margin: new go.Margin(0, 0, 0, 4),
										imageStretch: go.GraphObject.Uniform,
									},
									new go.Binding("source", "isMaterialNode", s => s ? material : process)
								),
								this.$(go.TextBlock, {
										name: "TB",
										row: 1,
										font: "14pt Helvetica, 微软雅黑, sans-serif",
										stroke: "#333333",
										margin: 5,
										// textValidation:onEditName
									},
									new go.Binding("text", "name"),//.makeTwoWay() //
									
								)
							)
						),					
						this.$("TreeExpanderButton", {
							width: 12,
							height: 12,
							cursor: "pointer",
							"ButtonBorder.fill": "#ccc",
							"ButtonBorder.stroke": null,
							"_buttonFillOver": "#b8b8b8",
							"_buttonStrokeOver": null,
							click: this.treeExpanderButtonClickHandle
						}),
						{selectionAdornmentTemplate: this.selectionAdornmentTemplate}
					);
			},
			simpleGroupTemplate() {
				return this.$(go.Group, "Horizontal", 
						{ selectionObjectName: "SELECTION" },  // added this property!
						{ // define the group's internal layout
							selectionAdorned: false,
							selectionChanged: onNodeSelectionChange,
							layout: this.$(go.TreeLayout, {layerSpacing: 20, nodeSpacing: 10}),
							// the group begins unexpanded;
							// upon expansion, a Diagram Listener will generate contents for the group
							isSubGraphExpanded: false,
							// when a group is expanded, if it contains no parts, generate a subGraph inside of it
							// subGraphExpandedChanged: (group) => {
							// 	if(group.memberParts.count === 0) {
							// 	}
							// },
							click: this.groupNodeClickHandle,
							cursor: "pointer",
						},
						this.$(go.Panel, "Auto", 
							this.$(go.Shape, "Rectangle", {
								name: "SELECTION",
								fill: null,
								stroke: "gray",
								strokeWidth: 2
							}),
							this.$(go.Panel, "Vertical", {
									defaultAlignment: go.Spot.Left,
									margin: 4
								},
								this.$(go.Panel, "Horizontal", {
										defaultAlignment: go.Spot.Top
									},
									// the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
									this.$("SubGraphExpanderButton", {
										name: "processExpanderButton",
										width: 0,
										height: 0,
										cursor: "pointer",
										"ButtonBorder.fill": null, //"#fcbb3a",
										"ButtonBorder.stroke": null,
										"_buttonFillOver": null, //"#f9a216",
										"_buttonStrokeOver": null
									}),
									this.$(go.TextBlock, {
											font: "bold 12pt Helvetica, 微软雅黑, sans-serif",
											margin: 4,
											stroke: "#169bd5"
										},
										new go.Binding("text", "name"))	// key
								),
								// create a placeholder to represent the area where the contents of the group are
								this.$(go.Placeholder, {
									padding: new go.Margin(0, 10)
								})
							), // end Vertical Panel
						),
						this.$("TreeExpanderButton", {
							width: 12,
							height: 12,
							cursor: "pointer",
							"ButtonBorder.fill": "#ccc",
							"ButtonBorder.stroke": null,
							"_buttonFillOver": "#b8b8b8",
							"_buttonStrokeOver": null,
							click: this.treeExpanderButtonClickHandle
						})
						
					); // end Group								
			
			},
			materialNodeTemplate() {
				return this.$(go.Node, "Horizontal", 
						{ selectionObjectName: "SELECTION" },  // added this property!
						{	selectionChanged: onNodeSelectionChange,
							click: this.treeNodeClickHandle,
							doubleClick: onDoubleClickNode,
							contextClick: onContextClickNode,
							// alignment: go.Spot.Top
						}, 
						new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), //
						this.$(go.Panel, "Vertical", 
							this.$(go.Panel, "Auto",
								this.$(go.Shape, "Rectangle", { name: "SELECTION", fill: "transparent", strokeWidth: 0, stroke: "#F09900" }),
								this.$(go.Panel, "Horizontal", 
									this.$(go.Picture, {
											portId: "TO",
											toSpot: go.Spot.Left,
											width: 20,
											height: 20,
											background: null,
											margin: new go.Margin(0, 0, 0, 4),
											imageStretch: go.GraphObject.Uniform,
										},
										new go.Binding("source", "isMaterialNode", s => s ? material : process)
									),
									this.$(go.TextBlock, {
											name: "TB",
											row: 1,
											font: "14pt Helvetica, 微软雅黑, sans-serif",
											stroke: "#333333",
											margin: 5,
											// textValidation:onEditName
										},
										new go.Binding("text", "name"),//.makeTwoWay() //								
									),
									// new go.Binding("editable","editable"),					
									this.$("TreeExpanderButton", {
										portId: "FROM",
										fromSpot: go.Spot.Right,
										width: 12,
										height: 12,
										cursor: "pointer",
										"ButtonBorder.fill": "#ccc",
										"ButtonBorder.stroke": null,
										"_buttonFillOver": "#b8b8b8",
										"_buttonStrokeOver": null,
										click: this.treeExpanderButtonClickHandle
									})
								),
							),
							this.$(go.Panel, "Table", 
								{ background: COMMENT_BGCOLOR},
								new go.Binding("itemArray", "materialInfoList"),
								{ 
									margin: 4,
									defaultAlignment: go.Spot.Left,
									itemTemplate:
										this.$(go.Panel, "TableRow",
										new go.Binding("background", "back"),
										this.$(go.TextBlock, new go.Binding("text", "batchNo"), // 批次
											{ column: 0, margin: 5 }),
										this.$(go.TextBlock, new go.Binding("text", "sumQuantity"),	// 数量
											{ column: 1, margin: 5 })
										)  // end of itemTemplate
								}
							)
						),
						{selectionAdornmentTemplate: this.selectionAdornmentTemplate}
					)	
			},
			processNodeTemplate() {
				return this.$(go.Node, "Horizontal", 
						{ selectionObjectName: "SELECTION" },  // added this property!
						{
							selectionChanged: onNodeSelectionChange,
							click: this.treeNodeClickHandle,
							doubleClick: onDoubleClickNode,
							contextClick: onContextClickNode,
							// alignment: go.Spot.Top
						},
						new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), //
						this.$(go.Panel, "Vertical", 
							this.$(go.Panel, "Auto",
								this.$(go.Shape, "Rectangle", { name: "SELECTION", fill: "transparent", strokeWidth: 0, stroke: "#F09900" }),
								this.$(go.Panel, "Horizontal", 
									this.$(go.Picture, {
											portId: "TO",
											toSpot: go.Spot.Left,
											width: 20,
											height: 20,
											background: null,
											margin: new go.Margin(0, 0, 0, 4),
											imageStretch: go.GraphObject.Uniform,
										},
										new go.Binding("source", "isMaterialNode", s => s ? material : process)
									),
									this.$(go.TextBlock, {
											name: "TB",
											row: 1,
											font: "14pt Helvetica, 微软雅黑, sans-serif",
											stroke: "#333333",
											margin: 5,
											// textValidation:onEditName
										},
										new go.Binding("text", "name"),//.makeTwoWay() //
										
									),
									// new go.Binding("editable","editable"),				
									this.$("TreeExpanderButton", {
										portId: "FROM",
										fromSpot: go.Spot.Right,
										width: 12,
										height: 12,
										cursor: "pointer",
										"ButtonBorder.fill": "#ccc",
										"ButtonBorder.stroke": null,
										"_buttonFillOver": "#b8b8b8",
										"_buttonStrokeOver": null,
										click: this.treeExpanderButtonClickHandle
									})
								),
							),
							this.$(go.Panel, "Table", 
								{ background: COMMENT_BGCOLOR},
								new go.Binding("itemArray", "processInfoList"),
								{ 
									margin: 4,
									defaultAlignment: go.Spot.Left,
									itemTemplate:
										this.$(go.Panel, "TableRow",
											new go.Binding("background", "back"),
											this.$(go.TextBlock, new go.Binding("text", "equipmentName"), // 设备
												{ column: 0, margin: 5 }),
											this.$(go.TextBlock, new go.Binding("text", "batchNo"), // 批次
												{ column: 1, margin: 5 }),
											this.$(go.TextBlock, new go.Binding("text", "sumQuantity"),	// 数量
												{ column: 2, margin: 5 })
										)  // end of itemTemplate
								},

								this.$(go.Panel, "TableRow",
									{ isPanelMain: true },  // needed to keep this element when itemArray gets an Array
									this.$(go.TextBlock, new go.Binding("text", "materialName"), // 物料名称
										{ row: 0, column: 0, columnSpan: 3, margin: 5, font: "bold 10pt sans-serif"})//new go.Margin(2, 2, 0, 2)
								),
							
								this.$(go.RowColumnDefinition,
									{ row: 1, separatorStroke: "white" })
							)
						),
						{selectionAdornmentTemplate: this.selectionAdornmentTemplate}
					)
			},
			processGroupTemplate() {
				return this.$(go.Group, "Vertical", { // define the group's internal layout
							selectionAdorned: false,
							layout: this.$(go.TreeLayout, {layerSpacing: 20, nodeSpacing: 10}),
							// the group begins unexpanded;
							// upon expansion, a Diagram Listener will generate contents for the group
							isSubGraphExpanded: false,
							click: this.groupNodeClickHandle,
							cursor: "pointer",
							selectionAdorned: false,
						},
						this.$(go.Panel, "Horizontal",
							this.$(go.Panel, "Auto", 
								this.$(go.Shape, "Rectangle", {
									fill: null,
									stroke: "gray",
									strokeWidth: 2,
									portId: 'TO',
									
									toSpot: go.Spot.Left
								}),
								this.$(go.Panel, "Vertical", {
										defaultAlignment: go.Spot.Left,
										margin: 4
									},
									this.$(go.Panel, "Horizontal", {
											defaultAlignment: go.Spot.Top
										},
										// the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
										this.$("SubGraphExpanderButton", {
											name: "processExpanderButton",
											width: 0,
											height: 0,
											cursor: "pointer",
											"ButtonBorder.fill": null, //"#fcbb3a",
											"ButtonBorder.stroke": null,
											"_buttonFillOver": null, //"#f9a216",
											"_buttonStrokeOver": null
										}),
										this.$(go.TextBlock, {
												font: "bold 12pt Helvetica, 微软雅黑, sans-serif",
												margin: 4,
												stroke: "#169bd5"
											},
											new go.Binding("text", "name"))	// key
									),
									// create a placeholder to represent the area where the contents of the group are
									this.$(go.Placeholder, {
										padding: new go.Margin(0, 10)
									})
								)
							),
							this.$("TreeExpanderButton", {
								width: 12,
								height: 12,
								cursor: "pointer",
								fromSpot: go.Spot.Right,
								portId: "FROM",
								"ButtonBorder.fill": "#ccc",
								"ButtonBorder.stroke": null,
								"_buttonFillOver": "#b8b8b8",
								"_buttonStrokeOver": null,
								click: this.treeExpanderButtonClickHandle
							})
						),
						this.$(go.Panel, "Table", 
							{ background: COMMENT_BGCOLOR},
							new go.Binding("itemArray", "processInfoList"),
							{ 
								margin: 4,
								defaultAlignment: go.Spot.Left,
								itemTemplate:
									this.$(go.Panel, "TableRow",
										new go.Binding("background", "back"),
										this.$(go.TextBlock, new go.Binding("text", "equipmentName"), // 设备
											{ column: 0, margin: 5 }),
										this.$(go.TextBlock, new go.Binding("text", "batchNo"), // 批次
											{ column: 1, margin: 5 }),
										this.$(go.TextBlock, new go.Binding("text", "sumQuantity"),	// 数量
											{ column: 2, margin: 5 })
									)  // end of itemTemplate
							},

							this.$(go.Panel, "TableRow",
								{ isPanelMain: true },  // needed to keep this element when itemArray gets an Array
								this.$(go.TextBlock, new go.Binding("text", "materialName"), // 物料名称
									{ row: 0, column: 0, columnSpan: 3, margin: 5, font: "bold 10pt sans-serif"})//new go.Margin(2, 2, 0, 2)
							),
						
							this.$(go.RowColumnDefinition,
								{ row: 1, separatorStroke: "white" })
						)

					) 	
			},
			linkTemplate() {
				return this.$(go.Link, // the whole link panel
						new go.Binding("points").makeTwoWay(), {
							curve: go.Link.Bezier,
							toShortLength: 0,
							selectable: false,
							corner: 0
							// adjusting: go.Link.Stretch,
						},
							// new go.Binding("curviness", "curviness"),
						this.$(go.Shape, // the link shape
							{
								stroke: "#999",
								strokeWidth: 3
							})
					);
			}

		},
		created() {
		},		
		mounted() {
			this.drawTree();
			// this.createOverview();
		},
		methods: {
			showTips() {
				this.tipsShow = !this.tipsShow;
				this.tree.nodes.each(node=> {
					let bVisible = node.visible,	
						cat = node.data.isMaterialNode ? "material": "process";

					if(!(node.data.isGroup && node.isSubGraphExpanded)) {
						// 如果不为组且展开。
						this.tree.model.setCategoryForNodeData(node.data, cat);
						node.visible = 	bVisible
					}
															
				})
			},
			hideTips() {
				this.tipsShow = !this.tipsShow;
				this.tree.nodes.each(node=> {
					let bVisible = node.visible				
					this.tree.model.setCategoryForNodeData(node.data, "simple");
					node.visible = 	bVisible								
				})
			},
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
			// 树节点点击事件。
			treeNodeClickHandle(e, node) {
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
				
				if(node.data.isMaterialNode) {   // node.data.type == "1"
					// 根据物料节点查询仓储信息。        
					this.$router.replace({ 
						path: "/stock", 
						query: {
							"key": node.data.key,
							"_tag":  new Date().getTime().toString().substr(-5)
						}
					})
				}else {
					
					this.$router.replace({ 
						path: "/process",
						query: {
							"key": node.data.key,
							"_tag":  new Date().getTime().toString().substr(-5)
						}										
					})
				}
			},
			// nodeSelectionChangeHandle(node) {				
			// 	let oSelect = node.findObject("SELECTION");
			// 	if (oSelect !== null) {
			// 		if (node.isSelected) {
			// 			oSelect.fill = "#fff";
			// 			oSelect.strokeWidth = 2;
			// 		}else {
			// 			oSelect.fill = "transparent";
			// 			oSelect.strokeWidth = 0;
			// 		}
			// 	}
			// },
			// 展开/收起按钮点击事件。
			treeExpanderButtonClickHandle(e, button) {
				let node = button.part;

				if(node instanceof go.Adornment) {
					node = node.adornedPart;
				}

				if(!(node instanceof go.Node)) {
					return;
				}

				let diagram = node.diagram;

				if(diagram === null) {
					return;
				}

				let cmd = diagram.commandHandler;

				if(node.isTreeExpanded) {
					if(!cmd.canCollapseTree(node)) {
						return;
					}
				} else {
					if(!cmd.canExpandTree(node)) {
						return;
					}
				}
				e.handled = true;
				
				let sGroup = node.data.group;
				if(node.isTreeExpanded) {
					cmd.collapseTree(node);
				} else {
					cmd.expandTree(node);
				}
			},
			// 组节点点击事件。
			groupNodeClickHandle(e, node) {
	
				let bSubGraphExpanded = node.isSubGraphExpanded;

				if(this.tipsShow && !bSubGraphExpanded) {
					// 组未展开，隐藏详情。
					this.tree.model.setCategoryForNodeData(node.data, "simple");
				}

				node.findObject("processExpanderButton").click(e, node.findObject("processExpanderButton"));

				if(this.tipsShow && bSubGraphExpanded) {
					// 组展开，且展示详情。
					this.tree.model.setCategoryForNodeData(node.data, "process");
					
				}
				
			},
			// 设置树节点、连线、组样式。
			setTreeTemplate() {
				// Define a simple node template consisting of text followed by an expand/collapse button
				// this.tree.nodeTemplate = this.simpleNodeTemplate;

				// 连线样式。
				this.tree.linkTemplate = this.linkTemplate;
				
				// 节点样式组。
				var templmap = new go.Map("string", go.Node);
				templmap.add("simple", this.simpleNodeTemplate);
				templmap.add("material", this.materialNodeTemplate);
				templmap.add("process", this.processNodeTemplate);
				this.tree.nodeTemplateMap = templmap;

				// 群组样式组。
				var groupTemplmap = new go.Map("string", go.Group);
				groupTemplmap.add("simple", this.simpleGroupTemplate);
				groupTemplmap.add("process", this.processGroupTemplate);
				this.tree.groupTemplateMap = groupTemplmap;
			},

			// 设置提示框样式。
			setCommentTemplate() {
				// 物料节点注释样式。					
				this.tree.nodeTemplateMap.add("materialComment",
					// this.$(go.Node,  // this needs to act as a rectangular shape for BalloonLink,
					// { background: "transparent" },  // which can be accomplished by setting the background.
					// this.$(go.TextBlock,
					// 	{ stroke: "brown", margin: 3 },
					// 	new go.Binding("text"))
					// )
					this.$(go.Node, "Auto",
						// new go.Binding("location", "loc", go.Point.parse),//.makeTwoWay(go.Point.stringify), //
						this.$(go.Shape, { fill: COMMENT_BGCOLOR, stroke: "lightgray", strokeWidth: 1 }),
						this.$(go.Panel, "Table",
							new go.Binding("itemArray", "items"),
							{ margin: 4,
							defaultAlignment: go.Spot.Left,
							itemTemplate:
								this.$(go.Panel, "TableRow",
								new go.Binding("background", "back"),
								this.$(go.TextBlock, new go.Binding("text", "batch"), // 批次
									{ column: 0, margin: 5 }),
								this.$(go.TextBlock, new go.Binding("text", "sum"),	// 数量
									{ column: 1, margin: 5 })
								)  // end of itemTemplate
							})
						)	
				);

				// 工序节点注释样式。
				this.tree.nodeTemplateMap.add("processComment",
					this.$(go.Node, "Auto",
						this.$(go.Shape, { fill: COMMENT_BGCOLOR, stroke: "lightgray", strokeWidth: 1 }),
						this.$(go.Panel, "Table",
							new go.Binding("itemArray", "items"),
							{ 
								margin: 4,
								defaultAlignment: go.Spot.Left,
								itemTemplate:
									this.$(go.Panel, "TableRow",
										new go.Binding("background", "back"),
										this.$(go.TextBlock, new go.Binding("text", "equipment"), // 设备
											{ column: 0, margin: 5 }),
										this.$(go.TextBlock, new go.Binding("text", "batch"), // 批次
											{ column: 1, margin: 5 }),
										this.$(go.TextBlock, new go.Binding("text", "sum"),	// 数量
											{ column: 2, margin: 5 })
									)  // end of itemTemplate
							},
							this.$(go.Panel, "TableRow",
								{ isPanelMain: true },  // needed to keep this element when itemArray gets an Array
								this.$(go.TextBlock, new go.Binding("text", "material"), // 物料名称
									{ row: 0, column: 0, columnSpan: 3, margin: 5, font: "bold 10pt sans-serif"})//new go.Margin(2, 2, 0, 2)
								),
							// this.$(go.RowColumnDefinition,
							// 	{ row: 0, background: "lightgray" }),
							this.$(go.RowColumnDefinition,
								{ row: 1, separatorStroke: "white" })
							)
						)
				);		
				
				this.tree.linkTemplateMap.add("Comment",
					// if the BalloonLink class has been loaded from the Extensions directory, use it
					// this.$((typeof BalloonLink === "function" ? BalloonLink : go.Link),
					// this.$(go.Shape,  // the Shape.geometry will be computed to surround the comment node and
					// 	// point all the way to the commented node
					// 	{ stroke: "lightgray", strokeWidth: 1, fill: COMMENT_BGCOLOR }))
					this.$(go.Link,
					{ routing: go.Link.AvoidsNodes,
						corner: 10 },                  // rounded corners
					this.$(go.Shape, { stroke: COMMENT_BGCOLOR }),
					this.$(go.Shape, { stroke: COMMENT_BGCOLOR, toArrow: "Standard", fill: COMMENT_BGCOLOR })
					)
					// this.$(go.Link,
					// { curve: go.Link.Bezier},
					// this.$(go.Shape, { stroke: COMMENT_BGCOLOR, strokeWidth: 2 }),
					// this.$(go.Shape, { stroke: COMMENT_BGCOLOR, toArrow: "Standard", fill: COMMENT_BGCOLOR })
					// )
				)
			},
			// 画布双击事件。
			diagramDblClickHandle(e, node) {
				zoomDiagram(this.tree, this.flag);
				this.flag = !this.flag;
			},
			// 画布初始化。
			initDiagram() {
				this.tree =
					this.$(go.Diagram, 'tree', {
						// define the layout for the diagram
						// initialContentAlignment: go.Spot.Center,
						contentAlignment: go.Spot.LeftCenter,
						allowMove: false,
						allowZoom: true,
						allowCopy: false,
						allowDelete: false,
						allowHorizontalScroll: true,
						hasHorizontalScrollbar: this.chrome,
						hasVerticalScrollbar: this.chrome,
						allowVerticalScroll: true,					
				        layout: this.$(go.LayeredDigraphLayout, {layerSpacing: 33, columnSpacing: 25}),
						doubleClick: this.diagramDblClickHandle						
					});
			},
			/**
			 * 设置gojs图形。
			 * @param {Object} oData
			 * @param {String} sId
			 * @return {Object}
			 */
			drawTree() {
				// 画布初始化。
				this.initDiagram();
				// 设置主节点样式。
				this.setTreeTemplate();
				// 设置提示框样式。
				// this.setCommentTemplate();	
				// 布局完成后的事件处理，设置初始时节点在中间显示。
				this.tree.addDiagramListener("LayoutCompleted", this.layoutCompletedHandle);
			},
			// 布局完成后的事件处理，设置初始时节点在中间显示。
			layoutCompletedHandle(e) {
				if(this.treeData.node) {						
					let oData = this.treeData.node.filter(o => o.parents == "")[0]
					let node = this.tree.findNodeForKey(oData.key);
					if(node) {
						this.tree.centerRect(node.actualBounds);
					}
				}
			},
			/**
			 * 创建缩略图。
			 * @param {Object} oDiagram
			 * @param {String} sId
			 * @return {Object}
			 */
			createOverview() {
				this.overview = this.$(go.Overview, 'overview', {
					observed: this.tree,
					contentAlignment: go.Spot.Center
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
		position: relative;
	}
	.icons {
		position: relative;
		flex: 0 40px;
		text-align: right;
		padding-right:20px;
		
		.icon-show,
		.icon-hide,
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
	
	#overview {
		width: 200px; 
		height: 100px; 
		position: absolute; 
		left: 0; 
		top: 0; 
		border:1px solid #ccc;
		
		canvas {
			outline:none;
		}
		
	}
</style>