const { InstanceStatus } = require('@companion-module/base')

var { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

const API = require('./api.js')

module.exports = {

	async sendPTZ(command, str) {
		let self = this;

		try {
			if (str !== undefined) {
				const connection = new API(self.config)

				let cmd = `${command}${str}`

				if (self.config.verbose) {
					self.log('debug', `Sending command: ${cmd}`);
				}

				const result = await connection.sendRequest(cmd)
			}
		} catch (error) {
			let errorText = String(error);

			if (errorText.match('ECONNREFUSED')) {
				self.log('error', 'Unable to connect to the server.')
			}
			else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
				self.log('error', 'Connection to server has timed out.')
			}
			else {
				self.log('error', `An error has occurred: ${errorText}`);
				self.updateStatus(InstanceStatus.Error, errorText);
			}
		}
	},

	initActions: function () {
		let self = this;
		
		let actions = {}
		let SERIES = {}
		let cmd = ''

		// Set the model and series selected, if in auto, detect what model is connected
		if (self.config.model === 'Auto') {
			self.data.model = self.data.modelDetected
		} else {
			self.data.model = self.config.model
		}

		if (self.data.model !== '') {
			self.data.series = MODELS.find((MODELS) => MODELS.id == self.data.model).series
		}

		// Find the specific commands for a given series
		if (
			self.data.series === 'Auto' ||
			self.data.series === 'Other' ||
			SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == self.data.series) == undefined
		) {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == 'Other')
		}
		else {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == self.data.series)
		}

		var s = SERIES.actions;

		//check if any lists need to be updated
		if (self.data.exposureShootingModeList !== null) {
			s.exposureShootingMode.dropdown = c.CHOICES_EXPOSURESHOOTINGMODES_BUILD(self.data.exposureShootingModeList); //rebuild the list by running the function again
		}

		if (self.data.exposureModeList !== null) {
			s.exposureMode.dropdown = c.CHOICES_EXPOSUREMODES_BUILD(self.data.exposureModeList); //rebuild the list by running the function again
		}

		if (self.data.aeBrightnessList !== null) {
			s.aeBrightness.dropdown = c.CHOICES_AEBRIGHTNESS_BUILD(self.data.aeBrightnessList); //rebuild the list by running the function again
		}

		if (self.data.aePhotometryList !== null) {
			s.aePhotometry.dropdown = c.CHOICES_AEPHOTOMETRY_BUILD(self.data.aePhotometryList); //rebuild the list by running the function again
		}

		if (self.data.aeFlickerReductList !== null) {
			s.aeFlickerReduct.dropdown = c.CHOICES_AEFLICKERREDUCT_BUILD(self.data.aeFlickerReductList); //rebuild the list by running the function again
		}

		if (self.data.shutterList !== null) {
			s.shutter.dropdown = c.CHOICES_SHUTTER_BUILD(self.data.shutterList); //rebuild the list by running the function again
		}

		if (self.data.irisList !== null) {
			s.iris.dropdown = c.CHOICES_IRIS_BUILD(self.data.irisList); //rebuild the list by running the function again
		}

		if (self.data.kelvinList !== null) {
			s.kelvin.dropdown = c.CHOICES_KELVIN_BUILD(self.data.kelvinList); //rebuild the list
		}

		if (self.data.whitebalanceModeList !== null) {
			s.whitebalanceMode.dropdown = c.CHOICES_WBMODE_BUILD(self.data.whitebalanceModeList); //rebuild the list by running the function again
		}

		// ########################
		// #### System Actions ####
		// ########################

		if (s.powerState == true) {
			actions.powerOff = {
				name: 'System - Power Off',
				options: [],
				callback: async (action) => {
					cmd = 'cmd=standby'
					self.sendPTZ(self.powerCommand, cmd);
					self.data.powerState = 'standby';
					self.getCameraInformation_Delayed();
				}
			}

			actions.powerOn = {
				name: 'System - Power On',
				options: [],
				callback: async (action) => {
					cmd = 'cmd=idle'
					self.sendPTZ(self.powerCommand, cmd);
					self.data.powerState = 'idle';
					self.getCameraInformation_Delayed();
				}
			}

			actions.powerToggle = {
				name: 'System - Power Toggle',
				options: [],
				callback: async (action) => {
					if (self.data.powerState === 'idle') {
						cmd = 'cmd=standby';
						self.data.powerState = 'standby';
					}
					else {
						cmd = 'cmd=idle';
						self.data.powerState = 'idle';
					}
					self.sendPTZ(self.powerCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.cameraName.cmd) {
			actions.cameraName = {
				name: 'Set Camera Name',
				options: [
					{
						type: 'textinput',
						label: 'Camera Name',
						id: 'name',
						default: 'Camera',
						tooltip: 'Set the name of the camera.'
					}
				],
				callback: async (action) => {
					cmd = 'c.1.name.utf8=' + action.options.name;
					if (cmd !== '') {
						self.sendPTZ(self.ptzCommand, cmd)
					}
				}
			}
		}

		if (s.tallyProgram == true) {
			actions.tallyProgramOff = {
				name: 'System - Tally Off (Program)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=off&tally.mode=program'
					self.sendPTZ(self.ptzCommand, cmd)
					self.data.tallyProgram = 'off';
					if (self.data.tallyPreview === 'on') {
						cmd = 'tally=on&tally.mode=preview'
						self.sendPTZ(self.ptzCommand, cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyProgramOn = {
				name: 'System - Tally On (Program)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=on&tally.mode=program'
					self.sendPTZ(self.ptzCommand, cmd)
					self.data.tallyProgram = 'on';
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.tallyPreview == true) {
			actions.tallyPreviewOff = {
				name: 'System - Tally Off (Preview)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=off&tally.mode=preview'
					self.sendPTZ(self.ptzCommand, cmd)
					self.data.tallyPreview = 'off';
					if (self.data.tallyProgram === 'on') {
						cmd = 'tally=on&tally.mode=program'
						self.sendPTZ(self.ptzCommand, cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyPreviewOn = {
				name: 'System - Tally On (Preview)',
				options: [],
				callback: async (action) => {
					cmd = 'tally=on&tally.mode=preview'
					self.sendPTZ(self.ptzCommand, cmd)
					self.data.tallyPreview = 'on';
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyToggle = {
				name: 'System - Tally Toggle',
				options: [],
				callback: async (action) => {
					if (self.data.tallyProgram === 'on') {
						cmd = 'tally=on&tally.mode=preview';
						self.data.tallyPreview = 'on';
						self.data.tallyProgram = 'off';
					}
					else {
						cmd = 'tally=on&tally.mode=program';
						self.data.tallyProgram = 'on';
						self.data.tallyPreview = 'off';
					}	
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.digitalZoom == true) {
			actions.digitalZoom = {
				name: 'Digital Zoom On/Off',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Off' },
							{ id: 1, label: 'On' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.zoom.mode=off'
						self.data.digitalZoom = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.zoom.mode=dzoom'
						self.data.digitalZoom = 'dzoom';
					}
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.imageStabilization == true) {
			actions.imageStabilization = {
				name: 'Image Stabilization On/Off',
				options: [
					{
						type: 'dropdown',
						label: 'On/Off',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Off' },
							{ id: 1, label: 'On' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.is=off'
						self.data.imageStabilization = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.is=on1'
						self.data.imageStabilization = 'on1';
					}
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.custom == true) {
			actions.customCommand = {
				name: 'Send Custom Command',
				options: [
					{
						type: 'textinput',
						label: 'Custom Command',
						id: 'command',
						default: '',
						tooltip: 'Send a custom command. If it is not a supported command, the device may reject it.'
					}
				],
				callback: async (action) => {
					cmd = action.options.command
					if (cmd !== '') {
						self.sendPTZ(self.ptzCommand, cmd)
						self.getCameraInformation_Delayed();
					}
				}
			}
		}

		// ##########################
		// #### Pan/Tilt Actions ####
		// ##########################

		if (s.panTilt == true) {
			actions.left = {
				name: 'Pan/Tilt - Pan Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.right = {
				name: 'Pan/Tilt - Pan Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.up = {
				name: 'Pan/Tilt - Tilt Up',
				options: [],
				callback: async (action) => {
					cmd = 'tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.down = {
				name: 'Pan/Tilt - Tilt Down',
				options: [],
				callback: async (action) => {
					cmd = 'tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.upLeft = {
				name: 'Pan/Tilt - Up Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed + '&tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.upRight = {
				name: 'Pan/Tilt - Up Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed + '&tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.downLeft = {
				name: 'Pan/Tilt - Down Left',
				options: [],
				callback: async (action) => {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed + '&tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.downRight = {
				name: 'Pan/Tilt - Down Right',
				options: [],
				callback: async (action) => {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed + '&tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.stop = {
				name: 'Pan/Tilt - Stop',
				options: [],
				callback: async (action) => {
					cmd = 'pan=stop&tilt=stop'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.home = {
				name: 'Pan/Tilt - Home',
				options: [],
				callback: async (action) => {
					cmd = 'pan=0&tilt=0'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}
		}

		if (s.ptSpeed == true) {
			actions.ptSpeedU = {
				name: 'Pan/Tilt - Speed Up',
				options: [],
				callback: async (action) => {
					if (self.ptSpeedIndex == 0) {
						self.ptSpeedIndex = 0
					} else if (self.ptSpeedIndex > 0) {
						self.ptSpeedIndex--
					}
					self.ptSpeed = c.CHOICES_PT_SPEED[self.ptSpeedIndex].id
					self.data.panTiltSpeedValue = self.ptSpeed;
					self.getCameraInformation_Delayed();
				}
			}

			actions.ptSpeedD = {
				name: 'Pan/Tilt - Speed Down',
				options: [],
				callback: async (action) => {
					if (self.ptSpeedIndex == c.CHOICES_PT_SPEED.length) {
						self.ptSpeedIndex = c.CHOICES_PT_SPEED.length
					} else if (self.ptSpeedIndex < c.CHOICES_PT_SPEED.length) {
						self.ptSpeedIndex++
					}
					self.ptSpeed = c.CHOICES_PT_SPEED[self.ptSpeedIndex].id
					self.data.panTiltSpeedValue = self.ptSpeed;
					self.getCameraInformation_Delayed();
				}
			}

			actions.ptSpeedS = {
				name: 'Pan/Tilt - Set Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Pan/Tilt Speed Setting',
						id: 'speed',
						default: 625,
						choices: c.CHOICES_PT_SPEED,
					},
				],
				callback: async (action) => {
					self.ptSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_PT_SPEED.length; ++i) {
						if (c.CHOICES_PT_SPEED[i].id == self.ptSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						self.ptSpeedIndex = idx
					}
					self.ptSpeed = c.CHOICES_PT_SPEED[self.ptSpeedIndex].id
					self.data.panTiltSpeedValue = self.ptSpeed;
					self.getCameraInformation_Delayed();
				}
			}
		}

		// ######################
		// #### Lens Actions ####
		// ######################

		if (s.zoom == true) {
			actions.zoomI = {
				name: 'Lens - Zoom In',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=tele&zoom.speed.dir=' + self.zSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.zoomO = {
				name: 'Lens - Zoom Out',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=wide&zoom.speed.dir=' + self.zSpeed
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.zoomS = {
				name: 'Lens - Zoom Stop',
				options: [],
				callback: async (action) => {
					cmd = 'zoom=stop'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}
		}

		if (s.zoomValue == true) {
			actions.zoomValue = {
				name: 'Lens - Set Zoom Value',
				options: [
					{
						type: 'textinput',
						label: 'Zoom Value',
						id: 'value',
						default: '',
						tooltip: 'Set a custom zoom level. If it is not within range, the device may reject it.'
					}
				],
				callback: async (action) => {
					cmd = 'zoom=' + action.options.value;
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}
		}

		if (s.zoomSpeed == true) {
			actions.zSpeedS = {
				name: 'Lens - Set Zoom Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Zoom Speed Setting',
						id: 'speed',
						default: 8,
						choices: c.CHOICES_ZOOM_SPEED,
					},
				],
				callback: async (action) => {
					self.zSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_ZOOM_SPEED.length; ++i) {
						if (c.CHOICES_ZOOM_SPEED[i].id == self.zSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						self.zSpeedIndex = idx
					}
					self.zSpeed = c.CHOICES_ZOOM_SPEED[self.zSpeedIndex].id
					self.data.zoomSpeed = self.zSpeed;
					self.getCameraInformation_Delayed();
				}
			}

			actions.zSpeedU = {
				name: 'Lens - Zoom Speed Up',
				options: [],
				callback: async (action) => {
					if (self.zSpeedIndex == 0) {
						self.zSpeedIndex = 0
					} else if (self.zSpeedIndex > 0) {
						self.zSpeedIndex--
					}
					self.zSpeed = c.CHOICES_ZOOM_SPEED[self.zSpeedIndex].id
					self.data.zoomSpeed = self.zSpeed;
					self.getCameraInformation_Delayed();
				}
			}

			actions.zSpeedD = {
				name: 'Lens - Zoom Speed Down',
				options: [],
				callback: async (action) => {
					if (self.zSpeedIndex == c.CHOICES_ZOOM_SPEED.length) {
						self.zSpeedIndex = c.CHOICES_ZOOM_SPEED.length
					} else if (self.zSpeedIndex < c.CHOICES_ZOOM_SPEED.length) {
						self.zSpeedIndex++
					}
					self.zSpeed = c.CHOICES_ZOOM_SPEED[self.zSpeedIndex].id
					self.data.zoomSpeed = self.zSpeed;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.focus == true) {
			actions.focusN = {
				name: 'Lens - Focus Near',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=near'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.focusF = {
				name: 'Lens - Focus Far',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=far'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}

			actions.focusS = {
				name: 'Lens - Focus Stop',
				options: [],
				callback: async (action) => {
					cmd = 'focus.action=stop'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}
		}

		if (s.focusSpeed == true) {
			actions.fSpeedS = {
				name: 'Lens - Set Focus Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Focus Speed Setting',
						id: 'speed',
						default: 1,
						choices: c.CHOICES_FOCUS_SPEED,
					},
				],
				callback: async (action) => {
					self.fSpeed = action.options.speed
					var idx = -1
					for (var i = 0; i < c.CHOICES_FOCUS_SPEED.length; ++i) {
						if (c.CHOICES_FOCUS_SPEED[i].id == self.fSpeed) {
							idx = i
							break
						}
					}
					if (idx > -1) {
						self.fSpeedIndex = idx
					}
					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;

					self.checkVariables();
					
					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedU = {
				name: 'Lens - Focus Speed Up',
				options: [],
				callback: async (action) => {
					if (self.fSpeedIndex <= 0) {
						self.fSpeedIndex = 0
					} else if (self.fSpeedIndex > 0) {
						self.fSpeedIndex--
					}
					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;

					self.checkVariables();

					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedD = {
				name: 'Lens - Focus Speed Down',
				options: [],
				callback: async (action) => {
					if (self.fSpeedIndex >= c.CHOICES_FOCUS_SPEED.length) {
						self.fSpeedIndex = c.CHOICES_FOCUS_SPEED.length - 1
					} else if (self.fSpeedIndex < c.CHOICES_FOCUS_SPEED.length - 1) {
						self.fSpeedIndex++
					}
					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;

					self.checkVariables();

					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedToggle = {
				name: 'Lens - Focus Speed Toggle',
				options: [],
				callback: async (action) => {
					if (self.fSpeedIndex >= c.CHOICES_FOCUS_SPEED.length - 1) {
						self.fSpeedIndex = 0
					} else if (self.fSpeedIndex < c.CHOICES_FOCUS_SPEED.length - 1) {
						self.fSpeedIndex++
					}

					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;

					self.checkVariables();
					
					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.autoFocus == true) {
			actions.focusM = {
				name: 'Lens - Focus Mode (Auto/Manual Focus)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Focus',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Focus' },
							{ id: 1, label: 'Manual Focus' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'focus=auto'
						self.data.focusMode = 'auto';
					}
					if (action.options.bol == 1) {
						cmd = 'focus=manual'
						self.data.focusMode = 'manual';
					}
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.focusToggle = {
				name: 'Lens - Toggle Focus Mode (Auto/Manual Focus)',
				options: [],
				callback: async (action) => {
					if (self.data.focusMode === 'auto') {
						self.data.focusMode = 'manual';
					}
					else {
						self.data.focusMode = 'auto';
					}
					cmd = 'focus=' + self.data.focusMode;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.oneshotAutoFocus == true) {
			actions.focusOSAF = {
				name: 'Lens - Focus - One Shot Auto Focus',
				options: [],
				callback: async (action) => {
					cmd = 'focus=one_shot'
					self.sendPTZ(self.ptzCommand, cmd)
				}
			}
		}

		// ##########################
		// #### Exposure Actions ####
		// ##########################

		if (s.exposureShootingMode.cmd) {
			actions.exposureShootingMode = {
				name: 'Exposure Shooting Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Shooting Mode',
						id: 'val',
						default: s.exposureShootingMode.dropdown[0].id,
						choices: s.exposureShootingMode.dropdown
					}
				],
				callback: async (action) => {
					cmd = s.exposureShootingMode.cmd + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
										
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.exposureMode.cmd) {
			actions.exposureM = {
				name: 'Exposure Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Mode',
						id: 'val',
						default: s.exposureMode.dropdown[0].id,
						choices: s.exposureMode.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.shooting=manual';
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.exposureShootingMode = 'manual';
					cmd = 'c.1.exp=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.exposureMode = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}

			actions.exposureModeToggle = {
				name: 'Exposure Mode Toggle',
				options: [],
				callback: async (action) => {
					self.exposureModeIndex = s.exposureMode.dropdown.findIndex((EXPOSUREMODE) => EXPOSUREMODE.id == self.data.exposureMode);

					if (!self.exposureModeIndex) {
						self.exposureModeIndex = 0;
					}

					if (self.exposureModeIndex >= s.exposureMode.dropdown.length - 1) {
						self.exposureModeIndex = 0;
					} else if (self.exposureModeIndex < s.exposureMode.dropdown.length) {
						self.exposureModeIndex++;
					}

					self.exposureMode = s.exposureMode.dropdown[self.exposureModeIndex].id
					self.data.exposureMode = self.exposureMode;

					if (self.data.exposureMode === 'fullauto') {
						cmd = 'c.1.shooting=fullauto';
						self.sendPTZ(self.ptzCommand, cmd);
						self.data.exposureShootingMode = 'fullauto';
						self.data.exposureMode = 'fullauto';
					}
					else {
						cmd = 'c.1.shooting=manual';
						self.sendPTZ(self.ptzCommand, cmd);
						self.data.exposureShootingMode = 'manual';
						cmd = 'c.1.exp=' + self.data.exposureMode;
						self.sendPTZ(self.ptzCommand, cmd);
					}		
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeGainLimit) {
			actions.aeGainLimit = {
				name: 'AE Gain Limit Max',
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'val',
						tooltip: 'Sets the Gain Limit Max',
						min: self.data.aeGainLimitMaxMin,
						max: self.data.aeGainLimitMaxMax,
						default: 330,
						step: 1,
						required: true,
						range: false
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.gainlimit.max=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.aeGainLimitMax = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeBrightness.cmd) {
			actions.aeBrightness = {
				name: 'AE Brightness',
				options: [
					{
						type: 'dropdown',
						label: 'AE Brightness',
						id: 'val',
						default: s.aeBrightness.dropdown[0].id,
						choices: s.aeBrightness.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.brightness=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.aeBrightness = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aePhotometry.cmd) {
			actions.aePhotometry = {
				name: 'AE Photometry',
				options: [
					{
						type: 'dropdown',
						label: 'AE Photometry',
						id: 'val',
						default: s.aePhotometry.dropdown[0].id,
						choices: s.aePhotometry.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.photometry=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.aePhotometry = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeFlickerReduct.cmd) {
			actions.aeFlickerReduct = {
				name: 'AE Flicker Reduct',
				options: [
					{
						type: 'dropdown',
						label: 'AE Flicker Reduct',
						id: 'val',
						default: s.aeFlickerReduct.dropdown[0].id,
						choices: s.aeFlickerReduct.dropdown
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.flickerreduct=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.aeFlickerReduct = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.aeResp) {
			actions.aeResp = {
				name: 'AE Resp',
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'val',
						tooltip: 'Sets the AE Resp Value',
						min: self.data.aeRespMin,
						max: self.data.aeRespMax,
						default: 1,
						step: 1,
						required: true,
						range: false
					}
				],
				callback: async (action) => {
					cmd = 'c.1.ae.resp=' + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.data.aeResp = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.shutter.cmd) {
			if (s.shutter.dropdown === undefined) {
				s.shutter.dropdown = c.CHOICES_SHUTTER_OTHER();
			}

			actions.shutterM = {
				name: 'Exposure - Shutter Mode (Auto Shutter)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Shutter',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Shutter' },
							{ id: 1, label: 'Manual Shutter' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.shutter.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.shutter.mode=speed'
					}
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterToggle = {
				name: 'Exposure - Toggle Shutter Mode (Auto/Manual Shutter)',
				options: [],
				callback: async (action) => {
					if (self.data.shutterMode === 'auto') {
						self.data.shutterMode = 'speed';
					}
					else {
						self.data.shutterMode = 'auto';
					}
					cmd = 'c.1.me.shutter.mode=' + self.data.shutterMode;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterUp = {
				name: 'Exposure - Shutter Up',
				options: [],
				callback: async (action) => {
					if (self.shutterIndex == s.shutter.dropdown.length) {
						self.shutterIndex = s.shutter.dropdown.length
					} else if (self.shutterIndex < s.shutter.dropdown.length) {
						self.shutterIndex++
					}
					self.shutterValue = s.shutter.dropdown[self.shutterIndex].id
					self.data.shutterValue = self.shutterValue;

					if (self.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.shutter.cmd + self.shutterValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterDown = {
				name: 'Exposure - Shutter Down',
				options: [],
				callback: async (action) => {
					if (self.shutterIndex == 0) {
						self.shutterIndex = 0
					}
					else if (self.shutterIndex > 0) {
						self.shutterIndex--
					}
					self.shutterValue = s.shutter.dropdown[self.shutterIndex].id
					self.data.shutterValue = self.shutterValue;

					if (self.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.shutter.cmd + self.shutterValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterSet = {
				name: 'Exposure - Set Shutter',
				options: [
					{
						type: 'dropdown',
						label: 'Shutter Setting',
						id: 'val',
						default: s.shutter.dropdown[0].id,
						choices: s.shutter.dropdown,
					},
				],
				callback: async (action) => {
					self.shutterValue = action.options.val;
					self.data.shutterValue = self.shutterValue;

					if (self.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(self.ptzCommand, cmd)

						self.shutterIndex = s.shutter.dropdown.findIndex((SHUTTER) => SHUTTER.id == action.options.val);
						cmd = s.shutter.cmd + self.shutterValue;
						self.sendPTZ(self.ptzCommand, cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.iris.cmd) {
			if (s.iris.dropdown === undefined) {
				s.iris.dropdown = c.CHOICES_IRIS_OTHER();
			}

			actions.irisU = {
				name: 'Exposure - Iris Up',
				options: [],
				callback: async (action) => {
					if (self.irisIndex == s.iris.dropdown.length) {
						self.irisIndex = s.iris.dropdown.length
					} else if (self.irisIndex < s.iris.dropdown.length) {
						self.irisIndex++
					}
					self.irisValue = s.iris.dropdown[self.irisIndex].id
					self.data.irisValue = self.irisValue;
					
					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.iris.cmd + self.irisValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisD = {
				name: 'Exposure - Iris Down',
				options: [],
				callback: async (action) => {
					if (self.irisIndex == 0) {
						self.irisIndex = 0
					} else if (self.irisIndex > 0) {
						self.irisIndex--
					}
					self.irisValue = s.iris.dropdown[self.irisIndex].id
					self.data.irisValue = self.irisValue;
					
					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.iris.cmd + self.irisValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisS = {
				name: 'Exposure - Set Iris',
				options: [
					{
						type: 'dropdown',
						label: 'Iris Setting',
						id: 'val',
						default: s.iris.dropdown[0].id,
						choices: s.iris.dropdown,
					},
				],
				callback: async (action) => {
					self.irisIndex = s.iris.dropdown.findIndex((IRIS) => IRIS.id == action.options.val);
					self.irisValue = action.options.val;
					self.data.irisValue = self.irisValue;

					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)

						cmd = s.iris.cmd + self.irisValue;
						self.sendPTZ(self.ptzCommand, cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisM = {
				name: 'Exposure - Iris Mode (Auto Iris)',
				options: [
					{
						type: 'dropdown',
						label: 'Auto / Manual Iris',
						id: 'bol',
						default: 0,
						choices: [
							{ id: 0, label: 'Auto Iris' },
							{ id: 1, label: 'Manual Iris' },
						],
					},
				],
				callback: async (action) => {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.diaphragm.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.diaphragm.mode=manual'
					}
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisToggle = {
				name: 'Exposure - Toggle Iris Mode (Auto/Manual Iris)',
				options: [],
				callback: async (action) => {
					if (self.data.irisMode === 'auto') {
						self.data.irisMode = 'manual';
					}
					else {
						self.data.irisMode = 'auto';
					}
					cmd = 'c.1.me.diaphragm.mode=' + self.data.irisMode;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.gain.cmd) {
			if (s.gain.dropdown === undefined) {
				s.gain.dropdown = c.CHOICES_GAIN_OTHER();
			}

			actions.gainU = {
				name: 'Exposure - Gain Up',
				options: [],
				callback: async (action) => {
					if (self.gainIndex == s.gain.dropdown.length) {
						self.gainIndex = s.gain.dropdown.length
					} else if (self.gainIndex < s.gain.dropdown.length) {
						self.gainIndex++
					}
					self.gainValue = s.gain.dropdown[self.gainIndex].id
					self.data.gainValue = self.gainValue;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.gain.cmd + self.gainValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainD = {
				name: 'Exposure - Gain Down',
				options: [],
				callback: async (action) => {
					if (self.gainIndex == 0) {
						self.gainIndex = 0
					} else if (self.gainIndex > 0) {
						self.gainIndex--
					}
					self.gainValue = s.gain.dropdown[self.gainIndex].id
					self.data.gainValue = self.gainValue;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)
						cmd = s.gain.cmd + self.gainValue
						self.sendPTZ(self.ptzCommand, cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainToggle = {
				name: 'Exposure - Toggle Gain Mode (Auto/Manual Gain)',
				options: [],
				callback: async (action) => {
					if (self.data.gainMode === 'auto') {
						self.data.gainMode = 'manual';
					}
					else {
						self.data.gainMode = 'auto';
					}
					cmd = 'c.1.me.gain.mode=' + self.data.gainMode;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainS = {
				name: 'Exposure - Set Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Gain setting',
						id: 'val',
						default: s.gain.dropdown[0].id,
						choices: s.gain.dropdown,
					},
				],
				callback: async (action) => {
					self.gainIndex = action.options.val;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(self.ptzCommand, cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(self.ptzCommand, cmd)

						self.gainIndex = s.gain.dropdown.findIndex((GAIN) => GAIN.id == action.options.val);
						self.gainValue = action.options.val;
						self.data.gainValue = self.gainValue;
						cmd = s.gain.cmd + self.gainValue;
						self.sendPTZ(self.ptzCommand, cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.ndfilter.cmd) {
			if (s.ndfilter.dropdown === undefined) {
				s.ndfilter.dropdown = c.CHOICES_NDFILTER_OTHER;
			}

			actions.ndfilterUp = {
				name: 'Exposure - ND Filter Up',
				options: [],
				callback: async (action) => {
					if (self.ndfilterIndex == s.ndfilter.dropdown.length) {
						self.ndfilterIndex = s.ndfilter.dropdown.length
					} else if (self.ndfilterIndex < s.ndfilter.dropdown.length) {
						self.ndfilterIndex++
					}
					self.ndfilterValue = s.ndfilter.dropdown[self.ndfilterIndex].id
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.ndfilterDown = {
				name: 'Exposure - ND Filter Down',
				options: [],
				callback: async (action) => {
					if (self.ndfilterIndex == 0) {
						self.ndfilterIndex = 0
					} else if (self.ndfilterIndex > 0) {
						self.ndfilterIndex--
					}
					self.ndfilterValue = s.ndfilter.dropdown[self.ndfilterIndex].id
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.filterSet = {
				name: 'Exposure - Set ND Filter',
				options: [
					{
						type: 'dropdown',
						label: 'ND Filter Setting',
						id: 'val',
						default: s.ndfilter.dropdown[0].id,
						choices: s.ndfilter.dropdown,
					},
				],
				callback: async (action) => {
					self.ndfilterIndex = s.ndfilter.dropdown.findIndex((NDFILTER) => NDFILTER.id == action.options.val);
					self.ndfilterValue = action.options.val;
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.pedestal.cmd) {
			if (s.pedestal.dropdown === undefined) {
				s.pedestal.dropdown = c.CHOICES_PEDESTAL_OTHER();
			}

			actions.pedestalUp = {
				name: 'Exposure - Pedestal Up',
				options: [],
				callback: async (action) => {
					if (self.pedestalIndex == s.pedestal.dropdown.length) {
						self.pedestalIndex = s.pedestal.dropdown.length
					} else if (self.pedestalIndex < s.pedestal.dropdown.length) {
						self.pedestalIndex++
					}
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.pedestalDown = {
				name: 'Exposure - Pedestal Down',
				options: [],
				callback: async (action) => {
					if (self.pedestalIndex == 0) {
						self.pedestalIndex = 0
					} else if (self.pedestalIndex > 0) {
						self.pedestalIndex--
					}
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.pedestalSet = {
				name: 'Exposure - Set Pedestal',
				options: [
					{
						type: 'dropdown',
						label: 'Pedestal Setting',
						id: 'val',
						default: s.pedestal.dropdown[0].id,
						choices: s.pedestal.dropdown,
					},
				],
				callback: async (action) => {
					self.pedestalIndex = s.pedestal.dropdown.findIndex((PEDESTAL) => PEDESTAL.id == action.options.val);
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		// ##########################
		// #### White Balance Actions ####
		// ##########################

		if (s.whitebalanceMode.cmd) {
			if (s.whitebalanceMode.dropdown === undefined) {
				s.whitebalanceMode.dropdown = c.CHOICES_WBMODE_OTHER;
			}

			actions.whitebalanceModeSet = {
				name: 'White Balance - Set Mode',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode Setting',
						id: 'val',
						default: s.whitebalanceMode.dropdown[0].id,
						choices: s.whitebalanceMode.dropdown,
					},
				],
				callback: async (action) => {
					cmd = s.whitebalanceMode.cmd + action.options.val;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceModeToggle = {
				name: 'White Balance Mode Toggle',
				options: [],
				callback: async (action) => {
					self.whitebalanceModeIndex = s.whitebalanceMode.dropdown.findIndex((WBMODE) => WBMODE.id == self.data.whitebalanceMode);

					if (!self.whitebalanceModeIndex) {
						self.whitebalanceModeIndex = 0;
					}

					if (self.whitebalanceModeIndex >= s.whitebalanceMode.dropdown.length - 1) {
						self.whitebalanceModeIndex = 0;
					} else if (self.whitebalanceModeIndex < s.whitebalanceMode.dropdown.length - 1) {
						self.whitebalanceModeIndex++;
					}

					self.whitebalanceMode = s.whitebalanceMode.dropdown[self.whitebalanceModeIndex].id
					self.data.whitebalanceMode = self.whitebalanceMode;

					cmd = s.whitebalanceMode.cmd + self.data.whitebalanceMode;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceCalibration = {
				name: 'White Balance Calibration',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode',
						id: 'mode',
						default: 'a',
						choices: [ { id: 'a', label: 'WB A Mode'}, { id: 'b', label: 'WB B Mode'}]
					}
				],
				callback: async (action) => {
					cmd = 'c.1.wb.action=one_shot_' + action.options.mode;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.kelvin.cmd) {
			if (s.kelvin.dropdown === undefined) {
				s.kelvin.dropdown = c.CHOICES_KELVIN_OTHER();
			}
			actions.kelvinUp = {
				name: 'White Balance - Kelvin Value Up',
				options: [],
				callback: async (action) => {
					if (self.kelvinIndex >= s.kelvin.dropdown.length) {
						self.kelvinIndex = s.kelvin.dropdown.length
					} else if (self.kelvinIndex < s.kelvin.dropdown.length) {
						self.kelvinIndex++
					}
					self.kelvinValue = s.kelvin.dropdown[self.kelvinIndex].id
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.kelvinDown = {
				name: 'White Balance - Kelvin Value Down',
				options: [],
				callback: async (action) => {
					if (self.kelvinIndex <= 0) {
						self.kelvinIndex = 0
					} else if (self.kelvinIndex > 0) {
						self.kelvinIndex--
					}
					self.kelvinValue = s.kelvin.dropdown[self.kelvinIndex].id
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.kelvinSet = {
				name: 'White Balance - Set Kelvin Value',
				options: [
					{
						type: 'dropdown',
						label: 'Kelvin Setting',
						id: 'val',
						default: s.kelvin.dropdown[0].id,
						choices: s.kelvin.dropdown,
					},
				],
				callback: async (action) => {
					self.kelvinIndex = s.kelvin.dropdown.findIndex((KELVIN) => KELVIN.id == action.options.val);
					self.kelvinValue = action.options.val;
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.rGain.cmd) {
			if (s.rGain.dropdown === undefined) {
				s.rGain.dropdown = c.CHOICES_RGAIN_OTHER();
			}
			actions.rGainUp = {
				name: 'White Balance - Red Gain Up',
				options: [],
				callback: async (action) => {
					if (self.rGainIndex >= s.rGain.dropdown.length) {
						self.rGainIndex = s.rGain.dropdown.length
					} else if (self.rGainIndex < s.rGain.dropdown.length) {
						self.rGainIndex++
					}
					self.rGainValue = s.rGain.dropdown[self.rGainIndex].id
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.rGainDown = {
				name: 'White Balance - Red Gain Down',
				options: [],
				callback: async (action) => {
					if (self.rGainIndex <= 0) {
						self.rGainIndex = 0
					} else if (self.rGainIndex > 0) {
						self.rGainIndex--
					}
					self.rGainValue = s.rGain.dropdown[self.rGainIndex].id
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.rGainSet = {
				name: 'White Balance - Set Red Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Red Gain Setting',
						id: 'val',
						default: s.rGain.dropdown[0].id,
						choices: s.rGain.dropdown
					},
				],
				callback: async (action) => {
					self.rGainIndex = s.rGain.dropdown.findIndex((RGAIN) => RGAIN.id == action.options.val);
					self.rGainValue = action.options.val;
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.bGain.cmd) {
			if (s.bGain.dropdown === undefined) {
				s.bGain.dropdown = c.CHOICES_BGAIN_OTHER();
			}
			actions.bGainUp = {
				name: 'White Balance - Blue Gain Up',
				options: [],
				callback: async (action) => {
					if (self.bGainIndex >= s.bGain.dropdown.length) {
						self.bGainIndex = s.bGain.dropdown.length
					} else if (self.bGainIndex < s.bGain.dropdown.length) {
						self.bGainIndex++
					}
					self.bGainValue = s.bGain.dropdown[self.bGainIndex].id
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.bGainDown = {
				name: 'White Balance - Blue Gain Down',
				options: [],
				callback: async (action) => {
					if (self.bGainIndex <= 0) {
						self.bGainIndex = 0
					} else if (self.bGainIndex > 0) {
						self.bGainIndex--
					}
					self.bGainValue = s.bGain.dropdown[self.bGainIndex].id
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(self.ptzCommand, cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.bGainSet = {
				name: 'White Balance - Set Blue Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Blue Gain Setting',
						id: 'val',
						default: s.bGain.dropdown[0].id,
						choices: s.bGain.dropdown,
					},
				],
				callback: async (action) => {
					self.bGainIndex = s.bGain.dropdown.findIndex((BGAIN) => BGAIN.id == action.options.val);
					self.bGainValue = action.options.val;
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(self.ptzCommand, cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		// #########################
		// #### Presets Actions ####
		// #########################

		if (s.presets == true) {
			actions.savePset = {
				name: 'Preset - Save',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS()[0].id,
						choices: c.CHOICES_PRESETS(),
					},
					{
						type: 'textinput',
						label: 'Preset Name',
						id: 'name',
						default: 'preset',
						tooltip: 'Set the name of the preset.'
					},
					{
						type: 'checkbox',
						label: 'Save Position (PTZ)',
						id: 'save_ptz',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Focus',
						id: 'save_focus',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Exposure',
						id: 'save_exposure',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save White Balance',
						id: 'save_whitebalance',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save Image Stabilization (IS)',
						id: 'save_is',
						default: true
					},
					{
						type: 'checkbox',
						label: 'Save CP',
						id: 'save_cp',
						default: true
					}
				],
				callback: async (action) => {
					cmd = 'p=' + action.options.val + '&name=' + action.options.name;
					if ((action.options.save_ptz) && (action.options.save_focus) && (action.options.save_exposure) && (action.options.save_whitebalance) && (action.options.save_is) && (action.options.save_cp)) {
						cmd += '&all=enabled';
					}
					else {
						if (action.options.save_ptz) {
							cmd += '&ptz=enabled';
						}
						else {
							cmd += '&ptz=disabled';
						}
						if (action.options.save_focus) {
							cmd += '&focus=enabled';
						}
						else {
							cmd += '&focus=disabled';
						}
						if (action.options.save_exposure) {
							cmd += '&exp=enabled';
						}
						else {
							cmd += '&exp=disabled';
						}
						if (action.options.save_whitebalance) {
							cmd += '&wb=enabled';
						}
						else {
							cmd += '&wb=disabled';
						}
						if (action.options.save_is) {
							cmd += '&is=enabled';
						}
						else {
							cmd += '&is=disabled';
						}
						if (action.options.save_cp) {
							cmd += '&cp=enabled';
						}
						else {
							cmd += '&cp=disabled';
						}
					}
					self.sendPTZ(self.savePresetCommand, cmd);
				}
			}
		
			actions.recallPset = {
				name: 'Preset - Recall',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS()[0].id,
						choices: c.CHOICES_PRESETS(),
					},
				],
				callback: async (action) => {
					//need to determine drive mode first (normal, time, speed) and then recall with appropriate command
					if (!self.presetRecallMode) {
						self.presetRecallMode = 'normal';
						self.data.presetRecallMode = 'normal';
					}

					cmd = 'p=' + action.options.val;

					switch(self.presetRecallMode) {
						case 'time':
							cmd += '&p.ptztime=' + self.data.presetTimeValue;
							break;
						case 'speed':
							cmd += '&p.ptzspeed=' + self.data.presetSpeedValue;
							break;
					}

					self.data.presetLastUsed = parseInt(action.options.val);

					self.sendPTZ(self.ptzCommand, cmd);
				}
			}
		}
		if (s.presets == true) {
			actions.recallModePsetToggle = {
				name: 'Preset - Toggle Recall Mode',
				options: [],
				callback: async (action) => {
					self.presetRecallModeIndex = c.CHOICES_PRESETRECALLMODES.findIndex((PRESETRECALLMODE) => PRESETRECALLMODE.id == self.data.presetRecallMode);

					if (!self.presetRecallModeIndex) {
						self.presetRecallModeIndex = 0;
					}

					if (self.presetRecallModeIndex >= c.CHOICES_PRESETRECALLMODES.length - 1) {
						self.presetRecallModeIndex = 0;
					} else if (self.presetRecallModeIndex < c.CHOICES_PRESETRECALLMODES.length - 1) {
						self.presetRecallModeIndex++;
					}

					self.presetRecallMode = c.CHOICES_PRESETRECALLMODES[self.presetRecallModeIndex].id
					self.data.presetRecallMode = self.presetRecallMode;
					self.checkVariables();
				}
			}

			actions.recallModePset = {
				name: 'Preset - Set Recall Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Mode',
						id: 'val',
						default: c.CHOICES_PRESETRECALLMODES[0].id,
						choices: c.CHOICES_PRESETRECALLMODES
					},
				],
				callback: async (action) => {
					self.presetRecallMode = action.options.val;
					self.data.presetRecallMode = action.options.val;
					self.checkVariables();
				}
			}
		}

		if (s.timePset == true) {
			actions.timePsetUp = {
				name: 'Preset - Drive Time Up',
				options: [],
				callback: async (action) => {
					let choices_pstime = c.CHOICES_PSTIME();

					if (self.presetDriveTimeIndex >= choices_pstime.length) {
						self.presetDriveTimeIndex = choices_pstime.length
					} else if (self.presetDriveTimeIndex < choices_pstime.length) {
						self.presetDriveTimeIndex++
					}
					self.presetTimeValue = choices_pstime[self.presetDriveTimeIndex].id
					self.data.presetTimeValue = self.presetTimeValue;
					self.checkVariables();
				}				
			}

			actions.timePsetDown = {
				name: 'Preset - Drive Time Down',
				options: [],
				callback: async (action) => {
					let choices_pstime = c.CHOICES_PSTIME();

					if (self.presetDriveTimeIndex <= 0) {
						self.presetDriveTimeIndex = 0
					} else if (self.presetDriveTimeIndex > 0) {
						self.presetDriveTimeIndex--
					}
					self.presetTimeValue = choices_pstime[self.presetDriveTimeIndex].id
					self.data.presetTimeValue = self.presetTimeValue;
					self.checkVariables();
				}
			}

			actions.timePset = {
				name: 'Preset - Set Drive Time',
				options: [
					{
						type: 'dropdown',
						label: 'Time Seconds',
						id: 'time',
						default: 2000,
						choices: c.CHOICES_PSTIME(),
					},
				],
				callback: async (action) => {
					self.presetRecallTime = action.options.time;
					self.data.presetTimeValue = action.options.time;
					self.checkVariables();
				}
			}
		}

		if (s.speedPset == true) {
			actions.speedPsetUp = {
				name: 'Preset - Drive Speed Up',
				options: [],
				callback: async (action) => {
					let choices_psspeed = c.CHOICES_PSSPEED();

					if (self.presetDriveSpeedIndex >= choices_psspeed.length) {
						self.presetDriveSpeedIndex = choices_psspeed.length
					} else if (self.presetDriveSpeedIndex < choices_psspeed.length) {
						self.presetDriveSpeedIndex++
					}
					self.presetSpeedValue = choices_psspeed[self.presetDriveSpeedIndex].id
					self.data.presetSpeedValue = self.presetSpeedValue;
					self.checkVariables();
				}				
			}

			actions.speedPsetDown = {
				name: 'Preset - Drive Speed Down',
				options: [],
				callback: async (action) => {
					let choices_psspeed = c.CHOICES_PSSPEED();

					if (self.presetDriveSpeedIndex <= 0) {
						self.presetDriveSpeedIndex = 0
					} else if (self.presetDriveSpeedIndex > 0) {
						self.presetDriveSpeedIndex--
					}
					self.presetSpeedValue = choices_psspeed[self.presetDriveSpeedIndex].id
					self.data.presetSpeedValue = self.presetSpeedValue;
					self.checkVariables();
				}
			}

			actions.speedPset = {
				name: 'Preset - Set Drive Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Speed Setting',
						id: 'speed',
						default: 100,
						choices: c.CHOICES_PSSPEED(),
					},
				],
				callback: async (action) => {
					self.presetRecallSpeed = action.options.speed;
					self.data.presetSpeedValue = action.options.speed;
					self.checkVariables();
				}
			}
		}

		if (s.traces == true) {
			actions.tracePrepare = {
				name: 'Trace - Prepare',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=prepare'
					self.sendPTZ(self.traceCommand, cmd);
				}
			}

			actions.traceStart = {
				name: 'Trace - Start',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=start'
					self.sendPTZ(self.traceCommand, cmd);
				}
			}

			actions.traceStop = {
				name: 'Trace - Stop',
				options: [
					{
						type: 'dropdown',
						label: 'Trace Number',
						id: 'trace',
						default: 1,
						choices: [
							{ id: 1, label: 'Trace 1'},
							{ id: 2, label: 'Trace 2'},
							{ id: 3, label: 'Trace 3'},
							{ id: 4, label: 'Trace 4'},
							{ id: 5, label: 'Trace 5'},
							{ id: 6, label: 'Trace 6'},
							{ id: 7, label: 'Trace 7'},
							{ id: 8, label: 'Trace 8'},
							{ id: 9, label: 'Trace 9'},
							{ id: 10, label: 'Trace 10'},
						],
					}
				],
				callback: async (action) => {
					let trace = action.options.trace;

					cmd = 'control?t=' + trace + '&cmd=stop'
					self.sendPTZ(self.traceCommand, cmd);
				}
			}
		}

		self.setActionDefinitions(actions)
	}
}
