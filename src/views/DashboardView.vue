<template>
  <div class="">
    <div class="row">
        <div class="col">
            <h1 class="pageTitle">Dashboard</h1>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <Counters />
        </div>
    </div>
    
    <!-- ROW 0 -->
    <div class="row">
      <div class="col">
        <OverallEntries title="OVERALL ENTRIES TIMELINE"/>
      </div>
    </div>

    <!-- ROW 1 -->
    <div class="row">
      <div class="col">
        <TopTradedWildlife title="THE MOST COMMONLY TRADED WILDLIFE PRODUCTS" :icons="true"
        dataname="species" />
      </div>

      <div class="col">
        <TypeOfUnit title="TYPE OF UNIT" />
      </div>
    </div>

    <!-- ROW 2 -->
    <div class="row">
      <div class="col">
        <TotalByTaxonomy title="TOP BY TAXONOMY" />
      </div>

      <!-- <div class="col" style="">
        MAP
      </div> -->
      <div class="col" style="">
        <MapComponent />
      </div>
    </div>

    <!-- ROW 3 -->
    <div class="row">
      <div class="col">
        <TopByAreas title="TOP BY AREAS" />
      </div>

      <div class="col">
        <TopTradedWildlife title="TOP HUNTERS" :showfilters="false"
        dataname="hunters" />
      </div>
    </div>

    <!-- ROW 4 -->
    <div class="row">
      <div class="col">
        <TopTradedWildlife title="TOP PARTS AND PRODUCTS FOUND" 
        dataname="parts" :logscale="true" />
      </div>

      <div class="col">
        <ConservationStatus title="Conservation Status Red List"  />
      </div>
    </div>

    <!-- ROW 5 MARKET -->
    <div class="row marketPod">
      <div class="col">
        <MarketPriceComponent style="height: 300px;" title="MARKET PRICE TOTAL" :dataindex="0" color="#F08858" />
      </div>
      <div class="col">
        <MarketPriceComponent style="height: 300px;" title="MARKET PRICE AVERAGE" :dataindex="1" color="#FFC352" />
      </div>
      <div class="col">
        <MarketPriceComponent style="height: 300px;" title="MARKET PRICE KILO" :dataindex="2" color="#B960C1" />
      </div>

      <!-- <div class="col">
        <ConservationStatus title="Conservation Status Red List"  />
      </div> -->
    </div>
  </div>
</template>

<script setup>

import { onMounted } from 'vue'
import TopTradedWildlife from '../components/TopTradedWildlife.vue'
import TypeOfUnit from '../components/TypeOfUnit.vue'
import OverallEntries from '../components/OverallEntries.vue'
import TotalByTaxonomy from '../components/TotalByTaxonomy.vue'
import ConservationStatus from '../components/ConservationStatus.vue'
import MapComponent from '../components/MapComponent.vue'
import TopByAreas from '../components/TopByAreas.vue'
import Counters from '../components/Counters.vue'
import MarketPriceComponent from '../components/MarketPriceComponent.vue'


onMounted(() => {
  // add class
  document.querySelector("#app").classList.remove("fullWidth");
});

</script>

<style>



@media (min-width: 1024px) {

  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
