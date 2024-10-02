<template>
    <div class="dropdown" ref="dropdown">
        <!-- Button -->
        <button :class="{ 'dropdown-btn': true, 'dropdown-btn-expanded': isOpen}" @click="toggleDropdown">
            {{ title }} 
            <span style="margin-left: 10px;">
                <img src="/img/icons/arrow_down.png" alt=""   :class="{ 'rotated': isOpen }" style="height:12px;"  />
            </span>
        </button>
        <!-- <span v-if="isOpen">
                <img src="/img/icons/arrow_down.png" alt="" style="height:12px; margin-left: 10px;"/>
            </span>
            <span v-else>
                <img src="/img/icons/arrow_up.png" alt="" style="height:12px; margin-left: 10px;"/>
            </span> -->

        <!-- Dropdown Menu -->
        <div class="dropdown-menu" v-if="isOpen"
            :style="{ maxHeight: `${maxHeight}px`, overflowY: showScrollButtons ? 'hidden' : 'auto' }">
            <div v-if="showScrollButtons" class="scroll-button top" @mouseenter="startScroll('up')"
                @mouseleave="stopScroll">⬆️</div>

            <ul ref="dropdownList">
                <li v-for="item in data" :key="item.id" :class="{ 'selected': item.selected }"
                    @click="selectItem(item)">
                    <span class="icon">
                        <img v-if="item.selected" src="/img/icons/check_on.png" alt="" style="height:20px;"/>
                        <img v-else src="/img/icons/check_off.png" alt="" style="height:20px;"/>
                    <!-- {{ item.selected ? '✅' : '🔲' }} -->
                    </span>
                    <span style="width: 100%; padding-left: 10px;">{{ item.label }}</span>
                </li>
            </ul>

            <div v-if="showScrollButtons" class="scroll-button bottom" @mouseenter="startScroll('down')"
                @mouseleave="stopScroll">⬇️</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Props
const props = defineProps({
    title: String,
    data: Array,
    multiselect: Boolean,
    maxHeight: Number
})

// State management
const isOpen = ref(false)
const dropdownList = ref(null)
const scrollInterval = ref(null)
const dropdown = ref(null)

// Open and close dropdown
function toggleDropdown() {
    isOpen.value = !isOpen.value
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Emit selection changes
const emit = defineEmits(['update:selected'])

function selectItem(item) {
    if (!props.multiselect) {
        props.data.forEach(i => (i.selected = i.id === item.id))
    } else {
        item.selected = !item.selected
    }
    emit('update:selected', props.data)
}

// Scroll buttons visibility
const showScrollButtons = computed(() => props.data.length * 40 > props.maxHeight)

// Auto-scroll functionality
function startScroll(direction) {
    const list = dropdownList.value
    if (!list) return
    scrollInterval.value = setInterval(() => {
        if (direction === 'up') list.scrollTop -= 10
        else list.scrollTop += 10
    }, 50)
}

function stopScroll() {
    clearInterval(scrollInterval.value)
}
</script>

<style scoped>
/* Variables for easy UI customization */
* {
    --dropdown-bg-color: #5b9b9b;
    --dropdown-hover-color: #437575;
    --dropdown-font-color: white;
    --dropdown-padding: 5px 12px;
    --dropdown-icon-size: 14px;
    --dropdown-border-radius: 25px;
}

.dropdown{
  min-width: max-content;
  /* border-radius: 20px; */
  /* background-color: var(--control-bg); */
  color: white;
  border: none;
  padding: 0px;
  font-weight: 500;
  text-transform: uppercase;
  font-family: Roboto;
  /* cursor: pointer; */
}

/* Dropdown button */
button.dropdown-btn {
    background-color: var(--dropdown-bg-color);
    color: var(--dropdown-font-color);
    padding: var(--dropdown-padding);
    border: none;
    border-radius: var(--dropdown-border-radius);
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 500 !important;
    text-transform: uppercase;
    font-family: 'Roboto';
    justify-content: center;
    padding: 10px 10px !important;
}

button.dropdown-btn-expanded {
    border-radius: var(--dropdown-border-radius) var(--dropdown-border-radius) 0px 0px;
}

button.dropdown-btn .rotated {
    transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
    background-color: var(--dropdown-bg-color);
    position: absolute;
    overflow-y: auto;
    z-index: 1;
    border-radius: 0px 0px var(--dropdown-border-radius) var(--dropdown-border-radius) ;
}

/* Dropdown button and menu items */
button.dropdown-btn, .dropdown-menu, li {
  width: 150px;
  font-size: 13px;
}


/* Dropdown list */
ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    margin-bottom:10px;
}

li {
    display: flex;
    justify-content: space-between;
    padding: var(--dropdown-padding);
    cursor: pointer;
    border-top: solid 1px #00000060;
}

li:nth-last-child(1) {
}

li:hover {
    background-color: var(--dropdown-hover-color);
}

li.selected {
    background-color: var(--dropdown-hover-color);
}

.icon {
    font-size: var(--dropdown-icon-size);
    display: flex;
    align-items: center;
}

/* Scroll buttons */
.scroll-button {
    text-align: center;
    padding: 5px;
    cursor: pointer;
    background-color: var(--dropdown-hover-color);
}
</style>