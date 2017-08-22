<template>
	<div class="node-line" :class="[lineType]" :line-data="lineData" :style="styleObj.lineObj" @click.stop.prevent="setLineState">
		<div class="node-arrow" :style="styleObj.arrowObj"></div>
	</div>
</template>

<script>
	import $ from "jquery"
	export default {
		props: ["nodeLines","nodePo","lineData","lineType"],
		data() {
			return {
//				oNodePos: this.nodePo
			}
		},
		computed: {
			styleObj: function() {
				let oPos = this.getNodePosition(this.lineData);
				
				return this.getLineStyle(oPos.x1,oPos.y1,oPos.x2,oPos.y2, oPos.positive);
			}
		},
		methods: {
			getNodePosition(aLine) {
				let aP = this.nodePo[aLine[0]],
					bP = this.nodePo[aLine[1]],
					nRow1 = aP[0],
					nCol1 = aP[1],
					nRow2 = bP[0],
					nCol2 = bP[1],
					nLeft1,nLeft2,nTop1,nTop2,
					// 流向，正
					bPositive = true,
					nWidth = 200, nLDis = 10, nNode = 22,nTDis = 30,nText = 0;	//20
				
//				if(nCol2<nCol1) {
//					// nCol2为起点。
//					[nCol2,nCol1] = [nCol1,nCol2];
//					[nRow2,nRow1] = [nRow1,nRow2];
//				}
				
				// left的起点。   //  + nNode
				nLeft1 = (nWidth+nLDis)*nCol1 + nWidth/2 ;	
				// left的终点。- nNode
				nLeft2 = (nWidth+nLDis)*nCol2 + nWidth/2;
				// top的起点。
				nTop1 = nTDis*(nRow1+1) + nText + nNode*(nRow1) + nNode/2;
				// top的终点。
				nTop2 = nTDis*(nRow2+1) + nText + nNode*(nRow2) + nNode/2;
				
				// 流向反向问题。
				if(nCol2<nCol1) {
					// 反向
					nLeft1 -= nNode;
					nLeft2 += nNode;
					bPositive = false;
				}else {
					// 正常
					nLeft1 += nNode;
					nLeft2 -= nNode;
					bPositive = true;
				}
				
				return {
					x1: nLeft1,
					y1: nTop1,
					x2: nLeft2,
					y2: nTop2,
					positive: bPositive
				}
			},
			// 获取线样式
			getLineStyle(x1,y1,x2,y2, bPositive) {
				
				var nWidth = Math.abs(x2 - x1),
					nHeight = Math.abs(y1 - y2),
				//在页面上定位div左上角的具体位置
					left = x1,
				    top =  y1;
				    
				var deg= Math.atan(nHeight/nWidth);
				var deg1 = deg*180/Math.PI;
				var line = nHeight / Math.sin(deg);
				
				if(nHeight == 0) {
					line = nWidth;
				}
				
				// 正向或逆向旋转
				if(y1>y2) {
					deg1 = -deg1;
				}
				
				// 流向逆向。
				if(!bPositive) {
					deg1 = 180-deg1;
				}
				
				// 返回数据。
				return {
					lineObj: {
						position: "absolute",
						zIndex: 5,
						width: line + "px",
						left: left + "px",
						top: top + "px",
						transform: "rotate("+deg1+"deg)",
						transformOrigin:"left top"
					},
					arrowObj: {
						left: (line-10)+"px",
						top: "-5px"
					}
				}
			},
			// 设置链接线的状态。
			setLineState(ev) {
				// 编辑状态下的点击。
				this.$emit("nodeLineClick", ev, this.lineData);
			}
		}
	}
</script>

<style scoped lang="less">
	@normal: #73b633;
	@Broke: #db572d;
	@Recovered: #fe9500;
	
	.node-line {
		height: 4px;
		background-color: @normal;
		
		.node-arrow {
			position: relative;
			width: 10px;
			height: 10px;
			/*border: 1px solid #FFFFFF;*/
			border-top: 3px solid @normal;
			border-right: 3px solid @normal;
			/*border-top-color:  @normal;
			border-right-color:  @normal;*/
			transform: rotate(45deg);
		}
		
		&.normal {
			background-color: @normal;
			
			.node-arrow {
				border-top-color:  @normal;
				border-right-color:  @normal;
			}
		}
		
		/* 修复的样式。 */
		&.recovered {
			background-color: @Recovered;
			
			.node-arrow {
				border-top-color:  @Recovered;
				border-right-color:  @Recovered;
			}
		}
		
		/* 编辑的样式 */
		&.edited {
			background-color: @Broke;
			
			.node-arrow {
				border-top-color:  @Broke;
				border-right-color:  @Broke;
			}
		}
		
	}
</style>