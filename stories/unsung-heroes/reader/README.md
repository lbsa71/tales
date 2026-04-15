# Unsung Heroes - Interactive Reader

An immersive, meditative reading experience for the "Unsung Heroes" story. This TypeScript React application creates a full-screen, atmospheric interface that guides readers through the successive chapters of evolutionary intelligence.

## Features

- **Meditative UX**: Dark, atmospheric design with subtle gradient animations
- **Successive Erasure**: Each chapter transition fades out the previous, leaving ghostly traces
- **Poetic Navigation**: "yield to the next" button with elegant transitions
- **Glitch Finale**: The final chapter introduces interface corruption, reflecting the unknowable successor
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Static Output**: Builds to a static web page that can be deployed anywhere

## Development

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (optional, for nginx testing)

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the static site:
```bash
npm run build
```

The static files will be in the `dist/` directory.

### Testing with nginx (Docker)

After building, you can test the production build with nginx:

```bash
npm run build
docker-compose up
```

The app will be available at `http://localhost:8080`

## Project Structure

```
reader/
├── src/
│   ├── chapters/          # Markdown chapter files
│   ├── chaptersData.ts    # Chapter loading and metadata
│   ├── Reader.tsx         # Main reader component
│   ├── Reader.css         # Styling for the reader
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── dist/                  # Built static files (gitignored)
├── docker-compose.yml     # nginx configuration for testing
├── nginx.conf            # nginx server configuration
└── vite.config.ts        # Build configuration
```

## Design Philosophy

The reader embodies the story's themes of succession and impermanence:

- **No backtracking**: Progression is one-way, mirroring evolutionary inevitability
- **Ghostly remnants**: Previous chapters leave faint traces, like geological strata
- **Minimal UI**: Only text and a poetic proceed button
- **Slow transitions**: 800ms fade-outs encourage meditation
- **Final corruption**: The last chapter glitches, suggesting an unknowable successor

## Deployment

The `dist/` folder contains a complete static website. Deploy it to:

- **GitHub Pages**: Copy `dist/*` to your gh-pages branch
- **Netlify/Vercel**: Point to the `dist/` folder
- **S3/CloudFront**: Upload `dist/*` to your bucket
- **Any static host**: Just upload the `dist/` contents

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Animations and styling
- **Docker + nginx** - Production testing

## License

Part of the "Unsung Heroes" creative writing project.
