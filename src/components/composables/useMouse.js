// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    // Use clientX and clientY for viewport-relative coordinates
    x.value = event.clientX
    y.value = event.clientY
    //console.log( 'update mouse', x.value, y.value );
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
