"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Menu, Moon, Star, Sun, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StarField } from "@/components/star-field"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user, profile } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#050a1f] text-white overflow-hidden relative">
      {/* Star field background */}
      <StarField />

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[20%] left-[10%] w-24 h-24 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            y: [0, 20, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[40%] right-[15%] w-32 h-32 rounded-full bg-indigo-500/20 blur-xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[20%] w-40 h-40 rounded-full bg-blue-500/20 blur-xl"
          animate={{
            y: [0, 25, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrollY > 50 ? "bg-[#050a1f]/80 backdrop-blur-md py-3" : "py-6",
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif tracking-wider flex items-center">
            <Star className="mr-2 h-6 w-6 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dreamscape
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/gallery" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Gallery
            </Link>
            <Link href="/builder" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Dream Builder
            </Link>
            <Link href="/manual" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Manual
            </Link>
            <Link href="/companion" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Companion
            </Link>
            <Link href="/portal-to-surreal" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Portal to Surreal
            </Link>
            <Link href="/starlit-notes" className="text-sm tracking-wide hover:text-purple-300 transition-colors">
              Starlit Notes
            </Link>
            <Link href="/comic-strip" className="text-sm tracking-wide hover:text-teal-300 transition-colors">
              Comic Strip
            </Link>
            <UserNav />
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <UserNav />
            <Button variant="ghost" size="icon" className="ml-2 text-white" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050a1f]/95 backdrop-blur-md flex flex-col">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <Link href="/" className="text-2xl font-serif tracking-wider flex items-center">
              <Star className="mr-2 h-6 w-6 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dreamscape
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center justify-center flex-1 space-y-8">
            <Link
              href="/gallery"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/builder"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dream Builder
            </Link>
            <Link
              href="/manual"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Manual
            </Link>
            <Link
              href="/companion"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Companion
            </Link>
            <Link
              href="/portal-to-surreal"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Portal to Surreal
            </Link>
            <Link
              href="/starlit-notes"
              className="text-xl tracking-wide hover:text-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Starlit Notes
            </Link>
            <Link
              href="/comic-strip"
              className="text-xl tracking-wide hover:text-teal-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Comic Strip
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 pt-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 leading-tight">
                <span className="block">Where Dreams Become</span>
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Visual Reality
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Journey through the cosmos of your imagination. Create, explore, and share dreamscapes that transcend the
              boundaries of reality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-full"
                asChild
              >
                <Link href="/builder">
                  Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-500/20 text-white px-8 py-6 rounded-full"
                asChild
              >
                <Link href="/gallery">Explore Dreamscapes</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              className="w-1 h-2 bg-white/70 rounded-full"
              animate={{
                y: [0, 6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Explore the Possibilities
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Dreamscape offers a suite of tools to bring your imagination to life through AI-powered dream
              visualization and storytelling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Dream Builder",
                description: "Create stunning dreamscapes with our intuitive AI-powered interface.",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="h-8 w-8 text-purple-400" />
                  </motion.div>
                ),
                link: "/builder",
              },
              {
                title: "Dreamscape Gallery",
                description: "Explore a universe of user-generated dreamscapes for inspiration.",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Moon className="h-8 w-8 text-blue-400" />
                  </motion.div>
                ),
                link: "/gallery",
              },
              {
                title: "Dream Companion",
                description: "Converse with an AI companion to guide your creative journey.",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sun className="h-8 w-8 text-indigo-400" />
                  </motion.div>
                ),
                link: "/companion",
              },
              {
                title: "Portal to Surreal",
                description: "Beautiful, immersive environment for capturing your dreams, stories",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sun className="h-8 w-8 text-indigo-400" />
                  </motion.div>
                ),
                link: "/portal-to-surreal",
              },
              {
                title: "Starlit Notes",
                description: "Beautiful, immersive environment for capturing your dreams, stories",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sun className="h-8 w-8 text-indigo-400" />
                  </motion.div>
                ),
                link: "/starlit-notes",
              },
              {
                title: "Comic Strip Generator",
                description: "Generate fun comic strips from your prompts using AI.",
                icon: (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Sun className="h-8 w-8 text-teal-400" />
                  </motion.div>
                ),
                link: "/comic-strip",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-[#0a1535]/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(138, 75, 255, 0.2)" }}
              >
                {feature.icon}
                <h3 className="text-xl font-serif text-center mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-center mb-6">{feature.description}</p>
                <div className="text-center">
                  <Link href={feature.link} className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="text-xl font-serif tracking-wider flex items-center">
                <Star className="mr-2 h-5 w-5 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Dreamscape
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-2">Where imagination meets reality</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/gallery" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Gallery
              </Link>
              <Link href="/builder" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Dream Builder
              </Link>
              <Link href="/manual" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Manual
              </Link>
              <Link href="/companion" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Companion
              </Link>
              <Link href="/portal-to-surreal" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Portal to Surreal
              </Link>
              <Link href="/starlit-notes" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Starlit notes
              </Link>
              <Link href="/comic-strip" className="text-sm text-gray-300 hover:text-teal-300 transition-colors">
                Comic Strip
              </Link>
              <Link href="/login" className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                Login
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Dreamscape. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
