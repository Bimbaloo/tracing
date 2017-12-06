<template>
    <div class="content-query">
    	
    	<div class="query-item" 
    		v-for="(item,index) in category" 
    		:item-id = "index"
    		:key = "item.moduleCode">
    		<div class="query-header">
    			<span class="header-title"> {{ item.moduleName }} </span>
    			<div class="header-icon">
    				<!-- 编辑。 -->
    				<i @click.stop="showEditState(item.moduleCode,index)" title="编辑" v-show="!oBefore[item.moduleCode].bEdit" class="icon el-icon-edit"></i>
    				<!-- 取消。 -->
    				<i @click.stop="hideEditState(item.moduleCode,index)" title="取消" v-show="oBefore[item.moduleCode].bEdit" class="icon icon-20 icon-exit"></i>
    				<!-- 保存。 -->
    				<i @click.stop="saveModuleValue(item.moduleCode,index)" title="保存" v-show="oBefore[item.moduleCode].bEdit" class="icon icon-20 icon-save"></i>
    				<!-- 增加。 -->
    				<i @click.stop="showModal(item.moduleCode,index)" title="增加" v-show="oBefore[item.moduleCode].bEdit" class="icon el-icon-plus"></i>
    			</div>
    		</div>
    		<div class="content-item">
    			<li class="item-module"
    				v-for="(listItem,indexList) in item.groups"
    				:data-id = "indexList"
    				:key = "indexList"
    				@mouseover="isShow=index*10+indexList"
                    @mouseleave="isShow=null">
    				<span class="name-item">{{ listItem.groupName }}</span>
    				<div class="name-icon" :class="{'item-show-transition':oBefore[item.moduleCode].bEdit && isShow==index*10+indexList}">
    					<!-- 上移。 -->
    					<i v-if="indexList" 
    						@click.stop="changeOrder(item.moduleCode,index,indexList-1,indexList)"
    						 class="icon el-icon-arrow-up"></i>
    					<!-- 下移。 -->
    					<i v-if="indexList != item.groups.length-1" 
    						@click.stop="changeOrder(item.moduleCode,index,indexList,indexList+1)" 
    						class="icon el-icon-arrow-down"></i>
    					<!-- 修改。 -->
    					<i @click.stop="showModal(item.moduleCode,index,indexList)" v-if="listItem.groupName != '物流码'" class="icon el-icon-edit"></i>
    					<!-- 删除。 -->
    					<i @click.stop="delItem(index,indexList)" v-if="listItem.groupName != '物流码'" class="icon el-icon-delete"></i>
    				</div>
    			</li>
    		</div>
    	</div>
    	
    	<v-trans
    		:v-if="showTransfer"
    		:dialog-show="showTransfer"
    		:transfer-data="getAllFilter()"
    		:checked-data="getTransferData().aChecked"
    		:title="getTransferData().title"
    		:module-code="sCurrentModule"
    		@hideModal="hidePopModal"
    	></v-trans>
    </div>
</template>

<script>
	import "assets/css/common.less"
	import $ from "jquery"
    import Transfer from "components/config/newTrans.vue"

    // 表格接口。
    const TABLE_DATA_URL = HOST + "/api/v1/customized/items";
    // 自定义项列表接口。
    const MODULE_ITEM_URL = HOST + "/api/v1/customized/modules";
    
    export default {
        components:{
            "v-trans": Transfer
        },
        data() {
            return {
            	// 所有字段对应的数据。
            	aoTable: [],
            	// 自定义条件数据。
            	category: [],
            	// 临时保存数据，
            	oBefore: {
            		"stock": {
            			bEdit: false,
            			value: {}
            		},
            		"trace": {
            			bEdit: false,
            			value: {}
            		},
            		"track": {
            			bEdit: false,
            			value: {}
            		}
            	},
            	// 是否显示弹窗。
            	showTransfer: false,
            	isShow: null,
            	// 当前编辑的模块。
            	sCurrentModule: "",
            	nModuleIndex: "",
            	nItemIndex: "",
            	// 错误提示信息
            	sErrorMessage: ""
            }
        },
        created() {
        	this.$store.commit({
				type: "updateEdit",
				key: false
			});
			
			this.$register.sendRequest(this.$store, this.$ajax, TABLE_DATA_URL, "get", null, (oData) => {
				// 成功后的回调函数。
				this.aoTable = oData;
				// 调用接口数据。
				this.$nextTick(() => {
					this.$register.sendRequest(this.$store, this.$ajax, MODULE_ITEM_URL, "get", null, (oResult) => {
						// 成功后设置参数。includes
						this.category = oResult.filter(o=> ["trace","track"].indexOf(o.moduleCode)>-1)
					}, (sErrorMessage) => {
						// 提示信息。
						this.sErrorMessage = sErrorMessage;
						this.showMessage();
					})        
				})
			}, (sErrorMessage) => {
				// 提示信息。
            	this.sErrorMessage = sErrorMessage;
        		this.showMessage();
			});

        	// // 获取表格中的数据。  TABLE_DATA_URL
        	// this.$ajax.get(TABLE_DATA_URL).then((res) => {
        	// 	this.judgeLoaderHandler(res,() => {
        	// 		// 成功后的回调函数。
	        // 		this.aoTable = res.data.data;
	        // 		// 调用接口数据。
	        // 		this.$nextTick(() => {
			//           	this.$ajax.get(MODULE_ITEM_URL).then((res) => {//MODULE_ITEM_URL  "static/new.json"
			//           		this.judgeLoaderHandler(res,() => {
			//           			// 成功后设置参数。includes
			// 	                this.category = res.data.data.filter(o=> ["trace","track"].indexOf(o.moduleCode)>-1)
			//           		});
			//             });         
			//         })
        	// 	});
        	// });
            
        },
        computed: {
	        // 是否编辑的状态。
	        edit () {
	          return this.$store.state.edit
	        }
	    },
	    watch: {
          	oBefore: {
            	handler: "changeState",
            	deep: true
          	}
        },
        mounted() {
          // 离开改页面处理
          	let self = this
          	window.onbeforeunload = () => {
          		if(self.edit) {
          			// 提示需要保存。
          			return false
          		}
          	}
        },
        methods: {
        	// 编辑状态。
        	changeState(oldValue, newValue) {
        		let isEdit = false;
        		for(let o in newValue) {
        			if(newValue[o].bEdit) {
        				isEdit = true;
        			}
        		}
    			this.$store.commit({
					type: "updateEdit",
					key: isEdit
				});
        	},
        	// // 判断调用接口是否成功。
        	// judgeLoaderHandler(param,fnSu,fnFail) {
        	// 	let bRight = param.data.errorCode;
            	
            // 	// 判断是否调用成功。
            // 	if(!bRight) {
            // 		// 调用成功后的回调函数。
            // 		fnSu && fnSu();
            // 	}else {
            // 		// 提示信息。
            // 		this.sErrorMessage = param.data.errorMsg.message;
            // 		this.showMessage();
            // 		// 失败后的回调函数。
            // 		fnFail && fnFail();
            // 	}
        	// },
        	// 提示信息。
        	showMessage() {
        		this.$message({
        			message: this.sErrorMessage,
        			duration: 3000
        		});
        	},
        	// 表格数据处理。--- 获取表格中配置的条件的数据。
        	getAllFilter() {
				let aData = [];
				
				// [{key,label}]
//				this.aoTable.forEach((o) => {
//					return aData.push({
//						key: o.itemCode,
//						label: o.itemName
//					})
//				});
				
				aData = this.aoTable.map(o=>{
					return {
						key: o.itemCode,
						label: o.itemName
					}
				})
				
				// 返回数据。
				return aData;
        	},
        	// 表格数据处理，根据key值获取其名称。
        	getNameByKeyParam(sKey) {
        		let aFilterd = this.aoTable.filter(o => o.itemCode === sKey);
        		
        		if(aFilterd && aFilterd.length) {
        			return aFilterd[0].itemName;
        		}else {
        			return "";
        		}
        	},
        	// 获取模块的索引值。
        	getModuleIndexByModule(sModule) {
        		let nIndex = -1;
        		
        		// 获取索引值。
        		this.category.forEach((o,index)=>{
        			if(o.moduleCode === sModule) {
        				nIndex = index;
        			}
        		});
        		
        		return nIndex;
        	},
        	// 获取模块中所有数据
        	getModuleDataByModule(sModule) {
//      		let aMatched = this.category.filter(o => o.moduleCode === sModule);
//      		
//      		if(aMatched && aMatched.length) {
//      			return aMatched[0];
//      		}else {
//      			return {};
//      		}
        		
        		let nIndex = this.getModuleIndexByModule(sModule);
        		if(nIndex == -1) {
        			return {}
        		}else {
        			return this.category[nIndex];
        		}
        		
        	},
        	// 显示模块项的编辑模式。
        	showEditState(sModule,nIndex){
        		// 设置模块为编辑模式，并保存当前模块中所有的筛选条件。
        		this.oBefore[sModule].bEdit = true;
//      		let oData = this.getModuleDataByModule(sModule);
				let oData = this.category[nIndex];
				this.oBefore[sModule].value = $.extend(true,{},oData);
        		// 保存数据。
//      		sessionStorage.setItem(sModule,JSON.stringify(oData));
        	},
        	// 取消模块项的编辑模式。
        	hideEditState(sModule,nIndex) {
        		// 设置模块为正常模式，重置当前模块中所有的筛选条件。
        		this.oBefore[sModule].bEdit = false;
        		// 保存数据。
//      		let oData = JSON.parse(sessionStorage.getItem(sModule));
        		let oData = this.oBefore[sModule].value;
        		this.$set(this.category,nIndex,oData)
        	},
        	// 保存当前模块的数据。
        	saveModuleValue(sModule) {
        		// 参数。
        		let oResult = this.getModuleDataByModule(sModule);
				
				// 判断当前是否可以保存。
				if(!oResult.groups.length) {
					// 当前项为空，则提示。
					this.sErrorMessage = "模块下至少有一个条件组合";
					this.showMessage();
				}else {

					// 可以保存。
					this.$register.sendRequest(this.$store, this.$ajax, MODULE_ITEM_URL, "put", this.getModuleDataByModule(sModule), () => {
						this.oBefore[sModule].bEdit = false;
						this.sErrorMessage="保存成功！";
						this.showMessage();
					}, (sErrorMessage)=> {
						this.sErrorMessage = "保存失败";
						this.showMessage();
						console.log(sErrorMessage);
					}, (err)=> {
						this.sErrorMessage = "保存失败";
						this.showMessage();
						console.log(err);
					})
// 	        		this.$ajax.put(MODULE_ITEM_URL,this.getModuleDataByModule(sModule)).then((res)=>{
	        			
// 	        			this.judgeLoaderHandler(res,() => {
// 		        			this.oBefore[sModule].bEdit = false;
// 	        				this.sErrorMessage="保存成功！";
// 	        				this.showMessage();
// //	        			},()=>{
// //	        				let oData = this.oBefore[sModule].value;
// //	        				this.$set(this.category,this.getModuleIndexByModule(sModule),oData);
// 	        			});
// 	        		});
				}
				
        	},
        	// 获取transfer显示的值。
        	getTransferData() {
        		let oData = {
        			// 标题：
        			title: "",
        			// 选中key值。
        			aChecked: []
        		};
        		
        		if(this.sCurrentModule && this.nItemIndex >= 0) {
        			// 当前是编辑，模式。--- 获取所需的值。
        			let oItem = this.category[this.nModuleIndex].groups[this.nItemIndex];
        			oData = {
        				title: oItem.groupName,
        				aChecked: (function() {
        					let aData = [];
        					oItem.groupItems.forEach(function(o) {
        						aData.push(o.itemCode)
        					});
//      					aData = oItem.groupItems.map(o=>{
//      						return {o.itemCode}
//      					})
        					return aData;
        				})()
        			}
        		}
        		// 返回数据。
        		return oData;
        	},
        	// 显示弹窗。
        	showModal(sModule,nParentIndex,nIndex) {
        		this.showTransfer = true;
        		// 如果nIndex不存在，则表示是增加显示，否则为修改。---- 获取数据。
        		this.sCurrentModule = sModule;
        		this.nModuleIndex = nParentIndex;
        		this.nItemIndex = nIndex;
        	},
        	// 隐藏弹窗。-- 返回的数据。
        	hidePopModal(oResult) {
        		// 弹窗隐藏。
        		this.showTransfer = false;		// !this.showTransfer
        		this.sCurrentModule = "";
        		
        		if(oResult) {
        			// 存在数据， 则更新或，增加项。
        			let oValue = {
        				groupName: oResult.title,
        				groupItems: (function() {
        					let aValue = [];
        					aValue = oResult.aItem.map(o=>{
        						return {
        							itemCode: o
        						}
        					})
        					return aValue;
        				})()
        			};
        			
        			// 判断当前是增加还是更新。
        			if(this.nItemIndex != undefined) {
        				// 修改。
        				this.$set(this.category[this.nModuleIndex].groups, this.nItemIndex,oValue)
        			}else {
        				this.category[this.nModuleIndex].groups.push(oValue);
        			}
        		}
        	},
        	// 删除模块中的项。 参数为索引中。
        	delItem(nParentIndex,nIndex) {
        		// 显示数据删除。
        		this.category[nParentIndex].groups.splice(nIndex,1);
        	},
        	// 移动前项。
        	changeOrder(sModule,nParentIndex,nPrev,nNext) {
        		// 移动数据。
        		let oPrev = this.category[nParentIndex].groups[nPrev];
        		this.$set(this.category[nParentIndex].groups,nPrev,this.category[nParentIndex].groups[nNext]);
        		this.$set(this.category[nParentIndex].groups,nNext,oPrev);
        		// 这样互相交换，需鼠标移开才能看到效果。
//      		[this.category[nParentIndex].groups[nPrev],this.category[nParentIndex].groups[nNext]] = [this.category[nParentIndex].groups[nNext],this.category[nParentIndex].groups[nPrev]]
        		console.log(this.category[nParentIndex])
        	}
        }
    };
</script>

<style lang="less">
	.content {
		overflow: auto;
	}
    .content-query{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        padding: 20px;
        
        .query-item{
            width: 400px;
            border:2px solid #b3b3b3;
            margin: 20px;
            
            .query-header{
                display: flex;
                justify-content: space-between;
                height: 40px;
                color: #ffffff;
                padding: 0 20px 0 20px;
                background: #b3b3b3;
                
                .header-title,
                .header-icon {
                    line-height: 40px;
                }
                
                .header-icon {
                	cursor: pointer;
                	font-size: 20px;
                	
                	.icon {
                		margin-right: 10px;
                		vertical-align: middle;
                		 
                		&:last-child {
                			margin-right: 0;
                		}
                	}
                }
                .add-item{
                    margin-top: 20px;
                }
            }
            .content-item{
                height: 500px;
                padding: 20px 10px 0px 10px;
                overflow: auto;
                
                .item-module {
                    /*display: flex;
                    justify-content: space-between;*/
                    padding: 5px;
                    margin-bottom: 10px;
                    background: #e6e6e6;
					position:relative;                    
                    overflow: hidden;
                    
                    .name-item,
                    .name-icon {
                        line-height: 36px;
                    }
                    
                    .name-item {
                    	display: block;
                    	width: 100%;
                    	cursor: pointer;
                    	white-space: nowrap;
                    	overflow: hidden;
                    	text-overflow: ellipsis;
                    }
                    
                    .name-icon {
                    	position: absolute;
                    	right: 5px;
                    	/*top: 5px;*/
                    	line-height: 36px;
                    	cursor: pointer;
                    	bottom: -26px;
                    	opacity: 0;
                    	
                    	.icon {
                    		margin-right: 10px;
                    		
                    		&:last-child {
                    			margin-right: 0;
                    		}
                    	}
                    	
                    	&.item-show-transition {
	                        /*display: none;*/
	                        transition: all ease .8s;
	                        bottom: 0px;
	                        opacity: 1;
	                    }
	                    
	                    &.item-show-enter,
	                    &.item-show-leave {
	                    	transition: all ease .8s;
	                    	opacity: 0;
	                    	bottom: -26px;
	                    }
                    }
                    
                    .btn-item{
                   	 	margin-top: 8px;
                   	 		
                        &.hide{
                             display: none;
                         }
                         .edit-item{
                             display: inline-block;
                             margin-right: 5px;
                         }
                         .close-btn{
                             display: inline-block;
                             width: 20px;
                             height: 20px;
                             background: url("../../assets/img/img02.png") no-repeat;
                             background-position: 0 -40px;
                             cursor: pointer;
                            &:hover{
                                 background-position: -20px -40px;
                             }
                         }
                    }
                }
            }
            &:hover{
                 border: 2px solid #42af8f;
               
                .query-header {
                    background: #42af8f;
                }
                .item-module {
                	background: #d9f0e9;
                }
                
             }
        }
    }
</style>