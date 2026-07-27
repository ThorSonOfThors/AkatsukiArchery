<template>
  <section
    ref="section"
    class="parallax"
    :style="bgStyle"
  >
    <div class="parallax-overlay"></div>
    <div class="parallax-content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  image: string
  speed?: number
  height?: string
  overlayOpacity?: number
}>()

const section = ref<HTMLElement | null>(null)
const offset = ref(0)

const handleScroll = () => {
  if (!section.value) return

  const rect = section.value.getBoundingClientRect()
  const scrolled = window.scrollY
  const elementTop = rect.top + scrolled
  const elementHeight = rect.height
  const windowHeight = window.innerHeight
  
  const progress = (scrolled - elementTop + windowHeight) / (elementHeight + windowHeight)
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const speed = props.speed ?? 0.3
  const maxOffset = 150
  offset.value = -(clampedProgress * maxOffset - maxOffset / 2) * speed
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
})

const bgStyle = computed(() => ({
  backgroundImage: `url(${props.image})`,
  backgroundSize: 'cover',
  backgroundPosition: `center ${50 + offset.value}%`,
  backgroundRepeat: 'no-repeat',
  height: props.height || '500px',
  minHeight: '300px',
  position: 'relative' as const,
  overflow: 'hidden' as const
}))
</script>

<style scoped>
.parallax {
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: none;
  will-change: background-position;
}

.parallax-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, v-bind('overlayOpacity ?? 0.5'));
  z-index: 1;
  pointer-events: none;
}

.parallax-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 2rem;
}

@media (max-width: 768px) {
  .parallax {
    height: 350px !important;
    min-height: 250px !important;
  }
}
</style>