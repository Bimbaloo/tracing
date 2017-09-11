<template>
	<el-dialog class="processDialog" title="断链修复原因" :visible.sync="popShow" :close-on-click-modal="false" :before-close="handleClose">
		<!-- 断链修复原因。 -->
		<el-form label-position="left" label-width="100px">
			<el-form-item label="修复的数据">
				<ul class="pop-list">
					<li v-for="value in popData.link">
						<span>{{ value.processName }}</span>
						<span>{{ value.equipmentName }}</span>
						<span>{{ value.happenTime }}</span>
						<span>{{ value.quantity }}</span>
					</li>
				</ul>
			</el-form-item>
			<el-form-item label="断开的数据">
				<ul class="pop-list">
					<li v-for="value in popData.cancel">
						<span>{{ value.processName }}</span>
						<span>{{ value.equipmentName }}</span>
						<span>{{ value.happenTime }}</span>
						<span>{{ value.quantity }}</span>
					</li>
				</ul>
			</el-form-item>
			<el-form-item label="修复原因" >
				<el-input type="textarea" :rows="2" placeholder="请输入原因" v-model="sdes"></el-input>
			</el-form-item>
		</el-form>
		
		<div slot="footer" class="dialog-footer">
			<v-button text-data="取消" @query="closeModal"></v-button>
			<v-button text-data="确 定" @query="setFilter"></v-button>
		</div>
	</el-dialog>
</template>

<script>
	import Button from "components/basic/button.vue"

	export default {
		props: {
			popShow: Boolean,
			popData: {
				type: Object,
				default: {
					cancel: [],
					link: []
				}
			}
		},
		// 组件。
		components: {
			"v-button": Button
		},
		data() {
			return {
				// 当前传入的值
				sdes: "",
				aCancel: [],
				aLink: []
			}
		},
		created() {},
		// 计算属性。
		computed: {},
		watch: {
			popShow() {
				this.sdes = "";
			}
		},
		// 方法。
		methods: {
			// 弹窗筛选确定-- 重置筛选值。
			setFilter() {
				// 设置弹窗状态。
				this.$emit("hideSavePop", this.sdes);
			},
			// 关闭按钮。
			handleClose() {
				this.$emit("hideSavePop");
			},
			closeModal() {
				this.$emit("hideSavePop");
			}
		}
		
	};
</script>

<style lang="less">
	
	.processDialog {
		.el-dialog {
			max-width: 600px;
		}
		.pop-list {
			li {
				list-style: circle;
			}
		}
	}
	.el-radio-group .el-radio {
		display: block;
		margin: 5px 0;
		
		&:first-child {
			/*margin-left: 15px;*/
		}
	}
	
	.dialog-footer,
	.el-dialog__header {
		text-align: center;
	}
</style>