<template>
    <el-date-picker
      v-model="form[key]" 
      type="datetime"
      :placeholder="hint" 
      format="yyyy-MM-dd HH:mm:ss"
      style="width: 100%;"
      >
    </el-date-picker>
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData'],
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData,
                key: this.keyData
            }
        },
        methods: {
            handleChange: function (value) {
                // let value = event.target.value;
                let formattedValue = value
                    // 删除两侧的空格符
                    .trim()
                if (formattedValue !== value) {
                    this.$refs.input.value = formattedValue
                }
                // 通过 input 事件发出数值
                this.$emit('change', formattedValue)
            }
        }
    }
</script>