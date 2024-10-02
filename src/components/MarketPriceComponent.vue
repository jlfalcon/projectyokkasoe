<template>
    <div class="pod container">
        <header style="display: flex; flex-direction: column; align-items: start; gap: 0px;">
            <div class="title">{{ title }}</div>
            <div class="valuesRow" v-if="dataSource && data.length>0">
                <div class="">{{ getShortNumber(dataSource.period_total) }} M US$</div>
                <div :style="{ 'text-align':'right', color:color, 'font-size': '0.9rem', top: '5px', position: 'relative'}">
                    <span style="font-weight: 300;">{{ getArrow(dataSource.difference)}} </span>
                    {{ dataSource.difference }}%</div>
            </div>
        </header>
        <div style="width: 100%; height: 200px; " v-if="dataSource && data.length>0">
            <VuePlotly :data="data" :layout="layout" :config="config"  style="height:100%;" />
        </div>
        <div class="loading" v-show="loading">Loading....</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VuePlotly } from 'vue3-plotly';
import axios from 'axios';
import Utils from '../Utils.js';
import { useDropdown } from './useDropdown.js';
const { loading, filters, dropDownConfig, onDropdownSelectChanged, buildUrl } = useDropdown(loadData);

// -----------
const API_URL = window.getApiUrl( "marketprice" );

const props = defineProps({
    title: String, 
    dataindex: String,   // Index of the element in the results to be used for this module
    color:String
});

let data = ref([]);
let dataSource = ref(null)

let layout = {
    plot_bgcolor: "#ffffff00",
    paper_bgcolor: "#ffffff00",

    margin: { l: 20, r: 20, b: 40, t: 0 },
    
    yaxis: {
        showline: true, // Show axis line
        showticklabels: false,
        zeroline: false,
        showgrid: false,
        linecolor: '#429295', // Green line
        linewidth: 2 // Thick line (adjust thickness here)
    },
    
    xaxis: {
        showline: true, // Show axis line
        showticklabels: false,
        zeroline: false,
        showgrid: true, // Show grid
        gridcolor: '#00000030', // Black grid lines
        gridwidth: 1, // Set grid line thickness
        griddash: "dot", 
        //dtick: 6,
        linecolor: '#429295', // Green axis line
        linewidth: 2, // Thick axis line
        dash: 'dash' // Make grid lines dashed (use 'dot' for dotted lines)
    }
};


let config = ref({
    displayModeBar: false,
    responsive: true
}); 

function getShortNumber( number ){
    // divide by 1M and return result with 2 decimals
    return (number/1000000).toFixed(2);
}

function getArrow(number){
    if( number > 0 ){
        return "↑";
    }else if( number < 0 ){
        return "↓";
    }else{
        return "=";
    }
}
function setData(newData){
    console.log( 'setData: ', newData );
    data.value = newData;
}

function loadData(){
    // Assign filters to URL and set loading....
    let url = buildUrl(API_URL);
    console.log( 'loadData', url );
    data.value = [];
    loading.value = true;
  axios.get( url )
  .then((response) => {
    console.log( "[dataload] Overall: ", response.data);
    dataSource.value = response.data[props.dataindex]; 
    let values_raw = dataSource.value.values;

    // Build trace with dates and values
    let trace = {
        x: dataSource.value.dates,
        y: values_raw,
        type: 'scatter',

        name: dataSource.value.name,
        marker: { color:  Utils.colors[props.dataindex], size: 7 },
        //marker: { color:  trace.color }
        //mode: 'markers',
    };
    
    /* let traces_parsed = [];
    values_raw.forEach((trace, index) => {
        let x = [];
        let y = [];
        trace.dates.forEach((date, i) => {
            x.push( trace.dates[i] );
            y.push( trace.values[i] );
        });
        traces_parsed.push({
            x: x,
            y: y,
            type: 'scatter',
            name: trace.name,
            marker: { color:  Utils.colors[index] }
            //marker: { color:  trace.color }
        });
    }); */
    
    setData( [trace] );
})
.catch((error) => {
    console.error(error);
  })
  .finally(() => {
    loading.value = false;
  });
  ;
  
}

onMounted(() => {
    loadData();
});


</script>

<style scoped>

.list {
    display: flex;
    flex-direction: column;
    overflow: auto;
    height:80%;
}

.item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
}

.details {
    flex-grow: 1;
}

.text {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
}

.bar-container {
    width: 100%;
    background-color: #bce3e1;
    border-radius: 4px;
    overflow: hidden;
}

.bar {
    height: 10px;
    background-color: #fe8064;
}


.valuesRow{
    display: flex;
    justify-content: space-between;
    margin-top: -10px;
    font-size: 1.4em;
    font-weight: bold;
    color: #429295;
    width: 100%;
}
</style>