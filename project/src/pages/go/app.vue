<template>
	<div id="app">
		<v-header></v-header>
		<div class="content">			
			<div id="myDiagramDiv" class="charts"></div>			
		</div>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	import cat1 from './img/cat1.png'
	import cat2 from './img/cat2.png'
	import cat3 from './img/cat3.png'
	import cat4 from './img/cat4.png'
	import cat5 from './img/cat5.png'
	import cat6 from './img/cat6.png'

	let sNormal= "#73b633";			// 正常节点		颜色+边框
	let sBroke = "#db572d";			// 断链节点		颜色+边框
	let sRecovered = "#fe9500";		// 已修复节点		颜色+边框
	let sCanDo = "#424aaf";	// "#42afa0";			// 可修复节点		边框
	let sActived = "#7642af";		// 选中节点		边框
	
	export default {
		components: {
			'v-header': header
		},
		data() {
			return {

			}
		},
		mounted() {
			this.create();
		},
		computed: {
		},
		methods: {
			create() {
				var $ = this.$;
				// Click and drag the background in the above diagram to pan the view.
				// Click a node to select it, or press down on and drag a node to move it around.
				// To create a selection box, click and hold on the background, then start dragging.
				// Use CTRL-C and CTRL-V, or control-drag-and-drop, to make a copy of the selection.
				// Press the Delete key to delete selected nodes. (Read about more Keyboard Commands.)
				// Since the undo manager was enabled, CTRL-Z and CTRL-Y will undo and redo moves and copies and deletions.

				var myDiagram =
				$(go.Diagram, "myDiagramDiv",
				{
				"initialContentAlignment": go.Spot.Top, // center Diagram contents
				"undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
				layout: $(go.TreeLayout, // specify a Diagram.layout that arranges trees
					{ angle: 90, layerSpacing: 35 })
				});

				// the template we defined earlier
				myDiagram.nodeTemplate =
				$(go.Node, "Horizontal",
					{ background: "#44CCFF" },
					$(go.Picture,
					{ margin: 10, width: 50, height: 50, background: "red" },
					new go.Binding("source")),
					$(go.TextBlock, "Default Text",
					{ margin: 12, stroke: "white", font: "bold 16px sans-serif" },
					new go.Binding("text", "name"))
				);

				// define a Link template that routes orthogonally, with no arrowhead
				myDiagram.linkTemplate =
				$(go.Link,
					// default routing is go.Link.Normal
					// default corner is 0
					{ routing: go.Link.Orthogonal, corner: 5 },
					$(go.Shape, { strokeWidth: 3, stroke: "#555" }) // the link shape

					// if we wanted an arrowhead we would also add another Shape with toArrow defined:
					// $(go.Shape, { toArrow: "Standard", stroke: null }
					);
					
				var model = $(go.TreeModel);
				model.nodeDataArray =
				[ // the "key" and "parent" property names are required,
				// but you can add whatever data properties you need for your app
				{ key: "1",              name: "Don Meow",   source: cat1 },
				{ key: "2", parent: "1", name: "Demeter",    source: cat2 },
				{ key: "3", parent: "1", name: "Copricat",   source: cat3 },
				{ key: "4", parent: "3", name: "Jellylorum", source: cat4 },
				{ key: "5", parent: "3", name: "Alonzo",     source: cat5 },
				{ key: "6", parent: "2", name: "Munkustrap", source: cat6 }
				];
				myDiagram.model = model;

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
			margin: 20px;
			background-color: #FFFFFF;
			
			
			.charts {
				width: 100%;
				height: 100%;
			}
			
		}
	}
	
</style>