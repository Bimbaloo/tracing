<template>
    <el-select 
    	v-model="formData[keyData]" 
    	:placeholder="hint" 
    	:disabled="disabled" 
    	style="width: 100%;" 
    	multiple 
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
    export default {
        props: {
        	formData: Object,
        	placeholderData: String,
        	keyData: String,
        	listData: Array,
        	allData: {
        		required: false,
        		default: 'all'
        	},
        	disabled: {
        		required: false,
        		default: false
        	}
        },
        data() {
            return {
//              form: this.formData,
                hint: this.placeholderData,
//              key: this.keyData,
//              multiValues: this.formData[this.keyData]
            }
        },
        computed: {
        	options: function() {
        		let aResult = JSON.parse(JSON.stringify(this.listData || []));
        		// 将全部按钮加入。
        		aResult.unshift({
        			label: "全部",
        			value: this.allData
        		})
        		// 返回数据。
        		return aResult;
        	}
        },
        methods: {
            handleChange(value) {
            	
            	// 是否选中的是全部，如果是全部则其他的不能选中其他的|| 如果选中的是除全部以外其他的，则设置为全部
            	if((value.includes(this.allData) && value.length > 1) || (!value.includes(this.allData) && value.length === this.listData.length )) {
            		// 含有全部，则将数据设置为全部。
            		if(value.includes(this.allData) && value[value.length-1] != this.allData) {
            			// 已选中全部下，选中其他数据。
//          			this.multiValues = [value[value.length-1]];
            			this.formData[this.keyData] = [value[value.length-1]]
            		}else {
						// 1、点击的是全部 2、选中了除全部外的数据            			
//	            		this.multiValues = [this.allData];
	            		this.formData[this.keyData] = [this.allData];
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
