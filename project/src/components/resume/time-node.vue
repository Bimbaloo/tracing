<template>
	<div class="node-outer" :class="[colorType, isBorder?'':'sRadius']">
		<div class="node-inner"></div>
	</div>
</template>

<script>
	
	export default {
		props: {
			"colorType": String,
			"isBorder": {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {}
		}
	}
</script>

<style scoped lang="less">
	@normal: #0099ff;
	@yellow: #fcc433;
	@red: #e86b59;
	@green: #00a656;
	@purple: #999cf9;
	
	.node-outer {
		width: 18px;
		height: 18px;
		background-color: transparent;
		border: 2px solid @normal;
		border-radius: 50%;
		margin: 0 auto;
		
		.node-inner {
			width: 6px;
			height: 6px;
			margin: 4px auto;
			background-color: @normal;
			border: 2px solid @normal;
			border-radius: 50%;
		}
		
		&.sRadius {
			border-radius: 0;
			
			.node-inner {
				border-radius: 0;
			}
		}
		
		/* 大个size。 */
		&.bigSize {
			width: 50px;
			height: 50px;
			border-width: 4px;
			/*transform: rotate(90deg);*/
			
			.node-inner {
				width: 25px;
				height: 25px;
				border-radius: 0;
				border-width: 4px;
				background: transparent;
				margin: 0;
				/*border-top: 0;
				border-left: 0;*/
				
				margin-left: 24px;
				border-right: 0;
				border-top: 0;
			}
		}
		/* 蓝色 */
		&.blue {
			border-color: @normal;
			
			.node-inner {
				background-color: @normal;
				border-color: @normal;
			}
			
			&.bigSize {
				.node-inner {
					background-color: transparent;
				}
			}
		}
		
		/* 红色 */
		&.red {
			border-color: @red;
			
			.node-inner {
				background-color: @red;
				border-color: @red;
			}
		}
	
		/* 黄色 */
		&.yellow {
			border-color: @yellow;
			
			.node-inner {
				background-color: @yellow;
				border-color: @yellow;
			}
		}
		
		/* 绿色 */
		&.green {
			border-color: @green;
			
			.node-inner {
				background-color: @green;
				border-color: @green;
			}
		}
		
		/* 紫色 */
		&.purple {
			border-color: @purple;
			
			.node-inner {
				background-color: @purple;
				border-color: @purple;
			}
		}
	}
	
</style>