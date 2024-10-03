import 'dotenv/config'
import { ensureDirSync, writeFileSync, statSync } from 'fs-extra'
import ora from 'ora'
import path from 'path'
import { generateShops } from './lib/generate-shops'
import { parseIni } from './lib/parse-ini'
import { sizeFormatter, durationFormatter } from 'human-readable'

main()

function main() {
  const startTime = Date.now()

  let spinner = ora('Parsing ModOrganizer.ini...').start()

  const result = parseIni()

  if (result === null) {
    spinner.fail('No path argument provided!')

    console.log(
      "\n - You must add your MO2 path in the 'Arguments' field in MO2's executables settings for AVA.\n"
    )

    exit()
    return
  }

  const { MO_PATH, GAME_PATH, PROFILE } = result

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

  console.log('')
  console.log(' - Game Path:', GAME_PATH)
  console.log(' - MO2 Path:', MO_PATH)
  console.log(' - Profile:', PROFILE)
  console.log('')

  spinner = ora('Generating shops...').start()

  const shops = generateShops(MO_PATH, PROFILE)

  spinner.succeed('Generated shops')

  const shopsDir =
    process.env.NODE_ENV === 'development'
      ? path.join(MO_PATH, 'mods', process.env.OUTPUT_MOD!, 'r6', 'scripts')
      : path.join(GAME_PATH, 'r6', 'scripts')

  const shopsPath = path.join(shopsDir, 'ava-generated-shops.reds')

  const formatSize = sizeFormatter()
  const formatDuration = durationFormatter({ allowMultiples: ['s', 'ms'] })

  let size: string

  ensureDirSync(shopsDir)
  writeFileSync(shopsPath, shops, 'utf8')
  size = formatSize(statSync(shopsPath).size) as string

  const duration = formatDuration(Date.now() - startTime) as string

  console.log('\n - Path:', shopsPath)
  console.log(' - Size:', size)
  console.log(' - Time:', duration, '\n')

  exit()
  return
}

function exit() {
  if (process.env.NODE_ENV === 'development') {
    process.exit(0)
  }

  console.log('Press any key to exit...')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}
