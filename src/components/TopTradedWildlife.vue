<template>
    <div class="pod container">
        <header>
            <div class="title">{{ getFullTitle(props) }}</div>
            <CustomDropdown v-if="showfilters" @update:selected="onDropdownSelectChanged" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
       
        <div class="list" v-if="dataset">
            <div class="item" v-for="(id, index) in dataset.labels" :key="id">
                <!-- <img v-if="icons" :src="'/img/species/bird.png'" alt="" class="icon" /> -->
                <img v-if="icons" :src="getIcon(id)" alt="" class="icon" @error="useDefaultIcon($event, index);" />
                <!-- <img src="original_image.jpg" alt="Image" onerror="this.onerror=null; this.src='default_image.jpg';" /> -->
                <div class="details" v-if="dataset.percents">
                    <div class="text">{{ id }} - {{ dataset.percents[index] }}% - {{ dataset.values[index] }}</div>
                    <div class="bar-container">
                        <div class="bar" :style="{ width: dataset.computedPercentages[index] + '%' }"></div>
                    </div>
                </div>
                <div class="details" v-else >
                    <div class="text">{{ id }} - {{ dataset.values[index] }}</div>
                    <div class="bar-container">
                        <div class="bar" :style="{ width: dataset.computedPercentages[index] + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="loading" v-show="loading">Loading....</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CustomDropdown from './CustomDropdown.vue';
import { useDropdown } from './useDropdown.js';
const { loading, filters, dropDownConfig, onDropdownSelectChanged, getSurveyDropdownTitle, getFullTitle, buildUrl } = useDropdown(loadData);

const maxValue = ref(0);

const props = defineProps({
  title: {
    type: String,
    required: false
  }, 
  dataname: {
    type: String,
    required: true
  }, 
  showfilters: {
    type: Boolean,
    required: false, 
    default: true
  }, 
  icons: {
    type: Boolean,
    required: false, 
    default: false
  }, 
  logscale: {
    type: Boolean,
    required: false, 
    default: false
  }
})
// -----------
const API_URL = window.getApiUrl( props.dataname  );


const dataset = ref(null);

function getIcon(name){
    return '/img/animals/'+name+'.png';
}

function useDefaultIcon(event, index){
    let element = event.target;
    console.log( 'useDefaultIcon', element );
    //:data-taxonomy="dataset.taxonomies[index]" 
    if( element.failed=='true' ){
        return;
    }
    element.failed='true';
    //element.onerror=null; 
    element.src='/img/animals/generic_'+dataset.value.taxonomies[index] + '.png';
    //return '/img/animals/generic_'+icon+'.png';
}


function loadData(){
    // Assign filters to URL and set loading....
    let url = buildUrl(API_URL);
    console.log( 'loadData', url );
    dataset.value = [];
    loading.value = true;
  axios.get( url )
  .then((response) => {
    console.log( "[dataload] Species: ", response.data);
    // Compute percentages
    response.data.values.forEach((value) => {
        maxValue.value = Math.max(maxValue.value, value);
    });
    if( props.logscale ){
        maxValue.value = Math.log(maxValue.value);
    }
    response.data.computedPercentages = response.data.values.map((value) => {
        let scaledValue = value;
        if( props.logscale ){
            scaledValue = Math.log(value);
        }
        return Math.floor(( scaledValue / maxValue.value) * 100);
    });
    dataset.value = response.data;
    
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
    padding: 0px 10px 10px 0px;
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