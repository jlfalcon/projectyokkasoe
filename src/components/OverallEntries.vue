<template>
    <div class="pod container">
        <header>
            <div class="title">{{ getFullTitle(props) }}</div>
            <CustomDropdown @update:selected="onDropdownSelectChanged"  :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <div style="width: 100%; height: 300px; " v-if="data.length>0">
            <VuePlotly :data="data" :layout="layout" :config="config"  style="height:100%;" />
        </div>
        <div class="loading" v-show="loading">Loading....</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VuePlotly } from 'vue3-plotly';
import axios from 'axios';
import CustomDropdown from './CustomDropdown.vue';
import Utils from '../Utils.js';
import { useDropdown } from './useDropdown.js';
const { loading, filters, dropDownConfig, onDropdownSelectChanged, getSurveyDropdownTitle, getFullTitle, buildUrl } = useDropdown(loadData);

// -----------
const API_URL = window.getApiUrl( "timeline" );

const props = defineProps({
  title: {
    type: String,
    required: false
  }, 
});

let data = ref([]);

let layout = {
    plot_bgcolor:"#ffffff00",
    paper_bgcolor:"#ffffff00",

    margin: { l: 20, r: 20, b: 20, t: 0 },
    legend: { orientation: 'h', y: 1.2 },
    yaxis: {
        showline: true, // Show axis line
        showticklabels: false,
        zeroline: false,
        showgrid: true,
        gridcolor: '#00000030', // Black grid lines
        gridwidth: 1, // Set grid line thickness
        griddash: "dot", 
        //dtick: 100,
        linecolor: '#429295', // Green line
        linewidth: 2 // Thick line (adjust thickness here)
    }, 
    xaxis: {       
        showline: true, // Show axis line
        showticklabels: true,
        zeroline: false,
        showgrid: true, // Show grid
        gridcolor: '#00000030', // Black grid lines
        gridwidth: 1, // Set grid line thickness
        griddash: "dot", 
        dtick: 6,
        linecolor: '#429295', // Green axis line
        linewidth: 2, // Thick axis line
    }
}

let config = ref({
    displayModeBar: false,
    responsive: true
}); 


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
    let traces_raw = response.data; 
    let traces_parsed = [];
    traces_raw.forEach((trace, index) => {
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
    });
    
    setData( traces_parsed );
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
</style>