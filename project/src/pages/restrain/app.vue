<template>
	<div id="app">
		<v-header></v-header>
		<div class="panel">
			<div class='panel-title'>
				<el-tabs element-loading-text="拼命加载中"  class="search-tab" >
					<el-tab-pane label="新建遏制"  activeName="first">
						<el-radio-group v-model="radioa">
							<div class='radio'>
								<el-radio :label="radio.key" v-for="radio in radioList">{{radio.groupName}}</el-radio>
							</div>
							<el-form :inline="true" :model="radio.ruleForm"  :class="[{ hide: radioa === radio.key }, 'demo-form-inline','form-inline']" v-for="radio in radioList">
								 <el-form-item v-for="item in radio.groupItems" :label="item.placeholder">
									<component :is="`v-${item.type}`" :form-data="item.type" :placeholder-data="item.placeholder" :key-data="item.type"></component> 
								</el-form-item> 
								<el-form-item>
									<el-button type="primary" class='btn' @click="onSubmit">查询</el-button>
								</el-form-item>
							</el-form>
							<!-- <el-form :inline="true" :model="formInline" :class="[{ hide: radio !=='1' }, 'demo-form-inline','form-inline']" v-for="radio in radios">
								<el-form-item label="物料:">
									<el-select v-model="value" placeholder="请选择物料">
										<el-option
											v-for="item in options"
											:key="item.value"
											:label="item.label"
											:value="item.value">
										</el-option>
									</el-select>
								</el-form-item>
								<el-form-item label="批次:">
									<el-input v-model="input" placeholder="请输入批次"></el-input>
								</el-form-item>
								<el-form-item>
									<el-button type="primary" class='btn' @click="onSubmit">查询</el-button>
								</el-form-item>
							</el-form>
							<el-form :inline="true" :model="formInline" :class="[{ hide: radio !=='2' }, 'demo-form-inline','form-inline']">
								<el-form-item label="物料:">
									<el-select v-model="value" placeholder="请选择物料">
										<el-option
											v-for="item in options"
											:key="item.value"
											:label="item.label"
											:value="item.value">
										</el-option>
									</el-select>
								</el-form-item>
								<el-form-item label="开始时间:">
									<el-date-picker v-model="startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
								</el-form-item>
								<el-form-item label="结束时间:">
									<el-date-picker v-model="endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
								</el-form-item>
								<el-form-item>
									<el-button type="primary" class='btn' @click="onSubmit">查询</el-button>
								</el-form-item>
							</el-form> -->
						</el-radio-group>
					</el-tab-pane>
					<el-tab-pane label="遏制列表" activeName="second">遏制列表</el-tab-pane>
				</el-tabs>
			</div>
			<div class="panel-content">
				
			</div>
		</div>
	</div>
</template>


<script>
	import header from "components/header/header.vue"
	//import panel from "components/panel/panel.vue"
	import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
    import DateTime from 'components/basic/dateTime.vue'

	
	export default {
		// 页面组件。
		components: {
			"v-header": header,
			'v-input': Input,
            'v-select': Select,
            'v-datetime': DateTime
		},
		// 页面数据。
		data() {
			return {
				radioList:[{
					key:'1',
					groupName:'物料',
					groupItems: [
                        {
                            itemCode: "materialCode",
							itemName: "物料",
							type: "select",
							placeholder:"请选择物料"
                        },
                        {
                            itemCode: "batchNo",
							itemName: "批次",
							type: "input",
							placeholder:"请输入批次"
                        }
					],
					ruleForm:{
						materialCode:'',
						batchNo:''
					}
				},
				{
					key:'2',
					groupName:'设备',
					groupItems: [
                        {
                            itemCode: "personCode",
							itemName: "人员",
							type: "select",
							placeholder:"请选择人员"
                        },
                        {
                            itemCode: "startTime",
							itemName: "开始时间",
							type: "datetime",
							placeholder:"请选择开始时间"
                        },
                        {
                            itemCode: "endTime",
							itemName: "结束时间",
							type: "datetime",
							placeholder:"请选择结束时间"
                        }
					],
					ruleForm:{
						materialCode:'',
						startTime:'',
						endTime:''
					}
				}],

				activeName: 'first',
				radioa: '1',
				formInline: {
					user: '',
					region: ''
				},
				startTime:'',
				endTime:'',
				options: [{
					value: '选项1',
					label: '黄金糕'
					}, {
					value: '选项2',
					label: '双皮奶'
					}, {
					value: '选项3',
					label: '蚵仔煎'
					}, {
					value: '选项4',
					label: '龙须面'
					}, {
					value: '选项5',
					label: '北京烤鸭'
				}],
				value: '',
				input:''
			}
		},
		// 计算属性。
		computed: {},
		// 创建时处理。mounted
		created() {},
		// 页面方法。
		methods: {
			onSubmit() {
				console.log('submit!');
			}
		}
		
	}
	
</script>
    					
<style lang="less">
	@green: #42af8f;
	@blue: #0099ff;
	@yellow: #fcc433;
	@red: #e86b59;
	@inVent: #00a656;
	
	body {
		background-color: #f2f2f2;
		font-size: 14px;
		overflow: hidden;

		.panel {
			padding: 20px;
    		box-sizing: border-box;
			.panel-title {
				background-color: #fff;
				.el-radio-group {
					display:block;
					text-align: left;
					.radio {
						margin-bottom:15px;
					}
					.form-inline {
						border-bottom:1px solid #ccc
					}
				}
			}
			.el-form-item {
				margin-right: 40px;
				.el-select>.el-input {
					width:180px;
				}
				.btn {
					border-radius: 0;
					width: 80px;
					height: 30px;
					padding: 0;
					box-sizing: border-box;
					font-size: 14px;
				}
			}
			.el-form-item:last-child {
				margin-left:60px;
			}
			
			.panel-content {
				background-color: #fff;
			}
		}
	}
	
</style>

<style lang="less">  
    .el-radio {
        &:hover {
            color: #42af8f;

            .el-radio__inner {
                border-color: #42af8f;
            }  
        }
    }

    .el-radio__inner {
        border: 2px solid #999;
        width: 14px;
        height: 14px;

        &::after {
            background-color: #42af8f;
        }
    }

    .el-radio__input.is-checked .el-radio__inner {
        border-color: #42af8f;
        background: #fff;
    }

    .el-radio__label {
        padding-left: 10px;
    }

    .panel-title {
        text-align: center;
        padding-left: 28px;
        padding-right: 28px;
    }
    .panel-content {
    	overflow: auto;
    	
    	.panel-content-wrap {
    		padding:  0 28px;
    	}
    }
    .hide {
    	display: none;
    }
	.search-tab {
		padding-top: 20px;
		.el-tabs__header {
			border-bottom:none;
			.el-tabs__item {
				border-radius: 0;
				width: 90px;
				height: 30px;
				padding: 0;
				box-sizing: border-box;
				font-size: 14px;
				border: 2px solid #42af8f;
				line-height: 26px;
				margin-right: 20px;
			}
			.el-tabs__active-bar {
				display:none
			}
			.is-active {
				background-color: #42af8f;
				color: #fff;
			}
		}
	}
	
	
</style>