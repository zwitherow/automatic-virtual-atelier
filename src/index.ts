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

  let spinner = ora(' Parsing ModOrganizer.ini...').start()

  const { MO_PATH, GAME_PATH, PROFILE, error } = parseIni()

  if (error) {
    spinner.fail(' Error parsing ModOrganizer.ini!\n')
    console.log(error)

    exit()
    return
  }

  spinner.succeed(' Validated ModOrganizer.ini\n')

  console.log(' - Game Path:', GAME_PATH)
  console.log(' - MO2 Path:', MO_PATH)
  console.log(' - Profile:', PROFILE, '\n')

  spinner = ora(' Generating shops...').start()

  const { shopsCount, itemsCount, shopsData } = generateShops(MO_PATH, PROFILE)

  spinner.succeed(` Added ${itemsCount} items to ${shopsCount} shops\n`)
  const shopsDir =
    process.env.NODE_ENV === 'development'
      ? path.join(MO_PATH, 'mods', process.env.OUTPUT_MOD!, 'r6', 'scripts')
      : path.join(GAME_PATH, 'r6', 'scripts')

  const shopsPath = path.join(shopsDir, 'ava-generated-shops.reds')

  const formatSize = sizeFormatter()
  const formatDuration = durationFormatter({ allowMultiples: ['s', 'ms'] })

  let size: string

  ensureDirSync(shopsDir)
  writeFileSync(shopsPath, shopsData, 'utf8')
  size = formatSize(statSync(shopsPath).size) as string

  const duration = formatDuration(Date.now() - startTime) as string

  console.log(' - Path:', shopsPath)
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
