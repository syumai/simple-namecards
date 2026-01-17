# simple-namecards

A web application for designing and printing name cards. Input name card data in JSON format, preview the layout on A4 paper (8 cards per page), and print.

**Live Demo:** https://syumai.github.io/simple-namecards/

## Features

- JSON-based input for name and icon URL
- A4 paper layout with 8 name cards per page (2 columns × 4 rows)
- Pagination for more than 8 cards
- Print all pages at once

## JSON Format

```json
[
  { "name": "Felix", "icon": "https://api.dicebear.com/7.x/thumbs/svg?seed=Felix" },
  { "name": "Aneka", "icon": "https://api.dicebear.com/7.x/thumbs/svg?seed=Aneka" }
]
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- React 19
- TypeScript
- Vite

## License

MIT
