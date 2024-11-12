import { consola } from 'consola'
import fs from 'node:fs/promises'
import { parse, stringify } from 'ini'

export async function getSettings() {
  const saved = await getSavedSettings()

  if (saved) {
    if (process.argv.includes('--no-prompt')) {
      return saved
    }

    const useSaved = await consola.prompt(
      'AVA.ini found. Use saved settings?',
      { type: 'confirm' }
    )

    if (useSaved) {
      console.clear()
      return saved
    }
  }

  const ALL_ITEMS_SHOP = await consola.prompt(
    'Do you want AVA to create an additional shop containing all items?',
    { type: 'confirm' }
  )

  let ITEM_COST = '0'

  const useStaticCost = await consola.prompt(
    'Do you want to set a default cost for all items?',
    { type: 'confirm' }
  )

  if (useStaticCost) {
    ITEM_COST = await getStaticCost()
  }

  const save = await consola.prompt('Do you want to save these settings?', {
    type: 'confirm'
  })

  if (save) {
    const config = stringify({ ALL_ITEMS_SHOP, ITEM_COST })
    fs.writeFile('AVA.ini', config, 'utf-8')
  }

  console.clear()
  return { ALL_ITEMS_SHOP, ITEM_COST }
}

async function getSavedSettings() {
  const iniExists = !!(await fs.stat('AVA.ini').catch(() => false))
  if (!iniExists) {
    return null
  }

  const settings = parse(await fs.readFile('AVA.ini', 'utf-8'))

  if (
    settings.ALL_ITEMS_SHOP === undefined ||
    typeof settings.ALL_ITEMS_SHOP !== 'boolean'
  ) {
    return null
  }

  if (
    settings.ITEM_COST === undefined ||
    typeof settings.ITEM_COST !== 'string' ||
    isNaN(Number(settings.ITEM_COST))
  ) {
    return null
  }

  return {
    ALL_ITEMS_SHOP: settings.ALL_ITEMS_SHOP,
    ITEM_COST: settings.ITEM_COST
  }
}

async function getStaticCost() {
  const input = await consola.prompt('Enter the default cost for all items', {
    type: 'text'
  })

  if (isNaN(Number(input))) {
    consola.error('Invalid number')
    return getStaticCost()
  }

  return input
}
