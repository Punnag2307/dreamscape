"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Book,
  Edit,
  FileText,
  ImageIcon,
  LinkIcon,
  MoreVertical,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StarField } from "@/components/star-field"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { UserNav } from "@/components/user-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { database, ref, push, set, onValue, off, remove } from "@/lib/firebase"

type Note = {
  id: string
  title: string
  content: string
  images: { url: string; caption?: string }[]
  links: { url: string; title?: string }[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

// --- Define the Default Hardcoded Notes ---
const DEFAULT_HARDCODED_NOTE: Note = {
  id: "default-note-001",
  title: "Starlit Reflections",
  content: `As I gaze up at the endless expanse of the night sky, I am reminded of the infinite possibilities that lie ahead. The stars, scattered like diamonds across the heavens, are not just distant lights; they are whispers of dreams, waiting to be realized. In their glow, I see fragments of the stories I have yet to tell, the paths I have yet to walk, and the endless potential that lies within me.\n\nEach star represents a moment, a hope, a wish, a memory—each one an opportunity to embrace the unknown with courage and wonder. The night sky teaches me that even in the darkest moments, there is light. Every challenge I face is just another step toward discovering the true magic that lies within my heart.\n\nI remind myself that dreams are not confined to the night; they stretch far beyond the hours when the sky is dark, weaving themselves into the very fabric of my existence. The stars, with their silent brilliance, are a testament to the power of dreams—how they shine, even in the absence of sunlight, how they guide us, even when we cannot see the road ahead.\n\nTonight, as I lay beneath this starlit sky, I open my heart to the endless possibilities that await me. I let go of all fears and doubts, allowing the universe to guide me. For I know that I am part of something greater, a cosmic dance of dreams and destiny. And as the stars watch over me, I will dream boldly, love deeply, and live fully, with the knowledge that I am forever a part of the universe's grand story.`,
  images: [],
  links: [],
  tags: ["reflection", "stars", "default"],
  createdAt: new Date('2025-04-25T00:00:00Z').toISOString(), // Static creation date
  updatedAt: new Date('2025-04-25T00:00:00Z').toISOString(), // Static update date
};

const DEFAULT_HARDCODED_NOTE_2: Note = {
  id: "default-note-002", // Unique static ID
  title: "A Dreamer's Note ✨",
  content: `Dreams are the bridges we build between who we are and who we are meant to become. They arrive in soft whispers, often in the quiet moments when the world is still, guiding us toward the future. But they are more than mere fantasies; they are the heartbeats of our deepest desires, the language of our soul, and the sparks that ignite the fire of possibility.\n\nEvery dream carries a message, a lesson, a hidden treasure waiting to be uncovered. Sometimes, we fear chasing them, unsure if they are too far out of reach. Yet, the stars remind us that no dream is too far. Like the night sky that stretches endlessly above us, our dreams are limitless, vast, and capable of lighting the way through even the darkest nights.\n\nAs I close my eyes tonight, I choose to trust in the power of my dreams. I will follow them wherever they lead, knowing that each step I take is one closer to the life I've always imagined.`,
  images: [],
  links: [],
  tags: ["dreamer", "possibility", "default"],
  createdAt: new Date('2025-04-21T00:00:00Z').toISOString(), // Static creation date
  updatedAt: new Date('2025-04-26T00:00:00Z').toISOString(), // Static update date
};

const DEFAULT_HARDCODED_NOTE_3: Note = {
  id: "default-note-003", // Unique static ID
  title: "A Note to the Dreamer Within ✨",
  content: `To the dreamer within me: Your dreams are not distant echoes, but vibrant calls from the universe, inviting you to step forward, to create, to explore, to believe. You were born with the ability to dream, to see the world in ways that others may not yet understand. And within those dreams lies the power to shape your reality.\n\nThe world may tell you that dreams are impossible, that they are mere illusions to be discarded with the rising sun. But the stars shine brighter in the darkest hours, and so do your dreams. They don't fade when the light comes—they grow stronger, pushing you forward, guiding you toward the life that awaits.\n\nSo, tonight, I lay my worries aside and open my heart to the magic of my dreams. I will not let fear dim their brilliance. With each new dream, I take a step closer to the person I am meant to be.`,
  images: [],
  links: [],
  tags: ["dreamer", "believe", "default"],
  createdAt: new Date('2025-03-12T00:00:00Z').toISOString(), // Static creation date
  updatedAt: new Date('2024-05-26T00:00:00Z').toISOString(), // Static update date
};

// List of all default note IDs for easier checking
const DEFAULT_NOTE_IDS = [
    DEFAULT_HARDCODED_NOTE.id,
    DEFAULT_HARDCODED_NOTE_2.id,
    DEFAULT_HARDCODED_NOTE_3.id
];
// ----------------------------------------

// Default empty note structure (for creating NEW notes)
const DEFAULT_NEW_NOTE: Omit<Note, "id"> = {
  title: "Untitled Note",
  content: "",
  images: [],
  links: [],
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function StarlitNotesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(DEFAULT_HARDCODED_NOTE)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageCaption, setImageCaption] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [tagInput, setTagInput] = useState("")

  // Form state for editing
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImages, setEditImages] = useState<{ url: string; caption?: string }[]>([])
  const [editLinks, setEditLinks] = useState<{ url: string; title?: string }[]>([])
  const [editTags, setEditTags] = useState<string[]>([])

  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Fetch notes from Firebase
  useEffect(() => {
    if (!user) {
      setNotes([]);
      // Ensure one of the defaults is active if no user
      setActiveNote(prev => prev && DEFAULT_NOTE_IDS.includes(prev.id) ? prev : DEFAULT_HARDCODED_NOTE);
      return;
    }

    const notesRef = ref(database, `users/${user.uid}/notes`)
    const handleNotesValue = (snapshot: any) => {
      if (snapshot.exists()) {
        const notesData = snapshot.val()
        const notesArray = Object.keys(notesData).map((key) => {
          // Ensure all required properties exist to prevent undefined errors
          const note = notesData[key]
          return {
            id: key,
            title: note.title || "Untitled Note",
            content: note.content || "",
            images: Array.isArray(note.images) ? note.images : [],
            links: Array.isArray(note.links) ? note.links : [],
            tags: Array.isArray(note.tags) ? note.tags : [],
            createdAt: note.createdAt || new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
          }
        })

        // Sort by updated date (newest first)
        notesArray.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        setNotes(notesArray)

        // If no active note IS SET OR the active note was one of the defaults,
        // keep the currently active default active. Otherwise, let the selected Firebase note stay active.
        setActiveNote(prev => prev && DEFAULT_NOTE_IDS.includes(prev.id) ? prev : DEFAULT_HARDCODED_NOTE);
      } else {
        setNotes([])
        setActiveNote(null) // Clear active note if notes are empty
      }
    }

    onValue(notesRef, handleNotesValue)

    return () => {
      off(notesRef, "value", handleNotesValue)
    }
  }, [user])

  // Combine ALL default notes and fetched notes for display
  const combinedNotes = [
      DEFAULT_HARDCODED_NOTE,
      DEFAULT_HARDCODED_NOTE_2,
      DEFAULT_HARDCODED_NOTE_3,
      ...notes
  ];

  // Filter combined notes based on search query
  const filteredNotes = combinedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  // Create a new note
  const handleCreateNote = () => {
    if (!user) return

    const newNote = { ...DEFAULT_NEW_NOTE }

    const notesRef = ref(database, `users/${user.uid}/notes`)
    const newNoteRef = push(notesRef)

    set(newNoteRef, newNote)
      .then(() => {
        const createdNote = { id: newNoteRef.key as string, ...newNote }
        setActiveNote(createdNote)
        setIsEditing(true)
        setEditTitle(createdNote.title)
        setEditContent(createdNote.content)
        setEditImages(createdNote.images || [])
        setEditLinks(createdNote.links || [])
        setEditTags(createdNote.tags || [])
      })
      .catch((err) => {
        console.error("Error creating note:", err)
        setError("Failed to create note. Please try again.")
      })
  }

  // Delete a note
  const handleDeleteNote = (noteId: string) => {
    if (DEFAULT_NOTE_IDS.includes(noteId)) {
        setError("Cannot delete default notes.");
        return;
    }
    if (!user) return

    const noteRef = ref(database, `users/${user.uid}/notes/${noteId}`)

    remove(noteRef)
      .then(() => {
        if (activeNote?.id === noteId) {
          const remainingNotes = notes.filter((note) => note.id !== noteId)
          setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
          setIsEditing(false)
        }
      })
      .catch((err) => {
        console.error("Error deleting note:", err)
        setError("Failed to delete note. Please try again.")
      })
  }

  // Start editing a note
  const handleEditNote = (note: Note) => {
    if (DEFAULT_NOTE_IDS.includes(note.id)) {
        setError("Cannot edit default notes.");
        return;
    }
    setActiveNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditImages(note.images || [])
    setEditLinks(note.links || [])
    setEditTags(note.tags || [])
    setIsEditing(true)
  }

  // Save edited note
  const handleSaveNote = () => {
    if (!user || !activeNote) return

    setIsSaving(true)
    setError(null)

    const updatedNote = {
      ...activeNote,
      title: editTitle,
      content: editContent,
      images: editImages || [],
      links: editLinks || [],
      tags: editTags || [],
      updatedAt: new Date().toISOString(),
    }

    const noteRef = ref(database, `users/${user.uid}/notes/${activeNote.id}`)

    set(noteRef, {
      title: updatedNote.title,
      content: updatedNote.content,
      images: updatedNote.images,
      links: updatedNote.links,
      tags: updatedNote.tags,
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt,
    })
      .then(() => {
        setActiveNote(updatedNote)
        setIsEditing(false)
        setIsSaving(false)
      })
      .catch((err) => {
        console.error("Error saving note:", err)
        setError("Failed to save note. Please try again.")
        setIsSaving(false)
      })
  }

  // Add image to note
  const handleAddImage = () => {
    if (!imageUrl.trim()) return

    const newImage = {
      url: imageUrl,
      caption: imageCaption.trim() || undefined,
    }

    setEditImages([...(editImages || []), newImage])
    setImageUrl("")
    setImageCaption("")
    setShowImageInput(false)
  }

  // Remove image from note
  const handleRemoveImage = (index: number) => {
    if (!editImages) return
    const updatedImages = [...editImages]
    updatedImages.splice(index, 1)
    setEditImages(updatedImages)
  }

  // Add link to note
  const handleAddLink = () => {
    if (!linkUrl.trim()) return

    // Add http:// if missing
    let formattedUrl = linkUrl
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl
    }

    const newLink = {
      url: formattedUrl,
      title: linkTitle.trim() || undefined,
    }

    setEditLinks([...(editLinks || []), newLink])
    setLinkUrl("")
    setLinkTitle("")
    setShowLinkInput(false)
  }

  // Remove link from note
  const handleRemoveLink = (index: number) => {
    if (!editLinks) return
    const updatedLinks = [...editLinks]
    updatedLinks.splice(index, 1)
    setEditLinks(updatedLinks)
  }

  // Add tag to note
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!editTags || !editTags.includes(tagInput.trim())) {
        setEditTags([...(editTags || []), tagInput.trim()])
      }
      setTagInput("")
    }
  }

  // Remove tag from note
  const handleRemoveTag = (tag: string) => {
    if (!editTags) return
    setEditTags(editTags.filter((t) => t !== tag))
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Select a note
  const handleSelectNote = (note: Note) => {
    setActiveNote(note)
    setIsEditing(false)
    setError(null)
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
    <div className="min-h-screen bg-[#050a1f] text-white flex flex-col relative">
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
      <header className="py-4 px-4 border-b border-white/10 bg-[#050a1f]/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-xl font-serif absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Starlit Notes
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 lg:w-80 border-r border-white/10 bg-[#050a1f]/80 backdrop-blur-md">
          {/* Mobile title */}
          <div className="md:hidden text-center py-4 border-b border-white/10">
            <h1 className="text-xl font-serif">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Starlit Notes
              </span>
            </h1>
          </div>

          {/* Search and create */}
          <div className="p-4 border-b border-white/10">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={handleCreateNote}
            >
              <Plus className="h-4 w-4 mr-2" /> New Note
            </Button>
          </div>

          {/* Notes list */}
          <div className="overflow-y-auto h-[calc(100vh-13rem)]">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-400">No notes found</p>
                {searchQuery && (
                  <Button variant="link" className="text-purple-400 mt-2" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNotes.map((note) => {
                  const isDefault = DEFAULT_NOTE_IDS.includes(note.id)
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "p-4 cursor-pointer transition-colors",
                        activeNote?.id === note.id ? "bg-purple-500/20 border-l-2 border-purple-500" : "hover:bg-white/5",
                      )}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium mb-1 truncate">{note.title}</h3>
                        {!isDefault && user && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0a1535] border-white/10">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem
                                className="text-red-400 focus:bg-red-500/20 focus:text-red-300"
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate mb-2">{note.content.substring(0, 60)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {note.tags && note.tags.length > 0 ? (
                            <>
                              {note.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                                >
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10">
                                  +{note.tags.length - 2}
                                </span>
                              )}
                            </>
                          ) : null}
                        </div>
                        <span className="text-xs text-gray-500">{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Note content */}
        <div className="flex-1 overflow-y-auto">
          {activeNote ? (
            <div className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-serif bg-transparent border-white/10 focus:border-purple-500/50"
                      placeholder="Note title"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {editTags &&
                      editTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center text-xs px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30"
                        >
                          {tag}
                          <button className="ml-1 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-32 h-6 text-xs bg-white/5 border-white/10"
                      placeholder="Add tag..."
                    />
                  </div>

                  <Textarea
                    ref={contentRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px] bg-white/5 border-white/10 focus:border-purple-500/50"
                    placeholder="Write your thoughts, dreams, or stories here..."
                  />

                  {/* Images section */}
                  {editImages && editImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Images</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {editImages.map((image, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border border-white/10 group">
                            <div className="aspect-video relative">
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt={image.caption || `Image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {image.caption && <div className="p-2 text-sm text-gray-300">{image.caption}</div>}
                            <button
                              className="absolute top-2 right-2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add image form */}
                  {showImageInput && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                      <h3 className="text-lg font-medium">Add Image</h3>
                      <div className="space-y-2">
                        <Input
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="bg-white/5 border-white/10"
                          placeholder="Image URL"
                        />
                        <Input
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          className="bg-white/5 border-white/10"
                          placeholder="Caption (optional)"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 hover:bg-white/10"
                          onClick={(e) => { e.stopPropagation(); setShowImageInput(false); }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddImage(); }}>
                          Add Image
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Links section */}
                  {editLinks && editLinks.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Links</h3>
                      <div className="space-y-2">
                        {editLinks.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center">
                              <LinkIcon className="h-4 w-4 mr-3 text-blue-400" />
                              <div>
                                <div className="font-medium">{link.title || "Untitled Link"}</div>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:underline"
                                >
                                  {link.url}
                                </a>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); handleRemoveLink(index); }}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add link form */}
                  {showLinkInput && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                      <h3 className="text-lg font-medium">Add Link</h3>
                      <div className="space-y-2">
                        <Input
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="bg-white/5 border-white/10"
                          placeholder="URL"
                        />
                        <Input
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          className="bg-white/5 border-white/10"
                          placeholder="Title (optional)"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 hover:bg-white/10"
                          onClick={(e) => { e.stopPropagation(); setShowLinkInput(false); }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddLink(); }}>
                          Add Link
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* AI Story Completion - Temporarily Commented Out
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">AI Story Completion</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 hover:bg-white/10"
                        onClick={async () => {
                          if (!editContent.trim()) {
                            setError("Please write some content first before using AI completion")
                            return
                          }

                          try {
                            setIsSaving(true)
                            // Import the completeStory function
                            // const { completeStory } = await import("@/lib/gemini") // This function doesn't exist

                            // Placeholder - replace with actual implementation if needed
                            setError("AI Completion feature is not implemented yet.")
                            setIsSaving(false)

                            // // Get AI completion
                            // const completion = await completeStory(editContent)

                            // // Append the completion to the current content
                            // setEditContent((prev) => prev + "\n\n" + completion)
                            // setIsSaving(false)
                          } catch (err) {
                            console.error("Error completing story:", err)
                            setError("Failed to complete the story. AI service may be unavailable.")
                            setIsSaving(false)
                          }
                        }}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>Complete with AI</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400">
                      Let AI help complete your story based on what you've written so far.
                    </p>
                  </div>
                   End of AI Story Completion Comment */}

                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); setShowImageInput(!showImageInput); }}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); setShowLinkInput(!showLinkInput); }}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" /> Add Link
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-white/20 hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={(e) => { e.stopPropagation(); handleSaveNote(); }}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-serif">{activeNote.title}</h2>
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => { e.stopPropagation(); handleEditNote(activeNote); }}
                        disabled={DEFAULT_NOTE_IDS.includes(activeNote.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div>Last updated: {formatDate(activeNote.updatedAt)}</div>
                    <div>Created: {formatDate(activeNote.createdAt)}</div>
                  </div>

                  {activeNote.tags && activeNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    {activeNote.content.split("\n").map((paragraph, i) => (
                      <p key={i}>{paragraph || '\u00A0'}</p>
                    ))}
                  </div>

                  {activeNote.images && activeNote.images.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium border-b border-white/10 pb-2">Images</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {activeNote.images.map((image, index) => (
                          <div key={index} className="rounded-lg overflow-hidden border border-white/10">
                            <div className="aspect-video relative">
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt={image.caption || `Image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {image.caption && <div className="p-3 text-sm text-gray-300">{image.caption}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeNote.links && activeNote.links.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium border-b border-white/10 pb-2">Links</h3>
                      <div className="space-y-3">
                        {activeNote.links.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <LinkIcon className="h-4 w-4 mr-3 text-blue-400" />
                            <div>
                              <div className="font-medium">{link.title || "Untitled Link"}</div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:underline"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Book className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-serif mb-2">No Note Selected</h2>
                <p className="text-gray-400 mb-6">Select a note from the sidebar or create a new one</p>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleCreateNote}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
