# Automatic Virtual Atelier

Automatically generate Virtual Atelier shops for installed mods based on separators in Mod Organizer.

## Installation

1. Download from releases and install as a mod in MO2. Ignore the warnings about directory structure. You can leave AVA.exe in the root directory or move it to a subdirectory, ex: `tools/AVA.exe`
2. Create an empty mod for the output of the executable, ex: `AVA Output`
3. On the right hand side of MO2, open the **Data** tab
4. Right click the newly added **AVA.exe** and select **Add as Executable**
5. Press `Ctrl + E` to open the Modify Executables window
6. Select **AVA** in the list
7. Copy the text inside the **Start in** field and paste it into the **Arguments** field
8. Tick the **Create files in mod instead of overwrite** option and select the empty mod you created in step 2

## Usage

Organize your mods that add ArchiveXL items into separators that begin with **AVA**, ex:

- `AVA Weapons`
- `AVA Cyberware`
- `AVA Clothing`

The separators _MUST_ begin with **AVA and then a space**.

Now just run the executable from MO2 by selecting **AVA** in the executables dropdown and clicking **Run**. AVA will generate `r6/scripts/ava-generated-shops.reds` in your selected output mod (or your overwrite if you skipped steps 2 and 8). This will create a shop for each separator as well as a single shop containing all items.

### Arguments

```
$ AVA [--no-prompt] [--no-pause] <mo2path>
```

- `--no-prompt` - Skip the interactive prompts if `AVA.ini` exists and is valid
- `--no-pause` - Automatically exit if there are no errors
- `mo2path` - Path to your MO2 root directory or a subdirectory (AVA will traverse upwards until `ModOrganizer.ini` is found)

## Uninstall

Remove the mod and the output mod you created in step 2 from Mod Organizer. If you didn't create an output mod, delete `r6/scripts/ava-generated-shops.reds` from your overwrite.

## How it works

The executable takes your MO2 installation directory (or a subfolder) as an argument and looks for `ModOrganizer.ini`, traversing up the tree until it finds it.

It parses the INI file to determine the game path and current MO profile. It then parses `<mo dir>/profiles/<current profile>/modlist.txt` to get the separators and associated mods.

It then parses all the contained YAML files to get the added items (and instances).

## Build it yourself

### Requirements

You need the following to bundle the JS app:

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/)

### Build steps

Clone the repo

```
git clone https://github.com/zwitherow/automatic-virtual-atelier.git
```

CD into the directory

```
cd automatic-virtual-atelier
```

Install dependencies

```
npm i
```

Build the executable

```
npm run pkg
```

You should now have an EXE located at `bin/AVA.exe`

## Development

Copy `example.env` to `.env` and update `MO_PATH` with your MO2 path. This needs to be the directory that contains `ModOrganizer.ini`. Rename `OUTPUT_MOD` to whatever you called your output mod.

Run in watch mode (uses settings in `.env`)

```
npm run dev
```

Bundle the JS app

```
npm run build
```

Run the JS app (uses settings in `.env`)

```
npm run start
```

Your `.env` settings will not be used when building the executable.
