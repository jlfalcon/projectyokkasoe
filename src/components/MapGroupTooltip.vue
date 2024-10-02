<template>
    <div :style="{
        left: `${left}px`,
        top: `${top-20}px`,
        width: 'fit-content',
        height: 'fit-content',
        position: 'absolute',
        
        'background-color': '#f4feff',
        'border-radius': '10px',
        'box-shadow': '0px 2px 10px rgba(0, 0, 0, 0.4)',
    }" class="popup-container">
        <div class="spike"></div>
        <slot />
    </div>
</template>

<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    left: { type: Number, required: true },
    top: { type: Number, required: true },
    items: { type: Array, required: true },
});

const emit = defineEmits(['clickedOutside']);

function clickOutsideHandler(event) {
    if (event.target.closest('.popup-container')) return;
    document.removeEventListener('mousedown', clickOutsideHandler);
    console.log( "MapGroupTooltip :: clickOutsideHandler" );
    emit('clickedOutside');
}

onMounted(() => {
    console.log( "MapGroupTooltip :: onMounted", props.items );
    document.addEventListener('mousedown', clickOutsideHandler);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', clickOutsideHandler);
});
</script>

<style scoped>
.popup-container {
    position: relative;
    /* pointer-events: none; */
    color: #2A6264;
    z-index: 100;
    font-size: 0.9rem;
    line-height: 18px;
    padding: 10px 20px;
}

.spike {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid #f4feff;
    /* Color of the spike */
    left: -10px;
    /* Position the spike to the left */
    top: 20px;
    /* Vertically center the spike */
    transform: translateY(-50%);
}
</style>