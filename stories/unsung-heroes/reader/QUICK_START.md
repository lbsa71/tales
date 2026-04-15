# Quick Start Guide - Interactive Reader

## Local Development

```bash
cd reader
npm install
npm run dev
```

Visit: http://localhost:5173

## Build for Production

```bash
cd reader
npm run build
```

The static site will be in `reader/dist/`

## Test Production Build with Docker

```bash
cd reader
npm run build
docker-compose up
```

Visit: http://localhost:8080

## Deployment

The `reader/dist/` folder is a complete static website. Deploy to:

- **GitHub Pages**: Push dist/ contents to gh-pages branch
- **Netlify/Vercel**: Connect repository and set build directory to `reader/dist`
- **S3/CloudFront**: Upload dist/ contents to bucket
- **Any static host**: Upload dist/ contents

## Development Notes

- No backend required - fully static
- All chapters are bundled at build time
- Responsive: works on mobile, tablet, desktop
- Built with React 19 + TypeScript + Vite
- Passes ESLint validation
- Production build ~240KB (gzipped ~75KB)
