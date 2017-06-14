<template>
	<div class="diagram">
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
			treeData: Object
		},
		data() {
			return {			
				tree: null,
				overview: null,
				flag: true,
				root: ""
			}
		},
		watch: {
		    // 如果 question 发生改变，这个函数就会运行
		    treeData: function () {			
				this.tree && (this.tree.model = new go.GraphLinksModel(this.treeData.node, this.treeData.link));	
		    },
		    key: function() {
		    	console.log(this.key);
		    }
		},
		computed: {
		    key () {
		      return this.$store.state.key
		    },
		    chrome () {
		    	return this.$store.state.chrome
		    }
		},
		mounted() {
			this.drawTree();
			this.createOverview();
		},
		methods: {
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
							nodeSpacing: 100,
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
								onClickNode(e, node, this.tree, this.catalog)
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
							new go.Binding("text", "show_name").makeTwoWay() //
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
								if(node.isTreeExpanded) {
									cmd.collapseTree(node);
									if(node.data.childGroup) {
										node.data.childGroup.split(",").forEach(sGroup => {
											let oGroup = this.tree.findNodeForKey(sGroup);
											oGroup.visible = false;
										})
									}
									node.findTreeChildrenNodes().each(o => {
										if(o.data.childGroup) {
											o.data.childGroup.split(",").forEach(sGroup => {
												let oGroup = this.tree.findNodeForKey(sGroup);
												oGroup.visible = false;
											})
										}
									})
								} else {
									cmd.expandTree(node);
									if(node.data.childGroup) {
										node.data.childGroup.split(",").forEach(sGroup => {
											let oGroup = this.tree.findNodeForKey(sGroup);
											oGroup.visible = true;
										})
									}
									node.findTreeChildrenNodes().each(o => {
										if(o.data.childGroup) {
											o.data.childGroup.split(",").forEach(sGroup => {
												let oGroup = this.tree.findNodeForKey(sGroup);
												oGroup.visible = true;
											})
										}
									})
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
							new go.Binding("text", "show_name")
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
									new go.Binding("text", "key"))
							),
							// create a placeholder to represent the area where the contents of the group are
							$(go.Placeholder, {
								padding: new go.Margin(0, 10)
							})
						) // end Vertical Panel
					); // end Group

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
			
			
		}
	}
</script>

<style>
</style>