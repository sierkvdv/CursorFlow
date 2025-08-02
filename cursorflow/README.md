# CursorFlow 🎯

Een moderne, interactieve web applicatie die cursor tracking combineert met visuele effecten en audio feedback voor een unieke gebruikerservaring.

## ✨ Features

### 🎯 Cursor Tracking
- Real-time cursor positie tracking
- Snelheid en richting detectie
- Vloeiende animaties die je cursor volgen

### 🎨 Visuele Effecten
- Dynamische deeltjes die je cursor volgen
- Glow effecten en trails
- Subtiele achtergrond animaties
- Responsive design voor alle schermformaten

### 🔊 Audio Feedback
- Subtiele geluiden bij cursor beweging
- Hover en click effecten
- Aanpasbare audio instellingen
- Web Audio API voor optimale prestaties

### 🎛️ Interactieve Controls
- Audio aan/uit toggle
- Visuele effecten aan/uit toggle
- Settings panel
- Real-time status indicators

## 🚀 Installatie

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd cursorflow
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start de development server**
   ```bash
   npm run dev
   ```

4. **Open je browser**
   Navigeer naar `http://localhost:5173`

## 🛠️ Technische Details

### Tech Stack
- **React 19** - Moderne React met hooks
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Vloeiende animaties
- **Web Audio API** - Real-time audio processing
- **Canvas API** - Performante visuele effecten

### Architectuur
```
src/
├── components/          # React componenten
│   ├── CursorTracker.tsx    # Cursor tracking canvas
│   └── InteractiveElements.tsx  # Control knoppen
├── hooks/              # Custom React hooks
│   ├── useAudioEffects.ts    # Audio management
│   ├── useCursorTracking.ts  # Cursor position tracking
│   └── useVisualEffects.ts   # Particle en trail effects
├── utils/              # Utility functies
├── App.tsx            # Hoofdcomponent
└── index.css          # Global styling
```

### Key Features

#### Audio Systeem
- Automatische initialisatie bij eerste user interaction
- Verschillende geluidstypes (sine, square, sawtooth)
- Aanpasbare volume en frequentie
- Browser autoplay policy compliance

#### Visuele Effecten
- Canvas-based rendering voor optimale performance
- Particle system met physics
- Trail effecten met gradient fading
- Mix-blend-mode voor moderne looks

#### Cursor Tracking
- Real-time positie updates
- Velocity berekening
- Richting detectie
- Throttled updates voor performance

## 🎮 Gebruik

### Basis Interactie
1. **Beweeg je muis** - Zie de visuele effecten en hoor audio feedback
2. **Hover over elementen** - Trigger hover effecten
3. **Klik op knoppen** - Hoor click geluiden

### Controls
- **🔊 Audio Toggle** (rechtsboven) - Zet audio aan/uit
- **✨ Effects Toggle** (rechtsboven) - Zet visuele effecten aan/uit
- **⚙️ Settings** (rechtsboven) - Toekomstige instellingen

### Status Indicators
- **Effects: ON/OFF** - Toont status van visuele effecten
- **Audio: ON/OFF** - Toont status van audio feedback

## 🎨 Customization

### Kleuren Aanpassen
Bewerk `tailwind.config.js` om de kleurenschema te wijzigen:
```javascript
colors: {
  background: '#0a0a0a',
  primary: '#00ff88',    // Groen
  secondary: '#ff0080',  // Roze
  accent: '#0080ff',     // Blauw
  text: '#ffffff',
}
```

### Audio Aanpassen
Bewerk `src/hooks/useAudioEffects.ts` om geluiden te wijzigen:
```typescript
const playClick = useCallback(() => {
  playTone({
    frequency: 400,    // Frequentie in Hz
    duration: 0.2,     // Duur in seconden
    volume: 0.15,      // Volume (0-1)
    type: 'square'     // Golfvorm
  });
}, [playTone]);
```

### Visuele Effecten
Bewerk `src/hooks/useVisualEffects.ts` om particles aan te passen:
```typescript
const createParticle = useCallback((x: number, y: number, velocity: number) => {
  // Pas particle eigenschappen aan
  return {
    size: Math.random() * 2 + 1,  // Grootte
    maxLife: Math.random() * 0.6 + 0.3,  // Levensduur
    // ... andere eigenschappen
  };
}, []);
```

## 🔧 Development

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build voor productie
npm run preview  # Preview build
npm run lint     # ESLint check
```

### Performance Tips
- Visuele effecten zijn automatisch geoptimaliseerd voor 60fps
- Audio wordt alleen afgespeeld bij user interaction
- Canvas rendering gebruikt requestAnimationFrame
- Particles worden automatisch opgeruimd

### Browser Support
- **Chrome/Edge** - Volledige ondersteuning
- **Firefox** - Volledige ondersteuning
- **Safari** - Volledige ondersteuning
- **Mobile** - Basis ondersteuning (touch events)

## 🐛 Troubleshooting

### Geen Audio
1. Controleer of je browser audio ondersteunt
2. Klik ergens op de pagina om audio te activeren
3. Controleer of audio niet gemute is in je browser
4. Controleer de browser console voor errors

### Trage Performance
1. Zet visuele effecten uit via de toggle
2. Verminder het aantal particles in de code
3. Controleer of hardware acceleration aan staat
4. Sluit andere zware applicaties

### Visuele Glitches
1. Refresh de pagina
2. Controleer of je browser up-to-date is
3. Probeer een andere browser
4. Controleer de browser console voor errors

## 🤝 Bijdragen

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Credits

- **React** - UI framework
- **Framer Motion** - Animatie library
- **TailwindCSS** - Styling framework
- **Lucide React** - Icon library
- **Web Audio API** - Audio processing

---

**Geniet van je CursorFlow ervaring! 🎉**
