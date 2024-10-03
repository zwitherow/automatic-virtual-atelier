import type { Options } from 'tsup'

export const tsup: Options = {
  clean: true,
  entryPoints: ['src/index.ts'],
  format: ['cjs'],
  minify: true,
  treeshake: true
}
