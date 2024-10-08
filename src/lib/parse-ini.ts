import { existsSync, readdirSync, readFileSync } from 'fs-extra'
import { parse } from 'ini'
import path from 'path'

export function parseIni() {
  let lastPath: string | null = null
  let currentPath = process.argv.includes('--dev')
    ? process.env.MO_PATH
    : process.argv.slice(2).join(' ')

  let MO_PATH = ''
  let GAME_PATH = ''
  let PROFILE = ''

  if (!currentPath) {
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error:
        " ! You must add your MO2 path in the 'Arguments' field in MO2's executable settings for AVA.\n"
    }
  }

  if (!existsSync(currentPath)) {
    return {
      MO_PATH,
      GAME_PATH,
      PROFILE,
      error:
        " ! The path provided in the 'Arguments' field in MO2's executable settings for AVA does not exist.\n"
    }
  }

  while (currentPath !== lastPath) {
    const files = readdirSync(currentPath)

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
      error: " ! Couldn't find ModOrganizer.ini\n"
    }
  }

  const ini = readFileSync(path.join(MO_PATH, 'ModOrganizer.ini'), 'utf8')
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
      error: ' ! Your ModOrganizer.ini appears to be invalid\n'
    }
  }

  GAME_PATH = config['General']['gamePath'].match(regex)[1]
  PROFILE = config['General']['selected_profile'].match(regex)[1]

  let error: string | null = null

  if (!GAME_PATH) {
    error = " ! Failed to parse 'gamePath' in ModOrganizer.ini\n"
  }

  if (!PROFILE) {
    error += " ! Failed to parse 'selected_profile' in ModOrganizer.ini\n"
  }

  return { MO_PATH: MO_PATH, GAME_PATH, PROFILE, error }
}
