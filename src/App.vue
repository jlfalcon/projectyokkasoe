<template>
  <div class="row subApp" style="z-index: 1; position: relative;">
    <div class="col">
      <header class="headBar">
        <img src="/img/logo.png" alt="" style="height: 60px; position: absolute; top: 3px;" />
        <div class="wrapper" style="text-align: right; flex: 1;">
          <nav>
            <RouterLink to="/">DASHBOARD</RouterLink>
            <RouterLink to="/data">DATA</RouterLink>
            <RouterLink to="/map">MAP</RouterLink>
          </nav>
        </div>
      </header>
    </div>
  </div>


  <div class="row">
    <div class="col">
      <RouterView v-if="dataLoaded" />
    </div>
  </div>

</template>




<script setup>

import { RouterLink, RouterView } from 'vue-router'


import { ref, onMounted } from 'vue';

let dataLoaded = ref(false);



onMounted(() => {
  dataLoaded.value = true;
});

</script>



<style scoped>
  nav a.router-link-exact-active {
    opacity: 1;
  }

  nav a.router-link-exact-active:hover {
    background-color: transparent;
  }

  nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
    font-size: 12px;
    color: var(--text-control);
    opacity: 0.5;
  }
  nav a:hover {
    opacity: 1;
  }

  nav a:first-of-type {
    border: 0;
  }

  .subApp{
    width: 100%;
    /* margin: 0 auto; */
    /* padding: 2rem; */
    font-weight: normal;
  }
</style>
