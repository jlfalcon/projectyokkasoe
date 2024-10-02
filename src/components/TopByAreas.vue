<template>
    <div class="pod container">
        <header>
            <div class="title">{{  getFullTitle(props)  }}</div>
            <CustomDropdown @update:selected="onDropdownSelectChanged" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <div :class="{transparent: loading}" style="width: 100%; height: 300px; ">
            <VuePlotly :data="data" :layout="layout" :config="config" style="height:100%;" />
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


const props = defineProps({
  title: {
    type: String,
    required: false
  }
})

// -----------
const API_URL = window.getApiUrl( "areas" );

let data = ref([]);

let layout = {
    plot_bgcolor:"#ffffff00",
    paper_bgcolor:"#ffffff00",

    barmode: 'stack', 
    align: 'right',

    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    },
    yaxis: {
        showline: false,       // Hide the axis line
        showticklabels: false, // Hide the tick labels
        zeroline: false        // Hide the zero line
    }, 
    xaxis: {
        showline: false,       // Hide the axis line
        showticklabels: false, // Hide the tick labels
        zeroline: false        // Hide the zero line
    }
    /* legend: {
        orientation: 'h'
    }, */
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
    console.log( "[dataload] Areas: ", response.data);
    let data_raw = response.data; 
    let traces = [];

    data_raw.forEach((item, index) => {
        traces.push({
            x: ["By Area"],
            y: [item.value],
            ax: 100, 
            customdata: [ { name:item.name, percent:item.percent} ],
            texttemplate: [ '<span style="opacity: 0.7;"><b>' + item.value + '</b></span> <span style="font-size: 0.6rem; opacity: 0.6;">' + item.percent + '%</span>'],
            textposition: 'auto',
            insidetextanchor: 'end',
            name: item.name,
            type: 'bar',
            // alignn text on the left
            textposition: 'inside',
            textfont: { size: 12 },
            marker: { color: Utils.colors[index] }, 
            hovertemplate: '<span>%{customdata.name}</span><br>' +
                 '%{y} (%{customdata.percent}%)<br>' +  // Customize the y value
                 '<extra></extra>'
            //marker: { color: item.color }
        });
    });
    setData( traces );
    //data.value = traces;
    console.log( 'traces', traces );
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    loading.value = false;
  });
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