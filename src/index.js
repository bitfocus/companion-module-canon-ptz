//Canon PTZ

const { InstanceBase, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')

const config = require('./config')
const state = require('./state')
const actions = require('./actions')
const feedbacks = require('./feedbacks')
const variables = require('./variables')
const presets = require('./presets')

const polling = require('./polling')
const utils = require('./utils')

const tracking = require('./tracking')

class canonptzInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...polling,
			...utils,
			...tracking,
		})

		//global vars here
		this.pollTimer = undefined

		this.data = {}

		this.ptzCommand = 'control.cgi?'
		this.powerCommand = 'standby.cgi?'
		this.savePresetCommand = 'preset/set?'
		this.traceCommand = 'trace/'
		this.maintainCommand = 'maintain?'
	}

	async destroy() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer);
			this.pollTimer = null;
		}

		if (this.pollTimerOnlineStatus) {
			clearInterval(this.pollTimerOnlineStatus);
		}

		if (this.pollTrackingTimer) {
			clearInterval(this.pollTrackingTimer);
		}
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.updateStatus('connecting')

		// polling is running and polling has been de-selected by config change
		if (this.pollTimer !== undefined) {
			this.stopPolling()
		}
		this.config = config

		this.data = state.defaultData()

		//preset names
		for (let i = 1; i <= this.data.presetCount; i++) {
			this.data['presetname' + i] = i;
		}

		Object.assign(this, state.defaultIndexes())

		this.config.host = this.config.host || ''
		this.config.httpPort = this.config.httpPort || 80
		this.config.model = this.config.model || 'Auto'
		this.config.debug = this.config.debug || false
		this.config.interval = this.config.interval || 5000

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		if (this.config.host !== '') {
			this.updateStatus('Connecting')
			this.getCameraInformation()
			this.initPolling()
			this.initTrackingPolling();

			this.setVariableValues({
				cameraIP: this.config.host,
				cameraIPLastOctet: this.config.host.split('.').pop(),
			})
		}

		this.checkVariables();
		this.checkFeedbacks();
	}
}

runEntrypoint(canonptzInstance, UpgradeScripts)
