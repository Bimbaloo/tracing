<template>
	
    <el-select v-if="key === 'materialCode'" v-model="form[key]" 
    	:placeholder="hint" 
    	style="width: 100%;" 
    	filterable 
    	clearable 
    	remote
    	:remote-method="remoteMethod"
    	:loading="loading"
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="getDisplayName(option)"
            :value="option.value">
            <div>
		        <span>{{ option.value }}</span>:
		      	<span>{{ option.label }}</span>
	        </div>
        </el-option>
    </el-select>
    
    <el-select v-else v-model="form[key]" 
    	:placeholder="hint" 
    	style="width: 100%;" 
    	filterable 
    	clearable 
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="option.label"
            :value="option.value">
        </el-option>
    </el-select>
</template>

<script>
	
	const oAjax = {
		// 物料。
		"materialCode": {
			url: HOST + "/api/v1/basicinfo/materials",// "/api/v1/customized/materials",
			code: "material"
		},
		// 设备。
		"equipmentCode": {
			url: HOST + "/api/v1/basicinfo/equipments",//"/api/v1/customized/equipments",
			code: "equipment"
		},
		// 工序
		"processCode": {
			url: HOST + "/api/v1/basicinfo/processes", //"/api/v1/customized/processes",
			code: "process"
		},
		// 人员
		"personCode": {
			url: HOST + "/api/v1/basicinfo/persons",//"/api/v1/customized/persons",
			code: "person"
		}
	};
	const sSessionSelectStorageKey = "selectStorageKey";
	
    export default {
        props: ['formData', 'placeholderData', 'keyData','listData'],
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData,
                key: this.keyData,
                list: [],
                // 保存所有数据。
                options: [],
                // 物料数据初始化。
                oInit: [],
                // 默认显示最大条数。（只限物料）
                nMax: 200,
                loading: false
            }
        },
        created() {
        	// 判断是否存在。如果存在
        	let sKey = this.key,
        		sStorage = sessionStorage.getItem(sSessionSelectStorageKey),
        		oStorage = sStorage? JSON.parse(sStorage): {},
        		nLen = this.nMax;
        	
        	if(oStorage && oStorage[sKey]) {
        		this.list = oStorage[sKey];
        		
        		// 如果是物料，则获取部分数据。
        		if(sKey === "materialCode") {
        			// 物料只取其中一部分。
        			this.options = this.list.filter((o,index)=>{
        				return index<nLen;
        			});
        			this.oInit = this.options;
        		}else {
        			// 默认为所有、
	        		this.options = this.list;
        		}
        		
        	}else {
	        	this.$ajax.get(oAjax[sKey].url).then((res) => {
	        		
	        		if(res.data.errorCode == "0") {
	        			// 成功。
		        	 	this.list = res.data.data.map(o=>{
		        	 		return {
		        	 			label: o[oAjax[sKey].code+"Name"],
		        	 			value: o[oAjax[sKey].code+"Code"]
		        	 		}
		        	 	});
	        		}else {
	        			this.list = [];
	        		}
	        		
					// 如果是物料，则获取部分数据。
	        		if(sKey === "materialCode") {
	        			// 物料只取其中一部分。并保存起来。当搜索时恢复
	        			this.options = this.list.filter((o,index)=>{
	        				return index<nLen;
	        			});
	        			this.oInit = this.options;
	        		}else {
	        			// 默认为所有、
		        		this.options = this.list;
	        		}
	        		
	        	 	oStorage[sKey] = this.list;
	        	 	// 保存数据。
	        	 	sessionStorage.setItem(sSessionSelectStorageKey,JSON.stringify(oStorage));
	        	});
        	}
        },
        methods: {
            handleChange(value) {
                console.log(value);
            },
            // 获取显示label
            getDisplayName(item) {
            	return item.value+":"+item.label;
            },
            // 外部查询。
            remoteMethod(query) {
            	if(this.key === "materialCode") {
            		// 物料数据，则通过搜索。
            		let sQuery = query.trim();
            		
            		if(sQuery !== "") {
            			this.loading = true;
            			let nLen = this.nMax,
            				nFilter = 0;
            				
            			setTimeout(()=> {
            				this.loading = false;
            				this.options = this.list.filter(o=>{
            					// 编码或名称匹配
            					let sLable = this.getDisplayName(o);
            					if((sLable.indexOf(sQuery)>-1||o.label.indexOf(sQuery)>-1 || o.value.indexOf(sQuery)>-1) && nFilter<nLen){
            						nFilter++;
            						return true;
            					}else {
            						return false;
            					}
            				});
            			},100);
            		}else {
            			this.options = this.oInit;
            		}
            	}
            }
        }  
    }
</script>

<style lang="less">
    .el-select-dropdown {
        border-radius: 0;
        margin: 0;
    }
</style>
