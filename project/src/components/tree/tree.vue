<template>
	<div class="diagram" ref="diagram">
		<div class="icons">
			<i class="icon icon-20 icon-hide" v-if="!tipsShow" @click="showTips"  title="显示详情"></i>
            <i class="icon icon-20 icon-show" v-else @click="hideTips"  title="隐藏详情"></i>
			<i class="icon icon-20 icon-exportImg" @click="onSvaeImgHandler1" title="生成图片"></i>
			<i class="icon icon-20 icon-print" @click="onPrintImgHandler" title="打印图片"></i>
			<i class="icon icon-20 icon-fullScreen" v-if="!treeFullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
		</div>
		<div id="tree" style="height: 100%;"></div>
		<!--div id="overview"></div-->
		<a href="" ref="downloadImage" v-show="false"></a>
	</div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import warehouse from 'assets/img/warehouse.png'
	import workshop from 'assets/img/workshop.png'
	import rework from 'assets/img/rework.png'
	import barcodeManage from 'assets/img/barcodeManage.png'
	import {onNodeSelectionChange, onClickNode, onContextClickNode, onDoubleClickNode, tooltipTextConverter, zoomDiagram} from 'assets/js/go-util'

	// 注释背景颜色。
	const COMMENT_BGCOLOR = "rgba(66,175,143,0.2)";//"rgba(44,52,60,0.7)";//
	const COMMENT_TEXTCOLOR = "#333";
	const HIGHLIGHT_BG_COLOR = "#f5efdc";//"#42af8f";//"#6DAB80";
	const NORMAL_TEXT_COLOR = "#333";//"#333";
	const TABLE_COLOR = "#42af8f"
	const ERROR_TEXT_COLOR	= "red"
	
	export default {
		props: {
			treeData: Object
		},
		data() {
			return {
				// 默认隐藏详细。
				tipsShow: false,
				tree: null,
				overview: null,
				flag: true,
				groupClick: false
			}
		},
		watch: {
		    data: function () {	
		    	if(this.tree) {	
					if(this.tipsShow) {
						// 若需要显示详情。
//						this.data.node.forEach(o => o.isMaterialNode ? (o.category = 'material'):(o.category = 'process'))
						this.data.node.forEach(o => o.category = 'process')
					}
					
					this.tree.model = new go.GraphLinksModel(this.data.node, this.data.link);	    	
					this.tree.model.linkFromPortIdProperty = "fromPort";
					this.tree.model.linkToPortIdProperty = "toPort";
		    	}				
		    },
		    key: function() {
		    	if(this.type == "catalog") {
		    		this.$nextTick(function() {
		    			this.setHighted()
		    			this.setSelection();
		    			this.fitToCurrentKey()
		    		})
		    	}else {
		    		this.setHighted()
		    	}
		    },
		    root: function() {
//		    	this.redrawTree();
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
			// 高亮的数据。
			highted() {
				return this.$store.state.highted
			},
			// 选中样式。
			selectionAdornmentTemplate () {
				return this.$(go.Adornment, "Spot", {
						isShadowed: true
					},
					this.$(go.Panel, "Auto", {
							defaultAlignment: go.Spot.Left,
							// 设置选中节点内边距，解决节点文字与图片的距离过近的问题。
							padding: new go.Margin(0, 20, 0, 0)// b,l,t,r
						},
						this.$(go.Shape, {
							fill: HIGHLIGHT_BG_COLOR, //"#ffffff",
							stroke: "#F09900",
							strokeWidth: 1
						},
//						new go.Binding("fill", "isHighlighted", h => h ? HIGHLIGHT_BG_COLOR : "#ffffff")
						),
						this.$(go.Picture, {
								position: new go.Point(0, 0),
								width: 16,
								height: 16,
								background: null,
								margin: new go.Margin(0, 5, 0, 4),
								imageStretch: go.GraphObject.Uniform,
							},
							new go.Binding("source", "iconType", this.getNodeIcon)
						),
						this.$(go.Placeholder) // this represents the selected Node
					),

					this.$(go.TextBlock, {
							row: 1,
							font: "14pt Helvetica, 微软雅黑, sans-serif",
							stroke: NORMAL_TEXT_COLOR,	//"#333333",
							margin: 5
						},
						new go.Binding("stroke", "", this.getTextColor),
						new go.Binding("text", "name")
					)
				)
			},
			// 物料节点详细信息模板。
		    materialTemplate() {
		      	return this.$(go.Panel, "TableRow",
		      				this.$(go.TextBlock, 
		      						new go.Binding("text", "batchNo"), // 批次
									{ column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock, 
									new go.Binding("text", "quantity"),	// 数量
									{ column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center })
		      			)
		    },
		    // 工序-投产物料相同。
		    processSameMaterialTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.Panel, "Table",
								{defaultColumnSeparatorStroke: TABLE_COLOR},
								this.$(go.TextBlock,
									new go.Binding("text", "equipmentName"), // 设备
									{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.Panel, "Table",
									this.$(go.RowColumnDefinition, { column: 1, separatorStroke: TABLE_COLOR }),
									this.$(go.RowColumnDefinition, { row: 1, separatorStroke: TABLE_COLOR}),
									this.$(go.RowColumnDefinition, { row: 2, separatorStroke: TABLE_COLOR}),
									{column:1},
									new go.Binding("itemArray", "list"),
									{
										itemTemplate:
											this.$(go.Panel, "TableRow",
												this.$(go.TextBlock,
													new go.Binding("text", "type"),
													{ column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR}
												),
												this.$(go.Panel, "Table",
													{
														defaultRowSeparatorStroke: TABLE_COLOR,
														column: 1
													},
													new go.Binding("itemArray", "list"),
													{
														itemTemplate:
															this.$(go.Panel, "TableRow",
																this.$(go.TextBlock,
																	new go.Binding("text", "batchNo"),
																	{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR}
																),
																this.$(go.TextBlock,
																	new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity),		// 总数/滞留数
																	{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR}
																)
															)
													}
												)
											)
									}
								)
							)
						)
		    },
		    // 工序-投产物料不同。
		    processDiffMaterialTemplate() {
		    	return 	this.$(go.Panel, "TableRow",
							this.$(go.Panel, "Table",
								{defaultColumnSeparatorStroke: TABLE_COLOR},
								this.$(go.TextBlock,
									new go.Binding("text", "equipmentName"), // 设备
									{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.Panel, "Table",
									this.$(go.RowColumnDefinition, { column: 1, separatorStroke: TABLE_COLOR }),
									this.$(go.RowColumnDefinition, { row: 1, separatorStroke: TABLE_COLOR}),
									this.$(go.RowColumnDefinition, { row: 2, separatorStroke: TABLE_COLOR}),
									{column:1},
									new go.Binding("itemArray", "list"),
									{
										itemTemplate:
											this.$(go.Panel, "TableRow",
												this.$(go.TextBlock,
													new go.Binding("text", "type"),
													{ column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR}
												),
												this.$(go.Panel, "Table",
//													this.$(go.RowColumnDefinition, { column: 1, separatorStroke: TABLE_COLOR }),
													{
														defaultRowSeparatorStroke: TABLE_COLOR,
														column: 1
													},
													new go.Binding("itemArray", "list"),
													{
														itemTemplate:
															this.$(go.Panel, "TableRow",
																this.$(go.TextBlock,
																	new go.Binding("text", "materialName"),
																	{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR}
																),
																this.$(go.TextBlock,
																	new go.Binding("text", "batchNo"),
																	{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR}
																),
																this.$(go.TextBlock,
																	new go.Binding("text", "",  o => o.remainQuantity + "/" + o.quantity),		// 总数/滞留数
																	{column: 2, margin: 5, stroke: COMMENT_TEXTCOLOR}
																)
															)
													}
												)
											)
									}
								)
							)
						)
		    },
		    // 条码管理节点详细信息模板。
		    barcodeTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.TextBlock, 
								new go.Binding("text", "destBarcode"), // 条码
								{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock,
								new go.Binding("text", "batchNo"), // 批次
								{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center}),
							this.$(go.TextBlock, 
								new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity),	// 数量
								{column: 2, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
						)
		    },
		    // 返工节点详细信息模板。
		    reworkTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.TextBlock,
								new go.Binding("text", "batchNo"), // 批次
								{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock, 
								new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity),	// 数量
								{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock, 
								new go.Binding("text", "qualityTypeName"),	// 质量
								{column: 2, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
						)
		    },
		    // 车间操作-结转+退料
		    workshopCarryTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.TextBlock, 
								new go.Binding("text", "materialName"), // 条码
								{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock, 
								new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity),	// 数量
								{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
						)
		    },
		    // 车间操作-车间调整 | 仓库操作-库存调整详细信息模板。
		    workshopTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.Panel, "Table",
								this.$(go.RowColumnDefinition, { column: 2, separatorStroke: TABLE_COLOR}),
								this.$(go.TextBlock,
									new go.Binding("text", "srcBarcode"), // 源条码
									{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.TextBlock,
									new go.Binding("text", "destAdjustQuantity"), // 源条码
									{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.Panel, "Table",
									{column:2, defaultRowSeparatorStroke: TABLE_COLOR},
									new go.Binding("itemArray", "list"),
									{
										itemTemplate:
											this.$(go.Panel, "TableRow",
												this.$(go.TextBlock,
													new go.Binding("text", "destBarcode"),
													{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center}
												),
												this.$(go.TextBlock,
													new go.Binding("text", "", o => o.remainQuantity + "/" + o.destAdjustQuantity),	// 调整数/滞留数
													{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center}
												)
											)
									}
								)
							)
						)
		    },
		    // 仓库操作-库存转储节点详细信息模板。
		    warehouseDumpTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.Panel, "Table",
								this.$(go.RowColumnDefinition, { column: 2, separatorStroke: TABLE_COLOR}),
								this.$(go.TextBlock,
									new go.Binding("text", "batchNo"), // 批次
									{column: 0,  margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.TextBlock,
									new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity), // 总数/滞留数
									{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								this.$(go.Panel, "Table",
										{column: 2, defaultRowSeparatorStroke: TABLE_COLOR},
									this.$(go.TextBlock, "源:",
										{row: 0, column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR }),
									this.$(go.TextBlock, 
										new go.Binding("text", "", o => o.srcWarehouse + o.srcWarehouseLocation), // 仓库库位
										{row: 0, column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR }),
									this.$(go.TextBlock, "目标:",
										{row: 1, column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR }),
									this.$(go.TextBlock, 
										new go.Binding("text", "", o => o.destWarehouse + o.destWarehouseLocation), // 仓库库位
										{row: 1, column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR }),
								)
							)
						)
		    },
		    // 仓库操作其他节点详细信息模板。
		    warehouseTemplate() {
		    	return this.$(go.Panel, "TableRow",
							this.$(go.TextBlock, 
								new go.Binding("text", "batchNo"), // 批次
								{column: 0, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
							this.$(go.TextBlock, 
								new go.Binding("text", "", o => o.remainQuantity + "/" + o.quantity),	// 总数/滞留数
								{column: 1, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center}),
							this.$(go.TextBlock, 
								new go.Binding("text", "", o => o.destWarehouse + o.destWarehouseLocation),	// 仓库库位
								{column: 2, margin: 5, stroke: COMMENT_TEXTCOLOR, alignment: go.Spot.Center }),
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
							this.$(go.Shape, "Rectangle", { 
								name: "SELECTION", 
								fill: "transparent", 
								strokeWidth: 0, 
								stroke: "#F09900" 
							},
							new go.Binding("fill", "isHighlighted", function(h) { return h ? HIGHLIGHT_BG_COLOR : "transparent" }).ofObject()
								//new go.Binding("fill", "isHighlighted", h => h ? HIGHLIGHT_BG_COLOR : "transparent")
							),
							this.$(go.Panel, "Horizontal", 
								this.$(go.Picture, {
										width: 20,
										height: 20,
										background: null,
										margin: new go.Margin(0, 0, 0, 4),
										imageStretch: go.GraphObject.Uniform,
									},
									new go.Binding("source", "iconType", this.getNodeIcon)
								),
								this.$(go.TextBlock, {
										name: "TB",
										row: 1,
										font: "14pt Helvetica, 微软雅黑, sans-serif",
										stroke: "#333333",
										margin: 5,
										// textValidation:onEditName
									},
									new go.Binding("stroke", "", this.getTextColor),
									new go.Binding("text", "name"),//.makeTwoWay() //
//									new go.Binding("stroke", "isHighlighted", function(h) { return h ? NORMAL_TEXT_COLOR : "#333333" }).ofObject()
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
			detailNodeTemplate() {
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
								this.$(go.Shape, "Rectangle", {
									name: "SELECTION",
									fill: "transparent",
									strokeWidth: 0,
									stroke: "#F09900"
								},
								new go.Binding("fill", "isHighlighted", function(h) { return h ? HIGHLIGHT_BG_COLOR : "transparent" }).ofObject()
								),
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
										new go.Binding("source", "iconType", this.getNodeIcon)
									),
									this.$(go.TextBlock, {
											name: "TB",
											row: 1,
											font: "14pt Helvetica, 微软雅黑, sans-serif",
											stroke: "#333333",
											margin: 5,
											// textValidation:onEditName
										},
										new go.Binding("stroke", "", this.getTextColor),
										new go.Binding("text", "name")//.makeTwoWay() //
//										new go.Binding("stroke", "isHighlighted", function(h) { return h ? NORMAL_TEXT_COLOR : "#333333" }).ofObject()
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
							this.$(go.Panel,"Auto",
								this.$(go.Shape, "Rectangle",
									{stroke: TABLE_COLOR , fill: "white"}),
								this.$(go.Panel, "Table", { background: "transparent"},
									new go.Binding("itemArray", "sumList"),//materialInfoList
									new go.Binding("itemTemplate", "detailType", this.fieldTemplate),		// 绑定节点详细信息模板。
									{
										defaultAlignment: go.Spot.Left,
										defaultRowSeparatorStroke: TABLE_COLOR
									},
									this.$(go.Panel, "TableRow",
										{ isPanelMain: true, background: TABLE_COLOR },  // needed to keep this element when itemArray gets an Array
										new go.Binding("visible", "detailTitle", detailTitle => detailTitle ? true : false),
										this.$(go.TextBlock, new go.Binding("text", "detailTitle"), // 物料名称
											// 标题显示的总列。
											{ row: 0, column: 0, columnSpan: 3,  margin: 5,  alignment: go.Spot.Center, font: "bold 10pt sans-serif", stroke: "white"})
									)
								)
							),
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
						this.$(go.Panel,"Auto",
							this.$(go.Shape, "Rectangle",
								{stroke: TABLE_COLOR , fill: "white"}),
							this.$(go.Panel, "Table", { background: "transparent"},
								new go.Binding("itemArray", "sumList"),//materialInfoList
								new go.Binding("itemTemplate", "detailType", this.fieldTemplate),		// 绑定节点详细信息模板。
								{
									defaultAlignment: go.Spot.Left,
									defaultRowSeparatorStroke: TABLE_COLOR
								},
								this.$(go.Panel, "TableRow",
									{ isPanelMain: true, background: TABLE_COLOR },  // needed to keep this element when itemArray gets an Array
									new go.Binding("visible", "detailTitle", detailTitle => detailTitle ? true : false),
									this.$(go.TextBlock, new go.Binding("text", "detailTitle"), // 物料名称
											// 标题显示的总列。
//											new go.Binding("columnSpan", 'columnIndex'),
										{ row: 0, column: 0, columnSpan: 3,  margin: 5, alignment: go.Spot.Center, font: "bold 10pt sans-serif", stroke: "white"})//new go.Margin(2, 2, 0, 2)font: "bold 10pt sans-serif",
								)
							)
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
			// 获取颜色。-- 异常节点颜色处理。
			getTextColor(o) {
				// 废品或容器清空或库存损益
				if(o.nodeType == "111" || o.nodeType == "202" || o.nodeType == "10004") {
					return ERROR_TEXT_COLOR 
				}else {
					return NORMAL_TEXT_COLOR
				}
			},
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
			// 根据模板类型获取展示的详细信息模板。
			fieldTemplate(sType) {
				switch(sType) {
					// 物料
					case "materialTemp":
						return this.materialTemplate
						break;
					// 条码管理
					case "barcodeManageTemp":
						return this.barcodeTemplate
						break;
					// 返工
					case "reworkTemp":
						return this.reworkTemplate
						break;
					// 工序-投产物料相同
					case "processSameMaterialTemp":
						return this.processSameMaterialTemplate
						break;
					// 工序-投产物料不同
					case "processDiffMaterialTemp":
						return this.processDiffMaterialTemplate
						break;
					// 车间操作-结转
					case "workshopCarryoverTemp":
						return this.workshopCarryTemplate
						break;
					// 车间操作-退料
					case "workshopReturnMateiralTemp":
						return this.workshopCarryTemplate
						break;
					// 车间操作-车间调整
					case "workshopTemp":
						return this.workshopTemplate
						break;
					// 仓库操作-库存转储
					case "warehouseDumpTemp":
						return this.warehouseDumpTemplate
						break;
					// 仓库操作-库存调整
					case "warehouseAdjustTemp":
						return this.workshopTemplate
						break;
					// 仓库操作-其他
					case "warehouseTemp":
						return this.warehouseTemplate
						break;
					default:
						break;
				}
			},
			showTips() {
				this.tipsShow = !this.tipsShow;
				this.tree.nodes.each(node=> {
					let bVisible = node.visible,	
//						cat = node.data.isMaterialNode ? "material": "process";
						cat = "process"

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
				debugger
				if(this.treeFullscreen && node.data.nodeType !== 10003 && node.data.nodeType !== 10004) {
					this.restoreScreenClick();
				}
				
				let aHighted = this.highted;
				this.$store.commit({
					type: "updateType",
					key: "tree"
				});
				this.$store.commit({
					type: "updateKey",
					key: node.data.key
				});
				
				// 如果当前点击的不是高亮的值，则将高亮清空。
				if(aHighted.length && !aHighted.includes(node.data.key)) {
					this.$store.commit({
						type: "updateHeighted",
						data: []
					});
				}

				// 点击节点信息展示。
				let nodeType = node.data.nodeType  //被点击节点的 nodeType
				if(nodeType === 101 || nodeType === 102 || nodeType === 103 || nodeType === 111 || nodeType === 112) {  // 仓库操作     
					this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
						nodeType: nodeType
					})
					this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
						detailInfos: node.data.detailInfos
					})
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
					this.$router.replace({ 
						path: "/workshop",
						query: {
							"detailInfos": node.data.detailInfos,
							"key": node.data.nodeType,
							"_tag":  new Date().getTime().toString().substr(-5)
						}										
					})
				}else if(nodeType === 201 || nodeType === 202 || nodeType === 203) { 									// 条码管理     
					this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
						nodeType: nodeType
					})
					this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
						detailInfos: node.data.detailInfos
					})
					this.$router.replace({ 
						path: "/barcodeManage",
						query: {
							"detailInfos": node.data.detailInfos,
							"key": node.data.nodeType,
							"_tag":  new Date().getTime().toString().substr(-5)
						}										
					})
				}else if(nodeType === 10003 || nodeType === 10004) { 
					console.log("物料节点不展示。")													// 物料  
					// this.$store.commit('updateNodeType', {	//将nodeType保存到vuex
					// 	nodeType: nodeType
					// })
					// this.$store.commit('updateDetailInfos', {	//将detailInfos保存到vuex
					// 	detailInfos: node.data.detailInfos
					// })   
					// this.$router.replace({ 
					// 	path: "/stock",
					// 	query: {
					// 		"detailInfos": node.data.detailInfos,
					// 		"key": node.data.nodeType,
					// 		"_tag":  new Date().getTime().toString().substr(-5)
					// 	}										
					// })
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
				// 设置组点击。
				this.groupClick = true
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
				templmap.add("process", this.detailNodeTemplate);
//				templmap.add("material", this.materialNodeTemplate);
//				templmap.add("process", this.processNodeTemplate);
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
				// 组点击不执行操作。
				if(!this.groupClick) {
					this.groupClick = false;
					this.fitToCurrentKey()
				}
			},
			// 当选中时定位到当前。
			fitToCurrentKey() {
				if(this.treeData.node) {
					// 如果存在显示的key值，则定位到显示的数据，否则定位到第一个数据。
					let oData = this.treeData.node.filter(o => this.key ? o.key == this.key : o.parents.includes("0") )[0]
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
			redrawTree1() {	
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
			
			/**
			 * 展开右侧节点。
			 * 
			 */
			redrawTree() {
				this.tree.nodes.each(o => {
					if(!o.data.group) {				
						o.visible = false
					}
				});
				
				this.root.forEach( sKey => {
					let oRoot = this.tree.findNodeForKey(sKey);
					oRoot.visible = true;
					
					oRoot.findTreeChildrenNodes().each(o => {
						o.visible = true;
					})
					oRoot.findTreeParts().each(o => {
						o.visible = true;
					})
				})
			},
			
			
			// 设置选中。
			setSelection() {
				if(!this.data.node.some(o => o.key == this.key)) {
					return;
				}
			    this.tree.nodes.each(obj => {
			    	// 取消选中样式。
			    	if(obj.isSelected) {
				    	obj.isSelected = false;
						
						if(obj.isHighlighted) {
							obj.background = HIGHLIGHT_BG_COLOR;
							// 高亮，字体颜色显示本身的颜色。
//							obj.findObject("TB") && (obj.findObject("TB").stroke = NORMAL_TEXT_COLOR);
						}else {
							obj.background = null;
							// 判断数据的类型
//					    	obj.findObject("TB") && (obj.findObject("TB").stroke = "#333");
						}
			    	}
			    });
				
				let oData = this.treeData.node.filter(o => o.key == this.key)[0],
					oNode = this.tree.findNodeForKey(oData.key);

				if(oNode) {				
					oNode.isSelected = true;
				}
				
				if(oData.group) {
					// 若节点在组合中。
					if(!this.tree.findNodeForKey(oData.group).isSubGraphExpanded) {
						this.tree.findNodeForKey(oData.group).expandSubGraph();
					}
				}
			},
			
			// 设置高亮。
			setHighted() {
				let aHighted = this.highted
				
				this.tree.startTransaction("highlight");
				
				// 清空高亮。
				this.tree.clearHighlighteds();
				
				// 是否需要高亮显示。
				this.tree.nodes.each(obj => {
			    	// 取消选中样式。
			    	if(aHighted.includes(obj.data.key)) {
						obj.isHighlighted = true;
						obj.data.isHighlighted = true;
					}else {
						obj.isHighlighted = false;
						obj.data.isHighlighted = false;
					}
			    });
			    
			    this.tree.commitTransaction("highlight");
			},

			/**
			* 生成图片。
			* @param {Object} event
			* @returns {void}
			*/
			onSvaeImgHandler(event) {
				let oImage = this.tree.makeImage({
					scale: 1,
					maxSize: new go.Size(Infinity, Infinity),
					// background: "rgb(248,248,240)"
					}),
					// 图片地址。
					sImage = oImage.src;
					
				// 当数据量过大时，下载失败
				this.$refs.downloadImage.href = sImage;
				this.$refs.downloadImage.download = "追溯主图.png";
				this.$refs.downloadImage.click();

//				 var w=window.open('about:blank','image from canvas');
//				 w.document.write("<img src='"+sImage+"' alt='from canvas'/>");	
			},	
			/**
			 * 生成图片。
			 * @param {Object} event
			 * @return {void}
			 */
			onSvaeImgHandler1(event) {
				let oImage = this.tree.makeImage({
					scale: 1,
					maxSize: new go.Size(Infinity, Infinity),
					// background: "rgb(248,248,240)"
					}),
					// 图片地址。
					sImage = oImage.src,
	            	aLink = this.$refs.downloadImage;
					
				// 下载图片
				downloadFile("追溯主图.png", sImage);
					
				// 数据转换。
				function base64Img2Blob(code){
	                let parts = code.split(';base64,');
	                let contentType = parts[0].split(':')[1];
	                let raw = window.atob(parts[1]);
	                let rawLength = raw.length;
	
	                let uInt8Array = new Uint8Array(rawLength);
	
	                for (let i = 0; i < rawLength; ++i) {
	                  uInt8Array[i] = raw.charCodeAt(i);
	                }
	
	                return new Blob([uInt8Array], {type: contentType}); 
	            }
				// 下载图片。
	            function downloadFile(fileName, content){
	                let blob = base64Img2Blob(content); //new Blob([content]);
	                let evt = document.createEvent("HTMLEvents");
	                
	                evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
	                aLink.download = fileName;
	                aLink.href = URL.createObjectURL(blob);
	         		aLink.click()
	                aLink.dispatchEvent(evt);
	            }
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
					// w.document.close();
					// w.focus();
					
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