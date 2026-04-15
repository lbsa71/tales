# Visual Modules

Interactive background animations that accompany each chapter of the Unsung Heroes reader. Modules are fully implemented and orchestrated at runtime by the reader.

## What’s here

- `BaseVisualModule.ts` – shared lifecycle, canvas sizing, interaction handling, metrics.
- `VisualModuleOrchestrator.ts` – loads modules per chapter, transitions, forwards events.
- `config/visualConfig.json` – per-chapter settings and global tuning knobs.
- `modules/` – nine implemented modules (DLA, ReactionDiffusion, LSystem, CellularAutomata, Morphogenetic, Boids, ForceDirectedGraph, NeuralActivation, Successor).
- `index.ts` exports modules, config, and types for hooks and consumer components.

## How the reader uses it

- `useVisualModule` (see `src/visualModules/index.ts`) creates an orchestrator bound to the canvas ref provided by `Reader.tsx`.
- `Reader.tsx` keeps the orchestrator in sync with the active chapter and forwards tap interactions from the content area directly to the current visual module.
- Visual-to-audio coupling: `VisualModuleOrchestrator.setEventListener` forwards module events to the audio orchestrator when enabled.

## Minimal API surface

```typescript
interface VisualModule {
  init(canvas: HTMLCanvasElement, config: VisualModuleConfig): void
  update(deltaTime: number): void
  render(): void
  destroy(): void
  updateConfig(config: Partial<VisualModuleConfig>): void
  getConfig(): VisualModuleConfig
  pause(): void
  resume(): void
  reset(): void
}
```

`BaseVisualModule` already implements lifecycle wiring, resize handling, interaction state, and metrics; modules mainly supply `onInit`, `onUpdate`, `onRender`, `onDestroy`, `onReset`, and `onInteraction`.

## Developing and running

```bash
# from /reader
npm install
npm run dev
```

To expose the dev server to other devices on your network (Vite):

```bash
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

Then browse from another device to `http://<your-ip>:4173`. Windows may prompt for firewall permission on first run; allow Node to listen on private networks.

## Adding or adjusting a module

1) Extend `BaseVisualModule`, implement the lifecycle hooks, and export it from `modules/` and `index.ts`.  
2) Add a config entry in `config/visualConfig.json` and map the name in `VisualModuleOrchestrator.createModule`.  
3) Keep opacity and motion subtle (we target comfortable background motion and 60fps desktop / 30fps mobile).  
4) Ensure `destroy()` cleans up animation frames and event listeners (handled by the base when hooks are used).

## Useful references

- `VISUAL_MODULES_IMPLEMENTATION_PLAN.md` – roadmap and sequencing.
- `VISUAL_MODULES_TECHNICAL_SPEC.md` – per-algorithm details and parameter definitions.
