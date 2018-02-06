<template>
	<el-dialog class="processDialog" title="断链修复原因" :visible.sync="popShow" :close-on-click-modal="false" :before-close="handleClose">
		<!-- 断链修复原因。 -->
		<el-form class="process-form" label-position="left" label-width="100px">
			<el-form-item label="修复的数据">
				<div class="pop-title" v-show="popData.link.length">
					<span class="title-type">类型</span>
					<span class="title-process">工序</span>
					<span class="title-equipment">设备</span>
					<span class="title-time">产出\投入时间</span>
					<span class="title-quantity">数量</span>
				</div>
				<div class="pop-list">
					<div class="list-item" v-for="value in popData.link" :key="value">
						<div v-for="(item, index) in value" :key="index">
							<span class="title-type">{{ index ? '→': '←' }}</span>
							<span class="title-process">{{ item.processName }}</span>
							<span class="title-equipment">{{ item.equipmentName }}</span>
							<span class="title-time">{{ item.happenTime }}</span>
							<span class="title-quantity">{{ item.quantity }}</span>
						</div>
					</div>
				</div>
			</el-form-item>
			<el-form-item label="断开的数据">
				<div class="pop-title" v-show="popData.cancel.length">
					<span class="title-type">类型</span>
					<span class="title-process">工序</span>
					<span class="title-equipment">设备</span>
					<span class="title-time">产出\投入时间</span>
					<span class="title-quantity">数量</span>
				</div>
				<div class="pop-list">
					<div class="list-item" v-for="value in popData.cancel" :key="value">
						<div v-for="(item, index) in value" :key="index">
							<span class="title-type">{{ index ? '→': '←' }}</span>
							<span class="title-process">{{ item.processName }}</span>
							<span class="title-equipment">{{ item.equipmentName }}</span>
							<span class="title-time">{{ item.happenTime }}</span>
							<span class="title-quantity">{{ item.quantity }}</span>
						</div>
					</div>
				</div>
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
	import Button from 'components/basic/button.vue'

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
	    'v-button': Button
	  },
	  data () {
	    return {
      // 当前传入的值
	      sdes: '',
	      aCancel: [],
	      aLink: []
	    }
	  },
	  created () {},
    // 计算属性。
	  computed: {},
	  watch: {
	    popShow () {
	      this.sdes = ''
    }
	  },
    // 方法。
	  methods: {
    // 弹窗筛选确定-- 重置筛选值。
	    setFilter () {
    // 设置弹窗状态。
	      this.$emit('hideSavePop', this.sdes)
	    },
    // 关闭按钮。
	    handleClose () {
	      this.$emit('hideSavePop')
	    },
	    closeModal () {
	      this.$emit('hideSavePop')
	    }
	  }
	
	}
</script>

<style lang="less">
	
	.processDialog {
		.el-dialog {
			width: auto;
		}
		
		.process-form {
			max-height: 600px;
			overflow: auto;
		}
		
		.pop-list,
		.pop-title {
			span {
				display: inline-block;
				
				&.title-type {
					width: 30px;		
				}
				&.title-process {
					width: 80px;
				}
				&.title-equipment {
					width: 160px;
				}
				&.title-time {
					width: 160px;
				}
				&.title-quantity {
					width: 30px;
				}
			}
		}
		
		.pop-title {
			text-align: center
		}
		
		.pop-list {
			.list-item {
				border: 1px solid #42af8f;
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
