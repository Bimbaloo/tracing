<template>
	<div class="process-wrap">
		<span class="process-triangle"></span>
		<div class="process-content">
			<div class="filters">
				<div class="filter-item" v-for="(value,key) in oProcess" :type="key">
					<div class="item-left">
						<el-checkbox v-model="value.checked"></el-checkbox>
						<span class="item-name"> {{ value.name }}</span>
					</div>
					<div class="item-right">
						<i class="el-icon-edit" :class={editDisabled:!value.checked} @click.stop="showPop"></i>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import $ from "jquery"
	
	export default {
		props: ["processData"],
		data() {
			return {
				// 当前传入的值
				oProcess: this.processData
			}
		},
		methods: {
			// 筛选项编辑弹窗事件。
			showPop: function(ev) {
				// 触发父组件弹窗。
				var jTarget = $(ev.target),
					sType = jTarget.parents(".filter-item").attr("type");
				
				// 当前工序  当前工序筛选条件
				if(this.oProcess[sType].checked) {		// jTarget.hasClass()
					this.$emit("showPop",sType);
				}
			}
		}
	}
	
	
</script>

<style scoped lang="less">
	@green: #42af8f;
	@white: #fff;
	@gray: #ccc;
	
	.process-wrap {
		width: 160px;
		position: relative;
		border: 1px solid @green;
		padding: 16px 10px;
		background-color: @white;
		z-index: 10;
		
		.process-triangle {
			position: absolute;
			left: 90px;
			top: -7px;
			width: 12px;
			height: 12px;
			transform: rotate(45deg);
			border: 1px solid @green;
			border-right-color: @white;
			border-bottom-color: @white;
			background-color: @white;
		}
		.process-content {
			
			.editDisabled {
				color: @gray;
				cursor: not-allowed;
			}
			
			.filters {
				.filter-item {
					margin-bottom: 10px;
					
					.item-left {
						float: left;
					}
					.item-right {
						float: right;
					}
					
					.item-name {
						margin-left: 10px;
					}
					
					&:after {
						content: '\20';
						display: block;
						height: 0;
						clear: both;
					}
					&:last-child {
						margin-bottom: 0;
					}
				}
			}
		}
		
	}
</style>