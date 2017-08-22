<template>
	<div class="node-outter" :node-id="nodeId" @click.stop.prevent="setState">
		<div class="node-inner"></div>
	</div>
</template>

<script>
	
	export default {
//		props: {
//			nodeId: String,
//			nodeValue: Object,
//			isEdit: Boolean
//		},
		props: ["nodeId", "nodeValue"],
		data() {
			return {
				oValue: this.nodeValue
			}
		},
		methods: {
			// 节点的点击状态。
			setState(ev) {
				// 出发节点的点击事件
				this.$emit("nodeClick", ev);
			}
		}
	}
	
</script>

<style scoped lang="less">
	@normal: #73b633;
	@Broke: #db572d;
	@Recovered: #fe9500;
	@canDo: #42afa0;	// 可修复的
	@actived: #7642af;		// 选中
	
	.node-outter {
		width: 18px;
		height: 18px;
		background-color: #FFFFFF;
		border: 2px solid @normal;
		border-radius: 50%;
		margin: 0 auto;
		cursor: pointer;
		
		.node-inner {
			width: 12px;
			height: 12px;
			margin: 3px auto;
			background-color: @normal;
			border-radius: 50%;
		}
		
		/* 正常节点 */
		&.normal {
			border-color: @normal;
			
			.node-inner {
				background-color: @normal;
			}
			
			/* 可修复的节点 */
			&.canDo {
				border-color: @canDo;
			}
			
			/* 编辑中的节点 */
			&.edited {
				border-color: @actived;
			}
		}
		
		/* 断链节点 */
		&.broken {
			border-color: @Broke;
			
			.node-inner {
				background-color: @Broke;
			}
			
			/* 可修复的节点 */
			&.canDo {
				border-color: @canDo;
			}
			
			/* 编辑中的节点 */
			&.edited {
				border-color: @actived;
			}
		}
		
		/* 已修复节点 */
		&.recovered {
			border-color: @Recovered;
			
			.node-inner {
				background-color: @Recovered;
			}
			
			/* 可修复的节点 */
			&.canDo {
				border-color: @canDo;
			}
			
			/* 编辑中的节点 */
			&.edited {
				border-color: @actived;
			}
		}
		
	}
	
	
</style>