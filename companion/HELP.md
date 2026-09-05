Canon PTZ

## This module supports the following Canon PTZ cameras:

**CR-N100, CR-N300, CR-N350, CR-N400, CR-N500, CR-N700, CR-X300, CR-X500**

Model capabilities follow the feature tables in Canon's XC Protocol Specifications (BPE-7216-011). A few notes on the newer models:

- On the CR-N100, CR-N350 and CR-N400 the ND filter value is read-only. Use **Exposure - ND Filter Mode** (Assist / Fixed) to control it; the ND filter value is still reported as a variable.
- The CR-N350 and CR-N400 have no Scene shooting mode and no Av/Tv exposure modes, and their gain tops out at 30.0 dB.
- The CR-N350 and CR-N400 add Advanced Zoom, Spot (Touch) AF, gain increment, and iris increment/fine controls.
- The CR-N100 adds Scene mode selection.
- The EOS C80 is supported as its own model. Cinema EOS bodies have no digital zoom mode — only the digital teleconverter — so **Digital Zoom On/Off** is not offered; use **Digital Magnification** instead. Their gain reaches 54.0 dB and exposure is manual-only.

It also supports the following Canon XF series cameras:

**XF-605**

Other devices using the XC protocol may be supported by using the "Other" model type in the list. Try it out!

## Actions

It is recommended to use the presets as much as possible as there are a lot of actions, variables, and feedbacks that work together.

The actions are separated into the following categories:

**System**

- Power Off
- Power On
- Power Toggle
- Set Camera Name
- Tally Off (PVW/PGM)
- Tally On (PVW/PGM)
- Tally Toggle
- Digital Zoom On/Off
- Digital Magnification On/Off
- Digital Magnification Value
- Image Stabilization On/Off
- Send Custom Command
- Change Module IP

**Pan/Tilt**

- Up, Down, Left, Right, UpLeft, UpRight, DownLeft, DownRight
- Pan/Tilt Home
- Pan/Tilt Speed Up
- Pan/Tilt Speed Down
- Set Pan/Tilt Speed
- Pan/Tilt Initialization

**Lens**

- Zoom In
- Zoom Out
- Set Zoom Speed
- Zoom Speed Up
- Zoom Speed Down
- Focus Far, Focus Near
- Set Focus Speed
- Focus Speed Up
- Focus Speed Down
- Focus Mode (Auto/Manual Focus)
- One Shot Auto Focus (OSAF)
- Spot (Touch) Auto Focus — CR-N350/CR-N400
- Soft Zoom Control — CR-N100/CR-N350/CR-N400
- Face Detection AF (Off / Face Only / Face Catch)

**Exposure**

- Set Exposure Mode (F. Auto, Program, Av, Tv, Manual)
- Set Shutter Mode (Auto/Manual)
- Shutter Up
- Shutter Down
- Set Shutter
- Iris Up
- Iris Down
- Set Iris
- Iris Mode (Auto/Manual Iris)
- Gain Up
- Gain Down
- Set Gain
- ND Filter Up — not on CR-N100/CR-N350/CR-N400, where the ND filter is read-only
- ND Filter Down — as above
- Set ND Filter — as above
- ND Filter Mode (Assist/Fixed) — CR-N100/CR-N350/CR-N400
- Scene Mode — CR-N100
- Gain Increment (Normal/Fine) — CR-N350/CR-N400
- Iris Increment (1/3, 1/4 Stop) — CR-N350/CR-N400
- Iris Fine On/Off — CR-N350/CR-N400
- Pedestal Up
- Pedestal Down
- Set Pedestal (Black Level)

**Picture**

- Set Sharpness, Sharpness Up, Sharpness Down (-10 to 50)
- Set Noise Reduction (0-12) — CR-N100/CR-N300/CR-N500/CR-X300 only

**White Balance**

- Set White Balance Mode
- White Balance Calibration
- Kelvin Up
- Kelvin Down
- Set Kelvin Value
- Red Gain Up
- Red Gain Down
- Set Red Gain
- Blue Gain Up
- Blue Gain Down
- Set Blue Gain

**Save presets**

- Save Preset 1-100, with options to set name and settings to save (ptz, focus, exposure, etc.)
- "Where the save options come from" chooses how a Save Preset button decides what to write:
  - **This button** — the checkboxes on the button itself. This is the default and how Save Preset has always worked.
  - **Module toggles** — the module's own switches, shared by every Save button pointed at them. Flip them with the **Preset - Set Save Option** action (each option, or All, set On/Off/Toggle). Nothing has to be created first: the toggles ship with the module, default to all on, read back as the `savePresetOption_*` variables, and are remembered across a restart.
  - **Variables** — point each option at any variable holding true/false, 1/0, yes/no or on/off.
- The **Preset Save Options** preset category has a ready-made switch per option (green when that option is being saved, dark when it is not), an All button, and a summary button. Drop them on a page next to any Save Preset button set to "Module toggles" to pick what a save writes without editing that button again.
- (Module toggles for the save options were written with @claude.)

**Recall Presets**

- Recall Preset 1-100
- Set Preset Playback Mode Normal
- Set Preset Playback Time
- Set Preset Playback Speed

**Traces**

- Prepare
- Start
- Stop
- Run Custom Trace

## Variables

A list of all the available Variables in this module sorted into the following categories. For their correct naming, refer to the list under "Edit" "Instance".

**System**

- PTZ Series
- PTZ Model
- Camera Name
- Power State
- Tally Program State
- Tally Preview State
- Digital Zoom On/Off
- Image Stabilization On/Off
- Firmware Version
- Protocol Version

**Lens**

- Zoom Speed
- Focus Speed
- Focus Value
- Auto Focus Mode

**Pan/Tilt**

- Pan/Tilt Speed Value

**Exposure**

- Exposure Shooting Mode (Auto, Manual, Scene)
- Exposure Mode (Auto, Av, Tv, Manual)
- Shutter Mode
- Shutter Value
- Iris Mode
- Iris Value
- Gain Mode
- Gain Value
- ND Filter Value
- Pedestal Value

**White Balance**

- White Balance Mode
- Kelvin Value
- Red Gain Value
- Blue Gain Value

**Presets**

- Preset Names
- Last Preset Recalled
- Preset Recall Mode
- Preset Time Value
- Preset Speed Value
- Save Preset Option ON/OFF, one per option (`savePresetOption_ptz`, `_focus`, `_exposure`, `_whitebalance`, `_is`, `_cp`)
- Save Preset Options summary, e.g. `PTZ, Exp, WB` (`savePresetOptions`)

## Feedbacks

A list of all the available Feedbacks in this module sorted into the following categories.

**System**

- Power State
- Tally Program State
- Tally Preview State
- Digital Zoom On/Off
- Image Stabilization On/Off

**Lens**

- Auto Focus Mode

**Exposure**

- Exposure Mode
- Auto Shutter On/Off
- Auto Iris On/Off

**Presets**

- Preset Last Used
- Preset Recall Mode
- Preset Save Option State — whether one option (or All) is currently set to be saved

**Custom**

- Parameter Matches Value — compare any parameter the camera reports in `info.cgi` against a value, for things the module has no dedicated feedback for (for example `k.output2.crop`)