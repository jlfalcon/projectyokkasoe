<template>
    <div class="mapInner" style="">
        <header class="mapHeader">
            <CustomDropdown v-if="mode=='big'" @update:selected="onModeChanged" :title="renderMode.label" :data="renderModes" :multiselect="false" :maxHeight="400" />

            <CustomDropdown v-if="mode=='big'"  @update:selected="onDropdownSelectChangedLocal" :title="getSurveyDropdownTitle()" :data="dropDownConfig.data" :multiselect="false" :maxHeight="400" />
        </header>
        <MapboxMap ref="mapInstance" class="minimap" access-token="pk.eyJ1IjoicHJvdG96b28iLCJhIjoiY2tyM3IxNjluMW1wNjJvbW5lZ2N5cnM1ZCJ9.CmiTelXq_QVQKbKQozkeNw" :center="defaultCenter" :zoom="defaultZoom" :minZoom="5" :maxZoom="15" @mb-zoomstart="onMapZoomStart" @mb-zoomend="onMapZoomEnd" @mb-move="onMapMove" >

            <!-- Marker clustering when "Show Entries" state is active -->
            <MapboxSource
                v-if="renderMode.id != 'areas'"
                id="entries"
                :options="{
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: individuals.map(track => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: track.geo_location.coordinates
                            },
                            properties: track
                        }))
                    },
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                }"
            ></MapboxSource>

            <!-- Clusters layer -->
            <MapboxLayer
                v-if="renderMode.id != 'areas'"
                id="clusters"
                @mb-click="onClusterClicked"
                :options="{
                    type: 'circle',
                    source: 'entries',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': '#E86E59',
                        'circle-radius': 20,
                    }
                }"
            />

            <!-- Cluster count layer -->
            <MapboxLayer
                v-if="renderMode.id != 'areas'"
                id="cluster-count" 
                :options="{
                    type: 'symbol',
                    source: 'entries',
                    filter: ['has', 'point_count'],
                    paint: {
                        'text-color': '#ffffff', 
                    }, 
                    layout: {
                        'text-field': '{point_count_abbreviated}',
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 14
                    }
                }"
            />

            <!-- Individual markers for non-clustered points -->
            <MapboxLayer
                v-if="renderMode.id != 'areas'"
                id="unclustered-point"
                :options="{
                    type: 'circle',
                    source: 'entries',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': '#ff9900',
                        'circle-radius': 10,
                        'circle-opacity': 0, 
                        
                    }
                }"
            />

            <MapboxMarker 
                v-if="renderMode.id != 'areas'"
                v-for="(track, index) in unclusteredTracks" 
                :key="'tr_' + index"
                :lng-lat="track.geometry.coordinates"
                :offset="[0, -15]"
            >

                <div
                @mouseenter="markerOnOver(track, $event)" 
                @mouseleave="mapMarkerTooltipInfo = null"
                class="customMarker"
                :style="{
                    'border': 'solid 2px #00000000',
                    'background-color': categoryColors[track.properties.category] || '#cccccc',
                    
                }"
                >
                <div
                    class="markerSpike"
                    :style="{
                    'background-color': categoryColors[track.properties.category] || '#cccccc',
                    }"
                />
                </div>
            </MapboxMarker>

            <!-- Area polygons  -->
            <MapboxSource
        id="areas"
        :options="{
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: areas.map(area =>{ 
                let result =  {
              type: 'Feature',
              geometry: area.geometry,
              properties: {
                id: area.properties.ST,
                relatedArea: areasById[area.properties.ST],
                name: area.properties.ST,
                interpolatedValue: areasById[area.properties.ST]?.interpolatedValue || 0
              }
            };
            return result;
            })
          }
        }"
      />

      <!-- Single layer for filling the areas with dynamic colors -->
      <MapboxLayer
      v-if="renderMode.id == 'areas'"
        id="areas-fill"
        @mb-click="onMapAreaClicked"
        :options="{
          type: 'fill',
          source: 'areas',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'interpolatedValue'],
              0, '#429295',
              1, '#F08858'
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': '#ffffff'
          }
        }"
      />

            
        </MapboxMap>
        <button v-if="mode!='big'" class="orangeButton" @click="gotoMap">
            GO TO MAP
        </button>
        <div class="zoomBtnsContainer" v-if="mode=='big'">
            <button class="zoomButton" @click="zoomIn">+</button>
            <button class="zoomButton" @click="zoomOut" style="padding-bottom: 8px; font-size: 3rem;">-</button>
        </div>

        <div class="mapInfoPanel" v-if="mode=='big' && renderMode.id == 'areas'">
            <div class="mapInfoPanelTitle">{{getInfoPanelTitleForAreas()}}</div>
            <div class="mapAreasLegend" style="margin-top: 10px;"></div>
            <div class="mapInfoPanelContent" style="display: flex; flex-direction: row; width: 100%;     font-size: 0.6rem; font-weight: bold; margin-top: 5px;">
                <div style="flex: 1;">MIN</div>
                <div style="flex: 1; display: flex; justify-content: right;">MAX</div>
            </div>
        </div>
        <div class="mapInfoPanel" v-if="mode=='big' && renderMode.id != 'areas'">
            <div class="mapInfoPanelTitle">{{getInfoPanelTitleForEntries()}}</div>
            <div class="mapInfoPanelEntriesContainer" style="display: flex; flex-direction: row; width: 100%;    font-weight: bold; margin-top: 3px; gap: 10px; align-items:flex-end;">
                <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: -2px;">
                    <!-- <div style="flex: 1; margin-bottom:5px;">
                        <div style="background-color: rgb(255, 153, 0, 0); border-radius: 50%; width: 8px; height: 8px;"></div>
                    </div> -->
                    <div style="flex: 1; line-height: 80%; font-size: 2.1rem;">{{ individuals.length }}</div>
                    <div style="flex: 1; font-size: 0.55rem;">RECORDS</div>
                </div>
                <div v-for="(value, key) in trackCountsByCategory" style="display: flex; flex-direction: column; align-items: center; min-width:50px;">
                    <div style="flex: 1; margin-bottom:5px;">
                        <div :style="{ 'background-color': categoryColors[key], 'border-radius': '50%', width: '8px', height: '8px' }"></div>
                    </div>
                    <div style="flex: 1; line-height: 80%; font-size: 1.5rem;">{{ value }}</div>
                    <div style="flex: 1; font-size: 0.55rem; text-transform: uppercase; line-height: 10px; padding-top: 5px; text-align: center;">{{ key }}</div>
                </div>
            </div>
        </div>

        <!-- <div style="position: fixed; top: 300px; right: 20px; font-size: 20px; font-weight: bold; color: #000; background-color: #fff; padding: 5px 10px;">UNCLUSTERED: {{  mapMarkerTooltipInfo }}</div> -->

        <MapAreaTooltip v-if="mapAreaTooltipInfo && !mapGroupItemsObject" :left="mapAreaTooltipInfo.position.left+20" :top="mapAreaTooltipInfo.position.top">
            <strong style="">{{ mapAreaTooltipInfo.name }}</strong><br>
            <div v-if="mapAreaTooltipInfo.info.byKind" v-for="(value, key) in mapAreaTooltipInfo.info.byKind">
                <strong>{{ value }}</strong> - {{ key }}<br>
            </div>
            <div v-else>No data for this area</div>
            <!-- <strong>134</strong> - Physical<br>
            <strong>34</strong> - PY<br>
            <strong>6</strong> - Hunting -->
        </MapAreaTooltip>

        <MapAreaTooltip v-if="mapMarkerTooltipInfo && !mapGroupItemsObject" :left="mapMarkerTooltipInfo.position.left" :top="mapMarkerTooltipInfo.position.top" :style="{ transform: mapMarkerTooltipInfo.transform }">
            <div style="display: flex; flex-direction: row;     align-items: center;">
                <div :style="{ 'background-color': categoryColors[mapMarkerTooltipInfo.info.properties.category], 'border-radius': '50%', width: '10px', height: '10px', 'margin-right': '5px' }"></div>
                <div>
                    <strong style="">{{ mapMarkerTooltipInfo.info.properties.category }}</strong>
                </div>            
            </div>            
            <div style="margin:3px 0px 0px 0px;">{{ mapMarkerTooltipInfo.info.properties.post_time.split('T')[0] }}<br>
            {{ mapMarkerTooltipInfo.info.properties.region }}</div>
            <!-- <div v-if="mapMarkerTooltipInfo.info.byKind" v-for="(value, key) in mapMarkerTooltipInfo.info.byKind">
                <strong>{{ value }}</strong> - {{ key }}<br>
            </div>
            <div v-else>No data for this area</div> -->
            <!-- <strong>134</strong> - Physical<br>
            <strong>34</strong> - PY<br>
            <strong>6</strong> - Hunting -->
        </MapAreaTooltip>

        <MapGroupTooltip 
            v-if="mapGroupItemsObject && mode=='big'" 
            :left="mapGroupItemsObject.position.left+20" :top="mapGroupItemsObject.position.top" 
            :items="mapGroupItemsObject.items" 
            style="z-index: 100000; pointer-events: reset;    padding-right: 0px;"
            @clickedOutside="mapGroupItemsObject = null"
        >
            <div>
                <span v-if="mapGroupItemsObject.name" style="font-size: 18px; font-weight: bold; margin: 2px 0px 5px;">{{ mapGroupItemsObject.name }}</span>
                <span v-if="mapGroupItemsObject.name" style="font-size: 14px; font-weight: bold; margin: 2px 10px 5px 3px; opacity: 0.5;"> ({{ mapGroupItemsObject.items.length }})</span>
            </div>
            <div style="min-width: max-content;max-height: 200px; overflow: auto; padding-right: 18px;">
                <div v-for="item in mapGroupItemsObject.items" style="display: flex; flex-direction: row; align-items: center; gap: 5px; border-bottom: solid 1px #00000020; padding: 5px 0px;">
                    <div :style="{ 'background-color': categoryColors[item.properties.category] || '#cccccc', width:'10px', height: '10px', 'border-radius': '50%', 'margin-right':'4px' }"></div>
                {{ item.properties.post_time.split('T')[0] }}
                <span v-if="!mapGroupItemsObject.name">- {{ item.properties.region }}</span>
                 ({{ item.properties.kind }})
                </div>
            </div>
        </MapGroupTooltip>


    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { MapboxMap, MapboxMarker, MapboxLayer, MapboxSource } from '@studiometa/vue-mapbox-gl';
import "@mapbox/mapbox-gl-geocoder/lib/mapbox-gl-geocoder.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import Utils from '../Utils.js';
import MapAreaTooltip from './MapAreaTooltip.vue';
import MapGroupTooltip from './MapGroupTooltip.vue';

import CustomDropdown from './CustomDropdown.vue';
import { useDropdown } from './useDropdown.js';
const { loading, filters, dropDownConfig, onDropdownSelectChanged, buildUrl, getSurveyDropdownTitle, getFullTitle, filterTitle } = useDropdown();

const renderModes = ref([
    { id: 'tracks', label: 'Show Entries', selected: false },
    { id: 'areas', label: 'Show By Area', selected: true },
]);
const renderMode = ref( renderModes.value[1]);

const BASE_API_URL = '';

const individuals_raw = ref([]);
const individuals = ref([]);
const areas = ref([]);
const areaSources = ref([]);

let areasById = ref({});
let areaValuesLoaded = ref(false);
let maxAreaValue = ref(0);

const mapInstance = ref(null);

const mapAreaTooltipInfo = ref(null);
const mapMarkerTooltipInfo = ref(null);

const mapGroupItemsObject = ref(null);

const categoryColors = {
    "Climate change": "#619542",
    "Community": "rgb(47, 128, 237)",
    "Forest": "rgb(39, 174, 96)",
    "Infrastructure": "rgb(242, 153, 74)",
    "Mining": "rgb(155, 81, 224)",
    "Water": "rgb(86, 204, 242)",
    "Wildlife": "rgb(242, 201, 76)",
};
// Props
const props = defineProps({
    mode: String
})

dropDownConfig.value.data[0].selected = false;
onDropdownSelectChanged( dropDownConfig );

const defaultZoom = ref(4.2);
const defaultCenter = ref([ 96.59550600130586, 22.01892928983952 ]);
if( props.mode=='big' ){
    defaultZoom.value = 5.3;
    defaultCenter.value = [95.41899029285236, 22.616563438307537];
}

const areaColors = [ "#429295", "#F08858" ];


const trackCountsByCategory = computed( ()=>{
    let result = {};
    individuals.value.forEach((item) => {
        let category = item.category;
        if( !result[category] ){
            result[category] = 0;
        }
        result[category]++;
    });
    let sortedResultsDesc = Object.keys(result).sort((a, b) => result[b] - result[a]);
    return sortedResultsDesc.reduce((acc, key) => {
        acc[key] = result[key];
        return acc;
    }, {});
});

function zoomIn(){
    console.log( 'zoomIn' );
    mapInstance.value.map.zoomIn();
}
function zoomOut(){
    console.log( 'zoomOut' );
    mapInstance.value.map.zoomOut();
}
function onDropdownSelectChangedLocal(selected){
    console.log( 'onDropdownSelectChangedLocal', selected );
    onDropdownSelectChanged(selected);
    console.log( 'onDropdownSelectChangedLocal::filters: ', filters );
    setFilteredTracks();
    setTimeout(() => {
        computeIndividuals();
    }, 500);
    //computeIndividuals();
    
   /*  onDropdownSelectChanged(selected);
    let centerTitle = filterTitle(); */
}


function onMapAreaClicked(event){
    if( props.mode !='big' ){
        return;
    }
    const features = mapInstance.value.map.queryRenderedFeatures(event.point, {
        layers: ['areas-fill']
    });
    console.log( 'onMapAreaClicked', event, features );
    console.log( 'onMapAreaClicked.individuals: ', individuals.value );
    let areaFeatures = individuals.value.filter( (item) => item.region == features[0].properties.id );
    areaFeatures = areaFeatures.map( (item) => {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: item.geo_location.coordinates
            },
            properties: item
        }
    }); 
    //const screenCoordinates = { x: event.x, y: event.y }
    //const screenCoordinates = mapInstance.value.map.project(features[0].geometry.coordinates); // { x: ..., y: ... }
    mapGroupItemsObject.value = { name: features[0].properties.id, position: { left: event.point.x, top: event.point.y }, items: areaFeatures };
    console.log( 'mapGroupItemsObject.value = ', mapGroupItemsObject.value );
}

function onClusterClicked(event){
    console.log( 'onClusterClicked', event );
  const clusterObject = event.features[0];
  console.log( 'clusterObject', clusterObject );

  // Geographical coordinates of the clicked cluster (longitude and latitude)
  const clusterCoordinates = event.features[0].geometry.coordinates;

  // Convert geographical coordinates to screen (pixel) coordinates
  const screenCoordinates = mapInstance.value.map.project(clusterCoordinates); // { x: ..., y: ... }

  console.log('Screen coordinates of clicked cluster center:', screenCoordinates);




  const clusterId = clusterObject.properties.cluster_id;
  const source = mapInstance.value.map.getSource('entries');

  // Retrieve the full list of final features (leaves) inside the cluster
  source.getClusterLeaves(
    clusterId,
    500, //Infinity, // Use Infinity to get all features in the cluster, or a specific number if you want to limit it
    0,       // Start at the first leaf
    (err, features) => {
      if (err) {
        console.error('Error retrieving cluster leaves:', err);
        return;
      }
      // features is an array of the final features inside the cluster
      console.log('Final features in cluster:', features);
      mapGroupItemsObject.value = { position: { left: screenCoordinates.x, top: screenCoordinates.y }, items: features };
    }
  );









   /*  const features = mapInstance.value.map.queryRenderedFeatures(event.point, {
        layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id; */
    /* let allLeafs = recursivelyCollectAllLeafsFromCluster( clusterId );
    console.log( 'onClusterClicked - allLeafs', allLeafs );
    return; */
    // Get list of cluster leaves
    /* const leaves = mapInstance.value.map.querySourceFeatures('entries', {
        sourceLayer: 'unclustered-point',
        filter: ['==', ['get', 'cluster_id'], clusterId]
    });
    console.log( 'onClusterClicked - leaves', leaves );
    leaves = ñeaves[0]; */

    /* mapInstance.value.map.getSource('entries').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        mapInstance.value.map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
        });
    }); */
}
/* 
function recursivelyCollectAllLeafsFromCluster(clusterId){
    let results = [];
    let leaves = [];
    let cluster = mapInstance.value.map.querySourceFeatures('entries', {
        sourceLayer: 'unclustered-point',
        filter: ['==', ['get', 'cluster_id'], clusterId]
    });
    if( cluster.length > 0 ){
        leaves = cluster;
    }else{
        let subClusters = mapInstance.value.map.querySourceFeatures('entries', {
            sourceLayer: 'clusters',
            filter: ['==', ['get', 'cluster_id'], clusterId]
        });
        subClusters.forEach((subCluster) => {
            let subClusterId = subCluster.properties.cluster_id;
            let subLeaves = recursivelyCollectAllLeafsFromCluster( subClusterId );
            leaves = leaves.concat( subLeaves );
        });
    }
}
 */

function gotoMap(){
    window.location.href = "/map";
}

const unclusteredTracks = ref([]);

function onMapZoomStart(event) {
    mapMarkerTooltipInfo.value = null;
    mapGroupItemsObject.value = null;
    mapAreaTooltipInfo.value = null;
}
function onMapZoomEnd(event) {
    computeIndividuals();
    mapMarkerTooltipInfo.value = null;
    mapGroupItemsObject.value = null;
    mapAreaTooltipInfo.value = null;
}
function onMapMove(event) {
    mapMarkerTooltipInfo.value = null;
    mapGroupItemsObject.value = null;
    mapAreaTooltipInfo.value = null;
}

function computeIndividuals() {
    let unclusteredItems = [];
    mapInstance.value.map.queryRenderedFeatures().forEach( (item)=>{
        if( item.layer.id == 'unclustered-point' ){
            //console.log( item.layer.id, item.properties.id, item._x, item._y, item._z, item.geometry.coordinates )
            unclusteredItems.push( item );
        }        
    })
    unclusteredTracks.value = unclusteredItems;

    let tracksByCategory = trackCountsByCategory.value;
    console.log( 'computeIndividuals::tracksByCategory', tracksByCategory );
    //console.log( 'computeIndividuals::unclusteredItems length: ', unclusteredTracks.value.length );

      /* console.log("computeIndividuals()", mapInstance.value.map);
      if (mapInstance.value.map) {
        const features = mapInstance.value.map.querySourceFeatures("entries");
        console.log("computeIndividuals 2 features()", features.length);
        let present_ids = {};
        let individuals = features.filter((feature) => {
          const props = feature.properties;
          let is_present = props.id && present_ids[props.id];
          present_ids[props.id] = true;
          return !props.cluster && props.name && !is_present;
        });
        let tracks = [];
        individuals.forEach((feature) => {
          const model = JSON.parse(feature.properties.model);
          tracks.push(model);
        });
        console.log("onMapZoomEnd 2 tracks()", tracks.length);
        individuals = tracks;
        unclusteredTracks.value = tracks;
        console.log("computeIndividuals 3 unclusteredTracks: ", tracks);
      } */
}

window.computeIndividuals = computeIndividuals;


function onModeChanged( selected ){
    renderMode.value = selected?.find( (item) => item.selected );
    //console.log( 'onModeChanged - renderMode: ', renderMode.value );

    setTimeout(() => {
        window.mapInstance = mapInstance.value;
        computeIndividuals();
    }, 1000);
}

function getLayerOption(index, source){
    let areaColor = "#ff0000";
    let areaOpacity = 0;
    let areaName = source.data.properties.ST;
    let areaData = areasById.value[areaName];
    if( areaData ){
        areaColor = Utils.interpolateHexColor( areaColors[0], areaColors[1], areaData.interpolatedValue );
        areaOpacity = 0.8;
    }

    return {
        id: "routeFill",
        type: "fill",
        source: "source-"+index,
        layout: {},
        paint: {
            'fill-color': areaColor,
            'fill-opacity': areaOpacity, 
            'fill-outline-color': '#ffffff'
        },
    }
}

onMounted( ()=>{
    fetchAreaValues( );
})

function fetchAreaValues(){
    // Reset areas by ids
    areasById.value = {};

    // Load area values
    const API_URL = window.getApiUrl( "areas" );
    let url = buildUrl(API_URL);
    loading.value = true;
    axios.get( url )
    .then((response) => {
        console.log( "[dataAreasValuesload] Areas: ", response.data);
        let dataAreasValues_raw = response.data; 

        // find max area value
        maxAreaValue.value = 0;
        dataAreasValues_raw.forEach((item) => {
            // Update max value
            if( item.percent > maxAreaValue.value )
                maxAreaValue.value = item.percent;

            // Store by id (name)
            areasById.value[item.name] = item;
        });

        // assign interpolated value
        dataAreasValues_raw.forEach((item) => {
            let itemInDict = areasById.value[item.name];
            itemInDict.interpolatedValue = maxAreaValue.value / itemInDict.value;
        });
        //setData( areasById );
        areaValuesLoaded.value = true;
        window.mapInstance = mapInstance.value;
        
       
        fetchTracks();        
    })
    .catch((error) => {
        console.error(error)
    })
    .finally(() => {
        loading.value = false;
    });
}

function setFilteredTracks(){
    individuals.value = [ ...individuals_raw.value ];
    if( filters.value.length > 0 && filters.value[0] != 'Overall' ){
        individuals.value = [ ...individuals_raw.value ].filter((item) => {
            let kind = item.kind;
            /* let region = item.region;
            let category = item.category;
            let survey = item.survey; */
            let isKind = filters.value.length == 0 || filters.value.includes( kind );
            /* let isRegion = filters.region.length == 0 || filters.region.includes( region );
            let isCategory = filters.category.length == 0 || filters.category.includes( category );
            let isSurvey = filters.survey.length == 0 || filters.survey.includes( survey );
            return isKind && isRegion && isCategory && isSurvey; */
            return isKind ; 
        });
        console.log( 'setFilteredTracks - individuals: ', individuals.value.length );
    }
    let totalEntries = individuals.value;
    let totalEntriesWithGeo = individuals.value.filter(item => item.geo_location);
    let totalEntriesWithRegion = individuals.value.filter(item => item.region);
    let totalEntriesWithGeoAndRegion = individuals.value.filter(item => item.region && item.geo_location);
    console.log( 'fetchTracks - totalEntries: ', totalEntries.length );
    console.log( 'fetchTracks - totalEntriesWithGeo: ', totalEntriesWithGeo.length );
    console.log( 'fetchTracks - totalEntriesWithRegion: ', totalEntriesWithRegion.length );
    console.log( 'fetchTracks - totalEntriesWithGeoAndRegion: ', totalEntriesWithGeoAndRegion.length );

    // Extract regions
    let regionsById = {};
    totalEntriesWithGeoAndRegion.forEach((item) => {
        let regionName = item.region;
        if( !regionsById[ regionName ] ){
            regionsById[ regionName ] = { name: regionName, value: 0, interpolatedValue: 0, byKind: {}, hasData: true };
        }
        regionsById[ regionName ].value++;
        let kind = item.kind;
        if( !regionsById[ regionName ].byKind[ kind ] ){
            regionsById[ regionName ].byKind[ kind ] = 0;
        }
        regionsById[ regionName ].byKind[ kind ]++;
    });
    let maxValue = 0;
    for( let regionName in regionsById ){
        let region = regionsById[ regionName ];
        maxValue = Math.max( maxValue, region.value );
    }
    // compute percents
    for( let regionName in regionsById ){
        let region = regionsById[ regionName ];
        region.interpolatedValue = region.value / maxValue;
        //region.interpolatedValue = Math.random()*30;
    }
    // store
    areasById.value = regionsById;
    maxAreaValue.value = maxValue;
    console.log( 'maxAreaValue.value', maxAreaValue.value );

    areaValuesLoaded.value = true;
    
    const cleanTracks = totalEntriesWithGeoAndRegion;
    individuals.value = cleanTracks.sort((itemA, itemB) => itemA.post_time < itemB.post_time ? 1 : -1);
    
}

const fetchTracks = () => {
    console.log( 'fetchAreaDebug - fetchTracks' );
    individuals.individuals_raw = [];
    individuals.value = [];
    //let path = 'data/map_tracks.json';
    let path = 'https://traders.projectyokkasoe.org/api/geo/'
    axios.get(BASE_API_URL + path).then(response => {
        let totalEntries = response.data.results;

        // Randomize positions to avoid so much clustering
        let maxRandom = 1;
        totalEntries.forEach((item) => {
            if( !item.geo_location ){
                return;
            }
            let randomX = Math.random() * maxRandom;
            let randomY = Math.random() * maxRandom;
            item.geo_location.coordinates[0] += randomX;
            item.geo_location.coordinates[1] += randomY;
        });
        // End of fake randomization of track positions

        individuals_raw.value = totalEntries;
        setFilteredTracks()
        

        window.mapInstance = mapInstance.value;
        
        mapInstance.value.map.on('load', () => {
            console.log( 'mapInstance loaded' );
            computeIndividuals();
        });

        // --------------------------- Mouse events for areas ---------------------------
        mapInstance.value.map.on('mouseleave', 'areas-fill', (event) => {
            mapAreaTooltipInfo.value = null;
        });
        mapInstance.value.map.on('mousemove', 'areas-fill', (event) => {
            const clickedArea = event.features[0];
            let areaData = areasById.value[clickedArea.properties.id];
            if( areaData ){
                mapAreaTooltipInfo.value = { name: clickedArea.properties.id, info:areaData, position: { left: event.point.x, top: event.point.y } };
            }else{
                mapAreaTooltipInfo.value = { name: clickedArea.properties.id, info:{ value: 0, interpolatedValue: 0 }, position: { left: event.point.x, top: event.point.y } };
            }
        });

        
        fetchAreas();
    });
};


const fetchAreas = () => {
    areas.value = [];
    let path = 'data/areas.json';
    axios.get(BASE_API_URL + path).then(response => {
        let features = response.data.features;
        features = features.filter((feature) => {
            let hasData = areasById.value[feature.properties.ST];
            return hasData;
        });
        features.forEach((feature) => {
            let areaData = areasById.value[feature.properties.ST];
            feature.properties.metaData = areaData;
        });

        areas.value = features;
        console.log( 'areasById', areasById.value );
        setTimeout(() => {
            onMapZoomEnd();
        }, 400);
    });
};

function markerOnOver( track, event ){
    setMarkerTooltip( track, event );
    //mapMarkerTooltipInfo.value = { name: track.properties.id, info: track, position: { left: 0, top: 0 } };
}

function setMarkerTooltip( track, event ){
    let transform = event.target.parentElement.style.transform;
    mapMarkerTooltipInfo.value = { name: track.properties.id, info: track, position: { left: 40, top: -20 }, transform:extractFirstTranslate(transform) };
}

function extractFirstTranslate(input) {
  const match = input.match(/translate\([^)]+\)/);
  return match ? match[0] : '';
}


function setData(newData){
    console.log( 'setData: ', newData );
    for( let areaName in newData ){
        let area = newData[areaName];
        let areaData = areasById.value[areaName];
        if( areaData ){
            areaData.properties.metaData = maxAreaValue.value / area.value;
        }
    }
    //areasById.value = newData;
}


function getInfoPanelTitleForAreas(){
    let result = '';
    if( filters.value && filters.value.length > 0 ){
        result = filters.value[0] + ' by Areas'
    }else{
        result = 'Overall by Areas'
    }
    return result;
}

function getInfoPanelTitleForEntries(){
    let result = '';
    if( filters.value && filters.value.length > 0 ){
        result = filters.value[0] + ' Entries'
    }else{
        result = 'Overall Entries'
    }
    return result;
}


</script>



<style>
.minimap{
  height: 100%;
  width: 100%;
  border-radius: 20px;
}

.customMarker {
  width: 30px;
  height: 30px;
  background-color: #ffffff;
  border-radius: 50%;
  border: solid 4px #ff9900;
  background-size: cover;
  opacity: 1;
  box-shadow: 0 0 15px #ffffff90;
}

.markerSpike {
  width: 12px;
  height: 12px;
  position: absolute;
  top: 21px;
  left: 9px;
  transform: rotateZ(135deg);
}

.mapHeader{
    position: absolute; z-index: 1; right: 10px; top: 10px;
}

.mapInner{
    width: 100%; height: 400px;
    min-width: 400px;
}

.zoomBtnsContainer{
    position: fixed; bottom: 60px; right: 20px;
}

.zoomButton{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #00000020;
    border: solid 3px #ffffff;
    font-size: 40px;
    /* font-weight: 100; */
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 11px;
    color: #ffffff;
    cursor: pointer;
}
.zoomButton:hover{
    background-color: #00000050;
}

.mapInfoPanel{
    position: fixed;
    bottom: 40px;
    left: 40px;
    background-color: #E9F9FA;
    border-top: solid 1px #00000020;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #2A6264;
    padding: 10px 20px;
    border-radius: 22px;
    min-width: 250px;
}

.mapInfoPanelTitle{
    /* font-weight: bold; */
    font-size: 1.4rem;
    text-align: left;
    width: 100%;
    /* margin-bottom: 10px; */
}

.mapInfoPanelEntriesContainer{
    /* font-weight: bold; */
    font-size: 1.4rem;
    text-align: left;
    width: 100%;
    /* margin-bottom: 10px; */
}

.mapAreasLegend{
    background: linear-gradient(to right, #429295, #F08858);
    width: 100%;;
    height: 8px;
}


</style>