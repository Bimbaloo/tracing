<template>
	<div id="app">
		<v-header :config="false" :back="'search.html'"></v-header>
		<div class="panel" id="restrain">
			<div class='panel-title'>
				<el-tabs  element-loading-text="拼命加载中"   class="search-tab">
					<el-tab-pane label="新建遏制"  activeName="first">
						<el-radio-group v-model="radioNumber">
							<div class='radio'>
								<el-radio :label="radio.key" v-for="(radio,index) in radioList" :key="index">{{radio.groupName}}</el-radio>
							</div>
							<el-form :inline="true" ref="materialForm" :model="materialForm"  :class="[ 'demo-form-inline','form-inline']" :rules="rules">
								 <el-form-item v-for="(item,index) in groupItems" :label="item.itemName" v-show="item.key === radioNumber" :key="item.itemCode+index" :prop="item.itemCode">
									 <component :is="`v-${item.type}`" :form-data="materialForm" :placeholder-data="item.placeholder" :key-data="item.itemCode"></component>  
								</el-form-item> 
								<el-form-item>
									<el-button type="primary" class='btn' @click="submitForm('materialForm')">查询</el-button>
								</el-form-item>
							</el-form>
						</el-radio-group>
					</el-tab-pane>
					<el-tab-pane label="遏制列表" activeName="second">						
						<el-form :inline="true" ref="equipmentFrom" :model="equipmentFrom"  :class="[ 'demo-form-inline','form-inline']" :rules="equipmentRules">
							 <el-form-item v-for="(item,index) in groupItems2" :label="item.itemName"  :key="`item`+index" :prop="item.itemCode">
								 <component :is="`v-${item.type}`" :form-data="equipmentFrom" :placeholder-data="item.placeholder" :key-data="item.itemCode"></component>  
							</el-form-item> 
							<el-form-item>
								<el-button type="primary" class='btn' @click="submitForm1('equipmentFrom')">查询</el-button>
							</el-form-item>
						</el-form>
					</el-tab-pane>
				</el-tabs>
			</div>
			<div class="panel-content">
				<div class="router-container" >
					<div v-if="tip" class='tip'></div>
					<router-view></router-view>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
	import header from "components/header/header.vue"

	import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
	import DateTime from 'components/basic/dateTime.vue'
	import fnP from "assets/js/public.js"

	//const URL_JOIN = HOST + "";//"http://rapapi.org/mockjsdata/21533/ssss??"    // 测试获取刚进来的数据
	const URL_JOIN = "../static/2.json"    // 测试获取刚进来的数据
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
				radioList:[
					{
						key:'0',
						groupName:'物料'
					},
					{
						key:'1',
						groupName:'设备',
					}
				],
				groupItems: [
                        {
							key:'1',
                         	itemCode: "equipmentCode",
							itemName: "设备",
							type: "select",
							placeholder:"请选择设备"
                        },
                        {
							key:'1',
                         	itemCode: "startTime",
							itemName: "开始时间",
							type: "datetime",
							placeholder:"请选择开始时间"
                        },
                        {
							key:'1',
                         	itemCode: "endTime",
							itemName: "结束时间",
							type: "datetime",
							placeholder:"请选择结束时间"
						},
						{
							key:'0',
                         	itemCode: "materialCode",
							itemName: "物料",
							type: "select",
							placeholder:"请选择物料"
                        },
                        {
							key:'0',
                         	itemCode: "batchNo",
							itemName: "批次",
							type: "input",
							placeholder:"请输入批次"
                        }
				],

				materialForm:{
					equipmentCode:'',   //设备
					startTime:'',		//开始时间
					endTime:'',			//结束时间
					materialCode:'',	//物料编号
					batchNo: ''			//批次号
				},
				activeName: 'first',
				radioNumber: '0',
				equipmentRules: {
					personCode: [
						{ required: true, message: '请选择人员', trigger: 'change' }
					],
					startTime: [
						{ type: 'date', required: true, message: '请选择开始日期', trigger: 'change' }
					],
					endTime: [
						{ type: 'date', required: true, message: '请选择结束日期', trigger: 'change' }
					]
				},
				/* 遏制列表页面数据 */
				equipmentFrom:{
					startTime:'',		//开始时间
					endTime:'',			//结束时间
					personCode:'',		//操作人员
				},
				groupItems2: [
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
				

				activeKey: "suspicious",  // 储存路由页面,默认suspicious


			/* 保存上次查询的数据 */
				defaultConditions:{},
				// 查询标记。
				tag: "",
				tip: true

			}
		},
		// 计算属性。
		computed: {
			// 获取当前真正的查询条件
			ruleForms: function(){
				let ruleForms = {}
				this.groupItems.filter((o) => o.key === this.radioNumber).forEach(item => {
					ruleForms[item.itemCode] = this.materialForm[item.itemCode]
				})
				return  ruleForms
			},
			rules:function(){
				let orules = {},
            		oForm = this.ruleForms,
				// 验证开始时间。
				validateStartTime = (rule, value, callback) => {
	            	if(!value) {
	            		callback(new Error("请输入开始时间"));
	            	}else {
	            		callback();
	            	}
				},
				// 验证结束时间。
            	validateEndTime = (rule, value, callback) => {
	            	let sStart = oForm.startTime;
	            	if(!value) {
	            		callback(new Error("请输入结束时间"));
	            	}else if(sStart && sStart > value) {
	            		// 如果开始时间存在，而且开始时间大于结束时间。
	            		callback(new Error("结束时间必须大于开始时间"));
	            	}else {
	            		callback();
	            	}
	            };
				if(this.radioNumber === "0"){
					orules = {
						batchNo: [
							{ required: true, message: '请输入批次号', trigger: 'blur' }
						],
						materialCode: [
							{ required: true, message: '请选择物料编号', trigger: 'change' }
						]
					}
				}else{
					orules = {
						equipmentCode: [
							{ required: true, message: '请选择设备编号', trigger: 'change' }
						],
						startTime:[
							{ validator: validateStartTime , required: true, message: '请选择开始日期', trigger: 'change' }
						],
						endTime:[
							{ validator: validateEndTime , required: true, trigger: 'change' }
						]
					}
				}
				return orules
			}

        },
		// 创建时处理。mounted
		created() {
			// 登录判断。
			this.$register.login(this.$store);

			/* 设置遏制类表的查询条件 */
			sessionStorage.setItem('restrainList', JSON.stringify(this.equipmentFrom)); //设置默认过滤条件 -- 遏制列表的条件

			/* 获取传入的查询条件 */
			this.tag = location.search.split("=")[1];

          	let oData = sessionStorage.getItem("searchConditions-" + this.tag);

			if(oData) {									//如果该条件在 session 中有保存
				oData = JSON.parse(oData);
				this.render(oData) 						// 根据数据渲染页面
			}else if(window.location.hash.length > 2) { // session中信息丢失，url中有参数。则获取url中的参数。			
				oData = this.getSearchData();
				this.render(oData)
			}else {
				oData = {
					tab: "",
					keys: {
						batchNo: "",
						materialCode: ''
					},
					radio: "0"
				}
				
			}

			/* 根据传入数据 */
			this.$register.sendRequest(this.$store, this.$ajax, URL_JOIN, "get", null, (oResult) => {
				this.tip = false
				let datas = oResult
				let _radioList = []			//用于储存radioList
				let _groupItems = []		//用于储存groupItems
				datas.forEach(o => {		//用于获取页面上布局信息
					if(o.moduleCode === "restrain"){	
						(o.groups).forEach((group,index) => {
							_radioList.push({
								key: `${index}`,
								groupName: `${group.groupName}`
							})
							var groupItems = group.groupItems
							groupItems.forEach(function(item){
								if(item.itemCode === "equipmentCode" || item.itemCode === "materialCode" ){  //查询条件如果是'物料'或'人员'
									item.type = 'select'
									item.placeholder = `请选择${item.itemName}`
								}else if(item.itemCode === "batchNo"){			//查询条件如果是'批次'
									item.type = 'input'
									item.placeholder = `请输入${item.itemName}`
								}else{											//查询条件如果是'时间'
									item.type = 'datetime'						
									item.placeholder = `请选择${item.itemName}`
								}
								_groupItems.push({
									key: `${index}`,
									itemCode: `${item.itemCode}`,
									itemName: `${item.itemName}`,
									type: `${item.type}`,
									placeholder: `${item.placeholder}`
								})
							})						
						})
						this.radioList = _radioList
						this.groupItems = _groupItems

					}
				})

				this.$nextTick(() => {
					if(oData) {
						this._submitForm(oData);
					}            
				})
			})

		},
		// 页面方法。
		methods: {
			/* 根据传入信息渲染页面 */
			render(oData){
				this.activeKey = oData.tab;  //路由
				this.radioNumber = oData.radio
				if(oData.radio === '0'){  // 将条件渲染到页面
					this.materialForm.materialCode = oData.keys.materialCode
					this.materialForm.batchNo = oData.keys.batchNo
				}else{
					this.materialForm.equipmentCode = oData.keys.equipmentCode
					this.materialForm.startTime = oData.keys.startTime
					this.materialForm.endTime = oData.keys.endTime
				}
			},

			submitForm(formName) {
			  this.$refs[formName].validate((valid) => {
					if (valid) {

                        let oConditions = {
                            keys: this.ruleForms, // this.keys,
							radio: this.radioNumber,
							tab: this.activeKey
						};
                        this._submitForm(oConditions);
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                
				});
			},
			submitForm1(formName) {
			  this.$refs[formName].validate((valid) => {
					if (valid) {
						sessionStorage.setItem('restrainList', JSON.stringify(this.equipmentFrom));
						this.$router.replace({ 
							path: '/list/'+new Date().getTime().toString().substr(-5) //对路由添加时间戳，促发路由改变，子组件监听路由触发事件
							
						})
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                
				});
			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param,fnSu,fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu();
				}else {
					// 提示信息。
					this.sErrorMessage = param.data.errorMsg.message;
					this.showMessage();
					// 失败后的回调函。
					fnFail && fnFail();
				}
			},
			// 显示提示信息。
			showMessage() {
				this.$message({
					message: this.sErrorMessage,
					duration: 3000
				});
			},
			// 切换tab
			handleClick(tab) {
				
				if(tab.index === '1'){
					sessionStorage.setItem('restrainList', JSON.stringify(this.equipmentFrom));
					this.$router.replace({ 
							path: '/list/'+new Date().getTime().toString().substr(-5) //对路由添加时间戳，促发路由改变(不可见)，子组件监听路由触发事件
							
						})
				}else{
					this._submitForm(this.defaultConditions)
				}
			},


			// 数据提交
			_submitForm(oConditions) {	
				

				let sPath = '/' + this.activeKey;  //this.activeKey  == 'suspicious'
				oConditions.tab = this.activeKey;

				this.defaultConditions = oConditions

          		sessionStorage.setItem('searchConditions-' + this.tag, JSON.stringify(oConditions))

				sPath = sPath + '/' + oConditions.radio;
				
				if(this.activeKey  === 'suspicious' && oConditions.radio == 1) {
					sPath = '/process'
				}
				this.$router.replace({ path: sPath, query: this.getKeys() })
			},
			
			getKeys() {
				
				let oSearch = this.ruleForms
				// 加时间戳。生成标记-- 点击查询可多次
				oSearch._tag = new Date().getTime().toString().substr(-5);
				
				return oSearch;
			},

			getSearchData () {
				let oData = {
					tab: "",
					keys: {},
					radio: "1"
				},
				aHref = location.href.split("?"),
				aParams = aHref[1].split("&"),
				aInfo = aHref[0].split("/");
					
				// 设置tab和radio
				oData.tab = aInfo[aInfo.length-2];
				oData.radio = aInfo[aInfo.length-1];
					
				// 设置keys。
				aParams.forEach(o=>{
					let aAttr = o.split("=");
					oData.keys[aAttr[0]] = decodeURIComponent(aAttr[1]);
				});

				// 返回参数。
			//	console.log(oData)
				return oData;
			},
			
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
				.form-inline {
					display: flex;
					border-bottom:1px solid #ccc
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
	.panel-title {
		.search-tab {
			.el-tabs__header {
				border-bottom:none;
				margin: 20px 0;
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
			.el-tabs__content {
				.el-tab-pane {
					.el-radio-group {
						.el-input__inner {
							height: 30px;
							border-radius: 0;
							border-color: #ddd;
						}
					}
					.el-input__inner {
						height: 30px;
						border-radius: 0;
						border-color: #ddd;
					}
				}
			}
		}
	}
	

	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items:stretch;
		
		.panel {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		.panel-content {
			display: flex;
			flex: 1;
			padding-left: 28px;
        	padding-right: 28px;
			.router-container {
				display: flex;
				flex: 1;
				width: 100%;
				flex-direction: column;
				.tip {
					height: 100%;
					background: url('../../assets/img/tip.png') no-repeat center center;
				}
				// .router-content {
				// 	.innner-content {
				// 		position: absolute;
				// 		left: 28px;
				// 		right: 28px;
				// 		margin-bottom: 15px;
				// 	}
				// }
				// .material-stock {
				// 	.router-path {
				// 		padding-left: 28px;
        		// 		padding-right: 28px;
				// 	}
				// }
			}
			.material-stock {
				flex: 1;
			}
		}
		.condition-messsage {
			.el-form-input {
				margin-left: 0;
				width: 400px;
				.el-form-item {
					.el-form-item__label {
						padding: 8px 10px 8px 0;
					}
					.el-form-item__content {
						.el-input {
							.el-input__inner {
								height: 30px;
								line-height: 30px;
								border-radius: 0;
							}
						}
					}
				}
			}
		}
	}

	#restrain {
		.router-path {
			border-bottom-width: 0;
		}
	}
</style>