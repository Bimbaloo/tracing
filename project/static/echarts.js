{
    var option = {
        title: {
            text: 'XX 参数图表',
            subtext: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['XX参数']
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} '
            }
        },
        visualMap: {
            top: 10,
            right: 10,
            pieces: [{
                gt: 0,
                lte: 4,
                color: '#ff0000'
            }, {
                gt: 4,
                lte: 21,
                color: '#ffde33'
            }, {
                gt: 21,
                lte: 100,
                color: '#ff0000'
            }],
            outOfRange: {
                color: '#999'
            }
        },
        series: [
            {
                name: 'XX参数',
                type: 'line',
                data: [11, 12, 2, 25, 18, 2, 10, 11, 12, 2, 25, 18, 2, 10, 11, 12, 2, 25, 18, 2, 10],
                markLine: {
                    data: [
                        {
                            yAxis: 21,
                            name: '上限',
                            lineStyle: {
                                normal: {
                                    color: "#3397fc"
                                }
                            }
                        },
                        { yAxis: 4, name: '下限' }
                    ]
                }
            }
        ]
    }
}