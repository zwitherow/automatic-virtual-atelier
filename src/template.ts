export const header = `@addMethod(gameuiInGameMenuGameController)
protected cb func RegisterStore(event: ref<VirtualShopRegistration>) -> Bool {
`

export const template = `  event.AddStore(
    n"{{storeId}}",
    "{{storeLabel}}",
    {{itemArray}},
    [500],
    r"base/gameplay/gui/world/adverts/arasaka/arasaka_atlas.inkatlas",
    n"LOGOLOGO",
    ["Legendary"],
    [0]
  );

`

export const footer = `}`
