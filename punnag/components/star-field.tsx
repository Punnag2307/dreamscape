"use client"

import { useEffect, useRef } from "react"

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Star properties
    const stars: {
      x: number
      y: number
      radius: number
      opacity: number
      speed: number
      twinkleSpeed: number
      twinkleDirection: number
    }[] = []

    // Create stars
    const createStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 2000)

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random(),
          speed: Math.random() * 0.05,
          twinkleSpeed: Math.random() * 0.01,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        })
      }
    }

    createStars()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        // Update star position (subtle movement)
        star.y += star.speed

        // Reset if star goes off screen
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }

        // Twinkle effect
        star.opacity += star.twinkleSpeed * star.twinkleDirection

        // Reverse direction if opacity reaches bounds
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkleDirection *= -1
        }

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}
