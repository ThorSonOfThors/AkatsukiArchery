<template>
  <div class="archery-fullscreen">
    <canvas 
      ref="gameCanvas" 
      class="archery-canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></canvas>
    
    <!-- Score Display - Top Right (always visible, subtle) -->
    <div class="score-display" :class="{ 'hidden': !isVisible }">
      <div class="score-item">
        <span class="score-icon">🎯</span>
        <span class="score-value">{{ score }}</span>
      </div>
      <div class="score-item">
        <span class="score-icon">🏹</span>
        <span class="score-value">{{ arrows }}</span>
      </div>
      <div class="score-item" v-if="comboCount >= 2">
        <span class="score-icon">🔥</span>
        <span class="score-value">{{ comboCount }}x</span>
      </div>
    </div>
    
    <!-- Subtle restart hint -->
    <div class="restart-hint" v-if="isGameOver">
      <span>Click to restart</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArcheryFullscreen',
  data() {
    return {
      canvas: null,
      ctx: null,
      isActive: false,
      isGameOver: false,
      isDragging: false,
      isAiming: false,
      isArrowFlying: false,
      isVisible: true,
      hideTimeout: null,
      
      // Game state
      score: 0,
      arrows: 10,
      comboCount: 0,
      lastHitTime: 0,
      totalShots: 0,
      bullseyes: 0,
      
      // Bow physics - fixed at bottom center
      bowX: 0,
      bowY: 0,
      bowAngle: 0,
      pullStrength: 0,
      maxPull: 120,
      
      // Arrow physics
      arrowX: 0,
      arrowY: 0,
      arrowVelocity: { x: 0, y: 0 },
      arrowTrail: [],
      
      // Targets
      targets: [],
      targetRadius: 35,
      
      // Particles
      particles: [],
      
      // Mouse/Touch
      mouseX: 0,
      mouseY: 0,
      
      // Animation
      gameLoopId: null,
      
      // Canvas dimensions
      canvasWidth: 0,
      canvasHeight: 0,
    }
  },
  mounted() {
    this.canvas = this.$refs.gameCanvas
    this.ctx = this.canvas.getContext('2d')
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    
    // Start game loop
    this.gameLoop()
    
    // Auto-hide after 2 seconds of inactivity
    this.resetHideTimer()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas)
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId)
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
    }
  },
  methods: {
    resizeCanvas() {
      this.canvasWidth = window.innerWidth
      this.canvasHeight = window.innerHeight
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasHeight
      
      // Always keep bow at bottom center
      this.bowX = this.canvasWidth / 2
      this.bowY = this.canvasHeight - 80
      this.arrowX = this.bowX
      this.arrowY = this.bowY
    },
    
    resetHideTimer() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout)
      }
      
      // Only hide if not actively playing
      if (!this.isDragging && !this.isAiming && !this.isArrowFlying) {
        this.hideTimeout = setTimeout(() => {
          if (!this.isDragging && !this.isAiming && !this.isArrowFlying) {
            this.isVisible = false
          }
        }, 2000)
      }
    },
    
    handleMouseDown(e) {
      this.isVisible = true
      this.resetHideTimer()
      
      if (this.isGameOver) {
        this.resetGame()
        return
      }
      
      if (this.arrows <= 0) return
      
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      this.startAiming(x, y)
    },
    
    handleMouseMove(e) {
      if (!this.isActive) return
      
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
      
      if (this.isDragging) {
        this.isVisible = true
        this.resetHideTimer()
        this.updateAim(this.mouseX, this.mouseY)
      }
    },
    
    handleMouseUp() {
      if (this.isDragging) {
        this.releaseArrow()
      }
      this.isDragging = false
      this.resetHideTimer()
    },
    
    handleTouchStart(e) {
      e.preventDefault()
      this.isVisible = true
      this.resetHideTimer()
      
      if (this.isGameOver) {
        this.resetGame()
        return
      }
      
      if (this.arrows <= 0) return
      
      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      this.startAiming(x, y)
    },
    
    handleTouchMove(e) {
      e.preventDefault()
      if (!this.isActive) return
      
      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = touch.clientX - rect.left
      this.mouseY = touch.clientY - rect.top
      
      if (this.isDragging) {
        this.isVisible = true
        this.resetHideTimer()
        this.updateAim(this.mouseX, this.mouseY)
      }
    },
    
    handleTouchEnd(e) {
      e.preventDefault()
      if (this.isDragging) {
        this.releaseArrow()
      }
      this.isDragging = false
      this.resetHideTimer()
    },
    
    startAiming(x, y) {
      if (!this.isActive) {
        this.isActive = true
        this.generateTargets()
      }
      
      this.isDragging = true
      this.isAiming = true
      this.pullStrength = 0
      this.updateAim(x, y)
    },
    
    updateAim(x, y) {
      const dx = x - this.bowX
      const dy = y - this.bowY
      
      // Calculate angle - allows aiming both left and right
      let angle = Math.atan2(dy, dx)
      
      // Limit angle to realistic range (-85 to 85 degrees)
      const maxAngle = Math.PI * 0.47
      angle = Math.max(-maxAngle, Math.min(maxAngle, angle))
      
      this.bowAngle = angle
      
      // Calculate pull strength based on distance
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 350
      this.pullStrength = Math.min((distance / maxDistance) * this.maxPull, this.maxPull)
      
      // Update arrow position (behind bow)
      const pullOffset = 20 + (this.pullStrength / this.maxPull) * 25
      this.arrowX = this.bowX - Math.cos(angle) * pullOffset
      this.arrowY = this.bowY - Math.sin(angle) * pullOffset
    },
    
    releaseArrow() {
      this.isDragging = false
      this.isAiming = false
      
      if (this.pullStrength < 10) {
        this.resetArrow()
        return
      }
      
      this.isArrowFlying = true
      this.arrows--
      this.totalShots++
      
      // Calculate velocity (can shoot in any direction)
      const power = (this.pullStrength / this.maxPull) * 18
      this.arrowVelocity = {
        x: Math.cos(this.bowAngle) * power,
        y: Math.sin(this.bowAngle) * power
      }
      
      // Add slight random variation
      this.arrowVelocity.x += (Math.random() - 0.5) * 0.5
      this.arrowVelocity.y += (Math.random() - 0.5) * 0.5
      
      // Start arrow from bow position
      this.arrowX = this.bowX
      this.arrowY = this.bowY
      this.arrowTrail = []
      
      this.resetHideTimer()
    },
    
    updateArrow() {
      if (!this.isArrowFlying) return
      
      // Store trail
      this.arrowTrail.push({ x: this.arrowX, y: this.arrowY })
      if (this.arrowTrail.length > 25) {
        this.arrowTrail.shift()
      }
      
      // Update position
      this.arrowX += this.arrowVelocity.x
      this.arrowY += this.arrowVelocity.y
      
      // Gravity (realistic)
      this.arrowVelocity.y += 0.15
      
      // Air resistance (slight)
      this.arrowVelocity.x *= 0.999
      this.arrowVelocity.y *= 0.999
      
      // Check bounds
      if (this.arrowX > this.canvasWidth || 
          this.arrowX < 0 || 
          this.arrowY > this.canvasHeight || 
          this.arrowY < -50) {
        this.isArrowFlying = false
        this.resetArrow()
        this.checkCombo(false)
        this.resetHideTimer()
        return
      }
      
      // Check collision with targets
      this.checkTargetCollision()
    },
    
    checkTargetCollision() {
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const target = this.targets[i]
        const dx = this.arrowX - target.x
        const dy = this.arrowY - target.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < this.targetRadius) {
          this.isArrowFlying = false
          
          // Calculate score based on accuracy
          const centerDistance = distance / this.targetRadius
          const points = Math.round(50 * (1 - centerDistance))
          
          let bonus = 0
          if (centerDistance < 0.2) {
            bonus = 30
            this.bullseyes++
          }
          
          const totalPoints = points + bonus
          this.score += totalPoints
          this.comboCount++
          this.lastHitTime = Date.now()
          
          // Combo bonus
          if (this.comboCount >= 3) {
            const comboBonus = this.comboCount * 5
            this.score += comboBonus
          }
          
          // Create particles
          this.createParticles(target.x, target.y, '#ff6b6b', 25)
          
          // Remove target
          this.targets.splice(i, 1)
          
          // Generate new targets
          if (this.targets.length === 0) {
            this.generateTargets()
          } else {
            this.addTarget()
          }
          
          this.resetArrow()
          this.resetHideTimer()
          return
        }
      }
    },
    
    resetArrow() {
      this.arrowX = this.bowX
      this.arrowY = this.bowY
      this.arrowVelocity = { x: 0, y: 0 }
      this.arrowTrail = []
      this.pullStrength = 0
      this.bowAngle = 0
      this.isArrowFlying = false
      this.isAiming = false
      this.isDragging = false
      
      if (this.arrows === 0 && this.targets.length > 0) {
        this.isGameOver = true
        this.isActive = false
        // Keep targets visible for 2 seconds then hide
        setTimeout(() => {
          this.isVisible = false
        }, 2000)
      }
    },
    
    createParticles(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          decay: Math.random() * 0.02 + 0.01,
          size: Math.random() * 4 + 2,
          color: color
        })
      }
    },
    
    updateParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.life -= p.decay
        
        if (p.life <= 0) {
          this.particles.splice(i, 1)
        }
      }
    },
    
    generateTargets() {
      const count = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < count; i++) {
        this.addTarget()
      }
    },
    
    addTarget() {
      const margin = 80
      const x = Math.random() * (this.canvasWidth - margin * 2) + margin
      const y = Math.random() * (this.canvasHeight * 0.7 - margin) + margin
      
      // Ensure targets are above bow
      if (y > this.bowY - 100) {
        this.addTarget()
        return
      }
      
      const types = ['normal', 'moving', 'small']
      const type = types[Math.floor(Math.random() * types.length)]
      
      this.targets.push({
        x: x,
        y: y,
        radius: type === 'small' ? 22 : 35,
        type: type,
        moving: type === 'moving',
        speed: type === 'moving' ? (Math.random() * 0.8 + 0.3) : 0,
        angle: Math.random() * Math.PI * 2,
        color: type === 'small' ? '#ffd93d' : '#ff4757'
      })
    },
    
    updateTargets() {
      for (const target of this.targets) {
        if (target.moving) {
          target.angle += 0.02
          target.x += Math.cos(target.angle) * target.speed
          target.y += Math.sin(target.angle) * target.speed * 0.5
          
          // Bounce off walls
          if (target.x < 50 || target.x > this.canvasWidth - 50) {
            target.speed *= -1
          }
          if (target.y < 50 || target.y > this.bowY - 100) {
            target.speed *= -1
          }
        }
      }
    },
    
    checkCombo(hit) {
      if (!hit && this.comboCount > 0 && Date.now() - this.lastHitTime > 3000) {
        this.comboCount = 0
      }
    },
    
    resetGame() {
      this.score = 0
      this.arrows = 10
      this.targets = []
      this.particles = []
      this.comboCount = 0
      this.bullseyes = 0
      this.totalShots = 0
      this.isGameOver = false
      this.isActive = false
      this.isVisible = true
      this.resetArrow()
      this.bowX = this.canvasWidth / 2
      this.bowY = this.canvasHeight - 80
      this.arrowX = this.bowX
      this.arrowY = this.bowY
      this.generateTargets()
      this.resetHideTimer()
    },
    
    draw() {
      const ctx = this.ctx
      const canvas = this.canvas
      
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Only draw if visible or actively playing
      if (!this.isVisible && !this.isDragging && !this.isAiming && !this.isArrowFlying && !this.isGameOver) {
        return
      }
      
      // Draw targets
      for (const target of this.targets) {
        this.drawTarget(ctx, target)
      }
      
      // Draw particles
      for (const p of this.particles) {
        ctx.globalAlpha = p.life * 0.8
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      
      // Draw arrow trail
      for (let i = 0; i < this.arrowTrail.length; i++) {
        const p = this.arrowTrail[i]
        ctx.globalAlpha = (i / this.arrowTrail.length) * 0.4
        ctx.fillStyle = '#ff6b6b'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      
      // Draw bow
      this.drawBow(ctx)
      
      // Draw arrow
      if (!this.isArrowFlying || this.arrows > 0) {
        this.drawArrow(ctx)
      }
      
      // Draw aiming line
      if (this.isAiming) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 10])
        ctx.beginPath()
        ctx.moveTo(this.bowX, this.bowY)
        const aimX = this.bowX + Math.cos(this.bowAngle) * 300
        const aimY = this.bowY + Math.sin(this.bowAngle) * 300
        ctx.lineTo(aimX, aimY)
        ctx.stroke()
        ctx.setLineDash([])
      }
    },
    
    drawTarget(ctx, target) {
      const radius = target.radius
      const isSpecial = target.color === '#ffd93d'
      
      // Glow
      const gradient = ctx.createRadialGradient(
        target.x, target.y, 0,
        target.x, target.y, radius * 1.5
      )
      gradient.addColorStop(0, isSpecial ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 71, 87, 0.12)')
      gradient.addColorStop(1, 'rgba(255, 71, 87, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(target.x, target.y, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()
      
      // Outer ring
      ctx.strokeStyle = isSpecial ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 71, 87, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(target.x, target.y, radius, 0, Math.PI * 2)
      ctx.stroke()
      
      // Inner rings
      for (let i = 1; i < 4; i++) {
        const r = (radius / 4) * i
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 217, 61, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(target.x, target.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Center
      ctx.fillStyle = isSpecial ? '#ffd700' : '#ff0000'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(target.x, target.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      
      // Special marker
      if (isSpecial) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('⭐', target.x, target.y - radius - 10)
      }
    },
    
    drawBow(ctx) {
      const x = this.bowX
      const y = this.bowY
      const angle = this.bowAngle
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      
      const bowLength = 70
      const pullOffset = (this.pullStrength / this.maxPull) * 20
      
      // Bow limbs
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(0, 0, bowLength, -Math.PI / 2.4, Math.PI / 2.4)
      ctx.stroke()
      
      // String
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      const sX = Math.cos(-Math.PI / 2.4) * bowLength
      const sY = Math.sin(-Math.PI / 2.4) * bowLength
      const eX = Math.cos(Math.PI / 2.4) * bowLength
      const eY = Math.sin(Math.PI / 2.4) * bowLength
      
      ctx.moveTo(sX, sY)
      ctx.lineTo(-15 - pullOffset, 0)
      ctx.lineTo(eX, eY)
      ctx.stroke()
      
      // Grip
      ctx.fillStyle = 'rgba(101, 67, 33, 0.5)'
      ctx.fillRect(-6, -6, 12, 12)
      
      // Power indicator
      if (this.isAiming && this.pullStrength > 15) {
        const percent = Math.round((this.pullStrength / this.maxPull) * 100)
        const color = percent > 70 ? 'rgba(0, 255, 0, 0.5)' : 
                     percent > 40 ? 'rgba(255, 217, 61, 0.5)' : 
                     'rgba(255, 107, 107, 0.5)'
        
        ctx.fillStyle = color
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${percent}%`, 0, -bowLength - 12)
      }
      
      ctx.restore()
    },
    
    drawArrow(ctx) {
      const x = this.arrowX
      const y = this.arrowY
      const angle = this.bowAngle
      
      ctx.save()
      ctx.translate(x, y)
      
      // If arrow is flying, use its velocity angle
      if (this.isArrowFlying) {
        const velAngle = Math.atan2(this.arrowVelocity.y, this.arrowVelocity.x)
        ctx.rotate(velAngle)
      } else {
        ctx.rotate(angle)
      }
      
      // Shaft
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(35, 0)
      ctx.stroke()
      
      // Head
      ctx.fillStyle = 'rgba(255, 107, 107, 0.8)'
      ctx.beginPath()
      ctx.moveTo(35, 0)
      ctx.lineTo(25, -7)
      ctx.lineTo(25, 7)
      ctx.closePath()
      ctx.fill()
      
      // Fletching
      ctx.fillStyle = 'rgba(255, 217, 61, 0.6)'
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(-28, -6)
      ctx.lineTo(-28, 6)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
    },
    
    gameLoop() {
      if (this.isActive && !this.isGameOver) {
        if (!this.isArrowFlying && this.arrows > 0 && this.targets.length === 0) {
          this.generateTargets()
        }
        
        this.updateArrow()
        this.updateParticles()
        this.updateTargets()
        this.checkCombo(false)
      } else if (this.isGameOver) {
        this.updateParticles()
      }
      
      this.draw()
      this.gameLoopId = requestAnimationFrame(this.gameLoop)
    }
  }
}
</script>

<style scoped>
.archery-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: crosshair;
  background: transparent !important;
  pointer-events: auto;
}

.archery-canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: transparent !important;
  touch-action: none;
}

/* Score Display - Top Right (subtle) */
.score-display {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  padding: 10px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  pointer-events: none;
  z-index: 10000;
  font-family: 'Arial', sans-serif;
  transition: all 0.5s ease;
  opacity: 1;
}

.score-display.hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all 0.5s ease;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.score-icon {
  font-size: 15px;
}

.score-value {
  font-weight: 600;
  font-size: 15px;
  min-width: 18px;
  color: rgba(255, 255, 255, 0.9);
}

/* Restart hint - subtle */
.restart-hint {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.25);
  font-family: 'Arial', sans-serif;
  font-size: 13px;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  pointer-events: none;
  z-index: 10000;
  animation: subtlePulse 2s ease-in-out infinite;
}

@keyframes subtlePulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.5; }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .score-display {
    top: 12px;
    right: 12px;
    padding: 8px 14px;
    gap: 12px;
  }
  
  .score-item {
    font-size: 12px;
  }
  
  .score-value {
    font-size: 13px;
    min-width: 15px;
  }
  
  .restart-hint {
    font-size: 11px;
    padding: 6px 16px;
    bottom: 30px;
  }
}

@media (max-width: 480px) {
  .score-display {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    gap: 8px;
    border-radius: 10px;
  }
  
  .score-item {
    font-size: 10px;
    gap: 4px;
  }
  
  .score-value {
    font-size: 11px;
    min-width: 12px;
  }
}
</style>