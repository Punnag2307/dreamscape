import Image from 'next/image'
import { motion } from 'framer-motion'

interface DreamSlide {
  text: string;
  imageData: string;
}

interface DreamSlideshowProps {
  slides: DreamSlide[];
}

export function DreamSlideshow({ slides }: DreamSlideshowProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-4 p-4">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative aspect-square w-64 flex-shrink-0 rounded-lg overflow-hidden border border-white/10"
          >
            <Image
              src={`data:image/png;base64,${slide.imageData}`}
              alt={`Dream scene ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-sm text-white">{slide.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 