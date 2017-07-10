<template>
	<div class="title"> {{ title }} </div>
</template>

<script>
	export default {
		props: ['title']
	}
</script>

<style>
	.title {
		width: 100%;
		text-align: center;
	    font-size: 21px;
   	 	color: #97C4D1;
	}
</style>