//Tests for the custom trace walk in utils.runCustomTrace.
//
//This drives the real function rather than a copy of its logic, because the
//bug in #33 was in exactly the kind of bounds arithmetic that a
//reimplementation would have quietly reproduced.
//
//Run with: npm test

const utils = require('../src/utils')

let failures = []

//Runs the real runCustomTrace, capturing the presets it sends. The function
//reschedules itself through setTimeout, so setTimeout is stubbed to hand the
//continuation back here instead of running it on a timer.
function walk(presetCount, loopMode, steps) {
	const sent = []
	const realSetTimeout = global.setTimeout

	const self = {
		customTracePresetArray: Array.from({ length: presetCount }, (_, i) => ({
			preset: i + 1,
			time: 1000,
		})),
		customTraceLoop: true,
		customTraceLoopCount: 0,
		customTraceLoopInterval: undefined,
		data: {},
		ptzCommand: 'control.cgi?',
		sendPTZ: (base, cmd) => sent.push(cmd.match(/^p=(\d+)/)[1]),
		checkVariables: () => {},
		checkFeedbacks: () => {},
		log: () => {},
	}
	Object.assign(self, utils)

	let pending = null
	global.setTimeout = (fn, delay, ...args) => {
		pending = () => fn(...args)
		return 0
	}

	try {
		self.runCustomTrace(true, loopMode, 0, 0, 'forward')
		for (let i = 1; i < steps && pending; i++) {
			const next = pending
			pending = null
			next()
		}
	} finally {
		global.setTimeout = realSetTimeout
	}

	return sent.join(',')
}

function check(label, actual, expected) {
	if (actual !== expected) {
		failures.push(`${label}\n      expected: ${expected}\n      actual:   ${actual}`)
		console.log(`  FAIL  ${label}`)
	} else {
		console.log(`   ok   ${label}`)
	}
}

console.log('Custom trace walk\n')

//A two-preset pendulum used to reverse and immediately turn back, pinning the
//camera on the second preset forever. Three or more presets always worked.
check('pendulum, 2 presets swings back and forth',
	walk(2, 'pendulum', 8), '1,2,1,2,1,2,1,2')

check('pendulum, 3 presets turns at both ends',
	walk(3, 'pendulum', 9), '1,2,3,2,1,2,3,2,1')

check('pendulum, 4 presets turns at both ends',
	walk(4, 'pendulum', 10), '1,2,3,4,3,2,1,2,3,4')

//One preset has nowhere to swing to. It used to index past the end of the
//array and stop the trace silently.
check('pendulum, 1 preset holds position',
	walk(1, 'pendulum', 4), '1,1,1,1')

check('normal loop, 2 presets wraps to the start',
	walk(2, 'normal', 6), '1,2,1,2,1,2')

check('normal loop, 3 presets wraps to the start',
	walk(3, 'normal', 7), '1,2,3,1,2,3,1')

if (failures.length) {
	console.error(`\n${failures.length} failure(s):\n`)
	for (const f of failures) console.error(`  ${f}\n`)
	process.exit(1)
}

console.log('\nTrace walk correct for all preset counts.')
