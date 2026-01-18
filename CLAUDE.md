# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page React application for creating, previewing, and printing business name cards. Users input card data in JSON format, preview cards on A4 paper layout (8 cards per page: 2 columns × 4 rows), and print or share via URL-encoded links.

## Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start Vite dev server
pnpm build      # Build for production (tsc -b && vite build)
pnpm test       # Run vitest unit tests
```

## Architecture

### Component Structure

- **App.tsx** - Main component managing JSON input state, card parsing, pagination, and URL encoding/decoding for sharing
- **components/Preview.tsx** - Renders cards in an iFrame with A4 paper formatting, handles both screen preview (single page) and print mode (all pages)
- **types.ts** - Data model: `NameCard { name, icon, social? }` and `CARDS_PER_PAGE = 8`

### Data Flow

1. **Input**: JSON array → `parseJson()` validation → `cards` state
2. **Preview**: Cards rendered in iFrame with isolated A4 styling
3. **Print**: `contentWindow.print()` on iFrame renders all pages
4. **Share**: `encodeCards()` → base64url string → URL query parameter
5. **Import**: URL parameter → `decodeCards()` → populate UI

### Encoding Format

Custom pipe-separated format: `name|icon|social` with compression (`https://` → `^` prefix). Uses base64url alphabet via `Uint8Array.toBase64/fromBase64` (requires Node 25+).

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7
- Vitest for in-source testing (`import.meta.vitest` pattern)
- Node.js 25+ required (see `mise.toml`)
- Deploys to GitHub Pages via GitHub Actions
