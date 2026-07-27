// src/composables/useInertiaScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface UseInertiaScrollOptions {
  damping?: number
  springStrength?: number
  maxVelocity?: number
  minVelocity?: number
  deceleration?: number
}

export function useInertiaScroll(options: UseInertiaScrollOptions = {}) {
  const {
    damping = 0.92,
    springStrength = 0.08,
    maxVelocity = 100,
    minVelocity = 0.1,
    deceleration = 0.85
  } = options

  // State
  const scrollY = ref<number>(0)
  const targetY = ref<number>(0)
  const velocity = ref<number>(0)
  const isAnimating = ref<boolean>(false)
  const isUserInteracting = ref<boolean>(false)

  let animationId: number | null = null
  let lastTouchY: number = 0
  let touchStartTime: number = 0
  let wheelTimeout: ReturnType<typeof setTimeout> | null = null

  // Physics update
  const updatePhysics = (): void => {
    const diff = targetY.value - scrollY.value
    
    // Spring force - pulls toward target
    const springForce = diff * springStrength
    
    // Apply forces
    velocity.value += springForce
    
    // Apply damping (friction)
    velocity.value *= damping

    // Apply deceleration when not actively scrolling
    if (!isUserInteracting.value) {
      velocity.value *= deceleration
    }

    // Clamp velocity
    if (Math.abs(velocity.value) > maxVelocity) {
      velocity.value = Math.sign(velocity.value) * maxVelocity
    }

    // Apply velocity
    scrollY.value += velocity.value
    
    // Clamp scroll
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    )
    scrollY.value = Math.max(0, Math.min(maxScroll, scrollY.value))

    // Apply to window
    window.scrollTo(0, Math.round(scrollY.value))

    // Check if animation should continue
    const shouldContinue = 
      Math.abs(velocity.value) > minVelocity || 
      Math.abs(diff) > 1

    if (shouldContinue) {
      isAnimating.value = true
      animationId = requestAnimationFrame(updatePhysics)
    } else {
      isAnimating.value = false
      scrollY.value = targetY.value
      velocity.value = 0
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    }
  }

  // Start animation loop
  const startAnimation = (): void => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    isAnimating.value = true
    animationId = requestAnimationFrame(updatePhysics)
  }

  // Scroll event handler
  const handleScroll = (): void => {
    targetY.value = window.scrollY
    if (!isAnimating.value) {
      startAnimation()
    }
  }

  // Wheel event handler with inertia
  const handleWheel = (e: WheelEvent): void => {
    e.preventDefault()
    
    isUserInteracting.value = true
    
    // Add velocity from wheel
    const deltaY = e.deltaY * 1.2
    velocity.value += deltaY * 0.05
    
    // Apply velocity limit
    if (Math.abs(velocity.value) > maxVelocity) {
      velocity.value = Math.sign(velocity.value) * maxVelocity
    }
    
    targetY.value = window.scrollY + deltaY
    
    if (!isAnimating.value) {
      startAnimation()
    }

    // Reset interaction flag after momentum
    if (wheelTimeout) {
      clearTimeout(wheelTimeout)
    }
    wheelTimeout = setTimeout(() => {
      isUserInteracting.value = false
    }, 100)
  }

  // Touch handlers for mobile with inertia
  const handleTouchStart = (e: TouchEvent): void => {
    // Safely access touches
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      if (touch) {
        lastTouchY = touch.clientY
        touchStartTime = performance.now()
        isUserInteracting.value = true
        velocity.value = 0
      }
    }
  }

  const handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault()
    
    // Safely access touches
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      if (touch) {
        const touchY = touch.clientY
        const deltaY = lastTouchY - touchY
        lastTouchY = touchY
        
        // Add velocity from touch movement
        velocity.value += deltaY * 0.15
        
        targetY.value = window.scrollY + deltaY
        
        if (!isAnimating.value) {
          startAnimation()
        }
      }
    }
  }

  const handleTouchEnd = (): void => {
    isUserInteracting.value = false
    
    // Add extra momentum from flick
    const touchDuration = performance.now() - touchStartTime
    if (touchDuration < 300) {
      // Flick detection - add extra velocity
      velocity.value *= 0.5
    }
    
    if (!isAnimating.value) {
      startAnimation()
    }
  }

  // Custom scroll to with inertia
  const scrollTo = (target: number, duration: number = 800): void => {
    const startY = window.scrollY
    const distance = target - startY
    const startTime = performance.now()
    
    // Stop current animation
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    isAnimating.value = false
    velocity.value = 0

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animateTo = (currentTime: number): void => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)
      
      const currentScroll = startY + distance * eased
      scrollY.value = currentScroll
      targetY.value = currentScroll
      window.scrollTo(0, Math.round(currentScroll))
      
      if (progress < 1) {
        requestAnimationFrame(animateTo)
      } else {
        scrollY.value = target
        targetY.value = target
        window.scrollTo(0, Math.round(target))
      }
    }

    requestAnimationFrame(animateTo)
  }

  // Clean up
  const destroy = (): void => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    
    if (wheelTimeout) {
      clearTimeout(wheelTimeout)
      wheelTimeout = null
    }
  }

  // Setup
  onMounted(() => {
    scrollY.value = window.scrollY
    targetY.value = window.scrollY
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    scrollY,
    velocity,
    isAnimating,
    scrollTo,
    destroy
  }
}