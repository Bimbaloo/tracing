<template>
    <header>
        <img :src="logo"/>
        ——&nbsp;&nbsp;追溯系统
    </header>
</template>
<script>
    import logo from 'assets/img/logo-w.png'
    
    export default {
        data () {
            return {
                logo
            }
        }
    }
</script>
<style lang="less" scoped>
    header{
        height: 68px;
        line-height: 68px;
        background-color: #333;
        padding-left: 40px;
        color: #fff;
        font-size: 16px;
        font-family: 微软雅黑;
    }
    img {
        // height: 48px;
        vertical-align: middle;
    }
</style>
