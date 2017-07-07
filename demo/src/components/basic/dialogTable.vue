 <template>
    <el-dialog :visible.sync="dialogVisible" top='20%' :show-close='false' >
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
                    <template scope="props">
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
            },
            dialogVisible:Boolean
        },
        data() {
            return {
                _dialogVisible:false
            }
        },
        computed: {
        	gridData: function() {
        		return this.dialogData.data
        	},
            // dialogVisible : function() {
        	// 	return this.dialogData.dialogVisible 
        	// },
            columns: function() {
                return this.dialogData.columns
            },
            _dialogVisible: function(){
                return this.dialogData.dialogVisible
            } 
        },
        watch: {
            '_dialogVisible': function() {
                 debugger
                if(!this.dialogVisible){
                    this.dialogVisibleChange();
                }
                
            }
        },
        methods: {    
            // cellClick: function(row, column, cell, event) {
            //     let oColumn = this.columns.filter(o => o.prop==column.property)[0];
            //     oColumn.cellClick && oColumn.cellClick(row);
                
            // }
            // selectionChange: function(selection) {
            // 	this.dialoData.selected = selection;
            // }
            dialogVisibleChange:function() {
                //this.dialogVisible
                this.$emit('dialogVisibleChange')
            }
        }
    }
</script>

<style lang="less">
   
</style>