"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Cloud, Sparkles, Star, Wand2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StarField } from "@/components/star-field"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { saveDream } from "@/lib/firebase"

// Sample mood options
const moodOptions = [
  { value: "serene", label: "Serene" },
  { value: "mysterious", label: "Mysterious" },
  { value: "surreal", label: "Surreal" },
  { value: "nostalgic", label: "Nostalgic" },
  { value: "ethereal", label: "Ethereal" },
  { value: "cosmic", label: "Cosmic" },
  { value: "vibrant", label: "Vibrant" },
]

// Sample style options
const styleOptions = [
  { value: "cosmic", label: "Cosmic" },
  { value: "fantasy", label: "Fantasy" },
  { value: "abstract", label: "Abstract" },
  { value: "nature", label: "Nature" },
  { value: "futuristic", label: "Futuristic" },
  { value: "historical", label: "Historical" },
]

// Interface for the API response containing multiple images
interface GenerationApiResponse {
  images: GeneratedImageData[];
}

// Single image data structure
interface GeneratedImageData {
  base64Data: string;
  mimeType: string;
}

export default function DreamBuilderPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [description, setDescription] = useState("")
  const [mood, setMood] = useState("")
  const [style, setStyle] = useState("")
  const [complexity, setComplexity] = useState([50])
  const [numPanels, setNumPanels] = useState<number>(4)

  // State for Save step
  const [dreamName, setDreamName] = useState("")
  const [dreamDescription, setDreamDescription] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Handle generation - Updated for multiple images
  const handleGenerate = async () => {
    setError(null)
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous images

    let combinedPrompt = description;
    if (mood) combinedPrompt += `, mood: ${mood}`;
    if (style) combinedPrompt += `, style: ${style}`;
    combinedPrompt += `, complexity: ${complexity[0]}%`;
    // Optionally add context for sequence generation (model dependent)
    // combinedPrompt += ", sequence of related images";

    try {
      console.log(`Requesting ${numPanels} images for prompt: ${combinedPrompt}`);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: combinedPrompt,
          sampleCount: numPanels, // Send the desired number of panels
          // negativePrompt: "text, words, letters",
          // aspectRatio: "1:1" // Keep aspect ratio consistent for strip?
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      // Expect the response to have an 'images' array
      const responseData: GenerationApiResponse = await response.json();

      if (!responseData || !responseData.images || responseData.images.length === 0) {
        throw new Error("No image data received from API.");
      }

      // Create data URLs for all received images
      const imageUrls = responseData.images.map(imageData => {
          if (!imageData || !imageData.base64Data) {
              console.warn("Received invalid image data object:", imageData);
              return null; // Skip invalid entries
          }
          return `data:${imageData.mimeType};base64,${imageData.base64Data}`;
      }).filter((url): url is string => url !== null); // Filter out nulls and assert type

      if (imageUrls.length === 0) {
         throw new Error("Failed to process image data received from API.");
      }

      console.log(`Received ${imageUrls.length} image URLs.`);
      setGeneratedImages(imageUrls); // Set the array of generated image URLs

      setIsGenerating(false)
      setCurrentStep(4) // Move to save step
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate dream sequence. Please try again.")
      setIsGenerating(false)
    }
  }

  // Handle save - Updated to use the array of generated images
  const handleSave = async () => {
    if (!user || generatedImages.length === 0) return

    setError(null)
    setIsSaving(true)

    try {
      const dreamData = {
        title: dreamName,
        description: dreamDescription,
        image: generatedImages[0], // Use the first image as the primary thumbnail
        images: generatedImages,   // Save the full array of image URLs
        prompt: description,
        mood,
        style,
        complexity: complexity[0],
        numPanels: generatedImages.length, // Store how many panels were saved
        createdAt: new Date().toISOString(),
      }

      const { dreamId, error } = await saveDream(user.uid, dreamData)

      if (error) {
        setError(error)
        setIsSaving(false)
        return
      }

      router.push("/gallery")
    } catch (err) {
      console.error(err)
      setError("Failed to save your dream. Please try again.")
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a1f] text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

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
              Dream Builder
            </span>
          </h1>

          <div className="flex items-center">
            <Link href="/manual">
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Guide
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16 container mx-auto px-4">
        {/* Mobile title */}
        <div className="md:hidden text-center mb-8">
          <h1 className="text-2xl font-serif">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Builder
            </span>
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto bg-red-500/10 border-red-500/30 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Steps indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                    currentStep === step
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : currentStep > step
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-white/10 text-gray-400",
                  )}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={cn("text-xs hidden md:block", currentStep === step ? "text-white" : "text-gray-400")}>
                  {step === 1 && "Describe"}
                  {step === 2 && "Customize"}
                  {step === 3 && "Generate"}
                  {step === 4 && "Save"}
                </span>
              </div>
            ))}

            {/* Connecting lines */}
            <div className="absolute left-0 right-0 flex justify-center">
              <div className="w-full max-w-[240px] h-[2px] bg-white/10 -z-10 hidden md:block">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                  style={{ width: `${(currentStep - 1) * 33.3}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/50 via-[#050a1f] to-gray-900/50 p-8 rounded-lg shadow-2xl border border-white/10 backdrop-blur-sm">
          {/* Step 1: Describe */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">Step 1: Describe Your Dream</h2>
              <Textarea
                placeholder="Describe the core scene, characters, or feeling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="bg-gray-800/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button onClick={() => setCurrentStep(2)} className="w-full bg-purple-600 hover:bg-purple-700">
                Next: Customize <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Customize */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">Step 2: Customize the Vibe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mood Selection */}
                <div>
                  <Label htmlFor="mood">Mood</Label>
                  <Select onValueChange={setMood} value={mood}>
                    <SelectTrigger id="mood" className="w-full bg-gray-800/50 border-gray-700">
                      <SelectValue placeholder="Select a mood (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {moodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-purple-600/30 focus:bg-purple-600/40">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Selection */}
                <div>
                  <Label htmlFor="style">Visual Style</Label>
                  <Select onValueChange={setStyle} value={style}>
                    <SelectTrigger id="style" className="w-full bg-gray-800/50 border-gray-700">
                      <SelectValue placeholder="Select a style (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {styleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-purple-600/30 focus:bg-purple-600/40">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Complexity Slider */}
              <div>
                <Label htmlFor="complexity">Detail / Complexity ({complexity[0]}%)</Label>
                <Slider
                  id="complexity"
                  min={10}
                  max={100}
                  step={10}
                  value={complexity}
                  onValueChange={setComplexity}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-purple-500 [&>span:first-child]:to-blue-500 [&>span>span]:bg-white"
                />
              </div>

              {/* Number of Panels Input */}
              <div>
                <Label htmlFor="numPanels">Number of Images / Panels</Label>
                <Input
                  id="numPanels"
                  type="number"
                  min="1"
                  max="8" // Set a reasonable max (e.g., 8 for Imagen 3)
                  value={numPanels}
                  onChange={(e) => setNumPanels(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                  className="w-full bg-gray-800/50 border-gray-700"
                />
                 <p className="text-xs text-gray-400 mt-1">How many images to generate in the sequence (1-8).</p>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-purple-600 hover:bg-purple-700">
                  Next: Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generate */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Step 3: Ready to Generate?</h2>
              <p className="text-gray-400">Review your description and settings. Generating {numPanels} image{numPanels !== 1 ? 's' : ''} might take a moment.</p>
              <p className="font-mono bg-gray-800/50 p-4 rounded break-words text-left text-sm">{description}{mood && `, mood: ${mood}`}{style && `, style: ${style}`}{`, complexity: ${complexity[0]}%`}</p>
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                {isGenerating ? (
                  <>
                    <Cloud className="mr-2 h-4 w-4 animate-pulse" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Dream Sequence
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setCurrentStep(2)} disabled={isGenerating}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customize
              </Button>
            </motion.div>
          )}

          {/* Step 4: View & Save */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-4">Step 4: Your Dream Sequence</h2>
              {isGenerating && <p>Generating...</p>} {/* Should not happen if step logic is correct */} 
              {generatedImages.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  {/* Display images in a row */} 
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {generatedImages.map((imgSrc, index) => (
                       <Image
                         key={index}
                         src={imgSrc}
                         alt={`Generated Dream Panel ${index + 1}`}
                         width={256} // Adjust size as needed
                         height={256} // Adjust size as needed
                         className="rounded-md object-cover aspect-square flex-shrink-0"
                         unoptimized // Necessary for data: URLs if not using a loader
                       />
                    ))}
                  </div>
                </div>
              )}
              {/* Save Form */} 
              <div className="space-y-4 pt-4 border-t border-white/10">
                 <h3 className="text-lg font-medium text-center">Save Your Creation</h3>
                 <Input 
                   placeholder="Give your dream sequence a name"
                   value={dreamName}
                   onChange={(e) => setDreamName(e.target.value)}
                   className="bg-gray-800/50 border-gray-700"
                  />
                 <Textarea
                    placeholder="Add a short description (optional)"
                    value={dreamDescription}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    rows={3}
                    className="bg-gray-800/50 border-gray-700"
                 />
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(3)} disabled={isSaving}> {/* Go back to Generate step */} 
                  <ArrowLeft className="mr-2 h-4 w-4" /> Regenerate
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !dreamName} className="bg-green-600 hover:bg-green-700">
                  {isSaving ? "Saving..." : "Save to Gallery"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
