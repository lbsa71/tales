/**
 * Cellular Automata Module
 * 
 * Rung 4: Early cells
 * Visual: Simple grid with gliders and stable patterns, sparse and slow
 * 
 * Algorithm: Conway's Game of Life or variants (HighLife, Seeds)
 * Creates emergent patterns from simple rules about cell birth and survival.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Cellular Automata specific configuration
 */
interface CellularAutomataConfig extends VisualModuleConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  birthRule: number[];
  survivalRule: number[];
  updateInterval: number;
  initialDensity: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  showGrid: boolean;
  gridOpacity: number;
  cellGlow: number;
  /**
   * Small probability that a living cell will randomly die after each generation.
   * Adds gentle "metabolic noise" so the grid doesn't freeze into perfectly static patterns.
   */
  randomDeathProbability: number;
  /**
   * Chance (per generation) to inject one or more small stable/oscillating patterns
   * at random positions. Keeps the field feeling alive over long sessions.
   */
  patternInjectionChance: number;
}

/**
 * Cell state with visual properties
 */
interface Cell {
  alive: boolean;
  age: number;
  fadeAlpha: number;
}

export class CellularAutomataModule extends BaseVisualModule {
  private grid: Cell[][] = [];
  private nextGrid: Cell[][] = [];
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private timeSinceLastUpdate: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;

  protected getDefaultConfig(): CellularAutomataConfig {
    return {
      primaryColor: '#5a9b8e',
      secondaryColor: '#3a6b5e',
      accentColor: '#8dc5ba',
      opacity: 0.4,
      speed: 0.4,
      density: 0.15,
      complexity: 0.3,
      gridWidth: 40,
      gridHeight: 30,
      cellSize: 18,
      birthRule: [3],
      survivalRule: [2, 3],
      updateInterval: 800,
      initialDensity: 0.15,
      fadeInDuration: 200,
      fadeOutDuration: 400,
      showGrid: true,
      gridOpacity: 0.1,
      cellGlow: 0.3,
      randomDeathProbability: 0.003,
      patternInjectionChance: 0.08,
    };
  }

  protected onInit(): void {
    const config = this.config as CellularAutomataConfig;
    this.gridWidth = config.gridWidth;
    this.gridHeight = config.gridHeight;

    // Initialize grids
    this.initializeGrids();
    
    // Seed with random pattern or interesting configurations
    this.seedPattern();
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as CellularAutomataConfig;
    
    this.timeSinceLastUpdate += deltaTime;

    // Update cell states on interval
    if (this.timeSinceLastUpdate >= config.updateInterval) {
      this.timeSinceLastUpdate = 0;
      this.updateGeneration();
      this.applyRandomCellDeaths();
      this.maybeInjectRandomPatterns();
    }

    // Update cell fade animations
    this.updateCellFades(deltaTime);
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as CellularAutomataConfig;
    const { width, height } = this.getCanvasSize();

    // Calculate offset to center the grid
    this.offsetX = (width - this.gridWidth * config.cellSize) / 2;
    this.offsetY = (height - this.gridHeight * config.cellSize) / 2;

    // Clear canvas
    this.clearCanvas();

    // Apply global opacity
    this.ctx.globalAlpha = config.opacity;

    // Draw grid lines if enabled
    if (config.showGrid) {
      this.drawGrid();
    }

    // Draw cells
    this.drawCells();

    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  protected onDestroy(): void {
    this.grid = [];
    this.nextGrid = [];
  }

  protected onConfigUpdate(config: Partial<VisualModuleConfig>): void {
    const caConfig = config as Partial<CellularAutomataConfig>;
    
    // If grid size changes, reinitialize
    if (caConfig.gridWidth !== undefined || caConfig.gridHeight !== undefined) {
      this.gridWidth = caConfig.gridWidth || this.gridWidth;
      this.gridHeight = caConfig.gridHeight || this.gridHeight;
      this.initializeGrids();
      this.seedPattern();
    }
  }

  protected onReset(): void {
    this.initializeGrids();
    this.seedPattern();
    this.timeSinceLastUpdate = 0;
  }

  protected onResize(width: number, height: number): void {
    // Suppress unused parameter warnings
    void width;
    void height;
    // Grid maintains its own size, just re-centers
  }

  /**
   * Initialize grid structures
   */
  private initializeGrids(): void {
    this.grid = [];
    this.nextGrid = [];

    for (let y = 0; y < this.gridHeight; y++) {
      this.grid[y] = [];
      this.nextGrid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x] = {
          alive: false,
          age: 0,
          fadeAlpha: 0,
        };
        this.nextGrid[y][x] = {
          alive: false,
          age: 0,
          fadeAlpha: 0,
        };
      }
    }
  }

  /**
   * Seed the grid with initial pattern
   */
  private seedPattern(): void {
    const config = this.config as CellularAutomataConfig;

    // Random sparse pattern
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (Math.random() < config.initialDensity) {
          this.grid[y][x].alive = true;
          this.grid[y][x].age = 0;
          this.grid[y][x].fadeAlpha = 0;
        }
      }
    }

    // Add some known interesting patterns (gliders, blinkers)
    this.addGlider(5, 5);
    this.addGlider(this.gridWidth - 10, 5);
    this.addBlinker(this.gridWidth / 2, this.gridHeight / 2);
  }

  /**
   * Add a glider pattern
   */
  private addGlider(x: number, y: number): void {
    const pattern = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ];

    this.addPattern(x, y, pattern);
  }

  /**
   * Add a blinker pattern
   */
  private addBlinker(x: number, y: number): void {
    const pattern = [
      [1, 1, 1],
    ];

    this.addPattern(x, y, pattern);
  }
  /**
   * Add a simple 2x2 block still-life pattern
   */
  private addBlock(x: number, y: number): void {
    const pattern = [
      [1, 1],
      [1, 1],
    ];

    this.addPattern(x, y, pattern);
  }

  /**
   * Add a pattern to the grid
   */
  private addPattern(x: number, y: number, pattern: number[][]): void {
    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[py].length; px++) {
        const gx = x + px;
        const gy = y + py;
        if (gx >= 0 && gx < this.gridWidth && gy >= 0 && gy < this.gridHeight) {
          if (pattern[py][px] === 1) {
            this.grid[gy][gx].alive = true;
            this.grid[gy][gx].age = 0;
            this.grid[gy][gx].fadeAlpha = 0;
          }
        }
      }
    }
  }

  /**
   * Update to next generation using cellular automata rules
   */
  private updateGeneration(): void {
    const config = this.config as CellularAutomataConfig;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const neighbors = this.countNeighbors(x, y);
        const cell = this.grid[y][x];
        const nextCell = this.nextGrid[y][x];

        if (cell.alive) {
          // Survival rule
          nextCell.alive = config.survivalRule.indexOf(neighbors) !== -1;
          nextCell.age = nextCell.alive ? cell.age + 1 : 0;
        } else {
          // Birth rule
          nextCell.alive = config.birthRule.indexOf(neighbors) !== -1;
          nextCell.age = 0;
        }

        // Initialize fade alpha for newly born/dead cells
        if (cell.alive !== nextCell.alive) {
          nextCell.fadeAlpha = 0;
        } else {
          nextCell.fadeAlpha = cell.fadeAlpha;
        }
      }
    }

    // Swap grids
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }
  /**
   * Occasionally remove random living cells to prevent the field from
   * settling into perfectly static, unchanging configurations.
   */
  private applyRandomCellDeaths(): void {
    const config = this.config as CellularAutomataConfig;

    if (config.randomDeathProbability <= 0) return;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cell = this.grid[y][x];

        if (cell.alive && Math.random() < config.randomDeathProbability) {
          cell.alive = false;
          cell.age = 0;
          // Keep existing fadeAlpha so the cell can gracefully fade out
        }
      }
    }
  }

  /**
   * With a small probability each generation, inject one or two small
   * patterns (gliders, blinkers, or blocks) at random positions so that
   * new structure keeps appearing over long reads.
   */
  private maybeInjectRandomPatterns(): void {
    const config = this.config as CellularAutomataConfig;

    if (config.patternInjectionChance <= 0) return;
    if (Math.random() >= config.patternInjectionChance) return;

    const patternTypes = ['glider', 'blinker', 'block'] as const;
    const patternCount = 1 + Math.floor(Math.random() * 2); // 1–2 patterns

    for (let i = 0; i < patternCount; i++) {
      const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];
      const margin = 4; // keep away from exact edges
      const x = Math.floor(Math.random() * (this.gridWidth - margin * 2)) + margin;
      const y = Math.floor(Math.random() * (this.gridHeight - margin * 2)) + margin;

      switch (type) {
        case 'glider':
          this.addGlider(x, y);
          break;
        case 'blinker':
          this.addBlinker(x, y);
          break;
        case 'block':
          this.addBlock(x, y);
          break;
      }
    }
  }

  /**
   * Count living neighbors for a cell
   */
  private countNeighbors(x: number, y: number): number {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = (x + dx + this.gridWidth) % this.gridWidth;
        const ny = (y + dy + this.gridHeight) % this.gridHeight;

        if (this.grid[ny][nx].alive) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Update fade animations for cells
   */
  private updateCellFades(deltaTime: number): void {
    const config = this.config as CellularAutomataConfig;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cell = this.grid[y][x];
        const targetAlpha = cell.alive ? 1 : 0;
        const fadeDuration = cell.alive ? config.fadeInDuration : config.fadeOutDuration;
        const fadeStep = deltaTime / fadeDuration;

        if (cell.fadeAlpha < targetAlpha) {
          cell.fadeAlpha = Math.min(targetAlpha, cell.fadeAlpha + fadeStep);
        } else if (cell.fadeAlpha > targetAlpha) {
          cell.fadeAlpha = Math.max(targetAlpha, cell.fadeAlpha - fadeStep);
        }
      }
    }
  }

  /**
   * Draw grid lines
   */
  private drawGrid(): void {
    if (!this.ctx) return;

    const config = this.config as CellularAutomataConfig;

    this.ctx.strokeStyle = config.secondaryColor;
    this.ctx.globalAlpha = config.gridOpacity * config.opacity;
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= this.gridWidth; x++) {
      const px = this.offsetX + x * config.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(px, this.offsetY);
      this.ctx.lineTo(px, this.offsetY + this.gridHeight * config.cellSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridHeight; y++) {
      const py = this.offsetY + y * config.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, py);
      this.ctx.lineTo(this.offsetX + this.gridWidth * config.cellSize, py);
      this.ctx.stroke();
    }
  }

  /**
   * Draw cells
   */
  private drawCells(): void {
    if (!this.ctx) return;

    const config = this.config as CellularAutomataConfig;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cell = this.grid[y][x];
        
        if (cell.fadeAlpha > 0) {
          const cx = this.offsetX + x * config.cellSize + config.cellSize / 2;
          const cy = this.offsetY + y * config.cellSize + config.cellSize / 2;
          
          // Calculate alpha based on age and fade
          const ageRatio = Math.min(cell.age / 10, 1);
          const alpha = cell.fadeAlpha * (0.5 + ageRatio * 0.5);

          // Draw glow
          if (config.cellGlow > 0) {
            const glowRadius = config.cellSize * 0.8;
            const alphaHex = Math.floor(alpha * config.cellGlow * 255).toString(16);
            const alphaHexPadded = alphaHex.length === 1 ? '0' + alphaHex : alphaHex;
            const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
            gradient.addColorStop(0, `${config.accentColor}${alphaHexPadded}`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
              cx - glowRadius,
              cy - glowRadius,
              glowRadius * 2,
              glowRadius * 2
            );
          }

          // Draw cell
          const cellRadius = config.cellSize * 0.35;
          this.ctx.fillStyle = config.primaryColor;
          this.ctx.globalAlpha = alpha * config.opacity;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, cellRadius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * Handle user interactions - toggle cells or spawn patterns at touch point
   */
  protected onInteraction(event: InteractionEvent): void {
    if (!this.grid || this.grid.length === 0) return;

    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      const config = this.config as CellularAutomataConfig;
      
      // Convert screen coordinates to grid coordinates
      const { width, height } = this.getCanvasSize();
      const gridX = Math.floor((event.point.x / width) * config.gridWidth);
      const gridY = Math.floor((event.point.y / height) * config.gridHeight);

      // Spawn a glider or random pattern at the interaction point
      const patterns = [
        // Glider
        [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        // Blinker
        [[0, 0], [0, 1], [0, 2]],
        // Block
        [[0, 0], [0, 1], [1, 0], [1, 1]],
      ];
      
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      for (const [dx, dy] of pattern) {
        const x = (gridX + dx + config.gridWidth) % config.gridWidth;
        const y = (gridY + dy + config.gridHeight) % config.gridHeight;
        
        if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length) {
          this.grid[y][x].alive = true;
          this.grid[y][x].age = 0;
          this.grid[y][x].fadeAlpha = 1;
        }
      }

      // Emit event for audio synchronization
      this.emitEvent({
        type: 'pattern-emerged',
        timestamp: event.timestamp,
        data: { x: gridX, y: gridY, patternType: 'spawned' },
      });
    }
  }
}
