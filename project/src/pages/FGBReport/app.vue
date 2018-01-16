<template>
	<div id="app" class="report-wrapper" >
		<!-- 显示节点 -->
		<div class="report-container" ref="fgbreport">
			<div class="page-icon">
				<i class="icon icon-20 icon-download" title="下载" @click="downloadHandle('fgbreport', $event)"></i>
            	<i class="icon icon-20 icon-print" title="打印" @click="printPage('fgbreport', $event)"></i>
			</div>
			<h1 class="title">FGB检验</h1>
			<h2 class="content-title">查询条件</h2>
            <div class="condition" ref='condition'>
                <div class='condition-message'>
                    <!-- <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span> -->
					<span v-for="(filter,index) in dataName" :key="index">
						{{filter.itemName}} : {{condition[filter.itemCode]}}
                    </span>
					
                    <el-form :model="ruleForm"  ref="ruleForm" class='el-form-input'>
                        <el-form-item label="条码：" > 
                             <el-input v-model="ruleForm.input" placeholder="请输入条码"  @change="updateRow" ></el-input>
                        </el-form-item>
                    </el-form>
                   
                </div>
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>条码表</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('fgbTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="fgbTable">
                <el-table 
				:data="datas" 
				stripe 
				class="table" 
				:row-key="tableData.data.prop" 
				v-loading="loading" 
				element-loading-text="拼命加载中" 
				style="width: 100%" 
				ref="multipleTable" 
				@expand="dataEdit"> 
				<!--:height="tableData.height"-->
                    <el-table-column v-if="!!column.show" v-for="column in columns" align="center" :type="column.type" :prop="column.prop" :label="column.name" :key="column.prop" :class-name="column.class" :width="column.width">
                        <template scope="props">
                            <el-form label-position="left" inline class="demo-table-expand table-form" v-if="column.type === 'expand'">
                                <el-form-item 
                                :label="setName(index)" 
                                v-for="(prop,index) in props.row" 
                                :key="index"
                                v-if="!!setName(index) && setName(index) !== '采集时间：' && setName(index) !=='条码：'">
                                    <span :title="prop">{{ prop }}</span>
                                </el-form-item>
                            </el-form>
                            <div v-else :class="[ 'cell-content']">
                                {{ props.row[column.prop] }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
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

const url = HOST + "/api/v1/fgb/by-equipment-time";
const url2 = HOST + `/api/v1/fgb/by-dataid`;
//const url = "static/fgb.json"
//const url2 = "static/fgb2.json"

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
                //"min-width": "1000px"
            },

            loading: false,
            condition: {},   // 查询条件    
            // filters: {},
            dataName: [      // 条件对应中文名
                {
                    itemCode: "equipmentName",
                    itemName: "设备"
                }, {
                    itemCode: "startTime",
                    itemName: "开始时间"
                }, {
                    itemCode: "endTime",
                    itemName: "结束时间"
                },
            ],
            /* fgb */
            tableData: {
                filename: 'fgb检验',
                columns: [{
					name: "",
                    type: "expand",
                    width: "100",
                    show:true               //是否在表头显示
                }, {
                    name: "条码",
                    prop: "value",
                    show:true
                }, {
                    name: "采集时间",
                    prop: "pickTime",
                    show:true
                }],
                data: []
                // height: 1
            },
            ruleForm:{
                input: ""
            },
           expandedId:[] //用于保存展开过的行的id

        }

    },
    created() {
		this.$register.login(this.$store);

		// 获取配置数据。
		this.$register.getVersion(this.$store, this.$ajax, () => {
		// this.$store.dispatch('getVersion').then(() => {
			if(this.fgb) {
				this.fetchData()//获取数据
			}else {
				// 若不支持遏制。
				this.$message.error('暂无权限。');
			}
			
		});//getConfig
        // this.fetchData(); //获取数据
    },
    computed: {
        /* 列信息 */
        columns: function() {
            return this.tableData.columns 
        },
        /* 显示的行信息 */
        datas: function() {
            if(this.ruleForm.input === ""){
                return this.tableData.data 
            }else {
                return this.updateRow(this.ruleForm.input)
            }
            
		},
		// 参数。
		oParams: function() {
			return window.Rt.utils.getParams()
		},
		// 是否支持断链修复。
		fgb() {
			return this.$store.state.versionModule && this.$store.state.versionModule.fgb
		}
		
    },
    mounted() {

    },
    updated() {

    },
    watch: {
    },
    methods: {
        // 显示提示信息。
        showMessage() {
            this.$message({
                message: this.sErrorMessage,
                duration: 3000
            });
        },
        // 请求成功。
        requestSucess(oData) {
            this.loading = false;
            this.tableData.data = oData;
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            this.loading = false;
            // 提示信息。
            console.log("查询出错。")
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            console.log("查询出错。")
        },
        // 获取数据。
        fetchData() {
            this.loading = true;
            let oQuery = {}
            Object.keys(this.oParams).forEach((el) => {
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {
                    oQuery[el] = decodeURIComponent(this.oParams[el])
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = decodeURIComponent(this.oParams[el])
                }
            })

            this.$register.sendRequest(this.$store, this.$ajax, url, "get", oQuery, this.requestSucess, this.requestFail, this.requestError)
        },
        // 表格导出。
        exportExcelHandle(oData, event) {
            if (!oData) {
                return;
            }
            // 下载表格。
            window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
        },
        // 表格打印。
        printHandle(refTable, event) {
            let oTable = this.$refs[refTable];

            if (!oTable) {
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
                        .el-table__body-wrapper td {
                        	white-space: normal;
    						word-break: break-all;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            // border: 1px solid #e4efec;
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
        /* 获取元素实际高度(含margin) */
        outerHeight(el) {
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        },
        /* 根据新获取的检验值，找到对应的中文 */
        setName(val) {
            let cName = this.tableData.columns.find((el) => {
                return el.prop === val
            })
            return (cName?cName.name+'：':false)
        },
        /* 根据新获取的检验值，设置中文名和英文名对应关系 */
        dataEdit(row, expanded) {
  
            let Id = row.dataId
            if(!!expanded && !this.expandedId.some(el=>el===Id)){  //如果展开的话
                let dataId = {
                    "dataId": Id
                }

                this.$register.sendRequest(this.$store, this.$ajax, url2, "get", dataId, (oData) => {
                    oData.forEach(el=>{
                        let newData = {name:`${el.description}`,prop:`${el.description}`}
                        this.tableData.columns.push(newData)
                        this.$set(row, `${el.description}`, `${el.value}${el.varUnit}`)
                    })
                    this.expandedId.push(Id)               
                }, (sErrorMessage) => {
                    // 提示信息。
                    console.log(sErrorMessage);
                }, (err) =>{
                    console.log(err);
                })
            }
        },
        /* 根据刷选条件显示行 */
        updateRow(value) {
            let odata;
            if(value !== ""){
                let reg =new RegExp("\\w*" + value + "\\w*");
                odata = this.tableData.data.filter((el)=>{
                   return reg.test(el.value) === true
                })
            }else{
                odata = this.tableData.data
            }
            return odata
		},
		// 页面下载。
		downloadHandle (refHtml, event) {
			event.stopPropagation();
			let oRef = this.$refs[refHtml];
			if(!oRef) {
				return;
			}
			window.Rt.utils.downloadHtml(html2canvas, oRef, "快速报告");     
		},
		// 打印页面。
		printPage(refHtml, event) {
			let oTable = this.$refs[refHtml];
	
			let sHtml = `
				<div class="report-wrapper">
					<div class="report-container">
						${oTable.innerHTML}
					</div>
					
					<style>
						body {
							display: flex;
							flex-direction: column;
						}
						
						.report-wrapper {
							padding: 20px;
							flex: 1 1;
						}
						.report-container .table {
							display: block !important;
						}
						.report-container {
							width: 100%;
							height: 100%;
							background-color: #fff;
							position: relative;
							box-sizing: border-box;
						}
						
						.report-container .content-table {
							display: block !important;
						}
						.report-container .page-icon {
							display: none
						}
						.report-container .title {
							height: 24px;
							font: normal 24px/1 "微软雅黑",arial,sans-serif;
							color: #333;
							text-align: center;
							margin: 28px auto;
						}
						.report-container .content-title,
						.report-container .content-title .table-title{
							font-size: 16px;
							height: 16px;
							line-height: 16px;
						}
						.report-container .content-title {
							text-indent: 10px;
							border-left: 4px solid #42af8f;
						}
						.report-container .inner-title .table-title {
							font-size: 16px;
							color: #42AF8F;
						}
						.report-container .condition-message {
							box-sizing: border-box;
							padding-left: 10px;
						}
						.report-container .condition-message span {
							font-size: 14px;
							margin-right: 30px
						}
						.report-container .condition-message .el-form-item .el-form-item__label, 
						.report-container .condition-message .el-form-item .el-form-item__content {
							display: inline-block;
						}

						.report-container .condition-table {
							margin-top: 0;
							box-sizing: border-box;
							border: 1px solid #42AF8F;
							padding: 10px;
						}

						.report-container .report .inner-title,
						.report-container .report .content-table.inner {
							display: block !important;
						}
						.report-container .report .error {
							height: 60px;
							text-align: center;
						}
						.report-container .el-table {
							// 显示表格
							display: block !important;
							font-size: 14px
						}
						.el-table .resize-triggers {
							display: none;
						}
						.el-table td.is-center, .el-table th.is-center {
							text-align: center;
						}
						.el-table thead th {
							height: 36px;
							background-color: #42af8f;
						}
						.el-table thead th .cell {
							color: #fff;
						}
						.el-table__body-wrapper tr:nth-child(even) {
							background-color: #fafafa;
						}
						.el-table__body-wrapper tr:nth-child(odd) {
							background-color: #fff;
						}
						.el-table__body-wrapper td {
							white-space: normal;
							word-break: break-all;
						}
						.el-table__body-wrapper .cell {
							min-height: 30px;
							line-height: 30px;
							// 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
							//	border: 1px solid #e4efec;
							box-sizing: border-box;
						}
						.el-table__body-wrapper .batch .cell > div {
							color: #f90;
							font-weight: 600
						}
						.el-table__empty-block {
							text-align: center;	
						}
						.el-table__expanded-cell{
							background-color: #f4fcf9;
							padding: 0;
						}	
						.el-table__expanded-cell .table-form {
							margin: 0;
							width: 100%;
							display: flex;
							flex-wrap: wrap;
						}
						.el-table__expanded-cell .table-form .el-form-item {
							line-height: 40px;
							margin-right: 0;
							margin-bottom: 0;
							box-sizing: border-box;
							width: 33.3%;
							padding-left: 100px;
							display: flex;
						}
						.el-table__expanded-cell .table-form .el-form-item .el-form-item__label {
							flex-basis: 100px;
							text-align: right;
						}
						.el-table__expanded-cell .table-form .el-form-item .el-form-item__content {
							overflow: hidden;
							text-overflow: ellipsis;
							flex: 1;
						}
						.el-input {
							width: 180px;						
						}
						.el-input__inner {
							border-radius: 0;
							height: 30px;
						}					
						.el-form-input {
							display: inline-block;
							margin-left: 60px;
							width: 240px;
						}
						.el-form-input .el-form-item {
							margin-bottom:0;
						}
						
					</style>
				</div>
			`;

			window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml, {
				width: document.body.clientWidth
			});
		},		
    }
}
</script>

<style lang="less" >
	body {
		display: flex;
		flex-direction: column;
	}
	
	.report-wrapper {
		padding: 20px;
		flex: 1 1;
	}

	.report-container {
		height: 100%;
		border: 1px solid #ccc;
		padding: 0 20px;
		background-color: #fff;
		position: relative;
		box-sizing: border-box;
		
		.page-icon {
			position: absolute;
			top: 30px;
			right: 20px;

			.icon {
				margin-left: 10px;
				cursor: pointer;
			}
		}

		.title {
			height: 24px;
			font: normal 24px/1 "微软雅黑",arial,sans-serif;
			color: #333;
			/*font-family: "微软雅黑";*/
			text-align: center;
			/*font-weight: normal;*/
			margin: 28px auto;
		}
		
	}
	.report-container {
		.condition-message {
			box-sizing: border-box;
			padding-left: 10px;
			span {
				font-size: 14px;
				margin-right: 30px
			}
		}
	}

// .content-title {
//     .icon-print {
//         right: auto;
//     }
// }
	.el-table__expanded-cell{
		background-color: #f4fcf9;
		padding: 0;
		.table-form {
			margin: 0;
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			.el-form-item {
				line-height: 40px;
				margin-right: 0;
				margin-bottom: 0;
				box-sizing: border-box;
				width: 33.3%;
				padding-left: 100px;
				display: flex;
				.el-form-item__label {
					flex-basis: 100px;
					text-align: right;
				}
				.el-form-item__content {
					overflow: hidden;
					text-overflow: ellipsis;
					flex: 1;
				}
			}
		}
	}
	.el-input {
		width: 180px;
	
	}
	.el-input__inner {
		border-radius: 0;
		height: 30px;
	}
	@media screen and (max-width: 1400px) {
		.el-table__expanded-cell{
			.table-form {
				.el-form-item {
					padding-left: 60px;
				}
			}
		}
	}
</style>

<style lang="less" scoped>
	.tableData {
		display: flex;
		justify-content: space-between;
		.table-handle {
			margin-right: 5px;
			display: flex;
			align-items: center;
			i {
				margin: 7.5px;
				&:hover {
					cursor: pointer
				}
			}
		}
		.table-table {
			i {
				margin: 5px;
			}
		}
	}
	
	.el-form-input {
		display: inline-block;
		margin-left: 60px;
		width: 240px;
		.el-form-item {
			margin-bottom:0;
		}
	}

</style>


