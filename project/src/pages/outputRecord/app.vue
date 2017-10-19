<template>
	<div id="app">
		<v-header :config="false" :back="false" :tool="false"></v-header>
		<div class="content" ref="content">
			<v-output :page-size="true" :page-height="contentHeight"></v-output>
		</div>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	import OutputRecord from 'components/outputRecord/record.vue'
	
	export default {
		components: {
			"v-header": header,
			"v-output": OutputRecord
		},
		data() {
			return {
				contentHeight: 400	
			}
		},
		created() {},
		mounted() {
			this.contentHeight = this.$refs.content.clientHeight
		},
		methods: {}
	}
	
</script>

<style lang="less">
	
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		
		.content {
			flex: 1;
			margin: 20px;
			padding: 20px;
			background-color: #FFFFFF;
		}
	}
	
</style>