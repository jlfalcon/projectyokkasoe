<template>
    <div :style="{
        left: `${x+30}px`,
        top: `${y-20}px`,
        width: 'fit-content',
        height: 'fit-content',
        
        'background-color': '#f4feff',
        'border-radius': '10px',
        'box-shadow': '0px 2px 10px rgba(0, 0, 0, 0.4)',
    }" class="popup-container">
        <div class="spike"></div>
        <slot />
    </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useMouse } from './composables/useMouse.js';

const { x, y } = useMouse();

const props = defineProps({
    left: { type: Number, required: true },
    top: { type: Number, required: true },
});
</script>

<style scoped>
.popup-container {
    position: fixed;
    pointer-events: none;
    color: #2A6264 !important;
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