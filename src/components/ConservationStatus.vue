<template>
    <div class="pod container">
        <header>
            <div class="title">{{  getFullTitle(props)  }}</div>
            <CustomDropdown @update:selected="onDropdownSelectChanged" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <div id="pepe" style="width: 100%; height: 300px; ">
            <VuePlotly :data="data" :layout="layout" :config="config" style="height:100%;" />
        </div>
        <div class="loading" v-show="loading">Loading....</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VuePlotly } from 'vue3-plotly';
import * as d3 from 'd3';
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
const API_URL = window.getApiUrl( "redlist" );


let data = ref([]);
let layout = ref(null);
let config = ref({
    displayModeBar: false,
    responsive: true
}); 


let parsedDataset = ref([]);
console.log('ConservationStatus (redlist): ');


function loadData(){
    // Assign filters to URL and set loading....
    let url = buildUrl(API_URL);
    console.log( 'loadData', url );
    data.value = [];
    loading.value = true;
  axios.get( url )
  .then((response) => {
    console.log( "[dataload] redlist: ", response.data);

    let dataset = response.data;

    parsedDataset.value = [];
    dataset.labels.forEach( (item, i) => {
        parsedDataset.value.push({
            name: item,
            value: dataset.percents[i]
        });
        
    });
      // Your d3.js logic here
    let rawData = parsedDataset.value;

      const pack = d3.pack().size([300*2, 300*2]).padding(20);
      const root = d3.hierarchy({ children: rawData }).sum(d => d.value);
      const nodes = pack(root).leaves();

      data.value = [{
        x: nodes.map(d => d.x),
        y: nodes.map(d => d.y),
        mode: 'markers',
        marker: {
          size: nodes.map(d => d.r * 1 ),
          color: Utils.colors,
          sizemode: 'diameter', 
          opacity: 0.6, 
        },
        hoverinfo: 'text',
        text: nodes.map(d => `${d.data.value}%`),  // for hover text
      }];

      layout.value = {
  annotations: nodes.map((d, i) => ({
    x: d.x,
    y: d.r < 40 ? d.y + d.r * 0.5 + 30 : d.y,
    text: `<b>${d.data.name}</b>`,
    showarrow: false,
    font: {
      size: 14+d.r*d.r*0.001,
      color: Utils.colors[i]  // Assign the same color as the circle
    },
    opacity: 1,
    align: 'center',
    xanchor: 'center',
    yanchor: 'middle'
  })),
  showlegend: false,
  xaxis: { showticklabels: false, zeroline: false, showgrid: false },
  yaxis: { showticklabels: false, zeroline: false, showgrid: false },
  margin: { l: 0, r: 0, t: 0, b: 0 },
  plot_bgcolor: "#ffffff00",
  paper_bgcolor: "#ffffff00",
};






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