//Tests for the get_config.cgi poll in tracking.getCameraTrackingConfig.
//
//The Auto Tracking app needs at least one keys= value on get_config.cgi and fails
//the whole request if any key is unknown, so the documented keys and the extra
//ones go out as separate requests. This drives the real function with the HTTP
//layer stubbed out.
//
//Run with: npm test

const tracking = require('../src/tracking')

let failures = []

function check(name, condition) {
	if (!condition) {
		failures.push(name)
	}
}

//responder(cmd) returns what sendTrackingRequest would: { status, response }
function makeInstance(responder) {
	const self = {
		config: { verbose: false, continuePolling: true },
		data: { trackingConfig: {} },
		requests: [],
		statuses: [],
		pollStopped: false,

		sendTrackingRequest(cmd) {
			this.requests.push(cmd)
			return Promise.resolve(responder(cmd))
		},
		updateStatus(s) { this.statuses.push(s) },
		log() {},
		checkVariables() {},
		checkFeedbacks() {},
		stopTrackingPolling() { this.pollStopped = true },
	}

	self.getCameraTrackingConfig = tracking.getCameraTrackingConfig
	return self
}

function ok(data) {
	return { status: 'ok', response: { data } }
}

function keysOf(cmd) {
	const match = cmd.match(/^get_config\.cgi\?keys=(.+)$/)
	return match ? match[1].split(',') : []
}

const EXTRA = ['tiltFixed', 'recoveryControl', 'visibilityLimitLower']

async function run() {
	//Both requests succeed: values from both end up in trackingConfig
	{
		const self = makeInstance((cmd) => {
			const keys = keysOf(cmd)
			if (keys.includes('tiltFixed')) {
				return ok({ tiltFixed: '1', recoveryControl: '0', status_code: 'G0_100', description: 'Success' })
			}
			return ok({ trackingEnable: '1', targetSelection: '0', status_code: 'G0_100', description: 'Success' })
		})
		await self.getCameraTrackingConfig()

		check('sends two requests', self.requests.length === 2)
		check('every request has keys=', self.requests.every((cmd) => keysOf(cmd).length > 0))
		const documented = self.requests.find((cmd) => keysOf(cmd).includes('trackingEnable'))
		check('documented request has no extra keys', documented && !EXTRA.some((k) => keysOf(documented).includes(k)))
		check('merges documented keys', self.data.trackingConfig.trackingEnable === '1')
		check('merges extra keys', self.data.trackingConfig.tiltFixed === '1')
		check('drops status_code', self.data.trackingConfig.status_code === undefined)
	}

	//Extra request rejected with HTTP 400: documented keys still stored, polling continues
	{
		const self = makeInstance((cmd) => {
			if (keysOf(cmd).includes('tiltFixed')) {
				return { status: 'failed' }
			}
			return ok({ trackingEnable: '0', status_code: 'G0_100', description: 'Success' })
		})
		self.config.continuePolling = false
		self.data.trackingConfig = { tiltFixed: '1' }
		await self.getCameraTrackingConfig()

		check('extra failure keeps documented keys', self.data.trackingConfig.trackingEnable === '0')
		check('extra failure keeps previous extra values', self.data.trackingConfig.tiltFixed === '1')
		check('extra failure does not stop polling', self.pollStopped === false)
	}

	//Documented request answered with an error status_code: nothing stored
	{
		const self = makeInstance(() => ok({ status_code: 'E4_120', description: 'Invalid Parameter' }))
		await self.getCameraTrackingConfig()

		check('error status_code stores nothing', Object.keys(self.data.trackingConfig).length === 0)
		check('error status_code does not set status', self.statuses.length === 0)
	}

	//App not started (HTTP 409): the log carries the app's own error, not "No response"
	{
		const self = makeInstance(() => ({
			status: 'failed',
			errorResponse: { status: 409, data: { status_code: 'E4_003', description: 'The application must be started.' } },
		}))
		self.config.verbose = true
		self.logs = []
		self.log = (level, msg) => self.logs.push(msg)
		await self.getCameraTrackingConfig()

		check('app error is logged', self.logs.some((msg) => msg.includes('E4_003 The application must be started. (HTTP 409)')))
		check('app error does not say no response', !self.logs.some((msg) => msg.includes('No response')))
	}

	//No reply at all: still the generic message
	{
		const self = makeInstance(() => ({ status: 'failed' }))
		self.config.verbose = true
		self.logs = []
		self.log = (level, msg) => self.logs.push(msg)
		await self.getCameraTrackingConfig()

		check('no reply logs no response', self.logs.some((msg) => msg.includes('No response received from server')))
	}

	if (failures.length > 0) {
		console.error(`get_config: ${failures.length} check(s) failed:`)
		for (const f of failures) {
			console.error(`  - ${f}`)
		}
		process.exit(1)
	}

	console.log('get_config: all checks passed')
}

run()
