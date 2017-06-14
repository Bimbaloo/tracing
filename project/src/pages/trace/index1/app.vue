<template>
	<div id="app">
		<v-header></v-header>
		<el-row :gutter="0" class="content"  v-loading.fullscreen.lock="fullscreenLoading">
			<el-col :xs="12" :sm="9" :md="6" :lg="4" class="nav" v-if="!collapse">
				<div id="catalog" style="height: 100%;"></div>
			</el-col>
			<el-col :xs="collapse?24:12" :sm="collapse?24:15" :md="collapse?24:18" :lg="collapse?24:20" class="router">
				<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapse=true"></i>
				<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="collapse=false"></i>
				<div class="router-container" ref="routerContainer">
					<v-tree :tree-data="treeData"></v-tree>
					<div class="view">
						<router-view></router-view>
					</div>
				</div>

			</el-col>
		</el-row>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	import tree from 'components/tree/tree.vue'
	import material from 'assets/img/material.png'
	import process from 'assets/img/process.png'
	import {onNodeSelectionChange, onClickNode, onContextClickNode, onDoubleClickNode, tooltipTextConverter, zoomDiagram} from 'assets/js/go-util'
	import {aoTestData} from './data'
	
	export default {
		components: {
			'v-header': header,
			'v-tree': tree
		},
		data() {
			return {
				fullscreenLoading: false,
				// 侧栏是否收缩。
				collapse: false,
				url: "/trace/trace-main",
				data: [],
				treeData: {},
				catalogData: [],
				params: [],
				tree: null,
				overview: null,
				catalog: null,
				chrome: /chrome/i.test(navigator.userAgent),
				flag: true,
				root: ""
			}
		},
		computed: {
			query: function() {
				let url = location.search; //获取url中"?"符后的字串 
				let oRequest = {};
				if(url.indexOf("?") != -1) {
					let strs = url.substr(1).split("&");

					for(let i = 0; i < strs.length; i++) {
						oRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
					}
				}
				return oRequest;
			}
		},
		created() {
			// 组件创建完后获取数据
			// 此时 data 已经被 observed 了
			let sSelected = sessionStorage.getItem("trace_" + this.query.tag);
			if(sSelected) {
				this.params = JSON.parse(sSelected);
			}

			// 加载数据。
//			this.fetchData();	
			this.data =aoTestData;
			// 格式化数据。
			this.parseTreeData();
			this.parseCatalogData();
		},
		mounted() {
			this.drawDiagram();
		},
		methods: {
			fetchData() {
				this.fullscreenLoading = true;
				
				this.$get(this.url, this.params)
					.then((res) => {
						this.fullscreenLoading = false;
						if(!res.errorCode) {
							this.data = res.data;
							if(!this.data.length) {
								this.$message.warning('查无数据。');
							} else {
								this.drawDiagram();
							}
						} else {
							this.$message.error('查询出错！');
						}
					})
					.catch((err) => {
						this.fullscreenLoading = false;
						this.$message.error('查询出错！');
					})
			},

			// 绘制图形树。
			drawDiagram() {
				// 格式化数据。
//				this.parseTreeData();
//				this.parseCatalogData();

				// 绘制右侧树。
//				this.drawTree();
//				this.createOverview();

				// 绘制左侧导航。
				this.drawCatalog();
			},

			/**
			 * 设置右侧图表树结构数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseTreeData() {
				let aoData = this.data,
					aoDiagramData = [],
					aoDiagramLinkData = [],
					oTempData = {},
					oData = {},
					oGroup = {};

				for(let i = aoData.length - 1; i >= 0; i--) {
					oTempData = {};
					oData = aoData[i];

					oTempData.show_name = oData.show_name;
					oTempData.name = oData.name;
					oTempData.key = oData.name;
					oTempData.code = oData.code;
					oTempData.level = oData.level;
					oTempData.parent = oData.parent;
					oTempData.type = oData.type;

					let sGroup = oData.remark;
					oTempData.group = sGroup;

					// 获取子组
					aoData.forEach(oFilter => {
						if(oFilter.remark && oFilter.parent == oData.name && oFilter.remark != sGroup) {
							if(oTempData.childGroup) {
								oTempData.childGroup += ",";
							} else {
								oTempData.childGroup = "";
							}
							oTempData.childGroup += oFilter.remark;
						}
					})
					aoDiagramData.push(oTempData);

					if(sGroup) {
						// 产线型工序。
						if(!oGroup[sGroup]) {
							oGroup[sGroup] = [];
							aoDiagramData.push({
								show_name: sGroup,
								name: sGroup,
								key: sGroup,
								type: "3",
								isGroup: true
							})
						}

					}

					aoDiagramLinkData.push({
						from: oData.parent,
						to: oData.name
					})

					if(oData.parent == "") {
						this.root += oTempData.key;
					}

				}

				this.treeData = {
					node: aoDiagramData,
					link: aoDiagramLinkData
				};

			},

			/**
			 * 获取树形数据。
			 * @param {Array} aoData
			 * @return {void}
			 */
			parseCatalogData() {
			
				let aoData = this.data,
					aoCopyData = [],
					self = this;

				aoData.forEach(oData => {
					aoCopyData.push({
						"show_name": oData.show_name,
						"name": oData.name,
						"key": oData.name,
						"type": oData.type,
						"group": oData.remark,
						"parent": oData.parent
					})
				});

				for(let i = aoCopyData.length - 1; i >= 0; i--) {
					let oData = aoCopyData[i];

					if(oData.parent === "") {
						this.catalogData.push(oData);

						aoCopyData.splice(i, 1);
						_findChildrenData(aoCopyData, oData.key, oData.key)
					}
				}

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

						if(oData && oData.parent === sKey) {
							oData.parent = sParentKey;
							self.catalogData.push(oData);

							aoCopyData.splice(i, 1);

							if(oData.type != 1) {
								sNewKey = sParentKey;
							} else {
								sNewKey = oData.key;
							}

							if(aoCopyData.length) {
								_findChildrenData(aoCopyData, oData.key, sNewKey)
							}
						}
					}
				}
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

				this.tree.model = new go.GraphLinksModel(this.treeData.node, this.treeData.link);
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
							click: this.onClickCatalogNode,
							doubleClick: onDoubleClickNode,
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

				this.catalog.model = new go.TreeModel(this.catalogData);
			},

			/**
			 * 点击左侧树节点。
			 * @param {Object} e
			 * @param {Object} node
			 * @return {void}
			 */
			onClickCatalogNode(e, node) {
				this.expandAllTree(node);

				let nodeInMyShowInTable = this.tree.findNodeForKey(node.data.key);
				nodeInMyShowInTable.isSelected = true;

////				let validNode = this.findValidNode(node);
//				let validNode = null;
//				if(node.data.type == "1") {
//					validNode = this.tree.findNodeForKey(node.data.key);
//				}else {
//					validNode = this.tree.findNodeForKey(node.findTreeParentNode().data.key);
//				}
//
//				if(validNode) {
////					let nodeInMy = this.tree.findNodeForKey(validNode.data.key);
//					this.showAllNode();
//					this.hiddenParent(validNode);
//				}

				this.catalog.nodes.each(obj => {
					obj.background = null;
					obj.findObject("TB").stroke = "#fff";
				});

				if(node.isSelected) {
					node.background = "white";
					node.findObject("TB").stroke = "#333";
				} else {
					node.background = null;
					node.findObject("TB").stroke = "#fff";
				}

								
				if(node.data.group) {
					// 若节点在组合中。
					if(!this.tree.findNodeForKey(node.data.group).isSubGraphExpanded) {
						this.tree.findNodeForKey(node.data.group).expandSubGraph();
					}
				}
			},

			/**
			 * 展示所有节点。
			 * @return {void}
			 */
			showAllNode() {
				this.tree.findTreeRoots().each(obj => this.showAllChildren(obj));
			},

			/**
			 * 展示所有子节点。
			 * @param {Object} parentNode
			 * @return {void}
			 */
			showAllChildren(parentNode) {
				if(parentNode.visible) {
					return;
				}
				let children = parentNode.findTreeChildrenNodes();
				children.each(obj => this.showAllChildren(obj));
				parentNode.visible = true;
			},

			/**
			 * 展示所有节点。
			 * @return {void}
			 */
			hiddenAllNode() {
				this.tree.findTreeRoots().each(obj => this.hiddenAllChildren(obj));
			},

			/**
			 * 展示所有子节点。
			 * @param {Object} parentNode
			 * @return {void}
			 */
			hiddenAllChildren(parentNode) {
				if(!parentNode.visible) {
					return;
				}
				let children = parentNode.findTreeChildrenNodes();
				children.each(obj => this.hiddenAllChildren(obj));
				parentNode.visible = false;
			},
			
			/**
			 * 隐藏父级节点。
			 * @param {Object} node
			 * @return {void}
			 */
			hiddenParent(node) {
				var parent = node.findTreeParentNode();
				if(parent) {
					parent.visible = false;
					this.hiddenParent(parent);
					this.hiddenParentChildren(parent, node);
				} else {
					return;
				}
			},

			/**
			 * 隐藏父级节点的子节点。
			 * @param {Object} node
			 * @param {Object} currentNode
			 * @return {void}
			 */
			hiddenParentChildren(node, currentNode) {
				var childrens = node.findTreeChildrenNodes();
				childrens.each(obj => {
					if(obj != currentNode) {
						obj.visible = false;
						this.hiddenParentChildren(obj);
					}
				});
			},

			/**
			 * 找到可用的节点。
			 * @param {Object} node
			 * @return {Object}
			 */
			findValidNode(node) {
				if(node.data.type == 1) {
					return node;
				}

				let parentNode = node;

				while(1) {
					let nodeTmp = parentNode.findTreeParentNode();
					if(!nodeTmp) {
						return parentNode;
					}
					if(nodeTmp.data.type == 1) {
						return nodeTmp;
					}
					parentNode = nodeTmp;
				}
			},

			/**
			 * 展开所有子节点。
			 * @param {Object} obj
			 * @param {Object} key
			 * @return {void}
			 */
			expandAllChildren(obj, key){
			    if(!obj.isTreeExpanded){
			        obj.expandTree();
			    }
			    if(obj.isSelected && key!=obj.data.key){
			        obj.isSelected = false;
			    }
			    var children = obj.findTreeChildrenNodes();
			    if(!children){
			        return;
			    }
			    children.each(node => this.expandAllChildren(node,key));
			},
			
			/**
			 * 展开右侧节点。
			 * @param {Object} oData
			 * @return {void}
			 */
			expandAllTree(oNode) {
//				var root = this.tree.findTreeRoots();
//			    root.each(obj => this.expandAllChildren(obj, oData.key));
				debugger
//				let oTree = this.tree;
//				let oCatalog = this.catalog;
//				let oInitTreeData = this.treeData;
//				let oTreeNode = null;
//				
//				if(oNode.data.type == "1") {
//					oTreeNode = oTree.findNodeForKey(oNode.data.key);
//				}else {
//					oTreeNode = oTree.findNodeForKey(oNode.findTreeParentNode().data.key);
//				}
//				
//				let aoTreeData = [];
//				
//				aoTreeData.push(oTreeNode.data);
//				
//				if(oTreeNode.data.childGroup) {
//					aoTreeData.push(this.treeData.node.filter(o => o.key == oTreeNode.data.childGroup)[0]);
//				}
//				
//				_setData(oTreeNode);
//
//				let aoNewLinkData = this.treeData.link.filter(o => aoTreeData.filter(item => item.key == o.from).length && aoTreeData.filter(item => item.key == o.to).length);
//				
//				this.tree.model = new go.GraphLinksModel(aoTreeData, aoNewLinkData);
//				this.root = oTreeNode.data.key;
//				
//				if(oNode.data.group) {
//					// 若节点在组合中。
//					if(!this.tree.findNodeForKey(oNode.data.group).isSubGraphExpanded) {
//						this.tree.findNodeForKey(oNode.data.group).expandSubGraph();
//					}
//				}
//				
//				function _setData(oChildNode) {
//					let oChild = oChildNode.findTreeChildrenNodes();
//					if(oChild) {
//						
//						oChild.each(node => {
//							aoTreeData.push(node.data);
//							_setData(node);
//						});
//					}
//				}
				
//				debugger
				let oRoot = {},
					aoNewData = [],
					aoNewLinkData = [],
					aoCopyData = Object.assign([], this.treeData.node),
					oGroup = {},
					oData = oNode.data,
					self = this;

				// 找到根节点。
				_findRoot(oData.key);

				if(oRoot.key != this.root) { // 若根节点改变，重新找到链路数据。
					aoNewData.push(oRoot);

					_spliceData(aoCopyData, oRoot.key);

					let sGroup = oRoot.group;
					if(sGroup && !oGroup[sGroup]) {
						oGroup[sGroup] = 1;
						aoNewData.push(aoCopyData.filter(o => o.key == sGroup)[0]);
						_spliceData(aoCopyData, sGroup);
					}
					_findChildren(oRoot.key);
					
					aoNewLinkData = this.treeData.link.filter(o => aoNewData.filter(item => item.key == o.from).length && aoNewData.filter(item => item.key == o.to).length);
					
					this.tree.model = new go.GraphLinksModel(aoNewData, aoNewLinkData);
					this.root = oData.key;
				} else {
					this.tree.nodes.each(node => {
						if(node.isSelected) {
							// 若选中。
							node.isSelected = false;
						}
					})
				}
				if(oData.group) {
					// 若节点在组合中。
					if(!this.tree.findNodeForKey(oData.group).isSubGraphExpanded) {
						this.tree.findNodeForKey(oData.group).expandSubGraph();
					}
				}

				/**
				 * 移除已使用的数据。
				 * @param {Object} aoCopyData
				 * @param {Object} sKey
				 * @return {void}
				 */
				function _spliceData(aoCopyData, sKey) {
					for(let i = aoCopyData.length - 1; i >= 0; i--) {
						if(aoCopyData[i].key == sKey) {
							aoCopyData.splice(i, 1);
							return;
						}
					}
				}

				/**
				 * 找到根节点。
				 * @param {Object} sKey
				 * @return {void}
				 */
				function _findRoot(sKey) {
					let oFilter = self.treeData.node.filter(o => o.key == sKey)[0];

					if(oFilter.type == "1" || oFilter.parent == "") {
						// 若为物料或为根节点。
						oRoot = oFilter;
					} else {
						_findRoot(oFilter.parent);
					}
				}

				/**
				 * 递归查找子节点。
				 * @param {Object} sKey
				 * @return {void}
				 */
				function _findChildren(sKey) {
					aoCopyData.filter(o => o.parent == sKey).forEach(oFilter => {
						aoNewData.push(oFilter);
						_spliceData(aoCopyData, sKey);

						let sGroup = oFilter.group;
						if(sGroup && !oGroup[sGroup]) {
							oGroup[sGroup] = 1;
							aoNewData.push(aoCopyData.filter(o => o.key == sGroup)[0]);

							_spliceData(aoCopyData, sGroup);
						}

						_findChildren(oFilter.key);
					})
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
	}
	
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		.content {
			flex: 1;
			.nav {
				border-right: 1px solid #ccc;
				box-sizing: border-box;
				height: 100%;
				background-color: #2e3840;
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
					flex: 1.2 1;
					margin-bottom: 20px;
				}
				.view {
					border: 1px solid #ccc;
					box-sizing: border-box;
					background-color: #fff;
					flex: 1 1;
				}
			}
		}
	}
</style>