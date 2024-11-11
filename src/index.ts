import 'dotenv/config'
import fs from 'node:fs'
import ora from 'ora'
import path from 'node:path'
import { generateShops } from './lib/generate-shops'
import { parseIni } from './lib/parse-ini'
import { sizeFormatter, durationFormatter } from 'human-readable'
import { getSettings } from './lib/get-settings'

main()

async function main() {
  console.clear()

  const { ALL_ITEMS_SHOP, ITEM_COST } = await getSettings()

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

  const { shopsCount, itemsCount, shopsData } = generateShops(
    MO_PATH,
    PROFILE,
    ALL_ITEMS_SHOP,
    ITEM_COST
  )

  spinner.succeed(` Added ${itemsCount} items to ${shopsCount} shops\n`)
  const shopsDir = process.argv.includes('--dev')
    ? path.join(MO_PATH, 'mods', process.env.OUTPUT_MOD!, 'r6', 'scripts')
    : path.join(GAME_PATH, 'r6', 'scripts')

  const shopsPath = path.join(shopsDir, 'ava-generated-shops.reds')

  const formatSize = sizeFormatter()
  const formatDuration = durationFormatter({ allowMultiples: ['s', 'ms'] })

  if (!fs.existsSync(shopsDir)) {
    fs.mkdirSync(shopsDir, { recursive: true })
  }

  fs.writeFileSync(shopsPath, shopsData, 'utf8')
  const size = formatSize(fs.statSync(shopsPath).size) as string

  const duration = formatDuration(Date.now() - startTime) as string

  console.log(' - Path:', shopsPath)
  console.log(' - Size:', size)
  console.log(' - Time:', duration, '\n')

  exit()
  return
}

function exit() {
  if (process.argv.includes('--watch')) {
    process.exit(0)
  }

  console.log('Press any key to exit...')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}
