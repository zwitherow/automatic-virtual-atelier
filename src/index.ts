import fs from 'fs-extra'
import ora from 'ora'
import path from 'path'
import { generateShops } from './lib/generate-shops'
import { parseIni } from './lib/parse-ini'

const GENERATE_FILES = true

main()

function main() {
  let spinner = ora('Parsing ModOrganizer.ini...').start()

  const { MO_PATH, GAME_PATH, PROFILE } = parseIni()

  if (MO_PATH === null) {
    spinner.fail('Failed to find ModOrganizer.ini')
    exit()
    return
  }

  if (GAME_PATH === null || PROFILE === null) {
    spinner.fail('Failed to parse ModOrganizer.ini')
    exit()
    return
  }

  spinner.succeed('Validated ModOrganizer.ini')

  console.log(
    '\nGame Path:',
    GAME_PATH,
    '\nMO Path:',
    MO_PATH,
    '\nProfile:',
    PROFILE,
    '\n'
  )

  spinner = ora('Generating shops...').start()

  const shops = generateShops(MO_PATH, PROFILE)

  spinner.succeed('Generated shops')

  const shopsDir = path.join(GAME_PATH, 'r6', 'scripts')
  const shopsPath = path.join(shopsDir, 'ava-generated-shops.reds')

  if (GENERATE_FILES) {
    fs.ensureDirSync(shopsDir)

    fs.writeFileSync(shopsPath, shops, 'utf8')

    console.log('\nShops written to file:')
  } else {
    console.log('\nShops NOT written to file (GENERATE_FILES is false):')
  }

  console.log('\n - Path:', shopsPath, '\n - Length:', shops.length)

  exit()
  return
}

export function exit() {
  console.log('\nAll finished. Press any key to exit...')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}
