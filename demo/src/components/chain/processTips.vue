<template>
	<div class="process-tips-content">
		<!--<span class="process-triangle"></span>-->
		<div class="process-list" :node-id="nodeId">
			<div class="list-item" v-for="(value,key) in nodeTip">
				<p class="item-time">{{ value.HappenTime }}</p>
				<p class="item-detail"><span class="item-action">{{ actionText(key) }}</span><span class="item-num">{{ value.Quantity }}</span>件<span class="item-code">{{ value.DoCode }}</span></p>
			</div>
		</div>
	</div>
</template>

<script>
	
	export default {
		props: ["nodeTip","nodeId"],
		data() {
			return {
				list: this.nodeTip
			}
		},
		methods: {
			actionText: function(sKey) {
				var sText = sKey === "in"? "投入": "产出";
				// 返回文字。
				return sText;
			}
		}
	}
	
</script>

<style scoped lang="less">
	
	@tipBorderColor: #c6a306;
	@tipBackgroudColor:#e6ddb4 /*rgba(246,226,139,1)*/;
	@tipTextColor: #f6a28b;
	
	.process-tips-content {
		/*width: 150px;
		position: relative;
		border: 1px solid @tipBorderColor;
		padding: 4px 10px;
		background-color: @tipBackgroudColor;*/
		
		.process-triangle {
			position: absolute;
			left: 80px;
			bottom: -6px;
			width: 10px;
			height: 10px;
			transform: rotate(45deg);
			border: 1px solid @tipBorderColor;
			border-left-color: @tipBackgroudColor;
			border-top-color: @tipBackgroudColor;
			background-color: @tipBackgroudColor;
		}
		.process-list {
			.list-item {
				color: @tipTextColor;
				font-size: 12px;
				margin-bottom: 10px;
				
				p {
					line-height: 20px;
				}
				.item-code {
					margin-left: 4px;
				}
				
				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}
	
</style>