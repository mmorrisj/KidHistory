// A tiny canvas particle burst. Written by hand rather than pulled in as a
// dependency because it is ~40 lines and this is the only effect we need.

const GRAVITY = 0.28
const DRAG = 0.99

export function burst(canvas, { x, y, count = 40, hue = 45, power = 9 } = {}) {
  if (!canvas) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const parts = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = power * (0.4 + Math.random() * 0.8)
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - power * 0.5,
      size: 3 + Math.random() * 5,
      spin: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI,
      hue: hue + (Math.random() - 0.5) * 60,
      life: 1,
    }
  })

  let raf = 0
  const step = () => {
    ctx.clearRect(0, 0, rect.width, rect.height)
    let alive = false

    for (const p of parts) {
      p.vy += GRAVITY
      p.vx *= DRAG
      p.vy *= DRAG
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      p.life -= 0.012
      if (p.life <= 0 || p.y > rect.height + 20) continue
      alive = true

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = Math.max(p.life, 0)
      ctx.fillStyle = `hsl(${p.hue} 85% 62%)`
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    if (alive) raf = requestAnimationFrame(step)
    else ctx.clearRect(0, 0, rect.width, rect.height)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}
