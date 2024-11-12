import fs from 'node:fs/promises'
import { createSpinner } from 'nanospinner'
import { consola } from 'consola'
import path from 'node:path'
import { generateShops } from './lib/generate-shops'
import { parseIni } from './lib/parse-ini'
import { sizeFormatter, durationFormatter } from 'human-readable'
import { getSettings } from './lib/get-settings'

main()

async function main() {
  console.clear()

  const { ALL_ITEMS_SHOP, ITEM_COST } = await getSettings()

  performance.mark('start')

  let spinner = createSpinner(' Parsing ModOrganizer.ini...').start()

  const { MO_PATH, GAME_PATH, PROFILE, error } = await parseIni()

  if (error) {
    spinner.error(' Error parsing ModOrganizer.ini!\n')
    return exit(error)
  }

  spinner.success(' Validated ModOrganizer.ini\n')

  console.log(' - Game Path:', GAME_PATH)
  console.log(' - MO2 Path:', MO_PATH)
  console.log(' - Profile:', PROFILE, '\n')

  spinner = createSpinner(' Generating shops...').start()

  const { shopsCount, itemsCount, shopsData } = await generateShops(
    MO_PATH,
    PROFILE,
    ALL_ITEMS_SHOP,
    ITEM_COST
  )

  spinner.success(` Added ${itemsCount} items to ${shopsCount} shops\n`)

  const shopsDir = process.env.OUTPUT_MOD
    ? path.join(MO_PATH, 'mods', process.env.OUTPUT_MOD, 'r6', 'scripts')
    : path.join(GAME_PATH, 'r6', 'scripts')

  const shopsPath = path.join(shopsDir, 'ava-generated-shops.reds')

  const formatSize = sizeFormatter()
  const formatDuration = durationFormatter({ allowMultiples: ['s', 'ms'] })

  if (!(await fs.stat(shopsDir).catch(() => false))) {
    await fs.mkdir(shopsDir, { recursive: true })
  }

  await fs.writeFile(shopsPath, shopsData, 'utf8')
  const size = formatSize((await fs.stat(shopsPath)).size) as string

  performance.mark('end')
  const elapsed = performance.measure('Duration', 'start', 'end')
  const duration = formatDuration(elapsed.duration)

  console.log(' - Path:', shopsPath)
  console.log(' - Size:', size)
  console.log(' - Time:', duration, '\n')

  return exit()
}

export function exit(error?: unknown) {
  if ((process.env.MO_PATH || process.argv.includes('--no-pause')) && !error) {
    process.exit(0)
  }

  if (error) {
    consola.error(error)
  }

  console.log('Press any key to exit...')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}
