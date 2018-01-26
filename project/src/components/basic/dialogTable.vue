 <template>
    <el-dialog :visible.sync="dialogData.dialogVisible" top='20%' :show-close='false' >
        <el-table :data="gridData" border width='100%'>
            <!--<el-table-column property="batchNo" label="序号" align="center"></el-table-column>
            <el-table-column property="barcode" label="条码" align="center"></el-table-column>-->
            <el-table-column 
                v-for="column in columns"       
                align="center"
                :sortable="column.sortable"
                :prop="column.prop"
                :label="column.name"
                :key="column.prop" 
                :class-name="column.class">
                    <template slot-scope="props">
                        <div :class="{clicked: (props.row.barcodeTypeName == '2' && column.prop=='barcode')}">{{props.row[column.prop]}}</div>
                    </template>
            </el-table-column>
        </el-table>
    
    </el-dialog>
</template>

<script>
    export default {
        props: {
            dialogData: Object,
            //tableData: Object,
            heights: {
            	required: false,
            	default: "100%"
            }
        },
        data() {
            return {
            }
        },
        computed: {
        	gridData: function() {
        		return this.dialogData.data
        	},

            columns: function() {
                return this.dialogData.columns
            }

        }
       
    }
</script>

<style lang="less">
   
</style>