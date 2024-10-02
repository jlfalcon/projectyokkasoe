<template>
    <div class="statsContainer" v-if="data">
        <div class="statsContainerItem">
        <div class="statsContainerItemValue" style="font-size: 2rem; margin-top: -12px;">{{ data.Records }}</div>
        <div class="statsContainerItemLabel" style="margin-top: -12px;">Records</div>
        </div>
        <div class="statsContainerItem">
        <div class="statsContainerItemValue">{{ data.Online }}</div>
        <div class="statsContainerItemLabel">Online</div>
        </div>
        <div class="statsContainerItem">
        <div class="statsContainerItemValue">{{ data.Physical }}</div>
        <div class="statsContainerItemLabel">Physical</div>
        </div>
        <div class="statsContainerItem">
        <div class="statsContainerItemValue">{{ data.PY }}</div>
        <div class="statsContainerItemLabel">Track</div>
        </div>
        <div class="statsContainerItem">
        <div class="statsContainerItemValue">{{ data.Hunting }}</div>
        <div class="statsContainerItemLabel">Hunting</div>
        </div>
    </div>
    <div class="statsContainer" style="font-weight: bold; width: 485px;" v-else>Loading...
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VuePlotly } from 'vue3-plotly';
import axios from 'axios';

// -----------
const API_URL = window.getApiUrl( "counters" );

let data = ref(null);


function loadData(){
  axios.get( API_URL )
  .then((response) => {
    console.log( "[dataload] Counters: ", response.data);
    data.value = response.data;
  })
  .catch((error) => {
    console.error(error);
  });
}

onMounted(() => {
    loadData();
});





</script>

<style scoped>

.statsContainer{
  display: flex;
  flex-direction: row;
  background-color: var(--control-bg);
  padding: 15px 20px 8px;
  border-radius: 10px;
  color: var(--text-control);
  align-items: center;
  width: max-content;
  height: 65px;
}
.statsContainerItem{
  display: flex;
  flex-direction: column;
  /* background-color: #ffffff20; */
  padding: 0px 10px;
  text-align: center;
  margin-right: 20px;
}
.statsContainerItemValue{
  font-weight: 900;
  font-size: 1.3rem;
  
}
.statsContainerItemLabel{
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.6rem;
  margin-top: -6px;
}
</style>