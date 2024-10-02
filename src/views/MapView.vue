<template>
  
  <div class="">
  HOLA
      <div class="col" style="">
        <MapComponent id="bigMap" mode="big"/>
      </div>
    </div>
</template>

<script setup>

import { onMounted } from 'vue'
import MapComponent from '../components/MapComponent.vue'

onMounted(() => {
  // add class
  document.querySelector("#app").classList.add("fullWidth");
});

</script>


<style>

#bigMap{
    border-radius: 0px;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
}
#bigMap .mapHeader{
    top: 100px;
    right: 32px;
    display: flex;
    gap: 10px;
}

#bigMap .minimap{
    border-radius: 0px;
    
  }
</style>
