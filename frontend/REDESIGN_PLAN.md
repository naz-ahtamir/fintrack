# FinTrack UI Redesign - Plan Revisi

## ❌ Masalah Saat Ini:
1. Font Inter tidak terload dengan benar
2. Toggle theme masih ada tapi tidak berguna (karena pure black theme)
3. Header/navbar terlihat jelek
4. Warna text sulit dibaca (contrast kurang)
5. Tampilan terlihat norak/tidak profesional

## ✅ Solusi yang Akan Diterapkan:

### 1. Font System
- Pastikan Inter font benar-benar terload
- Fallback ke system fonts yang bagus
- Font size dan weight yang lebih baik

### 2. Color System (Dark Theme yang Benar)
```
Background levels:
- bg-[#000000] - Pure black untuk main background
- bg-[#0a0a0a] - Cards/surfaces
- bg-[#141414] - Elevated elements
- bg-[#1a1a1a] - Hover states

Borders:
- border-[#262626] - Subtle borders
- border-[#333333] - More visible borders

Text:
- text-white - Primary text (high contrast)
- text-gray-300 - Secondary text (readable)
- text-gray-400 - Tertiary text
- text-gray-500 - Disabled/placeholder

Accent:
- #0066ff - Primary blue (clean, modern)
- #10b981 - Success/positive
- #ef4444 - Error/negative
- #f59e0b - Warning
```

### 3. Header Redesign
- Remove theme toggle (tidak berguna untuk single theme)
- Cleaner search bar
- Better notification dropdown
- Improved user menu

### 4. Layout Improvements
- Better spacing
- Proper typography hierarchy
- Improved contrast ratios
- Professional shadows and borders

### 5. Component Quality
- Remove ALL dark: prefixes
- Use consistent color values
- Better hover/active states
- Smooth animations

## 🎯 Reference Design:
Berdasarkan modern fintech dashboards seperti:
- Stripe Dashboard
- Vercel Dashboard  
- Linear App
- Notion (dark mode)

Karakteristik:
- Clean, minimal
- High contrast text (mudah dibaca)
- Subtle shadows
- Generous whitespace
- Professional typography
- Smooth interactions
