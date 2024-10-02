<template>
    <div class="pod container">
        <header>
            <div class="title">{{  getFullTitle(props)  }}</div>
            <CustomDropdown @update:selected="onDropdownSelectChanged" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <div :class="{transparent: loading}" style="width: 100%; height: 300px; ">
            <VuePlotly :data="data" :layout="layout" :config="config" style="height:100%;" @hover="onHover" @unhover="overedItem=null" />
        </div>
        <div class="loading" v-show="loading">Loading....</div>

        <GenericTooltip v-if="overedItem && overedItem.label" >
            <div><b>{{ overedItem.label }}</b></div>
            <div>{{ overedItem.value }} ({{ (overedItem.value / totalValues * 100).toFixed(0) }}%)</div>
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
import { useDropdown } from './useDropdown.js';
import GenericTooltip from './GenericTooltip.vue'
const { loading, filters, dropDownConfig, onDropdownSelectChanged, getSurveyDropdownTitle, getFullTitle, buildUrl } = useDropdown(loadData);


const props = defineProps({
  title: {
    type: String,
    required: false
  }
})
const totalValues = ref(0);
const overedItem = ref( null );
// -----------
const API_URL = window.getApiUrl( "taxonomies"  );

let data = ref([]);

let layout = {
    plot_bgcolor: "#ffffff00",
    paper_bgcolor: "#ffffff00",
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    },
    //treemapcolorway: ["#F08858", "#FFC352", "#B95020"], // Custom colorway if needed
    
    legend: {
        orientation: 'h'
    },
}

let config = ref({
    displayModeBar: false,
    responsive: true
});


function onHover(event){
    console.log( "onHover", event );
    let dataPoint = event.points[0];
    overedItem.value = dataPoint;
}


function loadData(){
    // Assign filters to URL and set loading....
    let url = buildUrl(API_URL);
    console.log( 'loadData', url );
    data.value = [];
    loading.value = true;
  axios.get( url )
  .then((response) => {
    console.log( "[dataload] Taxonomy: ", response.data);
    let data_raw = response.data; 

    let labels = data_raw.labels;
    let values = data_raw.values;
    let parents = labels.map( (item) => "");
    let colors = [ Utils.colors[2], Utils.colors[0], Utils.colors[1] ];
    totalValues.value = values.reduce((a, b) => a + b, 0);
    //let colors = data_raw.colors;


    data.value = [
        {
        type: "treemap",
        labels: labels,
        parents: parents,
        values: values,
        textinfo: "label+percent parent",
        textfont: {"color": "#ffffff", weight: "bold"},
        outsidetextfont: {"size": 20, "color": "#377eb8"},
        marker: {"line": {"width": 2}},
        pathbar: {"visible": false}, 
        maxdepth: 2, 
        marker: {colors: colors }, 
        hoverinfo: 'none'
        /* branchvalues:'total', */
        }
    ];
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
    /* myChart.value.on('plotly_click', function(data){
        console.log( "plotly_click", data );
    }); */
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
</style>../libs/vue3-plotly/library.mjs