<template>
	<el-radio-group v-model="form[key]">
		<el-radio v-for="(item,index) in radios" :label="item.label" :key="index">{{item.text}}</el-radio>
	</el-radio-group>
</template>

<script>
	
	export default {
		props: ['formData', 'keyData','listData'],
		data() {
            return {
                form: this.formData,
                key: this.keyData,
                radios: this.listData
            }
       },
       created() {
       	console.log(this)
       }
	}
	
</script>

<style>
	
</style>