<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="filter in filters">
                        {{filter[0]}} : {{filter[1]}}
                    </span> 
                </div>
            </div>
            <h2 class="content-title tableData">
            	质检记录
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('qtTable', $event)"></i>
            </h2>
			<div class="content-table" ref="qtTable">
                <v-table :table-data="tableData" :heights="tableData.height" :loading="loading" :resize="tdResize"></v-table>
			</div>
		
					
        </div>
    </div>  
</template>

<script>
	import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'
    import html2canvas from 'html2canvas'
    import table from "components/basic/table.vue"
    import rasterizeHTML from 'rasterizehtml'
	
//const url = HOST + `/quality/inspect/by-equipment-time`;
const url = `http://rap.taobao.org/mockjsdata/24404/quality/inspect/by-equipment-time?`

export default {
    components: {
		'v-table': table
	},
    data() {
        return {
            excel: true,
            print: true,
            loading: false,
            sErrorMessage: "",
            empty: "暂无数据。",
            styleObject: {
                //  "min-width": "2000px"
            },

            loading: false,
            tdResize: true, // 是否允许拖动table大小
            condition:{},   // 查询条件    
            dataName:[      // 条件对应中文名
                {
                    itemCode:"equipmentName",
                    itemName:"设备"
                },{
                    itemCode:"startTime",
                    itemName:"开始时间"
                },{
                    itemCode:"endTime",
                    itemName:"结束时间"
                },
            ],
            /* 投入 */
            tableData: {
                filename: "质检记录",
                columns: [{
                    name: "三检类型",
                    prop: "barcode",
                    width: "200",
                }, {
                    name: "设备编码",
                    prop: "eqipmentCode",
                    width: "200"
                }, {
                    name: "设备名称",
                    prop: "eqipmentName",
                    width: "200"
                }, {
                    name: "上报时间",
                    prop: "reportTime",
                    width: "200",
                }, {
                    name: "检验时间",
                    prop: "commitTime",
                    width: "200",
                }, {
                    name: "审核时间",
                    prop: "inspectedTime",
                    width: "120"
                }, {
                    name: "人员姓名",
                    prop: "operatorName",
                    width: "300"
                }, {
                    name: "员工号",
                    prop: "operatorCard",
                    width: "200"
                },{
                    name: "审核时间",
                    prop: "inspectedTime",
                    width: "120"
                }, {
                    name: "检验结果",
                    prop: "operatorCard",
                    width: "120"
                }
                // ,{
                //     name: "检验项目",
                //     prop: "happenTime",
                //     width: "500",
                //     lists: [
                //         {
                //             itemName: "项目1",
                //             value: "value0",
                //            // width: "200"
                //         },
                //         {
                //             itemName: "项目2",
                //             value: "value1",
                //            // width: "300"
                //         }]
                // }
                
                ],
                height: 1,
                data: [],
            },

            routerContent: 0

        }

    },
    created() {
        

        this.fetchData();
       
    },
    computed:{

        viewHeight: function(){
            return this.routerContent
        },
        resizeY: function(){
            return this.$store.state.resizeY
        },
        fullscreen: function(){
            return this.$store.state.fullscreen
        },
        /* 查询条件转数组中文 */
        filters: function() {
			let filters = this.condition
			for(let i in filters){
				if(filters[i] === '' || i === '_tag'){
					delete filters[i]
				}
			}
			/* 为了将获取到的 barcode等转换为对应的中文 */
			let b = Object.entries(filters),
				a = this.dataName;

			b.forEach(o =>
                a.forEach(function (x) {
                    if(o[0] === x.itemCode){
                        o[0] = x.itemName
                    }
                })
           )
		    return b
			/* 为了将获取到的 barcode等转换为对应的中文 */
		}
    },
    mounted(){
        this.routerContent = document.querySelector(".router-content").offsetHeight  //获取初始高度
        this.tableData.height  = this.adjustHeight()
       
    },
    updated(){
        
    },
    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'fetchData',
        /* 上下拖动时，重新设置table大小变化 */
        "resizeY":'setTbaleHeight',
         /* 全屏大小时，重新设置table大小 */
        "fullscreen": 'setTbaleHeight'
    },
    methods: {
       // 判断调用接口是否成功。
        judgeLoaderHandler(param, fnSu, fnFail) {
            let bRight = param.data.errorCode;
            
            // 判断是否调用成功。
            if(!bRight) {
            	// 调用成功后的回调函数。
                fnSu && fnSu();
            }else {
                 // 提示信息。
                console.log(param.data.errorMsg.message)
                // 失败后的回调函。
                fnFail && fnFail();
            }
        },	
        // 显示提示信息。
        showMessage() {
            this.$message({
                message: this.sErrorMessage,
                duration: 3000
            });
        },		              
        // 获取数据。
        fetchData() {    
            
            this.loading = true;
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el)=>{
                if(el === "equipmentId" || el === "startTime" || el === "endTime"){
                    oQuery[el] = this.$route.query[el]
                }
                if(el === "equipmentName" || el === "startTime" || el === "endTime"){
                    this.condition[el] = this.$route.query[el]
                }
            })
            this.$get(url, oQuery)
            .then((res) => {
                this.loading = false;
             
                this.judgeLoaderHandler(res,() => {
                    
                    let odata = res.data.data,  //获取到的data
                        tdata = [],             //想要的data 
                     //   lists = [];          //想要的lists 
                        obj = {
                            name: "检验项目",
                            width: "500",
                            lists: []
                        };
                                                                
                       odata.forEach((el) => {  /* 处理columns */
                            let items = el.items
                            items.forEach(function (el, index) {
                                obj.lists[index] = {
                                    itemName: `${el.itemName}`,
                                    value: `value` + index
                                }
                            })
                        })
                        this.tableData.columns.push(obj)

                        odata.forEach((el,index) => {       /* 处理data */
                            let items = el.items
                            items.forEach((el,index)=>{
                                tdata[`value`+index] = el.value
                            })
                            let obj = Object.assign(el, tdata);
                            console.log(obj)
                            //debugger
                            this.tableData.data.push(obj)
                        })

                   
                });				 
            })
            .catch((err) => {
                this.loading = false;
                this.styleObject.minWidth = 0;   
                console.log("数据库查询出错。")
            })
        },
        // 表格导出。
        exportExcelHandle (oData, event) {
            if(!oData) {
                return;
            }
            // 下载表格。
            window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);      
        },
        // 表格打印。
        printHandle (refTable, event) {
            let oTable = this.$refs[refTable];
            
            if(!oTable) {
                return;
            }
            
            let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${oTable.querySelector(".el-table__header-wrapper").innerHTML}
                    </div>
                    <div class="el-table__body-wrapper">
                        ${oTable.querySelector(".el-table__body-wrapper").innerHTML}
                    </div>
                    <style>
                        .el-table td.is-center, .el-table th.is-center {
                            text-align: center;
                        }
                        .table thead th {
                            height: 36px;
                            background-color: #42af8f;
                        }
                        .table thead th .cell {
                            color: #fff;
                        }
                        .el-table__body-wrapper tr:nth-child(even) {
                            background-color: #fafafa;
                        }
                        .el-table__body-wrapper tr:nth-child(odd) {
                            background-color: #fff;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
//	        					border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;	
                        }
                    </style>
                </div>
            `;
            
            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
        },
        // 获取高度。
        adjustHeight() {

            let ntable = 0;
            ntable = Math.floor(
                        this.viewHeight
                        -this.outerHeight(document.querySelector(".condition"))
                        -this.outerHeight(document.querySelector(".tableData"))
                    );
            return ntable;
        },
        /* 获取元素实际高度(含margin) */
         outerHeight(el) {
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        },
        /* 设置table实际高度 */
        setTbaleHeight(){
            this.routerContent = document.querySelector(".router-content").offsetHeight
            this.tableData.height = this.adjustHeight()
        },
        /* 设置title */
        setTitle(el,title){
            let elTds = document.querySelectorAll(el)
            elTds.forEach((el,index)=>{
                if(elTds[index].tagName.toLocaleLowerCase() === 'td'){
                        el.setAttribute('title', title);
                }
            })
        }
    }
}
</script>

<style lang="less">
.content-title.table-title {
    margin-top: 10px;
    margin-bottom: 0;
    color: #333;
    font-size: 14px;
    i {
        color: #ccc;
        float: right;
        &:first-child {
            transform: rotate(180deg);
            margin-left: 20px
        }
    }
}

.content-title {
    .icon-print {
        right: auto;
    }
}

.table {
    .batch,
    .barcode,
    .material {
        cursor: pointer;
        color: #f90;

        .cell {
            font-weight: 600;

            &:empty {
                cursor: default;
            }
        }
    }
    .clicked {
        cursor: pointer;
        color: #f90;
    }
}

</style>





