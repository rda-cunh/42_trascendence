export interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  location: string;
  seller: string;
  image: string;
  postedDate: string;
  fileFormat?: string;
  engine?: string;
}

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Stylized Character Model Pack",
    price: 45,
    description: "High-quality 3D character models with rigging and animations. Perfect for fantasy RPGs. Includes 5 unique characters with multiple texture variations. FBX and Blend files included.",
    category: "3D Models",
    condition: "New",
    location: "Digital Download",
    seller: "GameArtStudio",
    image: "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMGdhbWUlMjBjaGFyYWN0ZXIlMjBtb2RlbHxlbnwxfHx8fDE3NzE4MDMxNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-18",
    fileFormat: "FBX, Blend",
    engine: "Unity, Unreal",
  },
  {
    id: "2",
    title: "Retro Pixel Art Sprite Sheet",
    price: 15,
    description: "Complete 2D sprite sheet for retro platformer games. Includes character animations: idle, walk, run, jump, attack. 32x32 pixel resolution with multiple color palettes.",
    category: "2D Assets",
    condition: "New",
    location: "Digital Download",
    seller: "PixelCraftPro",
    image: "https://images.unsplash.com/photo-1758043322963-9d6f59f1509b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMHNwcml0ZSUyMHNoZWV0fGVufDF8fHx8MTc3MTgwMzE0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-17",
    fileFormat: "PNG",
    engine: "Any Engine",
  },
  {
    id: "3",
    title: "PBR Texture Pack - Sci-Fi",
    price: 35,
    description: "Professional PBR texture pack with 20 sci-fi materials. Includes albedo, normal, metallic, and roughness maps. 4K resolution, seamless tiling. Perfect for futuristic environments.",
    category: "Textures",
    condition: "New",
    location: "Digital Download",
    seller: "TextureMaster",
    image: "https://images.unsplash.com/photo-1707871891827-48ca1a0f48a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwdGV4dHVyZSUyMG1hdGVyaWFsfGVufDF8fHx8MTc3MTgwMzE0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-16",
    fileFormat: "PNG, TGA",
    engine: "Unity, Unreal",
  },
  {
    id: "4",
    title: "Holographic Shader Collection",
    price: 28,
    description: "10 premium shaders with holographic and neon effects. Fully customizable colors and intensity. Optimized for mobile and PC. Includes documentation and example scenes.",
    category: "Shaders",
    condition: "New",
    location: "Digital Download",
    seller: "ShaderWizard",
    image: "https://images.unsplash.com/photo-1659260253622-4070dda06e4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwc2hhZGVyJTIwZWZmZWN0fGVufDF8fHx8MTc3MTgwMzE0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-19",
    fileFormat: "Shader Graph",
    engine: "Unity",
  },
  {
    id: "5",
    title: "Low Poly Environment Pack",
    price: 65,
    description: "Complete low-poly environment with trees, rocks, grass, and terrain. Over 150 prefabs. Optimized for mobile games. Includes demo scene and customization guide.",
    category: "3D Models",
    condition: "New",
    location: "Digital Download",
    seller: "PolyWorld",
    image: "https://images.unsplash.com/photo-1770307773776-b69a7d317cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZW52aXJvbm1lbnQlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzcxODAzMTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-15",
    fileFormat: "FBX, OBJ",
    engine: "Unity, Unreal",
  },
  {
    id: "6",
    title: "Game UI Kit - Fantasy RPG",
    price: 22,
    description: "Complete UI kit with buttons, panels, icons, and HUD elements. Fantasy theme with hand-drawn style. Over 200 elements. PSD source files included.",
    category: "UI/UX",
    condition: "New",
    location: "Digital Download",
    seller: "UIGameDesign",
    image: "https://images.unsplash.com/photo-1586763749650-70d7996310d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVSSUyMGdhbWUlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzcxODAzMTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-14",
    fileFormat: "PNG, PSD",
    engine: "Any Engine",
  },
  {
    id: "7",
    title: "VFX Particle System Bundle",
    price: 40,
    description: "50+ particle effects including explosions, magic spells, fire, smoke, and impacts. Highly customizable. Performance optimized. Tutorial videos included.",
    category: "VFX",
    condition: "New",
    location: "Digital Download",
    seller: "VFXPro",
    image: "https://images.unsplash.com/photo-1768328592162-28a67c40b6ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0aWNsZSUyMGVmZmVjdCUyMGV4cGxvc2lvbnxlbnwxfHx8fDE3NzE4MDMxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-13",
    fileFormat: "Prefab",
    engine: "Unity, Unreal",
  },
  {
    id: "8",
    title: "Game Audio Pack - Sci-Fi",
    price: 30,
    description: "Professional sound effects library with 200+ sci-fi sounds. Includes weapons, UI, ambience, and effects. WAV and OGG formats. Royalty-free license.",
    category: "Audio",
    condition: "New",
    location: "Digital Download",
    seller: "SoundFXStudio",
    image: "https://images.unsplash.com/photo-1748366465774-aaa2160fe78d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwYXVkaW8lMjB3YXZlZm9ybXxlbnwxfHx8fDE3NzE4MDMxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    postedDate: "2026-02-12",
    fileFormat: "WAV, OGG",
    engine: "Any Engine",
  },
];