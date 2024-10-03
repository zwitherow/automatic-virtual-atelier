import fs from 'fs-extra'
import { parse } from 'ini'
import path from 'path'

export function parseIni() {
  let lastPath: string | null = null
  let currentPath =
    process.env.NODE_ENV === 'development'
      ? process.env.MO_PATH
      : process.argv.slice(2).join(' ')

  if (!currentPath) {
    return null
  }

  let MO_PATH: string | null = null
  let GAME_PATH: string | null = null
  let PROFILE: string | null = null

  while (currentPath !== lastPath) {
    const files = fs.readdirSync(currentPath)

    if (files.includes('ModOrganizer.ini')) {
      MO_PATH = currentPath
      break
    }

    lastPath = currentPath
    currentPath = path.join(currentPath, '..')
  }

  if (!MO_PATH) {
    return { MO_PATH, GAME_PATH, PROFILE }
  }

  const ini = fs.readFileSync(path.join(MO_PATH, 'ModOrganizer.ini'), 'utf8')
  const config = parse(ini)

  const regex = /@ByteArray\(([^)]*)\)/

  if (
    !config ||
    !config['General'] ||
    !config['General']['gameName'] ||
    !config['General']['gamePath'] ||
    config['General']['gameName'] !== 'Cyberpunk 2077' ||
    !regex.test(config['General']['gamePath']) ||
    !config['General']['selected_profile'] ||
    !regex.test(config['General']['selected_profile'])
  ) {
    return { MO_PATH, GAME_PATH, PROFILE }
  }

  GAME_PATH = config['General']['gamePath'].match(regex)[1]
  PROFILE = config['General']['selected_profile'].match(regex)[1]

  return { MO_PATH, GAME_PATH, PROFILE }
}
