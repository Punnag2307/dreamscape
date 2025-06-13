"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Book, Lightbulb, Sparkles, Star, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StarField } from "@/components/star-field"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ManualPage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("introduction")

  // Sample sections for the manual
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to the Dreamscape Manual, your guide to creating and exploring the realm of dreams. This mystical
            tome contains the knowledge you need to navigate the Dreamscape platform and bring your imagination to life.
          </p>
          <p>
            Dreamscape uses advanced AI to transform your descriptions, emotions, and creative direction into visual
            dreamscapes that capture the essence of your imagination. Whether you're seeking inspiration, creating art,
            or exploring the boundaries of your mind, this guide will help you make the most of your journey.
          </p>
          
          
          <p>
            As you embark on this journey, remember that dreams are boundless and your creativity is the only limit. Let
            this manual be your companion as you explore the vast cosmos of imagination.
          </p>
        </div>
      ),
    },
    {
      id: "getting-started",
      title: "Getting Started",
      content: (
        <div className="space-y-4">
          <p>To begin your journey with Dreamscape, follow these simple steps:</p>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="pl-2">
              <span className="font-medium">Create an account</span> - Sign up to access all features and save your
              creations.
            </li>
            <li className="pl-2">
              <span className="font-medium">Explore the Gallery</span> - Browse existing dreamscapes for inspiration.
            </li>
            <li className="pl-2">
              <span className="font-medium">Visit the Dream Builder</span> - Start creating your own dreamscapes.
            </li>
            <li className="pl-2">
              <span className="font-medium">Consult the Dream Companion</span> - Get guidance and suggestions from our
              AI assistant to enhance your creative process.
            </li>
          </ol>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 my-6">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Pro Tip:</span> Start with simple concepts and gradually add complexity as
                you become more familiar with the platform.
              </p>
            </div>
          </div>
          <p>
            Remember that dream creation is an iterative process. Don't be afraid to experiment, refine, and reimagine
            your creations until they match your vision.
          </p>
        </div>
      ),
    },
    {
      id: "dream-builder",
      title: "Dream Builder Guide",
      content: (
        <div className="space-y-4">
          <p>The Dream Builder is your primary tool for creating dreamscapes. It follows a four-step process:</p>

          <Accordion type="single" collapsible className="border-white/10">
            <AccordionItem value="step1" className="border-white/10">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs">
                    1
                  </div>
                  <span>Describe</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-9 space-y-3">
                  <p>
                    Begin by describing the elements, feelings, or scenes you want in your dreamscape. Be as detailed or
                    abstract as you wish.
                  </p>
                  <div className="bg-white/5 rounded-lg p-3 text-sm">
                    <p className="italic text-gray-300">
                      "A serene cosmic ocean where stars float like lily pads, with gentle waves of purple light
                      rippling across the surface."
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">
                    The more specific your description, the more aligned the result will be with your vision. However,
                    leaving some elements open to interpretation can lead to surprising and delightful results.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2" className="border-white/10">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs">
                    2
                  </div>
                  <span>Customize</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-9 space-y-3">
                  <p>Refine your dream by selecting a mood, style, and complexity level:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium w-24 flex-shrink-0">Mood:</span>
                      <span>Sets the emotional tone (serene, mysterious, surreal, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-24 flex-shrink-0">Style:</span>
                      <span>Defines the visual aesthetic (cosmic, fantasy, abstract, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-24 flex-shrink-0">Complexity:</span>
                      <span>Controls the level of detail and intricacy in your dreamscape</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-300">
                    Experiment with different combinations to discover unique visual styles that resonate with your
                    vision.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3" className="border-white/10">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs">
                    3
                  </div>
                  <span>Generate</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-9 space-y-3">
                  <p>
                    Review your settings and generate your dreamscape. Our AI will process your inputs and create a
                    visual representation of your dream.
                  </p>
                  <div className="bg-white/5 rounded-lg p-3 text-sm flex items-center">
                    <Wand2 className="h-4 w-4 text-purple-400 mr-2" />
                    <p>Generation typically takes 5-15 seconds depending on complexity.</p>
                  </div>
                  <p className="text-sm text-gray-300">
                    If the result doesn't match your vision, you can adjust your settings and generate again. Each
                    generation will produce a unique result, even with the same inputs.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step4" className="border-white/10">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs">
                    4
                  </div>
                  <span>Save</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-9 space-y-3">
                  <p>
                    Name your creation, add an optional description, and save it to your personal gallery or share it
                    with the Dreamscape community.
                  </p>
                  <p className="text-sm text-gray-300">
                    Saved dreamscapes can be revisited, shared, or used as inspiration for future creations. You can
                    also download your dreamscapes as high-resolution images.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="relative aspect-video rounded-lg overflow-hidden my-6 border border-white/10 shadow-lg">
            <Image
              src="/placeholder-dream-builder-ui.jpg"
              alt="Conceptual UI of the Dream Builder showing steps: Describe, Customize, Generate, Save"
              fill
              className="object-cover bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-900"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm font-medium">The Dream Builder Interface</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tips-tricks",
      title: "Tips & Tricks",
      content: (
        <div className="space-y-4">
          <p>Master the art of dream creation with these expert tips:</p>

          <div className="grid md:grid-cols-2 gap-6 items-center my-6">
            <div className="bg-purple-900/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-purple-400 mr-2" />
                <h4 className="font-semibold">Use Specific Imagery</h4>
              </div>
              <p className="text-sm text-gray-300">Mention specific objects, colors, and textures to guide the AI more precisely. Example: "A floating clock tower made of crystal, surrounded by swirling golden mist."</p>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 shadow-md">
              <Image
                src="/placeholder-specific-imagery.jpg"
                alt="AI dreamscape illustrating specific imagery: a crystal clock tower in golden mist"
                fill
                className="object-cover bg-gradient-to-br from-purple-900 to-indigo-900"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center my-6">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 shadow-md md:order-last">
              <Image
                src="/placeholder-contrast-dream.jpg"
                alt="AI dreamscape illustrating contrast: a bright nebula beside a dark void"
                fill
                className="object-cover bg-gradient-to-br from-blue-900 to-teal-900"
              />
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-white/10 md:order-first">
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
                <h4 className="font-semibold">Embrace Contrast</h4>
              </div>
              <p className="text-sm text-gray-300">Combine opposing elements (light/dark, calm/chaotic, natural/artificial) for more dynamic and visually interesting dreamscapes.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center my-6">
            <div className="bg-indigo-900/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-center mb-2">
                <Wand2 className="h-5 w-5 text-indigo-400 mr-2" />
                <h4 className="font-semibold">Layer Emotions</h4>
              </div>
              <p className="text-sm text-gray-300">Include emotional undertones in your descriptions (e.g., 'melancholy forest', 'joyful cityscape', 'eerie silence') to add depth.</p>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 shadow-md">
              <Image
                src="/placeholder-emotional-dream.jpg"
                alt="AI dreamscape illustrating emotion: a slightly melancholic, misty forest scene"
                fill
                className="object-cover bg-gradient-to-br from-indigo-900 to-purple-900"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 my-6">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Advanced Technique: Prompt Chaining</p>
                <p className="text-sm">
                  Create a series of related dreamscapes by using elements from one creation as inspiration for the
                  next. This technique can help you explore a theme or narrative across multiple images.
                </p>
              </div>
            </div>
          </div>

          <p>
            Remember that dream creation is both an art and a science. The more you experiment, the better you'll become
            at crafting dreamscapes that truly reflect your imagination.
          </p>
        </div>
      ),
    },
    {
      id: "companion",
      title: "Dream Companion",
      content: (
        <div className="space-y-4">
          <p>The Dream Companion is an AI guide designed to assist you in your creative journey. It can help with:</p>

          <ul className="space-y-3 my-4">
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs mt-0.5">
                •
              </div>
              <div>
                <p className="font-medium">Prompt Refinement</p>
                <p className="text-sm text-gray-300">
                  Get suggestions to improve your dream descriptions for better results.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs mt-0.5">
                •
              </div>
              <div>
                <p className="font-medium">Story Development</p>
                <p className="text-sm text-gray-300">Create narratives and stories based on your dreamscapes.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs mt-0.5">
                •
              </div>
              <div>
                <p className="font-medium">Creative Exploration</p>
                <p className="text-sm text-gray-300">
                  Discover new themes, styles, and concepts to inspire your creations.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-xs mt-0.5">
                •
              </div>
              <div>
                <p className="font-medium">Technical Guidance</p>
                <p className="text-sm text-gray-300">
                  Learn about platform features and best practices for dream creation.
                </p>
              </div>
            </li>
          </ul>

          <div className="relative aspect-video rounded-lg overflow-hidden my-6">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Dream Companion Interface"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm font-medium">The Dream Companion Interface</p>
            </div>
          </div>

          <p>
            To get the most from your Dream Companion, be specific about what you're trying to achieve. The more context
            you provide, the more tailored the guidance will be.
          </p>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10 my-6">
            <p className="text-sm italic mb-2">Example conversation:</p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-purple-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <span className="text-xs">You</span>
                </div>
                <p className="text-sm pt-1">
                  I want to create a dreamscape about memories, but I'm not sure how to approach it.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <span className="text-xs">AI</span>
                </div>
                <p className="text-sm pt-1">
                  Memories have both visual and emotional components. Consider describing specific objects that
                  represent important memories, perhaps with a soft, nostalgic glow around them. You might include
                  elements like old photographs, childhood toys, or significant locations that appear to be floating in
                  a dreamlike space. For the mood, "nostalgic" would be fitting, and you could try either an "abstract"
                  or "surreal" style depending on how literal you want the imagery to be.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#050a1f] text-white relative">
      {/* Star field background */}
      <StarField />

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
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
          className="absolute bottom-[20%] left-[5%] w-40 h-40 rounded-full bg-blue-500/10 blur-xl"
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050a1f]/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-xl font-serif absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Builder Manual
            </span>
          </h1>

          <div className="flex items-center">
            <Link href="/builder">
              <Button variant="ghost" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16">
        {/* Mobile title */}
        <div className="md:hidden text-center mb-8 container mx-auto px-4">
          <h1 className="text-2xl font-serif">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Builder Manual
            </span>
          </h1>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-[#0a1535]/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 sticky top-24">
                <h2 className="text-lg font-serif mb-4 flex items-center">
                  <Book className="h-5 w-5 mr-2 text-purple-400" />
                  Table of Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        activeSection === section.id ? "bg-purple-500/20 text-white" : "text-gray-300 hover:bg-white/5",
                      )}
                      onClick={() => {
                        setActiveSection(section.id)
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="bg-[#0a1535]/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8">
                <div className="prose prose-invert max-w-none">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-4">
                      <Book className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-serif m-0">
                      <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        The Dreamscape Manual
                      </span>
                    </h1>
                  </div>

                  {sections.map((section) => (
                    <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
                      <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-white/10">{section.title}</h2>
                      {section.content}
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
