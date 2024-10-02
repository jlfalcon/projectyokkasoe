<template>
    <div class="pod container">
        <header>
            <div class="title">{{  getFullTitle(props)  }}</div>
            <CustomDropdown @update:selected="onDropdownSelectChangedLocal" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <div :class="{transparent: loading}" style="width: 100%; height: 300px;">
            <VuePlotly :data="data" :layout="layout" :config="config" style="height:100%;" 
            @hover="onHover" @unhover="overedItem=null" 
        />
        </div>
        <div class="loading" v-show="loading">Loading....</div>

        <GenericTooltip v-if="overedItem && overedItem.label" >
            <div style="display: flex; flex-direction: row;     align-items: center;">
                <div :style="{ 'background-color': overedItem.color, 'border-radius': '50%', width: '10px', height: '10px', 'margin-right': '5px'}"></div>
                <div>
                    <!-- <strong style="">Track</strong> -->
                    <b>{{ overedItem.label }}</b>
                </div>            
            </div>       
            <div>{{ overedItem.value }}% of total</div>
        </GenericTooltip>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
//import { VuePlotly } from 'vue3-plotly';
import { VuePlotly } from '../libs/vue3-plotly';
import axios from 'axios';
import CustomDropdown from './CustomDropdown.vue';
import Utils from '../Utils.js';
import GenericTooltip from './GenericTooltip.vue'
import { useDropdown } from './useDropdown.js';
const { loading, filters, dropDownConfig, onDropdownSelectChanged, getSurveyDropdownTitle, getFullTitle, filterTitle, buildUrl } = useDropdown(loadData);


const props = defineProps({
  title: {
    type: String,
    required: false
  }
})
// -----------
const API_URL = window.getApiUrl( "units"  );

const overedItem = ref( null );

let data = ref([]);

let layout = ref({
   /*  height: 400,
    width: 500, */
    plot_bgcolor:"#ffffff00",
    paper_bgcolor:"#ffffff00",
    legend: {
        orientation: 'h', // Horizontal orientation
        x: 0.5,           // Center it horizontally
        xanchor: 'center' // Align center relative to the x value
    },
    annotations: [
    {
      font: {
        size: 14, 
        color: '#429295', 
        weight: 'bold', 
        family: 'Roboto'
      },
      showarrow: false,
      //text: 'OVERALL',
      text: filterTitle(),
      
    }
  ],

    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    },
    autosize: true, // Ensure autosizing is enabled
});

let config = ref({
    displayModeBar: false,
    responsive: true
});


function onHover(event){
    let dataPoint = event.points[0];
    overedItem.value = dataPoint;
}

function onDropdownSelectChangedLocal(selected){
    console.log( 'onDropdownSelectChangedLocal', selected );
    onDropdownSelectChanged(selected);
    let centerTitle = filterTitle();
    layout.value.annotations[0].text = centerTitle.toUpperCase();
}

function loadData(){
    // Assign filters to URL and set loading....
    let url = buildUrl(API_URL);
    console.log( 'loadData', url );
    data.value = [];
    loading.value = true;
  axios.get( url )
  .then((response) => {
    console.log( "[dataload] Units: ", response.data);
    let data_raw = response.data;
    data.value = [{
        values: data_raw.values,
        labels: data_raw.labels,
        marker: {colors: Utils.colors},
        //marker: {colors: data_raw.colors},
        //domain: {column: 0},
        //hoverinfo: '<div>label+value</div>percent',
        //hovertemplate: '%{label} %{value} <b>(%{percent})</b><extra></extra>',
        texttemplate: '<span style="opacity: 0.7;">%{label}<br><b>%{percent}</b></span>',
        textopacity: 0.6,
        hoverinfo: 'none',
        textposition: "inside",
        automargin: true,
        textfont: { size: 10 },
        hole: .45,
        type: 'pie'
        }]
  })
  .catch((error) => {
    console.error(error);
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