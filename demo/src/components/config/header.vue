<template>
    <header>
        <img :src="logo">
    </header>
</template>

<script>
    import logo from 'assets/img/logo-w.png';
    export default{
        data(){
            return {
                logo
            }
        }
    }
</script>

<style lang="less">
    header{
        height: 68px;
        line-height: 68px;
        background-color: #333;
        padding-left: 40px;
        img{
            vertical-align: middle;
        }
    }
</style>