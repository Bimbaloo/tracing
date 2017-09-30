<template>
	<!-- 节点线信息。 -->
	<div class="main-nodes">
		<!-- 操作处理。 -->
		<div class="main-handler">
			<v-button :class="{hide: edit}" text-data="编辑" @query="editHandler"></v-button>
			<v-button :class="{hide: !edit, exitButtomMargin: edit}" text-data="退出" @query="exitHandler"></v-button>
			<v-button :class="{hide: !edit}" text-data="保存" @query="saveHandler"></v-button>
			<v-button :class="{hide: !(edit && bHasDel)}" text-data="删除" @query="delHandler"></v-button>
			<div class="icons">
				<i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick" title="放大"></i>
				<i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick" title="缩小"></i>
			</div>
		</div>
		<!-- 线。 -->
		<div id="nodeLine" class="node-line"></div>
	</div>
</template>

<script>
	import Button from 'components/basic/button.vue'
	import 'assets/js/ScrollingTable.js'
	
	
	let sNormal= "#73b633";			// 正常节点		颜色+边框
	let sBroke = "#db572d";			// 断链节点		颜色+边框
	let sRecovered = "#fe9500";		// 已修复节点		颜色+边框
	let sInCanDo = "#4287af";				// 投入可修复      边框
	let sOutCanDo = "#6c42af";				// 产出可修复	边框
	let sCanDo = "#adaf42";		  // 都可修复节点		边框
	let sMultiValue = "all";
	
	export default {
		components: {
    		'v-button': Button
		},
		props: {
			filterData: Object,
			processData: {
				type: Array,
				default: []
			},
			nodeHeight: Number,
			// 修复的数据。
			produceData: Object,
			// 过滤的数据
			processNodeFilter: Object
		},
		data() {
			return {
				tree: null,
				// 保存的线数据。
				aCopyLinkData: [],
				allNodeLine: [],
				// 画图的节点数据。
				nodesData: [],
				// 当前存在的节点。
				aDisNode: [],
				// 删除的连线。
				aRemoveLink: [],
				// 新增的连线。
				aNewLink: []
			}
		},
		computed: {
			// 是否编辑。
			edit() {
				return this.$store.state.edit
			},
			// 是否全屏。
			fullscreen() {
				return this.$store.state.fullscreen
			},
			// 数据。
			data() {
				return Object.assign({}, this.$store.state.rawData)
			},
			// 所有节点线。
//			allNodeLine: function() {
//				return this.getAllNodeLines();
//			},
			// 获取所有的节点线。连续的线[ [1,2,3,4],[1,3,4] ]
			allContiLine() {
				return this.getAllContiLines()
			},
			// 获取所有的单个节点。
			allNoneLineNode() {
				return this.getAllNoneLineNode()
			},
			// 获取所有可连线的节点 [1,2,3,4,5]
			allFilterNode() {
				return this.data.doInOuts;
			},
			// 创建图形的数据。
//			nodesData() {
//				return this.getNodesData();
//			},
			// 选中线的条数。是否有可删除的。
			bHasDel() {
				return this.findAllSelectedLinks().length? true: false
			},
			// 获取工序中过滤参数值。
			processFilter() {
				return this.getProcessFilterData();
			}
		},
		created() {},
		mounted() {
			this.init()
		},
		watch: {
			data() {
				this.nodesData = this.getNodesData();
				this.allNodeLine = this.getAllNodeLines();
				// 更新图形。
        		this.updateGoCharts()
			},
			nodeHeight() {
				
				this.nodesData = this.getNodesData();
				this.allNodeLine = this.getAllNodeLines();
				// 更新图形。
        		this.updateGoCharts()
			},
			// 监听编辑
			edit() {
				if(this.tree) {
					let bEdit = this.edit
					this.tree.startTransaction("edit items");
					// 修改是否可删除。
					this.tree.allowDelete = bEdit;
					// 修改是否可连线。
					for (var nit = this.tree.nodes; nit.next(); ) {
		              	var node = nit.value;
		             	var table = node.findObject("TABLE");
		              	if (table) {
		                 	for (var iit = table.elements; iit.next(); ) {
		                      	var itempanel = iit.value;
		                      	itempanel.fromLinkable = bEdit;
		                      	itempanel.toLinkable = bEdit;
		                  	}
		              	}
		          	}
					this.tree.commitTransaction("edit items");
				}
			},
			// 监听修复返回的数据。
			produceData() {
				if(this.edit) {
					if(this.produceData.data) {
						// 存在。 则修改保存的数据。
						this.aNewLink.push(this.produceData)
					}else if(this.tree){
						// 不存在，则将保存的数据删除。
						this.tree.model.removeLinkData(this.produceData.line)
					}
				}
			},
			// 工序及节点过滤。
			filterData: {
        		handler: function() {
        			// 更新图形。
        			this.nodesData = this.getNodesData();
        			this.allNodeLine = this.getAllNodeLines();
        			this.updateGoCharts()
        		},
        		deep: true
			},
			// 单个工序过滤
			processNodeFilter: {
				handler: function() {
					// 更新数据。
					this.$set(this.processFilter, this.processNodeFilter.code, this.processNodeFilter)
					
        			// 更新图形。
        			this.nodesData = this.getNodesData();
        			this.allNodeLine = this.getAllNodeLines();
	        		this.updateGoCharts()
        		},
        		deep: true
			}
		},
		methods: {
			// 全屏按钮点击事件。
			fullScreenClick() {
				this.$store.commit({
					type: 'updateFullscreen',
					key: true
				});
				this.updateCanvas()
			},
			// 全屏还原点击事件。
			restoreScreenClick() {
				this.$store.commit({
					type: 'updateFullscreen',
					key: false
				});
				this.updateCanvas()
			},
			// 重绘图形。
			updateGoCharts() {
				if(this.tree) {
					this.tree.model = this.$(go.GraphLinksModel,
							      {
							        linkFromPortIdProperty: "fromPort",
							        linkToPortIdProperty: "toPort",
						            nodeDataArray: this.nodesData,
						            linkDataArray: this.allNodeLine
							      })
					this.updateCanvas()
		    	}
			},
			// 重绘页面。
			updateCanvas() {
				this.tree.requestUpdate()
			},
			// 节点线初始化操作。
			init() {
				// 数据处理。
				// 绘图。
				
				this.drawTree()
				this.tree.addDiagramListener("LayoutCompleted", () => {
					// 初始时判断 上下滚动箭头的显示状态
			        for (var nit = this.tree.nodes; nit.next(); ) {
			            var node = nit.value;
			            var scroll = node.findObject("SCROLLER");
			
			            if(scroll) {
			                scroll._updateScrollBar(scroll.findObject("TABLE"))
			            }
			        }
		      	});
			},
			drawTree() {
				let $ = this.$,
					that = this;
					
				this.tree =
					$(go.Diagram, 'nodeLine', {
						contentAlignment: go.Spot.TopLeft,		// initialContentAlignment	LeftCenter
						allowMove: false,
			            allowZoom: false,
			            allowCopy: false,
			            allowDelete: this.edit,		// 编辑参数控制。
			            "toolManager.hoverDelay": 100,
			            "animationManager.isEnabled":false,
			            "LinkDrawn": this.judgeIsCanLine,
			          	"PartResized": function(e) {
				            let node = e.subject;
				            let scroller = node.findObject("SCROLLER");
				            if (scroller !== null) scroller._updateScrollBar(scroller.findObject("TABLE"));
				        }
					});
				
				//legend
				this.tree.add(
		          $(go.Part, "Table",
		              { position: new go.Point(0, -8), selectable: false },
		              $(go.Panel, "Horizontal",
		                  { column: 0, alignment: go.Spot.Left , margin: new go.Margin(0,10,0,0)},
		                   $(go.TextBlock, "正常节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "Ellipse",
		                      { width: 12, height: 12, strokeWidth: 2, fill: sNormal, stroke:sNormal, margin: 4})
		               ),	//end column 0 
		              $(go.Panel, "Horizontal",
		                  { column: 1, alignment: go.Spot.Left, margin: new go.Margin(0,10,0,0) },
		                  $(go.TextBlock, "断链节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "Ellipse",
		                      { width: 12, height: 12, strokeWidth: 2, fill: sBroke, stroke:sBroke, margin: 4 })
		              ),  // end column 1
		              $(go.Panel, "Horizontal",
		                  { column: 2, alignment: go.Spot.Left, margin: new go.Margin(0,10,0,0) },
		                  $(go.TextBlock, "已修复节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "Ellipse",
		                      {width:12, height: 12, strokeWidth: 2, fill: sRecovered, stroke: sRecovered, margin: 4 })
		              ),  // end column 2
		              $(go.Panel, "Horizontal",
		                  { column: 3, alignment: go.Spot.Left , margin: new go.Margin(0,10,0,0)},
		                  $(go.TextBlock, "投入可修复节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "TriangleUp",
		                      {width:12,  height: 12, angle: -90, strokeWidth: 2, fill: sNormal, stroke: sNormal, margin: 4 }),
		                  $(go.Shape, "TriangleUp",
		                      {width:12,  height: 12, angle: -90, strokeWidth: 2, fill: sBroke, stroke: sBroke, margin: 4 }),
		                      $(go.Shape, "TriangleUp",
		                      {width:12,  height: 12, angle: -90, strokeWidth: 2, fill: sRecovered, stroke: sRecovered, margin: 4 })
		              ),  // end column 3
		              $(go.Panel, "Horizontal",
		                  { column: 4, alignment: go.Spot.Left , margin: new go.Margin(0,10,0,0)},
		                  $(go.TextBlock, "产出可修复节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "TriangleUp",
		                      {width:12, height: 12, angle: 90, strokeWidth: 2, fill: sNormal, stroke: sNormal, margin: 4 }),
		                  $(go.Shape, "TriangleUp",
		                      {width:12, height: 12, angle: 90, strokeWidth: 2, fill: sBroke, stroke: sBroke, margin: 4 }),
		                      $(go.Shape, "TriangleUp",
		                      {width:12, height: 12, angle: 90, strokeWidth: 2, fill: sRecovered, stroke: sRecovered, margin: 4 })
		              ),  // end column 4
		              $(go.Panel, "Horizontal",
		                  { column: 5, alignment: go.Spot.Left },
		                  $(go.TextBlock, "可修复节点:",
		                      { font: "700 13px Droid Serif, sans-serif" }),
		                  $(go.Shape, "Diamond",
		                      {width:12, height: 12, strokeWidth: 2, fill: sNormal, stroke: sNormal, margin: 4 }),
		                  $(go.Shape, "Diamond",
		                      {width:12, height: 12, strokeWidth: 2, fill: sBroke, stroke: sBroke, margin: 4 }),
		                      $(go.Shape, "Diamond",
		                      {width:12, height: 12, strokeWidth: 2, fill: sRecovered, stroke: sRecovered, margin: 4 })
		              ),  // end column 5
		          ));
				
				
				let tooltipTemplate =
		          $(go.Adornment, "Auto", {
		                  isShadowed: true
		              },
		              $(go.Shape, "Rectangle", {
		                  fill: "white",
		                  stroke: "#dedede"
		              }),
		              $(go.TextBlock, {
		                      font: "12pt Helvetica, 微软雅黑, sans-serif",
		                      stroke: "#333333",
		                      wrap: go.TextBlock.WrapFit,
		                      desiredSize: new go.Size(1000, NaN),
		                      alignment: go.Spot.Center,
		                      margin: 4
		                  },
		                  new go.Binding("text", '', this.showTooltip).ofObject())
		          );
				
				let fieldTemplate1 =
		          $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
		              new go.Binding("portId", "name"),  // this Panel is a "port"
		              {
		                  background: "transparent",  // so this port's background can be picked by the mouse
		                  fromSpot: go.Spot.LeftRightSides,  // links only go from the right side to the left side
		                  toSpot: go.Spot.LeftRightSides,
		                  fromLinkable: this.edit, 			// 编辑参数控制。
		                  toLinkable: this.edit				// 编辑参数控制。
		              },
		              { // allow the user to select items -- the background color indicates whether "selected"
		                  click: function(e, item) {
		                      // assume "transparent" means not "selected", for items
		                      let oldskips = item.diagram.skipsUndoManager;
		                      item.diagram.skipsUndoManager = true;
		                      if (item.background === "transparent") {
		                          item.background = "dodgerblue";
		                      } else {
		                          item.background = "transparent";
		                      }
		                      item.diagram.skipsUndoManager = oldskips;
		                  },
		                  toolTip: tooltipTemplate
		              },
		              $(go.Shape,
		                  { width: 12, height: 12, column: 0, strokeWidth: 2, margin: 4},
		                  new go.Binding("figure", "figure"),
		                  new go.Binding("angle", "angle"),
		                  new go.Binding("fill", "color"),
		                  new go.Binding("stroke", "borderColor")
		              ),
		              $(go.TextBlock,
		                  { margin: new go.Margin(3, 2), column: 1, font: "bold 14px sans-serif" },
		                  new go.Binding("text", "name"))
		          );
					
					
				let fieldTemplate =
			          $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
			              new go.Binding("portId", "name"),  // this Panel is a "port"
			              new go.Binding("fromLinkable", 'link'),
			              new go.Binding("toLinkable", 'link'),
			              {
			                  background: "transparent",  // so this port's background can be picked by the mouse
			                  fromSpot: go.Spot.LeftRightSides,  // links only go from the right side to the left side
			                  toSpot: go.Spot.LeftRightSides,
			                  fromLinkable: false, 			// 编辑参数控制。
		                  	  toLinkable: false,				// 编辑参数控制。
			                  name: 'tableRow'
			              },
			              { // allow the user to select items -- the background color indicates whether "selected"
			                  toolTip: tooltipTemplate
			              },
			              $(go.Panel, 'Table',
//			                  { stretch: go.GraphObject.Fill},
							 {alignment: go.Spot.TopLeft},
							 $(go.RowColumnDefinition,{ height: 30 }),
			                  // the table header
			                  $(go.Shape,
			                      { width: 12, height: 12, row: 0, column: 0, strokeWidth: 2, margin: 4},
			                      new go.Binding("figure", "figure"),
		                  		  new go.Binding("angle", "angle"),
			                      new go.Binding("fill", "color"),
			                      new go.Binding("stroke", "borderColor")
			                  ),
			                  $(go.TextBlock,
			                      { margin: new go.Margin(3, 2), width:40, row: 0, column: 1, font: "bold 14px sans-serif"},
			                      new go.Binding("text", "name")),
			                  // the collapse/expand button
//			                  new go.Binding("desiredSize", "visible", function(v) { return new go.Size(NaN, NaN); }).ofObject("LIST"),
			                  $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
			                      { row: 0, column: 2, alignment: go.Spot.RightCenter}),
			                  // the list of Panels, each showing an attribute
			                  $(go.Panel, "Vertical",
			                      {
			                          name: "LIST",
			                          row: 1,
			                          columnSpan: 3,
			                          padding: 3,
			                          alignment: go.Spot.TopLeft,
			                          defaultAlignment: go.Spot.Left,
//			                          stretch: go.GraphObject.Vertical,
			                          visible: false
			                      },
			                      $(go.TextBlock, '',
			                          {font: "bold 10px sans-serif"},
			                          new go.Binding("text", "", this.showTooltip).ofObject())
			                  )
			              )
			          );	
				
				this.tree.nodeTemplate =
			      $(go.Node, "Vertical",
			        {
			          movable: false,
			          copyable: false,
			          deletable: false,
			          selectionObjectName: "SCROLLER",
			          resizable: false, resizeObjectName: "SCROLLER",
			          portSpreading: go.Node.SpreadingNone
			        },
			        new go.Binding("location").makeTwoWay(),
			        {
		              selectionAdornmentTemplate:
		                  $(go.Adornment, "Auto",
		                      $(go.Shape, "RoundedRectangle",
		                          { fill: null, stroke: null  }),
		                      $(go.Placeholder)
		                  )
		          	},
			        $(go.Panel, 'Horizontal',
			            {
			            	click: this.showProcessFilter		// 显示工序过滤弹窗。
			            },
			            $(go.TextBlock,
			                { font: "bold 14px sans-serif" },
			                {
//			                    click: this.showProcessFilter		// 显示工序过滤弹窗。
			                },
			                new go.Binding("text", "name")),
			            $(go.Shape,
			                {toArrow: "Standard", angle: 90, margin: new go.Margin(0, 0, 0, 10) })
			        ),
//			        $(go.TextBlock,
//			          { font: "bold 14px sans-serif" },
//			          {
//			          	click: this.showProcessFilter		// 显示工序过滤弹窗。
//			          },
//			          new go.Binding("text", "name")),
			        $(go.Panel, "Auto",
			          $(go.Shape, { fill: "white", stroke: "gray" }),
			          $("ScrollingTable",
			            {
			              name: "SCROLLER",
//			              desiredSize: new go.Size(NaN, that.nodeHeight - 120),  // fixed width
			              stretch: go.GraphObject.Fill       // but stretches vertically
			            },
			            new go.Binding("TABLE.itemArray", "items"),
            			new go.Binding("desiredSize", "size").makeTwoWay(),
            			new go.Binding("TABLE.height", "height"),
			            {
			              "TABLE.itemTemplate": fieldTemplate,
			              "TABLE.defaultColumnSeparatorStroke": "gray",
			              "TABLE.defaultColumnSeparatorStrokeWidth": 0.5,
			              "TABLE.defaultRowSeparatorStroke": "gray",
			              "TABLE.defaultRowSeparatorStrokeWidth": 0.5,
			              "TABLE.defaultSeparatorPadding": new go.Margin(1, 3, 0, 3)
			            }
			          ),
			          	// 没有数据时不显示下面的边框
			           new go.Binding("visible", '', function (a, b) {
			              return a.data.items.length ? true: false
			           }).ofObject()
			        )
			      );
				
				
				this.tree.linkTemplate =
		          	$(go.Link,
		              	{
		                  relinkableFrom: false,
		                  relinkableTo: false,
//		                  toShortLength: 4,
		                  toolTip: 
		                  		$(go.Adornment, "Auto", {
		                              isShadowed: true
		                          },
		                          $(go.Shape, "Rectangle", {
		                              fill: "white",
		                              stroke: "#dedede"
		                          }),
		                          $(go.TextBlock, {
		                                  font: "12pt Helvetica, 微软雅黑, sans-serif"
		                              },
		                              new go.Binding("text", '', function (a, b) {
		                              	return a.data.fromPort + '>' + a.data.toPort
		                              }).ofObject())
		                      )
		              	},  // let user reconnect links
		              	$(go.Shape, { strokeWidth: 1.5,  stroke: sRecovered},
		                	new go.Binding("stroke", "color")),
		             	$(go.Shape, { toArrow: "OpenTriangle", stroke: sRecovered },
		               		new go.Binding("fill", "color"),
		             		new go.Binding("stroke", "color"))
		        );
		        
		        this.tree.model = $(go.GraphLinksModel,
							      {
							        linkFromPortIdProperty: "fromPort",
							        linkToPortIdProperty: "toPort",
						            nodeDataArray: that.nodesData,
						            linkDataArray: that.allNodeLine
							      });

				// 删除事件。
				this.tree.commandHandler.deleteSelection = this.deleteNodeLine;
			},
			// 显示tooltip
			showTooltip(item) {
				let oData = item.data,
					sKey = oData.name,
					oTip = this.getTooltipContent(sKey),
					str = '';
					
				for(let i in oTip) {
					let sName = ((i === 'in')?'投入':'产出');
					str += sName +'时间:'+oTip[i].HappenTime + '\n'
						+   sName +	oTip[i].Quantity
						+	'件       '
						+	oTip[i].DoCode + '\n'
				}
				
				return str.substring(0, str.length-1)
			},
			// 获取tooltip内容
			getTooltipContent(sId) {
    			let oNode = this.getNodeInfoById(sId),
    				aTipParam = ["HappenTime","Quantity","DoCode"],
    				oTimPre = {
    					"doInId": "in",
    					"doOutId": "out"
    				},
    				aTimPre = [],
    				oTip = {};
    			
    			// 循环获取参数。
    			for(var obj in oTimPre) {
    				// 判断是否有投入或产出记录。
    				if(oNode[obj] && oNode[obj] != "") {
    					aTimPre.push(oTimPre[obj]);
    				}
    			}
    			
    			// 循环获取节点提示信息值。
    			aTimPre.forEach(function(sPre) {
    				// 如果有记录。-- 通过条件判断是否有投入 或产出记录
    				oTip[sPre] = {
    					key: sPre
    				};
    				
    				// 获取提示的值。
    				aTipParam.forEach(function(sParam) {
    					oTip[sPre][sParam] = oNode[sPre+sParam];
    				});
    			});
    			
    			// 返回提示信息数据。
    			return oTip;
    		},
			// 显示工序过滤弹窗。
			showProcessFilter(e, item) {
				// 获取节点，及其显示的数据。
				let sCode = item.part.data.key;
				// 显示工序过滤弹窗。
				this.$emit('showFilterPop', JSON.stringify(this.processFilter[sCode]))  // Object.assign({}, this.processFilter[sCode])
			}, 
			// 获取当前选中的线。
			findAllSelectedLinks() {
				var items = [];
				
				if(this.tree) {
			        for (var nit = this.tree.links; nit.next(); ) {
			              	var node = nit.value;
			              	if(node.isSelected && (node.data.type === 'recovered' || node.data.type === undefined)) {
			              		// 只有选中的且为修复的线才能删除,或者为新增的线。
			                 	items.push(node)
			              	}
			        }
				}
				// 返回条数。
		        return items;
			},
			/**
			 * 删除连线函数。
			 */
			deleteNodeLine() {
				let links = this.findAllSelectedLinks()
				
				if(links.length > 0) {
	                this.tree.startTransaction("delete items");
	                for (let i = 0; i < links.length; i++) {
	                    let panel = links[i];
	                    let nodedata = panel.part.data;
						
						// 判断删除的连线。
	                    this.judgeIsCanRemove(nodedata)
	                    this.tree.model.removeLinkData(nodedata)
	                }
	                
	                this.tree.commitTransaction("delete items");
	            }
			},
			// 判断删除的连线。
			judgeIsCanRemove(nodeLine) {
	            // 否则 放入删除的数据中。
	            let bExit = false,
	            	nIndex = -1;
	            	
				// 判断该线是否存在与新建之中，存在则将在新建的数据中删除，
	            this.aNewLink.forEach( (o, index) => {
	            	if(o.line.fromPort == nodeLine.fromPort && o.line.toPort == nodeLine.toPort) {
	            		bExit = true;
	            		nIndex = index;
	            	}
	            })
	            
	            if(bExit) {
	            	// 删除的为新创建的线。
	            	this.aNewLink.splice(nIndex, 1);
	            }else {
	            	this.aRemoveLink.push(nodeLine);
	            }
			},
			// 判断是否可以创建连线处理。
			judgeIsCanLine(e) {
				let link = e.subject,
					sFromId = link.fromPortId,
					sToId = link.toPortId,
					oFrom = link.fromNode.part.data,
					oTo = link.toNode.part.data,
					oFromData = this.getNodeInfoById(sFromId),
					oToData = this.getNodeInfoById(sToId),
					bLink = true;
					
				if(oFrom.key === oTo.key) {
					// 两道工序不能在统一道工序中，
					bLink = false;
					this.$message('两个节点不能在一道工序中!');
				}else if(oFrom.seq - oTo.seq > 0){
					// 只能从上一道工序 到下一道工序
					bLink = false;
					this.$message('不能从下道工序连线到上道工序!');
				}else if(!oFromData.isOutCanRepair && !oToData.isInCanRepair) {
					// 上道工序产出源或下道工序投入源。
					bLink = false;
					this.$message('上道节点产出源或下道节点投入源不可修复')
				}
				
				// 节点多次修复。
				let aExit = this.aNewLink.filter( o => sFromId == o.line.fromPort || sToId == o.line.toPort)
				if(aExit.length) {
					bLink = false;
					this.$message('节点不能多次投入或产出修复!')
				}
				
				if(!bLink) {
					// 不能连线。
					this.tree.model.removeLinkData(link.data)
				}else {
					let oLink = {
						line: link.data,
						data: null
					}
					// 上道工序isRework为0 且doOutId为空  或 上道工序isRework 且reDoOutId为空      判断是否需要修复弹窗。
					if((!oFromData.isRework && !oFromData.doOutId) || (oFromData.isRework && !oFromData.reDoOutId)) {
						oLink.data = this.getRecoverdProduceData(oFromData, oToData)
						// 显示修复弹窗。
						this.$emit('showProducePop', oLink)
					}else {
						// 增加到添加线。
						this.aNewLink.push(oLink)
					}
				}
				
			},
			// 获取修复时展示的数据值。
			getRecoverdProduceData(oPrev, oNext) {
				// 获取数据。
				let oProduce = {
					id: oPrev.id,
					doOutId: null,
					outProcessId: oPrev.inProcessId,
					outProcessName: oPrev.inProcessName,
					outProcessSeq: oPrev.inProcessSeq,
					outMaterialName: oNext.inMaterialName,
					outMaterialSpec: oNext.inMaterialSpec,
					outMaterialUnit: oNext.inMaterialUnit,
					outEquipmentId: oPrev.inEquipmentId,
					outEquipmentName: oPrev.inEquipmentName,
					outEquipmentType: oPrev.inEquipmentType,
					outShiftDate: oPrev.inShiftDate,
					outShiftStartTime: oPrev.inShiftStartTime,
					outShiftEndTime: oPrev.inShiftEndTime,
					outPersonName: oPrev.inPersonName,
					outType: 1,
					outIokey: oPrev.inIokey,
					outBucketNo: "",
					outProcessUid: oPrev.inProcessUid,
					moldCode: "",
					doCode: oPrev.inDoCode,
					processCode: oPrev.inProcessCode+":"+oPrev.inProcessName,
					materialCode: oNext.inMaterialCode+":"+oNext.inMaterialName,
					batchNo: oNext.inBatchNo,
					barcode: oNext.inBarcode,
					quantity: oPrev.inQuantity,
					equipmentCode: oPrev.inEquipmentCode+":"+oPrev.inEquipmentName,
					personCode: oPrev.inPersonCode+":"+oPrev.inPersonName,
					happenTime: oNext.inHappenTime,
					shiftName: oPrev.inShiftName
				}
				
				return oProduce
			},
			/*
			 * 获取数据。
			 */
			getNodesData() {
				let aProcess = this.processData,
					that = this,
					oProcess = {},
					aSeriesData = [],
					aDisaplayNode = [],			// 通过节点链类型显示的节点。
					aFilterNodeType = this.filterData.nodeType,
					aNowNode = [],
					nIndex = 0;
					
				if(this.allFilterNode) {
					
					this.allFilterNode.forEach( o => {
						let sName = that.getNodeProcessCode(o).processName,
							sCode = that.getNodeProcessCode(o).processCode;
							
						if(!oProcess[sCode]) {
							oProcess[sCode] = {
								code: sCode,
								name: sName,
								data: []
							}
						}
						
						// 放置当前工序下所有的节点值。
						oProcess[sCode].data.push(o);
					});
				}
				
				// 获取通过节点类型过滤出的点。
				this.allContiLine.forEach( aLine => {
					// 判断是否合法
					let bFlag = false;
					
					// 如果链型为全部，则不用判断。
					if(aFilterNodeType.includes(sMultiValue)) {
						bFlag = true
					}else {
						// 判断该链是否合法
						bFlag = aFilterNodeType.some(function(sType) {
							return that.isFilterLineAble(aLine,sType);
						});
					}
					
					if(bFlag) {
						// 合法，将节点加入。
						aDisaplayNode = aDisaplayNode.concat(aLine)
					}
					
				})
				
				// 再次过滤没有连线的节点。
				this.allNoneLineNode.forEach( o => {
					// 判断是否合法
					let bFlag = false;
					
					// 如果链型为全部，则不用判断。
					if(aFilterNodeType.includes(sMultiValue)) {
						bFlag = true
					}else {
						// 判断该链是否合法
						bFlag = aFilterNodeType.some(function(sType) {
							return that.isFilterNodeAble(o, sType);
						});
					}
					
					if(bFlag) {
						// 合法，将节点加入。
						aDisaplayNode.push(o)
					}
					
				})
				
				aProcess.forEach( (oo, nIn) => {
					let sCode = oo.value,
						sName = oo.label,
						oData = oProcess[sCode],
						
						// node节点。
						oNode = {
							key: sCode,
							name: sName,
							seq: oo.seq,
							left: !nIn? true: false,
//							location: new go.Point(nIn*350, 10),
							items: [],
							size: new go.Size(NaN, that.nodeHeight - 120),
							height: that.nodeHeight - 150
						},
						aDisProcess = this.filterData.aFilterProcess;
					
					// 工序过滤。
					if(aDisProcess.includes(sMultiValue) || aDisProcess.includes(sCode)) {
						
						// 工序下的数据排序。
						oData.data = oData.data.sort( (oA, oB) => +new Date(oA.inHappenTime) - +new Date(oB.inHappenTime) > 0? 1:-1 )
						
						// 工序下的节点过滤。
						oData.data.forEach( (o, index) => {
							let sId = o.id + ''
							// 判断该节点是否存在于工序中。 判断节点是否存在于节点链中
							if(aDisaplayNode.includes(sId) && that.isFilterProcessAble(o, sCode)) {
								
								let oNodeType = that.getNodeType(o);
								
								// 返回节点数据。
								oNode.items.push({
									name: sId,
									data: o,
									figure: oNodeType.figure,	//"Ellipse",
									angle: oNodeType.angle,
									color: oNodeType.style.color,
									borderColor: oNodeType.style.borderColor,
									link: that.edit
								})
								
								aNowNode.push(sId)
							}
							
						});
						
						oNode.location = new go.Point(nIndex*350, 10),
						nIndex ++;
						// 返回数据。
						aSeriesData.push(oNode)
					}
					
				})
				
				// 当前页面中的节点。				
				this.aDisNode = aNowNode;
				// 返回数据。--- gojs展示的节点数据。
				return aSeriesData
			},
			isFilterNodeAble(sNode, sType) {
				let bFlag = false,
					that = this;
				
				switch(sType) {
					case "1":
						// 正常节点。
						bFlag =  that.getNodeType(that.getNodeInfoById(sNode)).type == "normal";
						
						break;
					case "2":
						// 断链节点。
						bFlag =  that.getNodeType(that.getNodeInfoById(sNode)).type == "broken";
						
						break;
					case "3":
						// 修复节点。
						bFlag =  that.getNodeType(that.getNodeInfoById(sNode)).type == "recovered";
						
						break;
					case "4":
						// 投入修复
						var ss = that.getNodeType(that.getNodeInfoById(sNode)).type;
						
						bFlag =  ss.includes("inCanDo") || ss.includes("canDo");
						
						break;
					case "5":
						// 产出修复
						var ss = that.getNodeType(that.getNodeInfoById(sNode)).type;
						
						bFlag =  ss.includes("outCanDo") || ss.includes("canDo");
						
						break;
				}
				
				// 返回数据。
				return bFlag;
			},
			/**
			 * 验证当前连线是否符合过滤条件。
			 * @param {Array} []  节点线。
			 * @param {String} sType 节点类型
			 * @return {Boolean} 是否合法。
			 */
			isFilterLineAble(aJudgeNode, sType) {
				let bFlag = false,
					that = this;
				
				switch(sType) {
					case "1":
						// 正常节点。
						bFlag = aJudgeNode.every(function(sNode) {
							// 正常节点的判断，每一项都是正常的。
							return that.getNodeType(that.getNodeInfoById(sNode)).type == "normal";
						});
						
						break;
					case "2":
						// 断链节点。
						bFlag = aJudgeNode.some(function(sNode) {
							// 断链节点的判断，含有断链。
							return that.getNodeType(that.getNodeInfoById(sNode)).type == "broken";
						});
						break;
					case "3":
						// 修复节点。
						bFlag = aJudgeNode.some(function(sNode) {
							// 修复节点的判断，含有修复。
							return that.getNodeType(that.getNodeInfoById(sNode)).type == "recovered";
						});
						break;
					case "4":
						// 投入修复
						bFlag = aJudgeNode.some(function(sNode) {
							// 修复节点的判断，含有投入修复。或修复
							let ss = that.getNodeType(that.getNodeInfoById(sNode)).type
							return ss.includes("inCanDo") || ss.includes("canDo");
						});
						break;
					case "5":
						// 产出修复
						bFlag = aJudgeNode.some(function(sNode) {
							// 修复节点的判断，含有产出修复。或修复
							let ss = that.getNodeType(that.getNodeInfoById(sNode)).type
							return ss.includes("outCanDo") || ss.includes("canDo");
						});
						break;
				}
				
				// 返回数据。
				return bFlag;
			},
			/**
			 *  验证当前节点是否存在于每道工序中的过滤。
			 * @param {String} oNode 当前节点， --只要有一个不符合，则社区
			 * @param {String} sCode
			 */
			isFilterProcessAble(oNode, sCode) {
				let // 默认合格。
					bFlag = true,
					that = this,
					oProcessFilter = that.processFilter[sCode],
					sParam = "";
				
				for(sParam in oProcessFilter) {
					var oParam = oProcessFilter[sParam];
					if(oParam.checked && bFlag) {
						switch(sParam) {
							case "inTime": 
								// 当节点的投入时间在配置时间之间。
								if(!(oNode.inHappenTime>=oParam.startTime && oNode.inHappenTime<=oParam.endTime)) {
									bFlag = false;
								}
								break;
							case "outTime":
								// 当前节点的产出时间在配置时间之间。
								if(!(oNode.outHappenTime>=oParam.startTime && oNode.outHappenTime<=oParam.endTime)) {
									bFlag = false;
								}
								break;
							case "dataLine":
								// 当前节点是否是1不用过虑，2-完整节点，3-不完整
								let sDataLine = oParam.selected;
								if(sDataLine == "2") {
									// 完整节点。
									if(!(oNode.doInId != "" && oNode.doOutId != "")) {
										bFlag = false;
									}
								}else if(sDataLine == "3") {
									// 不完整节点。
									if(!(oNode.doInId == "" || oNode.doOutId == "")) {
										bFlag = false;
									}
								}
								break;
							case "person":
								// 当前操作人是否在选中之中。
								let aSelectedPerson = oParam.selected;
								
								// 操作人是否在选中之中。 没有选中全部，且开始和结束都不包含。
								if(!aSelectedPerson.includes(sMultiValue) && !(aSelectedPerson.indexOf(oNode.inPersonName) >-1 || aSelectedPerson.indexOf(oNode.outPersonName) > -1)) {
									bFlag = false;
								}
								
								break;
							case "equipment":
								// 当前设备是否在选中之中。
								let aSelectedEquipment = oParam.selected;
								
								if(!aSelectedEquipment.includes(sMultiValue) && !(aSelectedEquipment.indexOf(oNode.inEquipmentName) >-1 || aSelectedEquipment.indexOf(oNode.outEquipmentName) > -1)) {
									bFlag = false;
								}
								
								break;
							case "doCode":
								// 当前工单是否在选中之中。
								let aSelectedCode = oParam.selected;
								
								if(!aSelectedCode.includes(sMultiValue) && !(aSelectedCode.indexOf(oNode.inDoCode) >-1 || aSelectedCode.indexOf(oNode.outDoCode) > -1)) {
									bFlag = false;
								}
								
								break;
							default:
								break;
						}
					}
				}
				// 返回数据。
				return bFlag;
			},
			/**
    		 * 获取工序节点的工序值。
    		 * @param {Object} oNode
    		 * @return {String} sProcessCode
    		 */
    		getNodeProcessCode(oNode) {
    			// 返回工序节点的工序值。
    			return {
    				processCode: oNode.parentProcessCode || oNode.inProcessCode,
    				processName: oNode.parentProcessName || oNode.inProcessName
    			};
    		},
    		// 获取节点的类型。
    		/**
    		 * 获取节点类型。
    		 * @param {Object} o 节点数据。
    		 * @return {Object}
    		 */
    		getNodeType(o) {
    			let // 修复
    				nIsRecovered = o.repairType,
    				// 断链。
    				nIsBroken = o.isBroke,
    				// 返工。
    				nIsRework = o.isRework,
    				oStyle = {
    					figure: 'Ellipse',		//　图标类型－－默认为圆形。
    					angle: 0,				//　旋转角度－－默认为0
    					type: '',
    					style: {
    						color: '',
    						borderColor: ''
    					}
    				}
    			
    			if(!nIsBroken && !nIsRecovered) {
    				// 正常节点。
    				oStyle = {
    					figure: 'Ellipse',		//　图标类型－－默认为圆形。
    					angle: 0,
    					type: 'normal',
    					style: {
    						color: sNormal,
    						borderColor: sNormal
    					}
    				}
    			}else if(nIsBroken) {
    				// 断链节点。
    				oStyle = {
    					figure: 'Ellipse',		//　图标类型－－默认为圆形。
    					angle: 0,
    					type: 'broken',
    					style: {
    						color: sBroke,
    						borderColor: sBroke
    					}
    				}
    			}else if(nIsRecovered) {
    				// 修复节点。
    				oStyle = {
    					figure: 'Ellipse',		//　图标类型－－默认为圆形。
    					angle: 0,
    					type: 'recovered',
    					style: {
    						color: sRecovered,
    						borderColor: sRecovered
    					}
    				}
    			}
    			
    			// 投入修复 或产出修复。
    			if(o.isInCanRepair && o.isOutCanRepair) {
    				// 投产都可修复
    				oStyle.figure = 'Diamond';
    				oStyle.type += 'canDo';
//  				oStyle.style.borderColor = sCanDo
    			}else if(o.isInCanRepair) {
    				// 投入可修复
    				oStyle.figure = 'TriangleUp';
    				oStyle.angle = -90;
    				oStyle.type += 'inCanDo';
//  				oStyle.style.borderColor = sInCanDo
    			}else if(o.isOutCanRepair) {
    				// 产出可修复
    				oStyle.figure = 'TriangleUp';
    				oStyle.angle = 90;
    				oStyle.type += 'outCanDo';
//  				oStyle.style.borderColor = sOutCanDo
    			}
    			
    			// 返回节点的类型。
    			return oStyle;
    		},
    		/**
    		 * 获取节点线的样式。
    		 * @param {Array} aLine
    		 * @return {Object}
    		 */
    		getNodeLineType(aLine) {
    			let _that = this,
    				oStyle = {
    					type: 'normal',
    					style: {
    						color: sNormal,
    						borderColor: sNormal
    					}
    				};
    				
    			// 上道工序修复为2，3，或下道工序修复为1，3
    			aLine.forEach( function(sNode, nIndex) {
    				let sValue = _that.getNodeInfoById(sNode).repairType;
    				
    				if( sValue == "3" || (!nIndex && sValue == "2") || (nIndex && sValue == "1")) {
    					oStyle = {
	    					type: 'recovered',
	    					style: {
	    						color: sRecovered,
	    						borderColor: sRecovered
	    					}
	    				};
    				}
    			});
    			
    			// 返回节点的类型。
    			return oStyle;
    		},
    		/**
    		 * 通过节点id，获取节点信息。
    		 * @param {String} sNodeId
    		 * @return {Object}
    		 */
    		getNodeInfoById(sNodeId) {
    			// 当前节点信息。
    			let aNode = [];
    			
    			aNode = this.data.doInOuts.filter( o => o.id == sNodeId)
    			
    			// 返回数据。
    			if(aNode.length) {
    				return aNode[0]
    			}else {
    				return {}
    			}
    		},
    		// 获取所有链节点。
    		getAllNodeLines1() {
    			// 获取所有节点的线。
    			var aLine = [],
    				that = this;
    			
    			// 获取所有的单线。
    			if(this.data.doInOuts) {
    				
	    			this.data.doInOuts.forEach(function(oData) {
	    				var sPrevId = oData.sourceIds,
	    					sCurrentId = oData.id+"";
	    			    				
	    				if(sPrevId) {
	    					// 存在上级工序。
	    					let aPrev = sPrevId.split(",");
	    					
	    					// 如果存在多个投入工序，则拆分。
	    					aPrev.forEach(function(sId) {
								aLine.push({
									from: that.getNodeProcessCode(that.getNodeInfoById(sId)).processCode,
									fromPort: sId,
									to: that.getNodeProcessCode(oData).processCode,
									toPort: sCurrentId,
									color: that.getNodeLineType([sId,sCurrentId]).style.color
								})
	    					});
	    				}
	    			});
    			}
    			
    			// 返回链式节点。
    			return aLine;    			
    		},
    		getAllNodeLines() {
    			// 获取所有节点的线。
    			var aLine = [],
    				that = this;
    			
    			if(this.aDisNode) {
					// 获取显示的线。    				
	    			this.aDisNode.forEach( sNode => {
	    				
	    				let oData = that.getNodeInfoById(sNode),
	    					sPrevId = oData.sourceIds;
	    				
	    				if(sPrevId) {
	    					// 存在上级工序。
	    					let aPrev = sPrevId.split(",");
	    					
	    					// 如果存在多个投入工序，则拆分。
	    					aPrev.forEach(function(sId) {
	    						// 判断节点是否存在。
	    						if(that.aDisNode.includes(sId)) {
	    							// 线的两个节点都存在，则加入。
	    							let oLine = that.getNodeLineType([sId,sNode]);
									aLine.push({
										from: that.getNodeProcessCode(that.getNodeInfoById(sId)).processCode,
										fromPort: sId,
										to: that.getNodeProcessCode(oData).processCode,
										toPort: sNode,
										color: oLine.style.color,
										type: oLine.type
									})
	    						}
	    					});
	    				}
	    				
	    			})
	    			
    			}
    			
    			// 返回链式节点。
    			return aLine;    			
    		},
    		// 获取所有连续的连线节点。
    		getAllContiLines() {
    			let that = this,
    				aLine = [],
    				aNewLine = [];
    			
    			if(this.allFilterNode) {
    				
    				// 获取所有线。
    				this.allFilterNode.forEach( oData => {
	    				var sPrevId = oData.sourceIds,
	    					sCurrentId = oData.id+"";
	    			    				
	    				if(sPrevId) {
	    					// 存在上级工序。
	    					let aPrev = sPrevId.split(",");
	    					
	    					// 如果存在多个投入工序，则拆分。
	    					aPrev.forEach(function(sId) {
		    					aLine.push([sId,sCurrentId]);
	    					});
	    				}
    				})
    				
    				// 过滤可链接的线。
    				for(var i=0; i<aLine.length; i++) {
						var aNow = aLine[i];
						// 获取当前同等级的数据。
						// 如果当前数据存在，则不需要再算一遍。
						if(_isBeCalcu(aNow)) {
							aNewLine = aNewLine.concat(_getLine(aNow));
						}
					}
    				
    			}
    			
    			// 返回连续的节点线。
    			return aNewLine;
    			
    			// 是否需要计算
				function _isBeCalcu(aNow) {
					// 默认需要计算。
					var bFlag = true;
					
					aNewLine.forEach(function(aValue) {
						var sTemp = aValue.toString(),
							sNow = aNow.toString();
						
						if(sTemp.indexOf(sNow) > -1) {
							bFlag = false;
						}
					});
					
					// 返回数据。
					return bFlag;
				}
				
				
				// 获取当前节点的
				function _getLine(aNow) {
					var sPrev = aNow[0],
						sNext = aNow[aNow.length-1],
						aCurrent = [],
						aNext = getNodeNext(sPrev),
					    aStart = getNodePrev(sNext);
					
					if(aNext.length || aStart.length) {
						// 获取向上的数据。
						if(aNext.length) {
							// 存在
							aNext.forEach(function(oData) {
								var sId = oData[0],
									aTemp = JSON.parse(JSON.stringify(aNow));		//$.extend(true, [], aNow);
								aTemp.unshift(sId);
								aCurrent.push(aTemp);
							});
						}else {
							aCurrent.push(aNow);
						}
						
						// 获取向下的数据。
						if(aStart.length) {
							// 存在。
							var aTemp = [];
							aCurrent.forEach(function(aId) {
								aStart.forEach(function(oData) {
									var sId = oData[1],
										aTem = JSON.parse(JSON.stringify(aId));			// $.extend(true,[],aId);
									aTemp.push(aTem.concat([sId]));
								});
							});
							aCurrent = aTemp;
						}
						
						var aNew = [];
						
						// 出口。
						// 合并数据。
						aCurrent.forEach(function(a) {
						 	aNew = aNew.concat(_getLine(a));
						});
						
						aCurrent = aNew;
					}else {
						aCurrent.push(aNow);
					}
					
					// 返回数据。
					return aCurrent;
				}
    			
    			// 获取所需前节点。以1开头的几点。
				function getNodePrev(sId) {
					var aResult = [];
					
					aLine.forEach(function(oData) {
						var sPrev = oData[0];
						if(sId == sPrev) {
							aResult.push(oData);
						}
					});
					
					// 返回数据。
					return aResult;
				}
    			
    			// 获取所需后节点。 以1结尾的节点
				function getNodeNext(sId) {
					var aResult = [];
					
					aLine.forEach(function(oData) {
						var sNext = oData[1];
						if(sId == sNext) {
							aResult.push(oData);
						}
					});
					
					// 返回数据。
					return aResult;
				}
    		},
    		// 获取所有没有线的节点。
    		getAllNoneLineNode() {
    			let that = this,
    				aNode = [];
    			
    			// 所有单个节点，sourceIds为空，且没有数据的sourceIds为该id
    			if(this.allFilterNode) {
    				
    				this.allFilterNode.forEach( oData => {
	    				var sPrevId = oData.sourceIds,
	    					sCurrentId = oData.id+'';
	    			    
	    				if(!sPrevId) {
	    					// 没有上道工序。
	    					let bFlag = false;
	    					
	    					bFlag = that.isHasTheLastLine(sCurrentId);
	    					
	    					if(!bFlag) {
	    						aNode.push(sCurrentId);
	    					}
	    				}
    				})
    				
    			}
    			
    			// 返回没有连线的节点。
    			return aNode
    		},
    		// 判断节点是否是其他节点的上道工序。
    		isHasTheLastLine(sNode) {
    			let aAllData = this.allFilterNode,
    				// 默认不存在。
    				bFlag = false;
    			
    			if(aAllData) {
	    			// 存在某个节点的上个工序为此节点。
					bFlag = aAllData.some(function(oData) {
						let aSource = [];
						if(oData.sourceIds) {
							aSource = oData.sourceIds.split(",");
						}
						return aSource.indexOf(sNode) > -1;
					});
    			}
    			
    			// 返回数据。
    			return bFlag;
    		},
    		// 获取断开及连接的数据
    		getRecoveredInfo(aoData) {
    			let that = this,
    				aNew = [];
    			
    			aoData.forEach( o => {
    				// 连接或断开。    			
    				let oLine = o.line ? o.line: o,
    					oPrev = that.getNodeInfoById(oLine.fromPort),
						oNext = that.getNodeInfoById(oLine.toPort),
						aGroup = []
    			
    				// 加入上工序
    				aGroup.push({
    					processName: oPrev.parentProcessName||oPrev.inProcessName,
						equipmentName: oPrev["outEquipmentName"],
						happenTime: oPrev["outHappenTime"],
						quantity: oPrev["outQuantity"]
    				})
    				
    				// 加入下工序
    				aGroup.push({
    					processName: oNext.parentProcessName|| oNext.inProcessName,
						equipmentName: oNext["inEquipmentName"],
						happenTime: oNext["inHappenTime"],
						quantity: oNext["inQuantity"]
    				})
    				
    				aNew.push(aGroup)
    			})
    			
    			// 返回数据。
    			return aNew
    		},
    		// 保存的数据合并。
    		saveData(aNew, aDel) {
    			let that = this,
    				oNew = {
    					cancelList: [],
    					repairList: []
    				}
    			
    			aNew.concat(aDel).forEach( o => {
    				// 连接或断开。    			
    				let bNew = o.line ? true: false,
    					oLine = o.line ? o.line: o,
    					oPrev = that.getNodeInfoById(oLine.fromPort),
						oNext = that.getNodeInfoById(oLine.toPort);
						
					
					// 数据合并。
					if(bNew) {
						// 新增的连线。将修复的数据与上道工序的数据合并。
						let oNewPrev = o.data? Object.assign({}, oPrev, o.data): oPrev
						oNew.repairList.push([oNewPrev, oNext]);
					}else {
						// 删除的连线。
						oNew.cancelList.push([oPrev, oNext])
					}
					
    			})
    			
    			// 返回数据。
    			return oNew
    		},
    		// 根据工序编码获取当前工序下的而所有节点。
    		getProcessNodesByCode(sCode) {
				// 当前数据。
				let aMatchData = [],
					that = this;
				
				// 获取匹配的数据。
				aMatchData = this.data.doInOuts.filter(function(oProcess) {
					return that.getNodeProcessCode(oProcess).processCode == sCode;
				});
				
				// 返回数据。
				return aMatchData;
    		},
    		// 根据工序编码获取当前工序下所有节点的某个参数的集合
    		getProcessNodesParam(sCode, sParam) {
    			let aoNode = this.getProcessNodesByCode(sCode),
    				aReturn = [];
				
				// 循环遍历数据。
				aReturn = aoNode.map( o => {
					return o[sParam];
				})
				
				// 数据排序处理。
				aReturn.sort(function(sA,sB) {
					if(!isNaN(Number(sA))) {
	                    // 数字。
	                    return sA - sB;
	                }else {
	                    // 字符串。
	                    return sA > sB ? 1:-1;
	                }
				});
				
				// 返回匹配后的数据。
				return aReturn;
			
    		},
    		// 获取工序中过滤的数据。
    		getProcessFilterData() {
    			let that = this,
    				oFilter = {};
    			
    			if(this.data.basicInfoDto) {
    				
	    			// 工序中的过滤。
	    			this.data.basicInfoDto.processArr.forEach( o => {
	    				let sCode = o.processCode,
	    					// 投入时间
	    					aInTime = that.getProcessNodesParam(sCode, 'inHappenTime'),
	    					aOutTime = that.getProcessNodesParam(sCode, 'outHappenTime'),
	    					aPerson = o.personNames,
	    					aEquipment = o.equipmentNames,
	    					aDoCode = o.doCodes;
	    					
	    				// 记录当前的过滤数据。
	    				oFilter[sCode] = {
	    					code: sCode,
	    					name: o.processName,
							inTime: {
								checked: false,
								startTime: aInTime.length ? aInTime[0] : '',
								endTime: aInTime.length ? aInTime[aInTime.length-1] : ''
							},
							outTime: {
								checked: false,
								startTime: aOutTime.length ? aOutTime[0] : '',
								endTime: aOutTime.length ? aOutTime[aOutTime.length-1] : ''
							},
							dataLine: {
								checked: false,
								selected: 1
							},
							person: {
								checked: false,
								selected: [sMultiValue],
								value: aPerson
							},
							equipment: {
								checked: false,
								selected: [sMultiValue],
								value: aEquipment
							},
							doCode: {
								checked: false,
								selected: [sMultiValue],
								value: aDoCode
							}
						}
	    			})
    			}
//  			console.log(oFilter)
    			// 返回数据。
    			return oFilter;
    		},
			// 节点编辑操作。
			editHandler() {
				this.$store.commit({
					type: 'updateEdit',
					key: true
				});
				
				// 将线的信息保存。
				this.aCopyLinkData = Object.assign([], this.allNodeLine)
				
				// 节点线信息。
				this.aNewLink = [];
				this.aRemoveLink = [];
			},
			// 节点退出编辑操作
			exitHandler() {
				this.$store.commit({
					type: 'updateEdit',
					key: false
				});
				
				// 退出的操作。 将数据重置到之前。
				if(this.tree && (this.aNewLink.length || this.aRemoveLink.length)) {
					
					this.allNodeLine = this.getAllNodeLines()
					this.updateGoCharts()
		    	}
			},
			// 节点保存操作。
			saveHandler() {
				// 获取删除的及新建的。
				if(this.aNewLink.length || this.aRemoveLink.length) {
					// 显示弹窗。
					let oSave = {
						cancel: this.getRecoveredInfo(this.aRemoveLink),
						link: this.getRecoveredInfo(this.aNewLink),
						save: this.saveData(this.aNewLink, this.aRemoveLink)
					}
					this.$emit('showSavePop', oSave)
				}else {
					// 没有操作的数据。
					this.$message('没有数据操作!')
				}
			},
			// 节点线删除操作。
			delHandler() {
				// 删除选中的节点线。
				this.deleteNodeLine();
			}
		}
	}
</script>

<style lang="less">
	
	.main-nodes {
		display: flex;
		flex-direction: column;
		
		.hide {
			display: none;
		}
		.exitButtomMargin {
			margin-left: 0;
		}
		
		.main-handler {
			flex: 0 40px;
			
			.icons {
				float: right;
				line-height: 36px;
				cursor: pointer;
			}
		}
		
		.node-line {
			flex: 1 1;
			
			canvas {
				outline: none;
			}
		}
	}
	
</style>