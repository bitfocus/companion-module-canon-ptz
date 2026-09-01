//Smoke test: build every model profile and make sure the module can still
//construct its actions, feedbacks, variables and presets from it.
//
//This exists because a capability key added to some SERIES_SPECS profiles but
//not others is the most common way this module breaks, and it fails at load
//time with a TypeError rather than anything the packaging checks would catch.
//Run with: npm test

const { MODELS, SERIES_SPECS } = require('../src/models')
const state = require('../src/state')

const actions = require('../src/actions')
const feedbacks = require('../src/feedbacks')
const variables = require('../src/variables')
const presets = require('../src/presets')
const tracking = require('../src/tracking')
const utils = require('../src/utils')

let failures = []

function fail(model, stage, error) {
	failures.push({ model, stage, message: error.message })
}

//A stand-in for the Companion instance. InstanceBase can't be constructed
//outside Companion, so this provides the surface the init functions touch and
//takes its state straight from src/state.js -- the same values index.js uses.
function makeInstance(model) {
	const self = {
		config: { model, host: '', httpPort: 80, interval: 5000 },
		data: state.defaultData(),

		ptzCommand: 'control.cgi?',
		powerCommand: 'standby.cgi?',
		savePresetCommand: 'preset/set?',
		traceCommand: 'trace/',
		maintainCommand: 'maintain?',

		definitions: {},

		setActionDefinitions(d) { this.definitions.actions = d },
		setFeedbackDefinitions(d) { this.definitions.feedbacks = d },
		setVariableDefinitions(d) { this.definitions.variables = d },
		setPresetDefinitions(d) { this.definitions.presets = d },
		setVariableValues(v) { this.definitions.variableValues = v },

		updateStatus() {},
		log() {},
	}

	Object.assign(self, actions, feedbacks, variables, presets, tracking, utils)

	//After the mixin, not before: actions.js defines sendPTZ and the polling
	//helpers itself, so stubbing them in the literal above would just be
	//overwritten and the test would reach for the network.
	Object.assign(self, {
		checkFeedbacks() {},
		sendPTZ() {},
		sendTrackingCommand() {},
		getCameraInformation() {},
		getCameraInformation_Delayed() {},
	})
	Object.assign(self, state.defaultIndexes())

	for (let i = 1; i <= self.data.presetCount; i++) {
		self.data['presetname' + i] = i
	}

	return self
}

//Every selectable model, so a profile that only exists in MODELS is covered too
const models = MODELS.filter((m) => m.id !== 'Auto').map((m) => m.id)

console.log(`Building ${models.length} model profiles (${SERIES_SPECS.length} series specs)\n`)

for (const model of models) {
	const self = makeInstance(model)
	const stages = [
		['initActions', () => self.initActions()],
		['initFeedbacks', () => self.initFeedbacks()],
		['initVariables', () => self.initVariables()],
		['initPresets', () => self.initPresets()],
		['checkVariables', () => self.checkVariables()],
	]

	//checkVariables swallows its own errors and logs them, so catch it there too
	self.log = (level, message) => {
		if (level === 'error') fail(model, 'checkVariables', new Error(message))
	}

	for (const [stage, run] of stages) {
		try {
			run()
		} catch (error) {
			fail(model, stage, error)
		}
	}

	const d = self.definitions
	const counts =
		`actions ${Object.keys(d.actions || {}).length}` +
		`, feedbacks ${Object.keys(d.feedbacks || {}).length}` +
		`, variables ${(d.variables || []).length}` +
		`, presets ${Object.keys(d.presets || {}).length}`

	const bad = failures.filter((f) => f.model === model).length
	console.log(`  ${bad ? 'FAIL' : ' ok '}  ${model.padEnd(16)} ${counts}`)
}

//Capability keys are meant to differ between profiles -- that is what
//SERIES_SPECS is for -- so "every profile has every key" would be wrong. What
//is always wrong is a profile claiming a feedback whose backing action it
//doesn't have: the feedback exists to report that action's state, and since
//the guards make the mismatch silent rather than fatal, nothing else catches
//it. This is the shape #103 shipped in.
const actionNames = new Set()
for (const spec of SERIES_SPECS) {
	for (const name of Object.keys(spec.actions)) actionNames.add(name)
}

for (const spec of SERIES_SPECS) {
	for (const [name, enabled] of Object.entries(spec.feedbacks)) {
		if (enabled === true && actionNames.has(name) && !spec.actions[name]) {
			failures.push({
				model: spec.id,
				stage: 'profile consistency',
				message: `feedbacks.${name} is enabled but actions.${name} is missing`,
			})
		}
	}
}

if (failures.length) {
	console.error(`\n${failures.length} failure(s):\n`)
	for (const f of failures) {
		console.error(`  ${f.model} -> ${f.stage}: ${f.message}`)
	}
	console.error(
		'\nIf this is a TypeError on an undefined property, a capability key was\n' +
		'likely added to some SERIES_SPECS profiles but not all of them.\n'
	)
	process.exit(1)
}

console.log('\nAll model profiles built cleanly.')
