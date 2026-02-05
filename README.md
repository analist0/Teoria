# 🧬 Spiritual Light Engine

> מנוע אור רוחני בזמן אמת לסידור דיגיטלי

Real-Time Spiritual Rendering Engine for interactive Siddur (Jewish prayer book) visualization.

## ✨ Features

### 🌳 Sefirot-Based Visual System
Each of the ten Sefirot has unique visual characteristics:
- **כתר (Keter)** - Pure white light, diverging particles
- **חכמה (Chokhmah)** - Silver-blue spiral flow
- **בינה (Binah)** - Deep blue converging energy
- **חסד (Chesed)** - Light blue descending flow
- **גבורה (Gevurah)** - Red-gold ascending fire
- **תפארת (Tiferet)** - Gold-purple harmony spiral
- **נצח (Netzach)** - Pink ascending victory
- **הוד (Hod)** - Deep pink descending splendor
- **יסוד (Yesod)** - Orange converging foundation
- **מלכות (Malkhut)** - Royal blue presence

### 📜 Text Engine Layer
- Automatic parsing of Hebrew prayer text
- Divine Name (שמות קדושים) detection
- Gematria calculation
- Kavvanah (intention) metadata
- Sefirah association

### 🌊 Scroll Prediction Engine
- Velocity-based scroll prediction
- Pre-activation of effects before words reach viewport
- Smooth transitions between active words

### 🌌 GPU Particle Attractor System
- WebGL-accelerated particles
- Curl noise for organic movement
- Dynamic attractor system
- Sefirah-specific flow patterns

### ✨ Post Processing Pipeline
- HDR Bloom
- Chromatic Aberration
- Vignette
- Film Noise
- Depth of Field

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Architecture

```
src/
├── engine/           # Core engine modules
│   ├── types.ts      # TypeScript definitions
│   ├── sefirot.ts    # Sefirot visual configurations
│   ├── textEngine.ts # Prayer text parsing
│   └── scrollPrediction.ts # Scroll tracking
│
├── components/       # React components
│   ├── SpiritualCanvas.tsx  # Main WebGL canvas
│   ├── SpiritualText.tsx    # Prayer text display
│   ├── ParticleAttractor.tsx # GPU particles
│   ├── PostProcessing.tsx   # Effects pipeline
│   └── AuroraBackground.tsx # Background shader
│
├── shaders/          # GLSL shaders
│   ├── particleAttractor.vert/frag
│   ├── spiritualGlow.frag
│   └── auroraBackground.frag
│
├── stores/           # Zustand state
│   └── spiritualStore.ts
│
├── hooks/            # React hooks
│   └── useSpiritualEngine.ts
│
├── data/            # Prayer data
│   └── prayers.ts
│
└── styles/          # CSS modules
    ├── global.css
    └── SpiritualText.module.css
```

## 🛠️ Technologies

- **React 18** - UI Framework
- **Three.js** - 3D Graphics
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers
- **@react-three/postprocessing** - Post-processing effects
- **Zustand** - State management
- **Framer Motion** - Animations
- **TypeScript** - Type safety
- **Vite** - Build tool
- **GLSL** - Custom shaders

## 📖 Included Prayers

1. **קריאת שמע** - Shema Yisrael
2. **פתיחת העמידה** - Amidah Opening (Avot)
3. **קדושה** - Kedushah
4. **אנא בכח** - Ana B'koach
5. **תהילים כ״ג** - Psalm 23
6. **ברכת כהנים** - Priestly Blessing

## 🎨 Customization

### Adding New Prayers

```typescript
import { parseSpiritualText } from '@/engine/textEngine'

const myPrayer = parseSpiritualText(
  'Prayer Title',
  `
  Prayer text here...
  Each line is a verse...
  `,
  'תפארת' // Default Sefirah
)
```

### Custom Sefirah Visuals

Edit `src/engine/sefirot.ts` to customize colors, particle counts, and flow patterns.

## 📄 License

MIT

---

**בונה אור לסידור** 🕯️
