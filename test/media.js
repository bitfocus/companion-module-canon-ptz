//Tests for internal recording, media mode and crop (XC spec rev 012, B.4).
//
//Feeds an info.cgi body through the real processResult/storeData, then drives
//the real action callbacks and checks the commands they would send. The crop
//lines are the spec's own sample response (§3.2.2.1), so the parser is held
//to what the camera actually writes, "name==value" lines included.
//
//Run with: npm test

const state = require('../src/state')
const actions = require('../src/actions')
const feedbacks = require('../src/feedbacks')
const variables = require('../src/variables')
const presets = require('../src/presets')
const polling = require('../src/polling')
const tracking = require('../src/tracking')
const utils = require('../src/utils')

let failures = []
let checks = 0

function check(name, condition, detail) {
	checks++
	if (!condition) {
		failures.push(`${name}${detail !== undefined ? ` -- got ${JSON.stringify(detail)}` : ''}`)
	}
}

function makeInstance(model) {
	const self = {
		config: { model, host: '', httpPort: 80, interval: 5000 },
		data: state.defaultData(),
		ptzCommand: 'control.cgi?',
		modeCommand: 'mode.cgi?',
		definitions: {},
		sent: [],
		logs: [],
		setActionDefinitions(d) { this.definitions.actions = d },
		setFeedbackDefinitions(d) { this.definitions.feedbacks = d },
		setVariableDefinitions(d) { this.definitions.variables = d },
		setPresetDefinitions(d) { this.definitions.presets = d },
		setVariableValues(v) { this.definitions.variableValues = v },
		updateStatus() {},
		log(level, message) { this.logs.push([level, message]) },
	}

	Object.assign(self, actions, feedbacks, variables, presets, polling, tracking, utils)
	Object.assign(self, {
		checkFeedbacks() {},
		sendPTZ(base, cmd) { self.sent.push(base + cmd) },
		sendTrackingCommand() {},
		getCameraInformation() {},
		getCameraInformation_Delayed() {},
	})
	Object.assign(self, state.defaultIndexes())

	self.initActions()
	self.initFeedbacks()
	self.initVariables()
	self.initPresets()

	return self
}

function poll(self, lines) {
	self.processResult({ response: { data: lines.join('\n') } })
}

const context = { parseVariablesInString: async (value) => value }

async function run(self, actionId, options = {}) {
	self.sent = []
	await self.definitions.actions[actionId].callback({ options }, context)
	return self.sent
}

function feedback(self, feedbackId, options) {
	return self.definitions.feedbacks[feedbackId].callback({ options })
}

async function main() {
	// #### parseLine ####
	const p = polling.parseLine
	check('parseLine ":=" changed value', JSON.stringify(p('f.rec:=on')) === '["f.rec","on"]', p('f.rec:=on'))
	check('parseLine "==" unchanged value', JSON.stringify(p('k.1.crop.frame.x==5000')) === '["k.1.crop.frame.x","5000"]', p('k.1.crop.frame.x==5000'))
	check('parseLine plain "="', JSON.stringify(p('p=1')) === '["p","1"]', p('p=1'))
	check('parseLine keeps "=" inside a value', JSON.stringify(p('p.1.name.utf8:=a=b')) === '["p.1.name.utf8","a=b"]', p('p.1.name.utf8:=a=b'))

	// #### Recording on a CR-N700 ####
	const n700 = makeInstance('Canon CR-N700')

	poll(n700, [
		'c.1.type:=Canon CR-N700',
		'f.rec.status:=idle',
		'f.rec.mode:=normal',
		'f.rec.format.media1:=xfavc',
		'f.rec.media1.status:=recordable',
		'f.rec.media1.remainingtime:=123',
		'f.rec.media1.videoinfo:=3840x2160:59980:P',
		'f.mode.status:=camera',
		'f.mediamode:=idle',
	])

	check('record status stored', n700.data.recordStatus === 'idle', n700.data.recordStatus)
	check('remaining time variable', n700.definitions.variableValues.media1RemainingTime === '123', n700.definitions.variableValues.media1RemainingTime)
	check('record status variable is labelled', n700.definitions.variableValues.recordStatus === 'Stopped', n700.definitions.variableValues.recordStatus)
	check('recording feedback off while idle', feedback(n700, 'recording', { option: 'rec' }) === false)

	let sent = await run(n700, 'recordToggle')
	check('toggle from idle starts recording', sent[0] === 'control.cgi?f.rec=on', sent)
	check('recording feedback on after start', feedback(n700, 'recording', { option: 'rec' }) === true)

	sent = await run(n700, 'recordToggle')
	check('toggle while recording stops', sent[0] === 'control.cgi?f.rec=off', sent)

	sent = await run(n700, 'recordStart')
	check('start sends f.rec=on', sent[0] === 'control.cgi?f.rec=on', sent)
	sent = await run(n700, 'recordStop')
	check('stop sends f.rec=off', sent[0] === 'control.cgi?f.rec=off', sent)

	poll(n700, ['f.rec.media1.status:=unrecordable', 'f.rec.media1.remainingtime:=0'])
	check('remaining time blank when card unrecordable', n700.definitions.variableValues.media1RemainingTime === '', n700.definitions.variableValues.media1RemainingTime)
	check('card feedback reports unrecordable', feedback(n700, 'recordingMedia', { card: '1', option: 'unrecordable' }) === true)

	// #### Media mode ####
	sent = await run(n700, 'operatingMode', { mode: 'media' })
	check('media mode uses mode.cgi', sent[0] === 'mode.cgi?cmd=media', sent)
	sent = await run(n700, 'operatingMode', { mode: 'camera' })
	check('camera mode uses mode.cgi', sent[0] === 'mode.cgi?cmd=camera', sent)

	poll(n700, ['f.mode.status:=media', 'f.mediamode:=playback', 'f.playback.status:=fast_forward_x15', 'f.playback.timecode:=01:23:45:00'])
	check('playback feedback', feedback(n700, 'playbackStatus', { option: 'fast_forward_x15' }) === true)
	check('operating mode feedback', feedback(n700, 'mediaMode', { option: 'media' }) === true)
	check('playback status variable', n700.definitions.variableValues.playbackStatus === 'Fast Forward x15', n700.definitions.variableValues.playbackStatus)
	check('playback timecode variable', n700.definitions.variableValues.playbackTimecode === '01:23:45:00', n700.definitions.variableValues.playbackTimecode)

	// #### Crop, from the spec's sample response ####
	poll(n700, [
		'f.output.list:=output1:12g-sdi,output2:hdmi_3g-sdi,output3:ip',
		'k.count:=3',
		'k.output1.crop:=overview',
		'k.output1.crop.list:=overview',
		'k.output2.crop:=overview',
		'k.output2.crop.list:=overview,crop1,crop2,crop3',
		'k.output3.crop:=overview',
		'k.output3.crop.list:=overview,crop1,crop2',
		'k.1.crop.size:=1920x1080',
		'k.1.crop.frame.x:=5000',
		'k.1.crop.frame.x.min:=0',
		'k.1.crop.frame.x.max:=9999',
		'k.1.crop.frame.y:=5000',
		'k.1.crop.frame.y.min:=0',
		'k.1.crop.frame.y.max:=9999',
		'k.1.crop.frame.width:=5000',
		'k.1.crop.frame.width.min:=1333',
		'k.1.crop.frame.width.max:=10000',
		'k.1.crop.frame.height:=5000',
		'k.2.crop.frame.width:=5000',
		'k.2.crop.frame.width.min:=5000',
		'k.2.crop.frame.width.max:=5000',
		'k.3.crop.frame.width==2813',
		'k.3.crop.frame.width.min:=750',
		'k.3.crop.frame.width.max:=3094',
	])

	check('crop area parsed', n700.data.cropAreas['1'].width === 5000 && n700.data.cropAreas['1'].widthMin === 1333, n700.data.cropAreas['1'])
	check('"==" crop line keeps its value', n700.data.cropAreas['3'].width === 2813, n700.data.cropAreas['3'])
	check('output list parsed', n700.data.cropOutputs.output3.list.join(',') === 'overview,crop1,crop2', n700.data.cropOutputs.output3)

	const outputChoice = n700.definitions.actions.cropOutputSource.options[0].choices.find((o) => o.id === 'output3')
	check('output labelled from f.output.list', outputChoice && outputChoice.label === 'Output 3 (IP)', outputChoice)
	check('variables built per area', n700.definitions.variables.some((v) => v.variableId === 'crop3_width'))
	check('crop width variable', n700.definitions.variableValues.crop1_width === 5000, n700.definitions.variableValues.crop1_width)
	check('output source variable', n700.definitions.variableValues.crop_output3_source === 'Overview', n700.definitions.variableValues.crop_output3_source)

	sent = await run(n700, 'cropOutputSource', { output: 'output3', source: 'crop1' })
	check('output source command', sent[0] === 'control.cgi?k.output3.crop=crop1', sent)

	sent = await run(n700, 'cropOutputSource', { output: 'output1', source: 'crop1' })
	check('unavailable source is not sent', sent.length === 0, sent)
	check('unavailable source is logged', n700.logs.some(([level]) => level === 'warn'))

	poll(n700, ['k.output3.crop:=crop1'])
	check('output source feedback', feedback(n700, 'cropOutputSource', { output: 'output3', source: 'crop1' }) === true)

	sent = await run(n700, 'cropAdjust', { area: '1', field: 'x', amount: 250 })
	check('adjust x', sent[0] === 'control.cgi?k.1.crop.frame.x=5250', sent)
	sent = await run(n700, 'cropAdjust', { area: '1', field: 'x', amount: 250 })
	check('second adjust steps from the first, not the stale poll', sent[0] === 'control.cgi?k.1.crop.frame.x=5500', sent)

	sent = await run(n700, 'cropAdjust', { area: '1', field: 'width', amount: -10000 })
	check('adjust clamps to the reported minimum', sent[0] === 'control.cgi?k.1.crop.frame.width=1333', sent)

	sent = await run(n700, 'cropAdjust', { area: '2', field: 'width', amount: 250 })
	check('fixed-width area sends nothing', sent.length === 0, sent)

	sent = await run(n700, 'cropSetFrame', { area: '1', x: '100', y: '', width: '20000' })
	check('set frame skips blank fields and clamps', sent[0] === 'control.cgi?k.1.crop.frame.x=100&k.1.crop.frame.width=10000', sent)

	sent = await run(n700, 'cropSetFrame', { area: '1', x: 'abc', y: '', width: '' })
	check('set frame rejects non-numbers', sent.length === 0, sent)

	// #### Model gating ####
	const n500 = makeInstance('Canon CR-N500')
	check('CR-N500 has no recording', n500.definitions.actions.recordStart === undefined)
	check('CR-N500 has no crop', n500.definitions.actions.cropAdjust === undefined)

	const n350 = makeInstance('Canon CR-N350')
	check('CR-N350 has crop', n350.definitions.actions.cropAdjust !== undefined)
	check('CR-N350 has no recording', n350.definitions.actions.recordStart === undefined)

	const xf605 = makeInstance('Canon XF-605')
	check('XF-605 has recording', xf605.definitions.actions.recordStart !== undefined)
	check('XF-605 has no media mode', xf605.definitions.actions.operatingMode === undefined)
	check('XF-605 has card B', xf605.definitions.variables.some((v) => v.variableId === 'media2RemainingTime'))

	if (failures.length) {
		console.error(`Recording/media/crop: ${failures.length} of ${checks} checks failed:\n`)
		for (const failure of failures) {
			console.error(`  ${failure}`)
		}
		process.exit(1)
	}

	console.log(`Recording/media/crop: all ${checks} checks passed`)
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
