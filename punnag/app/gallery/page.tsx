"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Filter, Heart, Share, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StarField } from "@/components/star-field"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { getAllDreams } from "@/lib/firebase"
import { UserNav } from "@/components/user-nav"

type Dream = {
  id: string
  userId: string
  username: string
  title: string
  description?: string
  image: string
  mood: string
  style: string
  complexity: number
  createdAt: string
  likes?: number
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [dreamscapes, setDreamscapes] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null)
  const [selectedMood, setSelectedMood] = useState("all")
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch dreams from Firebase
  useEffect(() => {
    const fetchDreams = async () => {
      setLoading(true)
      try {
        const { dreams, error } = await getAllDreams()
        if (dreams && !error) {
          setDreamscapes(dreams)
        }
      } catch (err) {
        console.error("Error fetching dreams:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDreams()
  }, [])

  // Filter dreamscapes based on selected mood and theme
  const filteredDreamscapes = dreamscapes.filter((dream) => {
    const moodMatch = selectedMood === "all" || dream.mood === selectedMood
    const themeMatch = selectedTheme === "all" || dream.style === selectedTheme
    return moodMatch && themeMatch
  })

  // Get unique moods and themes from the data
  const moods = ["all", ...new Set(dreamscapes.map((dream) => dream.mood))]
  const themes = ["all", ...new Set(dreamscapes.map((dream) => dream.style))]

  // Play ambient sound when a dream is selected
  useEffect(() => {
    if (selectedDream && audioRef.current) {
      audioRef.current.volume = 0.2
      audioRef.current.play().catch((e) => console.log("Audio play prevented:", e))
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [selectedDream])

  return (
    <div className="min-h-screen bg-[#050a1f] text-white relative">
      {/* Star field background */}
      <StarField />

      {/* Ambient audio (will play when a dream is selected) */}
      {/* <audio ref={audioRef} loop>
        <source src="/ambient-sound.mp3" type="audio/mp3" />
      </audio> */}

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full bg-blue-500/10 blur-xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
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
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-xl font-serif absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dreamscape Gallery
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/20 hover:bg-white/10"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16 container mx-auto px-4">
        {/* Mobile title */}
        <div className="md:hidden text-center mb-8">
          <h1 className="text-2xl font-serif">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dreamscape Gallery
            </span>
          </h1>
        </div>

        {/* Filters panel */}
        {isFiltersOpen && (
          <motion.div
            className="bg-[#0a1535]/70 backdrop-blur-md p-6 rounded-xl mb-8 border border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Filter Dreamscapes</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Mood</h3>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <Button
                      key={mood}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-white/20 hover:bg-white/10",
                        selectedMood === mood && "bg-purple-500/20 border-purple-500/50",
                      )}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm text-gray-400 mb-2">Theme</h3>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <Button
                      key={theme}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-white/20 hover:bg-white/10",
                        selectedTheme === theme && "bg-blue-500/20 border-blue-500/50",
                      )}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
        )}

        {/* Gallery grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDreamscapes.map((dream, index) => (
              <motion.div
                key={dream.id}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className="overflow-hidden rounded-xl bg-[#0a1535]/30 backdrop-blur-sm border border-white/10 group-hover:border-purple-500/30 transition-all"
                  onClick={() => setSelectedDream(dream)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={dream.image || "/placeholder.svg"}
                      alt={dream.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a1f] via-transparent opacity-70" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-lg mb-1">{dream.title}</h3>
                    <p className="text-sm text-gray-300 mb-3">by {dream.username}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm">
                        <Heart className="h-4 w-4 mr-1 text-pink-400" />
                        {dream.likes || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{dream.mood}</span>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphism hover effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transition-opacity pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredDreamscapes.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-serif mb-2">No dreamscapes found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters to see more results</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMood("all")
                setSelectedTheme("all")
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Create dream button */}
        <div className="fixed bottom-6 right-6">
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full h-14 w-14 p-0"
            asChild
          >
            <Link href="/builder">
              <span className="text-2xl">+</span>
            </Link>
          </Button>
        </div>
      </main>

      {/* Dream preview modal */}
      {selectedDream && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDream(null)} />

          <motion.div
            className="relative bg-[#0a1535]/80 backdrop-blur-md rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="relative aspect-video">
              <Image
                src={selectedDream.image || "/placeholder.svg"}
                alt={selectedDream.title}
                fill
                className="object-cover"
              />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
                onClick={() => setSelectedDream(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-serif mb-1">{selectedDream.title}</h2>
                  <p className="text-gray-300">by {selectedDream.username}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-white/5 hover:bg-white/10">
                    <Heart className="h-5 w-5 text-pink-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-white/5 hover:bg-white/10">
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                  {selectedDream.mood}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                  {selectedDream.style}
                </span>
              </div>

              <p className="text-gray-300 mb-6">
                {selectedDream.description ||
                  `A dreamscape that captures the essence of ${selectedDream.mood} ${selectedDream.style} visions. This
                  creation invites viewers to explore the depths of imagination and experience the beauty of dreams made
                  visual.`}
              </p>

              <div className="flex justify-between">
                <Button variant="outline" className="border-white/20 hover:bg-white/10" asChild>
                  <Link href="/builder">Create Similar</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">More Options</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0a1535] border-white/10">
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
