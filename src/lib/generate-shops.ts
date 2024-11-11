import fs from 'node:fs'
import md5 from 'md5'
import path from 'node:path'
import yaml from 'yaml'
import type { ShopData } from '../types'

export function generateShops(
  MO_PATH: string,
  PROFILE: string,
  ALL_ITEMS_SHOP: boolean,
  ITEM_COST: string
) {
  const header = `@addMethod(gameuiInGameMenuGameController)
protected cb func RegisterStore(event: ref<VirtualShopRegistration>) -> Bool {
`

  const template = `  event.AddStore(
    n"{{storeId}}",
    "{{storeLabel}}",
    {{itemArray}},
    [${ITEM_COST}],
    r"base/gameplay/gui/world/adverts/arasaka/arasaka_atlas.inkatlas",
    n"LOGOLOGO",
    ["Legendary"],
    [0]
  );

`

  const footer = `}`

  const groups = parseModlist(MO_PATH, PROFILE)

  let shopsOutput = ''
  let allItems: string[] = []
  for (const group of groups) {
    const files: string[] = []

    for (const modPath of group.paths) {
      const fullPath = path.join(MO_PATH, 'mods', modPath)
      files.push(...fileListFromDir(fullPath))
    }

    const items: string[] = []

    for (const file of files) {
      items.push(...itemListFromFilePath(file))
    }

    const id = md5(group.label)

    const dedupedItems = removeDedupe(items)

    const output = template
      .replace('{{storeId}}', id)
      .replace('{{storeLabel}}', group.label)
      .replace('{{itemArray}}', JSON.stringify(dedupedItems))

    shopsOutput += output
    allItems.push(...dedupedItems)
  }

  let shopsData = header + shopsOutput

  const allItemsUnique = [...new Set(allItems)]

  if (ALL_ITEMS_SHOP) {
    const allItemsOutput = template
      .replace('{{storeId}}', 'avaAllItemsStore')
      .replace('{{storeLabel}}', '! All Items (AVA)')
      .replace('{{itemArray}}', JSON.stringify(allItemsUnique))

    shopsData += allItemsOutput
  }

  shopsData += footer

  return {
    shopsCount: groups.length,
    itemsCount: allItemsUnique.length,
    shopsData
  }
}

function parseModlist(MO_PATH: string, PROFILE: string) {
  const modlistPath = path.join(MO_PATH, 'profiles', PROFILE, 'modlist.txt')

  const modlist = fs
    .readFileSync(modlistPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .filter(line => line.startsWith('+') || line.endsWith('_separator'))
    .map(line => line.substring(1))
    .reverse()

  let result: ShopData[] = []
  let currentObj: ShopData | null = null

  modlist.forEach(item => {
    if (item.includes('_separator')) {
      if (currentObj) {
        result.push(currentObj)
      }
      currentObj = {
        label: item.replace('_separator', '').trim(),
        paths: []
      }
    } else {
      if (currentObj) {
        currentObj.paths.push(item)
      }
    }
  })

  if (currentObj) {
    result.push(currentObj)
  }

  return result
    .filter(obj => obj.label.startsWith('AVA '))
    .map(obj => ({
      label: obj.label.replace('AVA ', '').concat(' (AVA)'),
      paths: obj.paths
    }))
}

function fileListFromDir(dir: string) {
  return fs
    .readdirSync(dir, { recursive: true })
    .filter(file => typeof file === 'string')
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    .map(file => path.join(dir, file))
}

function itemListFromFilePath(filepath: string) {
  const file = fs.readFileSync(filepath, 'utf8')

  const parsed = yaml.parse(dedupeNodes(file), {
    logLevel: 'silent',
    maxAliasCount: -1,
    schema: 'failsafe'
  })

  const items: string[] = []
  const regex = /\$[({]([^)}]*)[)}]/g

  for (const key in parsed) {
    if (!key.startsWith('Items.')) continue
    if (!parsed[key].entityName) continue

    const matches = key.match(regex)

    if (matches === null) {
      items.push(key)
      continue
    }

    if (!parsed[key]['$instances']) continue

    const instances = parsed[key]['$instances']

    for (const instance of instances) {
      const item = key.replace(regex, (_match, group) => {
        return instance[group]
      })

      items.push(item)
    }
  }

  return items
}

function dedupeNodes(yaml: string) {
  const regex = /^Items.[^:]*:/

  return yaml
    .split('\n')
    .map(line => {
      if (!line.match(regex)) return line

      return line.replace(
        ':',
        `_ava_dedupe_${Math.random().toString(36).substring(2)}:`
      )
    })
    .join('\n')
}

function removeDedupe(items: string[]) {
  return [...new Set(items.map(item => item.replace(/_ava_dedupe_.*/, '')))]
}
