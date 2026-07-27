<script setup>
import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'

let lenis

onMounted(() => {
  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 0.8,
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
})

onUnmounted(() => {
  lenis?.destroy()
})
</script>

<template>
  <RouterView />
</template>

