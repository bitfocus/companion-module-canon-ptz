//Canon PTZ

const { InstanceBase, Regex, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')

const config = require('./config')
const actions = require('./actions')
const feedbacks = require('./feedbacks')
const variables = require('./variables')
const presets = require('./presets')

const polling = require('./polling')

class moduleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...polling
		})

		//global vars here
		this.pollTimer = undefined

		this.data = {}

		this.ptzCommand = 'control.cgi?'
		this.powerCommand = 'standby.cgi?'
		this.savePresetCommand = 'preset/set?'
		this.traceCommand = 'trace/'
	}

	async destroy() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer);
			this.pollTimer = null;
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

		this.data = {
			debug: false,
			model: 'Auto',
			modelDetected: '',
			series: 'Auto',
			//System
			cameraName: '',
			powerState: '',
			tallyState: '',
			tallyProgram: '',
			tallyPreview: '',
			digitalZoom: '',
			imageStabilization: '',
			firmwareVersion: '',
			protocolVersion: '',
	
			//Zoom/Focus
			zoomSpeed: 8,
			zoomValue: '', //unknown starting value (for XF605 etc)
			focusSpeed: 1,
			focusValue: 0,
			autoFocusMode: '',
	
			//Pan/Tilt
			panTiltSpeedValue: 625,
	
			//Exposure
			exposureShootingMode: 'auto',
			exposureShootingModeListString: '',
			exposureShootingModeList: null,
			exposureMode: 'auto',
			exposureModeListString: '',
			exposureModeList: null,
			aeGainLimitMax: 330,
			aeGainLimitMaxMin: -60,
			aeGainLimitMaxMax: 330,
			aeBrightness: 0,
			aeBrightnessListString: '',
			aeBrightnessList: null,
			aePhotometry: 'center',
			aePhotometryListString: '',
			aePhotometryList: null,
			aeFlickerReduct: 'off',
			aeFlickerReductListString: '',
			aeFlickerReductList: null,
			aeResp: 1,
			aeRespMin: 0,
			aeRespMax: 2,
			shutterMode: 'manual',
			shutterValue: 2,
			shutterListString: '',
			shutterList: null,
			irisMode: 'manual',
			irisValue: 180,
			irisListString: '',
			irisList: null,
			gainMode: 'manual',
			gainValue: 10,
			ndfilterValue: '0',
			pedestalValue: '',
	
			//White Balance
			whitebalanceMode: 'auto',
			whitebalanceModeListString: '',
			whitebalanceModeList: null,
			kelvinValue: '2000',
			kelvinListString: '',
			kelvinList: null,
			rGainValue: '0',
			bGainValue: '0',
	
			//Recall Preset
			presetLastUsed: 1,
			presetRecallMode: 'normal',
			presetTimeValue: 2000,
			presetSpeedValue: 1
		}
	
		//preset names
		for (let i = 1; i <= 100; i++) {
			this.data['presetname' + i] = 'preset' + i;
		}
	
		this.ptSpeed = 625
		this.ptSpeedIndex = 4
		this.zSpeed = 8
		this.zSpeedIndex = 7
		this.fSpeed = 1
		this.fSpeedIndex = 1
		this.exposureModeIndex = 0
		this.shutterValue = 0
		this.shutterIndex = 0
		this.irisValue = 'auto'
		this.irisIndex = 0
		this.gainValue = 'auto'
		this.gainIndex = 0
		this.ndfilterValue = '0'
		this.ndfilterIndex = 0
		this.pedestalValue = 0
		this.pedestalIndex = 51
		this.whitebalanceModeIndex = 0;
		this.kelvinIndex = 0
		this.kelvinValue = 2820
		this.rGainIndex = 50
		this.rGainValue = 0
		this.bGainIndex = 50
		this.bGainValue = 0
		this.presetRecallModeIndex = 0
		this.presetLastUsedIndex = 0
		this.presetDriveTimeIndex = 0
		this.presetDriveSpeedIndex = 0
	
		this.config.host = this.config.host || ''
		this.config.httpPort = this.config.httpPort || 80
		this.config.model = this.config.model || 'Auto'
		this.config.debug = this.config.debug || false
		this.config.interval = this.config.interval || 5000
	
		this.updateStatus('Connecting')
		this.getCameraInformation()
		
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.initPolling()
	}
}

runEntrypoint(moduleInstance, UpgradeScripts)