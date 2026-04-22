import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Plugin to copy markdown files from /chapters to dist
function copyMarkdownFiles() {
  return {
    name: 'copy-markdown-files',
    closeBundle() {
      const chaptersDir = resolve(__dirname, '../chapters')
      const distDir = resolve(__dirname, 'dist/chapters')
      
      try {
        mkdirSync(distDir, { recursive: true })
        
        const chapters = [
          'chapter_01_replicators.md',
          'chapter_02_protocells.md',
          'chapter_03_rna_organisms.md',
          'chapter_04_early_cells.md',
          'chapter_05_multicellular.md',
          'chapter_06_sentient_animals.md',
          'chapter_07_representation.md',
          'chapter_08_the_pattern.md',
        ]
        const frontMatter = 'front_matter.md'
        const postscript = 'postscript.md'

        const filesToCopy = [frontMatter, ...chapters, postscript]

        filesToCopy.forEach(filename => {
          copyFileSync(
            resolve(chaptersDir, filename),
            resolve(distDir, filename)
          )
        })

        const unsungHeroesPath = resolve(distDir, 'UNSUNG_HEROES.md')
        const combinedContent = [frontMatter, ...chapters, postscript]
          .map(filename =>
            readFileSync(resolve(chaptersDir, filename), 'utf-8')
          )
          .join('\n\n')

        writeFileSync(unsungHeroesPath, combinedContent)

        console.log('✓ Copied markdown files from /chapters to dist/chapters and built UNSUNG_HEROES.md')
      } catch (error) {
        console.warn('Warning: Could not copy markdown files:', error)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './', // Use relative paths so the app works in any subdirectory
  plugins: [react(), copyMarkdownFiles()],
})
