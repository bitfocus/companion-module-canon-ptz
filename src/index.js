var instance_skel = require('../../../instance_skel')
var { MODELS } = require('./models.js')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var debug

instance.prototype.INTERVAL = null; //used for polling device

// #########################
// #### Other Functions ####
// #########################
instance.prototype.getCameraInformation = function () {
	//Get all information from Camera
	var self = this

	if (self.config.host) {
		self.system.emit(
			'rest_get',
			'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/info.cgi',
			function (err, result) {
				// If there was an Error
				if (err) {
					let errString = '';
					self.status(self.STATUS_ERROR);
					try {
						if (result && result.error && result.error.code) {
							if (result.error.code === 'ETIMEDOUT') {
								errString = 'Unable to reach device. Timed out.';
							}
							else if (result.error.code === 'ECONNREFUSED') {
								errString = 'Connection refused. Is this the right IP address?';
							}
							else {
								errString = result.error.code.toString();
							}
							self.log('error', 'Error from PTZ: ' + errString);	
						}
					}
					catch(error) {
						self.log('error', 'PTZ gave an error: ' + error);
					}

					if (self.INTERVAL) {
						self.log('info', 'Stopping Update Interval due to error.');
						clearInterval(self.INTERVAL);
						self.INTERVAL = null;
					}
					
					return
				}

				// If We get a responce, store the values

				self.status(self.STATUS_OK);

				if (('data', result.response.req)) {
					var str_raw = String(result.data)
					var str = {}

					self.data.info = [];

					str_raw = str_raw.split('\n') // Split Data in order to remove data before and after command

					for (var i in str_raw) {
						str = str_raw[i].trim() // remove new line, carriage return and so on.
						str = str.split('=') // Split Commands and data
						if ((str_raw[i].indexOf('p.') === -1) && (str_raw[i].indexOf('t.') === -1)) {
							debug('Received from PTZ: ' + str_raw[i]) // Debug Recived data
							if (self.config.debug == true) {
								self.log('info', 'Received CMD: ' + String(str_raw[i]))
							}
						}
						// Store Data
						str[0] = str[0].replace(':','');
						self.storeData(str)
					}

					self.checkVariables()
					self.checkFeedbacks()
				}
			}
		)
	}
};

instance.prototype.getCameraInformation_Delayed = function() {
	let self = this;

	setTimeout(self.getCameraInformation.bind(self), 500);
};

instance.prototype.storeData = function (str) {
	var self = this

	self.data.info.push(str);

	try {
		// Store Values from Events
		switch (str[0]) {
			//Detect camera type and reinitialize the module based on the detected model
			case 'c.1.type':
				self.data.modelDetected = str[1];
				if (self.data.model !== self.data.modelDetected) {
					self.log('info', 'New model detected, reloading module: ' + self.data.modelDetected);
					self.actions() // export actions
					self.init_presets()
					self.init_variables()
					self.checkVariables()
					self.init_feedbacks()
					self.checkFeedbacks()
				}
				break;
			//System
			case 'c.1.name.utf8':
				self.data.cameraName = str[1];
				break;
			case 'f.standby':
				self.data.powerState = str[1];
				break;
			case 'f.tally':
				self.data.tallyState = str[1];
				break;
			case 'f.tally.mode':
				if (str[1] === 'preview') {
					self.data.tallyPreview = self.data.tallyState;
				}
				else {
					self.data.tallyProgram = self.data.tallyState;
				}
				break;
			case 'c.1.zoom.mode':
				self.data.digitalZoom = str[1];
				break;
			case 'c.1.is':
				self.data.imageStabilization = str[1];
				break;
			case 's.firmware':
				self.data.firmwareVersion = str[1];
				break;
			case 's.protocol':
				self.data.protocolVersion = str[1];
				break;
			//Zoom/Focus
			case 'c.1.focus.speed':
				self.data.focusSpeed = str[1];
				break;
			case 'c.1.focus.value':
				self.data.focusValue = str[1];
				break;
			case 'c.1.focus':
				self.data.autoFocusMode = str[1];
				break;
			//Pan/Tilt
			//Exposure
			case 'c.1.shooting':
				self.data.exposureShootingMode = str[1];
				break;
			case 'c.1.shooting.list':
				if (self.data.exposureShootingModeListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.exposureShootingModeListString = str[1];
					self.log('info', 'New Exposure Shooting Modes detected, reloading module: ' + self.data.exposureShootingModeListString);
					self.data.exposureShootingModeList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.exp':
				self.data.exposureMode = str[1];
				break;
			case 'c.1.exp.list':
				if (self.data.exposureModeListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.exposureModeListString = str[1];
					self.log('info', 'New Exposure Modes detected, reloading module: ' + self.data.exposureModeListString);
					self.data.exposureModeList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.ae.gainlimit.max':
				self.data.aeGainLimitMax = parseInt(str[1]);
				self.actions();
				self.init_presets();
				break;
			case 'c.1.ae.gainlimit.max.min':
				self.data.aeGainLimitMaxMin = parseInt(str[1]);
				self.actions();
				self.init_presets();
				break;
			case 'c.1.ae.gainlimit.max':
				self.data.aeGainLimitMaxMax = parseInt(str[1]);
				self.actions();
				self.init_presets();
				break;
			case 'c.1.ae.brightness':
				self.data.aeBrightness = str[1];
				break;
			case 'c.1.ae.brightness.list':
				if (self.data.aeBrightnessListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.aeBrightnessListString = str[1];
					self.log('info', 'New AE Brightness List detected, reloading module: ' + self.data.aeBrightnessListString);
					self.data.aeBrightnessList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.ae.photometry':
				self.data.aePhotometry = str[1];
				break;
			case 'c.1.ae.photometry.list':
				if (self.data.aePhotometryListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.aePhotometryListString = str[1];
					self.log('info', 'New AE Photometry List detected, reloading module: ' + self.data.aePhotometryListString);
					self.data.aePhotometryList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.ae.flickerreduct':
				self.data.aeFlickerReduct = str[1];
				break;
			case 'c.1.ae.flickerreductlist':
				if (self.data.aeFlickerReductListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.aeFlickerReductListString = str[1];
					self.log('info', 'New AE Flicker Reduct List detected, reloading module: ' + self.data.aeFlickerReductListString);
					self.data.aeFlickerReductList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.ae.resp':
				self.data.aeResp = parseInt(str[1]);
				break;
			case 'c.1.ae.resp.min':
				self.data.aeRespMin = parseInt(str[1]);
				self.actions();
				self.init_presets();
				break;
			case 'c.1.ae.resp.max':
				self.data.aeRespMax = parseInt(str[1]);
				self.actions();
				self.init_presets();
				break;
			case 'c.1.me.shutter.mode':
				self.data.shutterMode = str[1];
				break;
			case 'c.1.me.shutter':
				self.data.shutterValue = str[1];
				break;
			case 'c.1.me.shutter.list':
				if (self.data.shutterListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.shutterListString = str[1];
					self.log('info', 'New Shutter Modes detected, reloading module: ' + self.data.shutterListString);
					self.data.shutterList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.me.diaphragm.mode':
				self.data.irisMode = str[1];
				break;
			case 'c.1.me.diaphragm':
				self.data.irisValue = str[1];
				break;
			case 'c.1.me.diaphragm.list':
				if (self.data.irisListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.irisListString = str[1];
					self.log('info', 'New Iris Modes detected, reloading module: ' + self.data.irisListString);
					self.data.irisList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.me.gain.mode':
				self.data.gainMode = str[1];
				break;
			case 'c.1.me.gain':
				self.data.gainValue = str[1];
				break;
			case 'c.1.nd.filter':
				self.data.ndfilterValue = str[1];
				break;
			case 'c.1.blacklevel':
				self.data.pedestalValue = str[1];
				break;
			//White Balance
			case 'c.1.wb':
				self.data.whitebalanceMode = str[1];
				break;
			case 'c.1.wb.list':
				if (self.data.whitebalanceModeListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.whitebalanceModeListString = str[1];
					self.log('info', 'New White Balance Modes detected, reloading module: ' + self.data.whitebalanceModeListString);
					self.data.whitebalanceModeList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.wb.kelvin':
				self.data.kelvinValue = str[1];
				break;
			case 'c.1.wb.kelvin.list':
				if (self.data.kelvinListString !== str[1]) { //only rebuild the actions if the list has changed
					self.data.kelvinListString = str[1];
					self.log('info', 'New Kelvin Modes detected, reloading module: ' + self.data.kelvinListString);
					self.data.kelvinList = str[1].split(',');
					self.actions();
					self.init_presets();
				}
				break;
			case 'c.1.wb.shift.rgain':
				self.data.rGainValue = str[1];
				break;
			case 'c.1.wb.shift.bgain':
				self.data.bGainValue = str[1];
				break;
			case 'p':
				self.data.presetLastUsed = parseInt(str[1]);
				break;
			default:
				break;
		}

		for (let i = 1; i <= 100; i++) {
			if (str[0] === ('p.' + i + '.name.utf8')) {
				self.data['presetname' + i] = str[1];
			}
		}
	}
	catch(error) {
		self.log('error', 'Error parsing response from PTZ: ' + String(error))
	}
};

instance.prototype.setupInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	if (self.config.interval > 0) {
		self.INTERVAL = setInterval(self.getCameraInformation.bind(self), self.config.interval);
	}
};

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	var self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this

	if (self.INTERVAL) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	var self = this

	debug = self.debug
	log = self.log

	self.data = {
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
		self.data['presetname' + i] = 'preset' + i;
	}

	self.ptSpeed = 625
	self.ptSpeedIndex = 4
	self.zSpeed = 8
	self.zSpeedIndex = 7
	self.fSpeed = 1
	self.fSpeedIndex = 1
	self.exposureModeIndex = 0
	self.shutterValue = 0
	self.shutterIndex = 0
	self.irisValue = 'auto'
	self.irisIndex = 0
	self.gainValue = 'auto'
	self.gainIndex = 0
	self.ndfilterValue = '0'
	self.ndfilterIndex = 0
	self.pedestalValue = 0
	self.pedestalIndex = 51
	self.whitebalanceModeIndex = 0;
	self.kelvinIndex = 0
	self.kelvinValue = 2820
	self.rGainIndex = 50
	self.rGainValue = 0
	self.bGainIndex = 50
	self.bGainValue = 0
	self.presetRecallModeIndex = 0
	self.presetLastUsedIndex = 0
	self.presetDriveTimeIndex = 0
	self.presetDriveSpeedIndex = 0

	self.config.host = this.config.host || ''
	self.config.httpPort = this.config.httpPort || 80
	self.config.model = this.config.model || 'Auto'
	self.config.debug = this.config.debug || false
	self.config.interval = this.config.interval || 5000

	self.status(self.STATUS_WARNING, 'connecting')
	self.getCameraInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
}

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	var self = this
	self.config = config
	self.status(self.STATUS_UNKNOWN)
	self.getCameraInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				"This module controls Canon PTZ cameras using the XC protocol. You can find supported models in the dropdown below.<br/>If your camera isn't in the list below, feel free to try it anyway with the option 'Other Cameras'.",
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Camera IP',
			width: 4,
			regex: self.REGEX_IP,
		},
		{
			type: 'textinput',
			id: 'httpPort',
			label: 'HTTP Port (Default: 80)',
			width: 3,
			default: 80,
			regex: self.REGEX_PORT,
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'text',
			id: 'modelInfo',
			width: 12,
			label: 'Camera Model',
			value: 'Please Select the camera model.',
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Select Your Camera Model',
			width: 6,
			default: MODELS[0].id,
			choices: MODELS,
			minChoicesForSearch: 5,
		},
		{
			type: 'text',
			id: 'intervalInfo',
			width: 12,
			label: 'Update Interval',
			value:
				'Please enter the amount of time in milliseconds to request new information from the camera. Set to 0 to disable.',
		},
		{
			type: 'textinput',
			id: 'interval',
			label: 'Update Interval',
			width: 3,
			default: 5000,
		},
		{
			type: 'text',
			id: 'dummy2',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'text',
			id: 'Info',
			width: 12,
			label: 'Other Settings',
			value:
				'These setting can be left on the default values and should give you a consistent setup, but they are there for you to use if need be.',
		},
		{
			type: 'text',
			id: 'tallyOnPGMInfo',
			width: 12,
			label: 'PGM Tally On',
			value:
				'Support for Tally On is no longer possible. Instead you can set this up as a trigger, and get additional control',
		},
		{
			type: 'checkbox',
			id: 'debug',
			width: 1,
			label: 'Enable',
			default: false,
		},
		{
			type: 'text',
			id: 'debugInfo',
			width: 11,
			label: 'Enable Debug To Log Window',
			value:
				'Requires Companion to be restarted. But this will allow you the see what is being sent from the module and what is being received from the camera.',
		},
	]
}

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function () {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.sendPTZ = function (str) {
	actions.sendPTZ(this, str);
}

instance.prototype.sendPower = function(str) {
	actions.sendPower(this, str);
}

instance.prototype.sendSavePreset = function(str) {
	actions.sendSavePreset(this, str);
}

instance.prototype.actions = function () {
	this.setActions(actions.setActions(this));
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;