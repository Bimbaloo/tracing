<template>
    <el-select v-model="multiValues" :placeholder="hint" style="width: 100%;" multiple @change="handleChange">
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
        	}
        },
        data() {
            return {
//              form: this.formData,
                hint: this.placeholderData,
//              key: this.keyData,
                multiValues: this.formData[this.keyData]
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
            	console.log("1")
            	// 是否选中的是全部，如果是全部则其他的不能选中其他的|| 如果选中的是除全部以外其他的，则设置为全部
            	if((value.includes(this.allData) && value.length > 1) || (!value.includes(this.allData) && value.length === this.listData.length )) {
            		// 含有全部，则将数据设置为全部。
            		this.multiValues = [this.allData];
            	}
            	
            	if(this.formData[this.keyData].toString() != this.multiValues.toString()) {
	            	this.formData[this.keyData] = this.multiValues;
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
