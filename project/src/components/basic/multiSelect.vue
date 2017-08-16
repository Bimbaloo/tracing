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
        		let aResult = this.listData || [];

        		aResult.unshift({
        			label: "全部",
        			value: "all"
        		})
        
        		return aResult;
        	}
        },
        methods: {
            handleChange(value) {
           
            	if(value.includes("all") && value.length > 1) {
            	
            		this.form[this.key] = ["all"];
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
