<template>
	<div class="node-outter" :node-edit="isEdit" :node-id="nodeId" @click.stop="setState">
		<div class="node-inner"></div>
	</div>
</template>

<script>
	
//	import $ from "jquery"
	
	export default {
		props: ["nodeId","nodeValue","isEdit"],
		data() {
			return {
//				id: this.nodeId,
				oValue: this.nodeValue
			}
		},
		methods: {
			// 节点的点击状态。
			setState(ev) {
				// 当前是编辑的状态，并且，当前是断链的节点。
				if(this.isEdit) {
					// 出发节点的点击事件
					this.$emit("nodeClick",ev);
				}
			}
		}
	}
	
</script>

<style scoped lang="less">
	@normal: #73b633;
	@Broke: #db572d;
	@Recovered: #fe9500;
	
	.node-outter {
		width: 18px;
		height: 18px;
		background-color: #FFFFFF;
		border: 2px solid @normal;
		border-radius: 50%;
		margin: 0 auto;
		
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
		}
		
		/* 断链节点 */
		&.broken {
			border-color: @Broke;
			
			.node-inner {
				background-color: @Broke;
			}
		}
		
		/* 修复节点 */
		&.recovered {
			border-color: @Recovered;
			
			.node-inner {
				background-color: @Recovered;
			}
		}
		
		
		/* 编辑中的节点 */
		&.edited {
			border-color: @Recovered;
			
			.node-inner {
				background-color: @Broke;
			}
		}
		
		
	}
	
	
</style>