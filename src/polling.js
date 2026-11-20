const { InstanceStatus } = require('@companion-module/base')
const API = require('./api')

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		let self = this;

		// Cleanup old interval
		if (self.pollTimer) {
			clearInterval(self.pollTimer);
		}

		clearInterval(self.pollTimerOnlineStatus); //this one just runs every 5 minutes to see if the camera has come back online after being unplugged without having to restart the module instance

		// Setup polling if enabled
		if (self.pollTimer === undefined && self.config.interval > 0) {
			self.pollTimer = setInterval(() => {
				self.getCameraInformation.bind(self)()
			}, self.config.interval)
		}

		// Setup online status polling
		self.pollTimerOnlineStatus = setInterval(() => {
			self.getCameraInformation.bind(self)()
		}, 300000) //every 5 minutes
	},

	stopPolling() {
		let self = this;
		//self.log('error', 'Stopping Polling due to Server error.');

		clearInterval(self.pollTimer);
		delete self.pollTimer

		clearInterval(self.pollTrackingTimer);
		delete self.pollTrackingTimer;
	},

	async getCameraInformation() {
		let self = this;

		const connection = new API(self.config);

		const cmd = 'info.cgi'

		const result = await connection.sendRequest(cmd);

		self.processResult(result);
	},

	processResult(result) {
		let self = this;

		//do something with data
		try {
			if (result && result.response && result.response.data) {
				let data = result.response.data;

				try {
					var str_raw = String(data)
					var str = {}

					self.data.info = [];

					str_raw = str_raw.split('\n') // Split Data in order to remove data before and after command

					for (var i in str_raw) {
						if ((str_raw[i].indexOf('p.') === -1) && (str_raw[i].indexOf('t.') === -1)) {

							if (self.config.verbose == true) {
								self.log('debug', 'Received CMD: ' + String(str_raw[i]))
							}
						}
						// Store Data
						self.storeData(self.parseLine(str_raw[i]))
					}

					self.updateCropShape()

					self.updateStatus(InstanceStatus.Ok)

					self.checkVariables()
					self.checkFeedbacks()
				}
				catch(error) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: ${error}`);
					}
					self.updateStatus(InstanceStatus.Error)
				}
			} else if (result && result.unauthorized === true) {
				if (!self.errorCount) {
					self.log('error', 'The camera rejected the login. Check the username and password in the connection config, or enable guest access on the camera.');
					self.updateStatus(InstanceStatus.AuthenticationFailure)
				}

				self.errorCount++;
			} else {
				if (!self.errorCount) {
					if (self.config.verbose) {
						self.log('error', `Error Getting Data: No response received from server. Is the Camera Online?`);
					}
					self.updateStatus(InstanceStatus.ConnectionFailure)
				}

				// Cleanup polling
				if (self.config.continuePolling !== true) {
					self.stopPolling()
				}

				self.errorCount++;
			}
		}
		catch(error) {
			if (self.config.verbose) {
				self.log('error', `Error Getting Data: ${error}`);
			}
			self.updateStatus(InstanceStatus.Error)
			// Cleanup polling
			if (self.config.continuePolling !== true) {
				self.stopPolling()
			}
		}
	},

	//Split one response line into [name, value]. The camera writes "name:=value"
	//for a value that changed and "name==value" for one that did not (§3.2.3.1.2),
	//and only the first "=" separates the two -- a preset name may contain more.
	//Splitting on every "=" used to turn "name==value" into an empty value.
	parseLine(line) {
		line = String(line).trim()

		const index = line.indexOf('=')

		if (index === -1) {
			return [line]
		}

		let name = line.slice(0, index)
		let value = line.slice(index + 1)

		if (name.endsWith(':')) {
			name = name.slice(0, -1)
		}
		else if (value.startsWith('=')) {
			value = value.slice(1)
		}

		return [name, value]
	},

	//Crop parameters are arrays whose size and choices vary by model and by
	//the camera's current output settings, so they are stored by the names the
	//camera reports rather than one case per parameter
	storeCropData(name, value) {
		let self = this;

		let match = name.match(/^k\.(output\d+)\.crop(\.list)?$/)

		if (match) {
			const output = self.data.cropOutputs[match[1]] || { source: '', list: [] }

			if (match[2]) {
				output.list = value.split(',').filter((entry) => entry !== '')
			}
			else {
				output.source = value
			}

			self.data.cropOutputs[match[1]] = output
			return true
		}

		match = name.match(/^k\.(\d+)\.crop\.(size|frame\.(x|y|width|height)(?:\.(min|max))?)$/)

		if (match) {
			const area = self.data.cropAreas[match[1]] || {}

			if (match[2] === 'size') {
				area.size = value
			}
			else {
				//x, xMin, xMax, width, widthMin...
				const key = match[3] + (match[4] ? match[4].charAt(0).toUpperCase() + match[4].slice(1) : '')
				area[key] = parseInt(value)
			}

			self.data.cropAreas[match[1]] = area
			return true
		}

		return false
	},

	//The crop actions, feedbacks and variables are built from whatever outputs
	//and areas the camera reports, so rebuild them when that changes -- not on
	//every poll, since the frame values themselves move all the time
	updateCropShape() {
		let self = this;

		const outputs = Object.keys(self.data.cropOutputs).sort()

		if (outputs.length === 0 && self.data.cropCount === 0) {
			return
		}

		const shape = JSON.stringify([
			self.data.cropCount,
			outputs.map((output) => [output, self.data.cropOutputs[output].list.join(',')]),
			self.data.cropOutputNames,
		])

		if (shape !== self.data.cropShapeString) {
			self.data.cropShapeString = shape
			self.initActions()
			self.initFeedbacks()
			self.initVariables()
			self.initPresets()
		}
	},

	storeData(str) {
		let self = this;

		self.data.info.push(str);

		try {
			// Store Values from Events
			switch (str[0]) {
				//Detect camera type and reinitialize the module based on the detected model
				case 'c.1.type':
					self.data.modelDetected = str[1];
					if (self.data.model !== self.data.modelDetected) {
						self.log('info', 'New model detected, reloading module: ' + self.data.modelDetected);
						self.initActions()
						self.initFeedbacks()
						self.initVariables()
						self.initPresets()

						self.checkVariables()
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
				case 'c.1.zoom.mag':
					self.data.digitalMagnificationValue = str[1];
					break;
				case 'c.1.zoom.mag.list':
					if (self.data.digitalMagnificationListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.digitalMagnificationListString = str[1];
						self.log('info', 'New Digital Magnification List detected, reloading module: ' + self.data.digitalMagnificationListString);
						self.data.digitalMagnificationList = str[1].split(',');
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.zoom':
					self.data.zoomValue = str[1];
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
				case 's.hardware.address':
					self.data.macAddress = str[1];
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
						self.initActions()
						self.initPresets()
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
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.gainlimit.max':
					self.data.aeGainLimitMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.gainlimit.max.min':
					self.data.aeGainLimitMaxMin = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.gainlimit.max.max':
					self.data.aeGainLimitMaxMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.brightness':
					self.data.aeBrightness = str[1];
					break;
				case 'c.1.ae.brightness.list':
					if (self.data.aeBrightnessListString !== str[1]) { //only rebuild the actions if the list has changed
						self.data.aeBrightnessListString = str[1];
						self.log('info', 'New AE Brightness List detected, reloading module: ' + self.data.aeBrightnessListString);
						self.data.aeBrightnessList = str[1].split(',');
						self.initActions()
						self.initPresets()
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
						self.initActions()
						self.initPresets()
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
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.ae.resp':
					self.data.aeResp = parseInt(str[1]);
					break;
				case 'c.1.ae.resp.min':
					self.data.aeRespMin = parseInt(str[1]);
					self.initActions()
					self.initPresets()
					break;
				case 'c.1.ae.resp.max':
					self.data.aeRespMax = parseInt(str[1]);
					self.initActions()
					self.initPresets()
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
						self.initActions()
						self.initPresets()
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
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.me.gain.mode':
					self.data.gainMode = str[1];
					break;
				case 'c.1.me.gain':
					self.data.gainValue = str[1];
					break;
				case 'c.1.me.gain.increment':
					self.data.gainIncrement = str[1];
					break;
				case 'c.1.me.diaphragm.increment':
					self.data.irisIncrement = str[1];
					break;
				case 'c.1.me.diaphragm.fine':
					self.data.irisFine = str[1];
					break;
				case 'c.1.nd.filter':
					self.data.ndfilterValue = str[1];
					break;
				case 'c.1.nd.mode':
					self.data.ndMode = str[1];
					break;
				case 'c.1.scene':
					self.data.sceneMode = str[1];
					break;
				case 'c.1.zoom.accel':
					self.data.zoomAccel = str[1];
					break;
				case 'c.1.focus.oneshot.status':
					self.data.oneshotAutoFocusStatus = str[1];
					break;
				case 'c.1.focus.oneshot.result':
					self.data.oneshotAutoFocusResult = str[1];
					break;
				case 'c.1.ac':
					self.data.sharpness = str[1];
					break;
				case 'c.1.nr':
					self.data.noiseReduction = str[1];
					break;
				case 'c.1.focus.detect':
					self.data.focusDetect = str[1];
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
						self.initActions()
						self.initPresets()
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
						self.initActions()
						self.initPresets()
					}
					break;
				case 'c.1.wb.shift.rgain':
					self.data.rGainValue = str[1];
					break;
				case 'c.1.wb.shift.bgain':
					self.data.bGainValue = str[1];
					break;
				case 'c.1.platform.status':
					self.data.platformStatus = str[1];
					break;
				case 'c.1.colorbar':
					self.data.colorBars = str[1];
					break;
				case 'p':
					self.data.presetLastUsed = parseInt(str[1]);
					self.checkVariables()
					self.checkFeedbacks()
					break;
				case 'p.count':
					self.data.presetCount = parseInt(str[1]) || 100;
					break;
				//Recording
				case 'f.rec.status':
					self.data.recordStatus = str[1];
					break;
				case 'f.rec.mode':
					self.data.recordMode = str[1];
					break;
				case 'f.rec.format.media1':
					self.data.recordFormat = str[1];
					break;
				case 'f.rec.media1.status':
					self.data.media1Status = str[1];
					break;
				case 'f.rec.media1.remainingtime':
					self.data.media1RemainingTime = str[1];
					break;
				case 'f.rec.media1.videoinfo':
					self.data.media1VideoInfo = str[1];
					break;
				case 'f.rec.media2.status':
					self.data.media2Status = str[1];
					break;
				case 'f.rec.media2.remainingtime':
					self.data.media2RemainingTime = str[1];
					break;
				//Operating mode / playback
				case 'f.mode.status':
					self.data.operatingMode = str[1];
					break;
				case 'f.mediamode':
					self.data.mediaMode = str[1];
					break;
				case 'f.playback.status':
					self.data.playbackStatus = str[1];
					break;
				case 'f.playback.timecode':
					self.data.playbackTimecode = str[1];
					break;
				case 'f.playback.timecode.start':
					self.data.playbackTimecodeStart = str[1];
					break;
				case 'f.playback.timecode.end':
					self.data.playbackTimecodeEnd = str[1];
					break;
				case 'f.playback.frame':
					self.data.playbackFrame = str[1];
					break;
				case 'f.playback.frame.total':
					self.data.playbackFrameTotal = str[1];
					break;
				//Crop
				case 'f.output.list': {
					//e.g. output1:12g-sdi,output2:hdmi_3g-sdi,output3:ip
					const names = {};
					for (const entry of String(str[1]).split(',')) {
						const [output, kind] = entry.split(':');
						if (output && kind) {
							names[output] = kind;
						}
					}
					self.data.cropOutputNames = names;
					break;
				}
				case 'k.count':
					self.data.cropCount = parseInt(str[1]) || 0;
					break;
				default:
					if (str[0].startsWith('k.') && str[1] !== undefined) {
						self.storeCropData(str[0], str[1]);
					}
					break;
			}
			if ((str[0].indexOf('p.') !== -1) && (str[0].indexOf('.name.utf8') !== -1)) {
				for (let i = 1; i <= self.data.presetCount; i++) {
					if (str[0] === ('p.' + i + '.name.utf8')) {
						self.data['presetname' + i] = str[1];
						if ((self.data['presetname' + i] === '') || (self.data['presetname' + i] === ('preset' + i))) {
							self.data['presetname' + i] = i;
						}
					}
				}
			}
		}
		catch(error) {
			self.log('error', 'Error parsing response from PTZ: ' + String(error))
			console.log(error);
		}
	},

	getCameraInformation_Delayed() {
		let self = this;

		setTimeout(self.getCameraInformation.bind(self), 500);
	}
}
