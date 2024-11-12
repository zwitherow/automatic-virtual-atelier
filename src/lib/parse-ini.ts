import fs from 'node:fs/promises'
import { parse } from 'ini'
import path from 'node:path'

export async function parseIni() {
  let lastPath: string | null = null
  let currentPath =
    process.env.MO_PATH ||
    process.argv
      .slice(2)
      .filter(el => !el.startsWith('--'))
      .join(' ')

  let MO_PATH = ''
  let GAME_PATH = ''
  let PROFILE = ''

  if (!currentPath) {
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error:
        "You must add your MO2 path in the 'Arguments' field in MO2's executable settings for AVA."
    }
  }

  if (!(await fs.stat(currentPath).catch(() => false))) {
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error:
        "The path provided in the 'Arguments' field in MO2's executable settings for AVA does not exist."
    }
  }

  while (currentPath !== lastPath) {
    const files = await fs.readdir(currentPath)

    if (files.includes('ModOrganizer.ini')) {
      MO_PATH = currentPath
      break
    }

    lastPath = currentPath
    currentPath = path.join(currentPath, '..')
  }

  if (!MO_PATH) {
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error: "Couldn't find ModOrganizer.ini"
    }
  }

  const ini = await fs.readFile(path.join(MO_PATH, 'ModOrganizer.ini'), 'utf8')
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
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error: 'Your ModOrganizer.ini appears to be invalid'
    }
  }

  GAME_PATH = config['General']['gamePath'].match(regex)[1]
  PROFILE = config['General']['selected_profile'].match(regex)[1]

  let error: string | null = null

  if (!GAME_PATH) {
    error = "Failed to parse 'gamePath' in ModOrganizer.ini"
  }

  if (!PROFILE) {
    error += "Failed to parse 'selected_profile' in ModOrganizer.ini"
  }

  return { MO_PATH, GAME_PATH, PROFILE, error }
}
