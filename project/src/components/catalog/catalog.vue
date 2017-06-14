<template>
	<div id="catalog" style="height: 100%;"></div>
</template>

<script>
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import {onNodeSelectionChange, onClickNode, onContextClickNode, onDoubleClickNode, tooltipTextConverter, zoomDiagram} from 'assets/js/go-util'

	export default {
		props: {
			catalogData: Array
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
		    	console.log(this.key);
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
						})
					});

				this.catalog.nodeTemplate =
					$(go.Node, {
							// no Adornment: instead change panel background color by binding to Node.isSelected	            
							click: (e, node) => {
								this.$store.commit({
									type: "updateCatalogKey",
									key: node.data.key
								});
								
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
								new go.Binding("text", "show_name", s => s)
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
							new go.Binding("text", "show_name")
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

			}
		}
	}
</script>

<style>
</style>