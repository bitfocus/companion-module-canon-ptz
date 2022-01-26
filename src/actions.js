var { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	sendPTZ: function (i, str) {
		var self = i

		if (str !== undefined) {
			self.system.emit(
				'rest_get',
				'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/control.cgi?' + str,
				function (err, result) {
					if (self.config.debug == true) {
						self.debug(
							'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/control.cgi?' + str
						)
						self.log('warn', 'Send CMD: ' + String(str))
					}
					if (err) {
						self.log('error', 'Error from PTZ: ' + String(err));
						return
					}
					if (('data', result.response.req)) {
						// console.log("Result from REST:" + result.data);
					}
				}
			)
		}
	},

	sendPower: function (i, str) {
		var self = i

		if (str !== undefined) {
			self.system.emit(
				'rest_get',
				'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/standby.cgi?' + str,
				function (err, result) {
					if (self.config.debug == true) {
						self.debug(
							'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/standby.cgi?' + str
						)
						self.log('warn', 'Send CMD: ' + String(str))
					}
					if (err) {
						self.log('error', 'Error from PTZ: ' + String(err));
						return
					}
					if (('data', result.response.req)) {
						// console.log("Result from REST:" + result.data);
					}
				}
			)
		}
	},

	sendSavePreset: function (i, str) {
		var self = i

		if (str !== undefined) {
			self.system.emit(
				'rest_get',
				'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/preset/set?' + str,
				function (err, result) {
					if (self.config.debug == true) {
						self.debug(
							'http://' + self.config.host + ':' + self.config.httpPort + '/-wvhttp-01-/preset/set?' + str
						)
						self.log('warn', 'Send CMD: ' + String(str))
					}
					if (err) {
						self.log('error', 'Error from PTZ: ' + String(err));
						return
					}
					if (('data', result.response.req)) {
						// console.log("Result from REST:" + result.data);
					}
				}
			)
		}
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		var self = i
		var actions = {}
		var SERIES = {}
		var cmd = ''

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
				label: 'System - Power Off',
				callback: function (action, bank) {
					cmd = 'cmd=standby'
					self.sendPower(cmd);
					self.data.powerState = 'standby';
					self.getCameraInformation_Delayed();
				}
			}

			actions.powerOn = {
				label: 'System - Power On',
				callback: function (action, bank) {
					cmd = 'cmd=idle'
					self.sendPower(cmd);
					self.data.powerState = 'idle';
					self.getCameraInformation_Delayed();
				}
			}

			actions.powerToggle = {
				label: 'System - Power Toggle',
				callback: function (action, bank) {
					if (self.data.powerState === 'idle') {
						cmd = 'cmd=standby';
						self.data.powerState = 'standby';
					}
					else {
						cmd = 'cmd=idle';
						self.data.powerState = 'idle';
					}
					self.sendPower(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.cameraName.cmd) {
			actions.cameraName = {
				label: 'Set Camera Name',
				options: [
					{
						type: 'textinput',
						label: 'Camera Name',
						id: 'name',
						default: 'Camera',
						tooltip: 'Set the name of the camera.'
					}
				],
				callback: function (action, bank) {
					cmd = 'c.1.name.utf8=' + action.options.name;
					if (cmd !== '') {
						self.sendPTZ(cmd)
					}
				}
			}
		}

		if (s.tallyProgram == true) {
			actions.tallyProgramOff = {
				label: 'System - Tally Off (Program)',
				callback: function (action, bank) {
					cmd = 'tally=off&tally.mode=program'
					self.sendPTZ(cmd)
					self.data.tallyProgram = 'off';
					if (self.data.tallyPreview === 'on') {
						cmd = 'tally=on&tally.mode=preview'
						self.sendPTZ(cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyProgramOn = {
				label: 'System - Tally On (Program)',
				callback: function (action, bank) {
					cmd = 'tally=on&tally.mode=program'
					self.sendPTZ(cmd)
					self.data.tallyProgram = 'on';
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.tallyPreview == true) {
			actions.tallyPreviewOff = {
				label: 'System - Tally Off (Preview)',
				callback: function (action, bank) {
					cmd = 'tally=off&tally.mode=preview'
					self.sendPTZ(cmd)
					self.data.tallyPreview = 'off';
					if (self.data.tallyProgram === 'on') {
						cmd = 'tally=on&tally.mode=program'
						self.sendPTZ(cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyPreviewOn = {
				label: 'System - Tally On (Preview)',
				callback: function (action, bank) {
					cmd = 'tally=on&tally.mode=preview'
					self.sendPTZ(cmd)
					self.data.tallyPreview = 'on';
					self.getCameraInformation_Delayed();
				}
			}

			actions.tallyToggle = {
				label: 'System - Tally Toggle',
				callback: function (action, bank) {
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
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.digitalZoom == true) {
			actions.digitalZoom = {
				label: 'Digital Zoom On/Off',
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
				callback: function (action, bank) {
					if (action.options.bol == 0) {
						cmd = 'c.1.zoom.mode=off'
						self.data.digitalZoom = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.zoom.mode=dzoom'
						self.data.digitalZoom = 'dzoom';
					}
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.imageStabilization == true) {
			actions.imageStabilization = {
				label: 'Image Stabilization On/Off',
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
				callback: function (action, bank) {
					if (action.options.bol == 0) {
						cmd = 'c.1.is=off'
						self.data.imageStabilization = 'off';
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.is=on1'
						self.data.imageStabilization = 'on1';
					}
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.custom == true) {
			actions.customCommand = {
				label: 'Send Custom Command',
				options: [
					{
						type: 'textinput',
						label: 'Custom Command',
						id: 'command',
						default: '',
						tooltip: 'Send a custom command. If it is not a supported command, the device may reject it.'
					  }
				],
				callback: function (action, bank) {
					cmd = action.options.command
					if (cmd !== '') {
						self.sendPTZ(cmd)
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
				label: 'Pan/Tilt - Pan Left',
				callback: function (action, bank) {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.right = {
				label: 'Pan/Tilt - Pan Right',
				callback: function (action, bank) {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.up = {
				label: 'Pan/Tilt - Tilt Up',
				callback: function (action, bank) {
					cmd = 'tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.down = {
				label: 'Pan/Tilt - Tilt Down',
				callback: function (action, bank) {
					cmd = 'tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.upLeft = {
				label: 'Pan/Tilt - Up Left',
				callback: function (action, bank) {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed + '&tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.upRight = {
				label: 'Pan/Tilt - Up Right',
				callback: function (action, bank) {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed + '&tilt=up&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.downLeft = {
				label: 'Pan/Tilt - Down Left',
				callback: function (action, bank) {
					cmd = 'pan=left&pan.speed.dir=' + self.ptSpeed + '&tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.downRight = {
				label: 'Pan/Tilt - Down Right',
				callback: function (action, bank) {
					cmd = 'pan=right&pan.speed.dir=' + self.ptSpeed + '&tilt=down&tilt.speed.dir=' + self.ptSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.stop = {
				label: 'Pan/Tilt - Stop',
				callback: function (action, bank) {
					cmd = 'pan=stop&tilt=stop'
					self.sendPTZ(cmd)
				}
			}

			actions.home = {
				label: 'Pan/Tilt - Home',
				callback: function (action, bank) {
					cmd = 'pan=0&tilt=0'
					self.sendPTZ(cmd)
				}
			}
		}

		if (s.ptSpeed == true) {
			actions.ptSpeedU = {
				label: 'Pan/Tilt - Speed Up',
				callback: function (action, bank) {
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
				label: 'Pan/Tilt - Speed Down',
				callback: function (action, bank) {
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
				label: 'Pan/Tilt - Set Speed',
				options: [
					{
						type: 'dropdown',
						label: 'speed setting',
						id: 'speed',
						default: 625,
						choices: c.CHOICES_PT_SPEED,
					},
				],
				callback: function (action, bank) {
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
				label: 'Lens - Zoom In',
				callback: function (action, bank) {
					cmd = 'zoom=tele&zoom.speed.dir=' + self.zSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.zoomO = {
				label: 'Lens - Zoom Out',
				callback: function (action, bank) {
					cmd = 'zoom=wide&zoom.speed.dir=' + self.zSpeed
					self.sendPTZ(cmd)
				}
			}

			actions.zoomS = {
				label: 'Lens - Zoom Stop',
				callback: function (action, bank) {
					cmd = 'zoom=stop'
					self.sendPTZ(cmd)
				}
			}
		}

		if (s.zoomSpeed == true) {
			actions.zSpeedS = {
				label: 'Lens - Set Zoom Speed',
				options: [
					{
						type: 'dropdown',
						label: 'speed setting',
						id: 'speed',
						default: 8,
						choices: c.CHOICES_ZOOM_SPEED,
					},
				],
				callback: function (action, bank) {
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
				label: 'Lens - Zoom Speed Up',
				callback: function (action, bank) {
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
				label: 'Lens - Zoom Speed Down',
				callback: function (action, bank) {
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
				label: 'Lens - Focus Near',
				callback: function (action, bank) {
					cmd = 'focus.action=near'
					self.sendPTZ(cmd)
				}
			}

			actions.focusF = {
				label: 'Lens - Focus Far',
				callback: function (action, bank) {
					cmd = 'focus.action=far'
					self.sendPTZ(cmd)
				}
			}

			actions.focusS = {
				label: 'Lens - Focus Stop',
				callback: function (action, bank) {
					cmd = 'focus.action=stop'
					self.sendPTZ(cmd)
				}
			}
		}

		if (s.focusSpeed == true) {
			actions.fSpeedS = {
				label: 'Lens - Focus Speed',
				options: [
					{
						type: 'dropdown',
						label: 'speed setting',
						id: 'speed',
						default: 1,
						choices: c.CHOICES_FOCUSSPEED,
					},
				],
				callback: function (action, bank) {
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
					self.fSpeed = c.CHOICES_FOCUSSPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;
					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedU = {
				label: 'Lens - Focus Speed Up',
				callback: function (action, bank) {
					if (self.fSpeedIndex == 0) {
						self.fSpeedIndex = 0
					} else if (self.fSpeedIndex > 0) {
						self.fSpeedIndex--
					}
					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;
					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.fSpeedD = {
				label: 'Lens - Focus Speed Down',
				callback: function (action, bank) {
					if (self.fSpeedIndex == c.CHOICES_FOCUS_SPEED.length) {
						self.fSpeedIndex = c.CHOICES_FOCUS_SPEED.length
					} else if (self.fSpeedIndex < c.CHOICES_FOCUS_SPEED.length) {
						self.fSpeedIndex++
					}
					self.fSpeed = c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].id
					self.data.focusSpeed = self.fSpeed;
					cmd = 'focus.speed=' + self.data.focusSpeed;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.autoFocus == true) {
			actions.focusM = {
				label: 'Lens - Focus Mode (Auto/Manual Focus)',
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
				callback: function (action, bank) {
					if (action.options.bol == 0) {
						cmd = 'focus=auto'
						self.data.focusMode = 'auto';
					}
					if (action.options.bol == 1) {
						cmd = 'focus=manual'
						self.data.focusMode = 'manual';
					}
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.focusToggle = {
				label: 'Lens - Toggle Focus Mode (Auto/Manual Focus)',
				callback: function (action, bank) {
					if (self.data.focusMode === 'auto') {
						self.data.focusMode = 'manual';
					}
					else {
						self.data.focusMode = 'auto';
					}
					cmd = 'focus=' + self.data.focusMode;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.oneshotAutoFocus == true) {
			actions.focusOSAF = {
				label: 'Lens - Focus - One Shot Auto Focus',
				callback: function (action, bank) {
					cmd = 'focus=one_shot'
					self.sendPTZ(cmd)
				}
			}
		}

		// ##########################
		// #### Exposure Actions ####
		// ##########################

		if (s.exposureShootingMode.cmd) {
			actions.exposureShootingMode = {
				label: 'Exposure Shooting Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Shooting Mode',
						id: 'val',
						default: s.exposureShootingMode.dropdown[0].id,
						choices: s.exposureShootingMode.dropdown
					}
				],
				callback: function (action, bank) {
					cmd = s.exposureShootingMode.cmd + action.options.val;
					self.sendPTZ(cmd);
										
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.exposureMode.cmd) {
			actions.exposureM = {
				label: 'Exposure Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Exposure Mode',
						id: 'val',
						default: s.exposureMode.dropdown[0].id,
						choices: s.exposureMode.dropdown
					}
				],
				callback: function (action, bank) {
					cmd = 'c.1.shooting=manual';
					self.sendPTZ(cmd);
					self.data.exposureShootingMode = 'manual';
					cmd = 'c.1.exp=' + action.options.val;
					self.sendPTZ(cmd);
					self.data.exposureMode = action.options.val;
					self.getCameraInformation_Delayed();
				}
			}

			actions.exposureModeToggle = {
				label: 'Exposure Mode Toggle',
				callback: function (action, bank) {
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
						self.sendPTZ(cmd);
						self.data.exposureShootingMode = 'fullauto';
						self.data.exposureMode = 'fullauto';
					}
					else {
						cmd = 'c.1.shooting=manual';
						self.sendPTZ(cmd);
						self.data.exposureShootingMode = 'manual';
						cmd = 'c.1.exp=' + self.data.exposureMode;
						self.sendPTZ(cmd);
					}					
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.shutter.cmd) {
			if (s.shutter.dropdown === undefined) {
				s.shutter.dropdown = c.CHOICES_SHUTTER_OTHER();
			}

			actions.shutterM = {
				label: 'Exposure - Shutter Mode (Auto Shutter)',
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
				callback: function (action, bank) {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.shutter.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.shutter.mode=speed'
					}
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterToggle = {
				label: 'Exposure - Toggle Shutter Mode (Auto/Manual Shutter)',
				callback: function (action, bank) {
					if (self.data.shutterMode === 'auto') {
						self.data.shutterMode = 'speed';
					}
					else {
						self.data.shutterMode = 'auto';
					}
					cmd = 'c.1.me.shutter.mode=' + self.data.shutterMode;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterUp = {
				label: 'Exposure - Shutter Up',
				callback: function (action, bank) {
					if (self.shutterIndex == s.shutter.dropdown.length) {
						self.shutterIndex = s.shutter.dropdown.length
					} else if (self.shutterIndex < s.shutter.dropdown.length) {
						self.shutterIndex++
					}
					self.shutterValue = s.shutter.dropdown[self.shutterIndex].id
					self.data.shutterValue = self.shutterValue;

					if (self.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(cmd)
						cmd = s.shutter.cmd + self.shutterValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterDown = {
				label: 'Exposure - Shutter Down',
				callback: function (action, bank) {
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
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(cmd)
						cmd = s.shutter.cmd + self.shutterValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.shutterSet = {
				label: 'Exposure - Set Shutter',
				options: [
					{
						type: 'dropdown',
						label: 'Shutter setting',
						id: 'val',
						default: s.shutter.dropdown[0].id,
						choices: s.shutter.dropdown,
					},
				],
				callback: function (action, bank) {
					self.shutterValue = action.options.val;
					self.data.shutterValue = self.shutterValue;

					if (self.shutterValue === 'auto') {
						cmd = 'c.1.me.shutter.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.shutter.mode=speed'
						self.sendPTZ(cmd)

						self.shutterIndex = s.shutter.dropdown.findIndex((SHUTTER) => SHUTTER.id == action.options.val);
						cmd = s.shutter.cmd + self.shutterValue;
						self.sendPTZ(cmd);
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
				label: 'Exposure - Iris Up',
				callback: function (action, bank) {
					if (self.irisIndex == s.iris.dropdown.length) {
						self.irisIndex = s.iris.dropdown.length
					} else if (self.irisIndex < s.iris.dropdown.length) {
						self.irisIndex++
					}
					self.irisValue = s.iris.dropdown[self.irisIndex].id
					self.data.irisValue = self.irisValue;
					
					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(cmd)
						cmd = s.iris.cmd + self.irisValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisD = {
				label: 'Exposure - Iris Down',
				callback: function (action, bank) {
					if (self.irisIndex == 0) {
						self.irisIndex = 0
					} else if (self.irisIndex > 0) {
						self.irisIndex--
					}
					self.irisValue = s.iris.dropdown[self.irisIndex].id
					self.data.irisValue = self.irisValue;
					
					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(cmd)
						cmd = s.iris.cmd + self.irisValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisS = {
				label: 'Exposure - Set Iris',
				options: [
					{
						type: 'dropdown',
						label: 'Iris setting',
						id: 'val',
						default: s.iris.dropdown[0].id,
						choices: s.iris.dropdown,
					},
				],
				callback: function (action, bank) {
					self.irisIndex = s.iris.dropdown.findIndex((IRIS) => IRIS.id == action.options.val);
					self.irisValue = action.options.val;
					self.data.irisValue = self.irisValue;

					if (self.irisValue === 'auto') {
						cmd = 'c.1.me.diaphragm.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.diaphragm.mode=manual'
						self.sendPTZ(cmd)

						cmd = s.iris.cmd + self.irisValue;
						self.sendPTZ(cmd);
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisM = {
				label: 'Exposure - Iris Mode (Auto Iris)',
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
				callback: function (action, bank) {
					if (action.options.bol == 0) {
						cmd = 'c.1.me.diaphragm.mode=auto'
					}
					if (action.options.bol == 1) {
						cmd = 'c.1.me.diaphragm.mode=manual'
					}
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.irisToggle = {
				label: 'Exposure - Toggle Iris Mode (Auto/Manual Iris)',
				callback: function (action, bank) {
					if (self.data.irisMode === 'auto') {
						self.data.irisMode = 'manual';
					}
					else {
						self.data.irisMode = 'auto';
					}
					cmd = 'c.1.me.diaphragm.mode=' + self.data.irisMode;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.gain.cmd) {
			if (s.gain.dropdown === undefined) {
				s.gain.dropdown = c.CHOICES_GAIN_OTHER();
			}

			actions.gainU = {
				label: 'Exposure - Gain Up',
				callback: function (action, bank) {
					if (self.gainIndex == s.gain.dropdown.length) {
						self.gainIndex = s.gain.dropdown.length
					} else if (self.gainIndex < s.gain.dropdown.length) {
						self.gainIndex++
					}
					self.gainValue = s.gain.dropdown[self.gainIndex].id
					self.data.gainValue = self.gainValue;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(cmd)
						cmd = s.gain.cmd + self.gainValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainD = {
				label: 'Exposure - Gain Down',
				callback: function (action, bank) {
					if (self.gainIndex == 0) {
						self.gainIndex = 0
					} else if (self.gainIndex > 0) {
						self.gainIndex--
					}
					self.gainValue = s.gain.dropdown[self.gainIndex].id
					self.data.gainValue = self.gainValue;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(cmd)
						cmd = s.gain.cmd + self.gainValue
						self.sendPTZ(cmd)
					}
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainToggle = {
				label: 'Exposure - Toggle Gain Mode (Auto/Manual Gain)',
				callback: function (action, bank) {
					if (self.data.gainMode === 'auto') {
						self.data.gainMode = 'manual';
					}
					else {
						self.data.gainMode = 'auto';
					}
					cmd = 'c.1.me.gain.mode=' + self.data.gainMode;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.gainS = {
				label: 'Exposure - Set Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Gain setting',
						id: 'val',
						default: s.gain.dropdown[0].id,
						choices: s.gain.dropdown,
					},
				],
				callback: function (action, bank) {
					self.gainIndex = action.options.val;

					if (self.gainValue === 'auto') {
						cmd = 'c.1.me.gain.mode=auto'
						self.sendPTZ(cmd)
					}
					else {
						cmd = 'c.1.me.gain.mode=manual'
						self.sendPTZ(cmd)

						self.gainIndex = s.gain.dropdown.findIndex((GAIN) => GAIN.id == action.options.val);
						self.gainValue = action.options.val;
						self.data.gainValue = self.gainValue;
						cmd = s.gain.cmd + self.gainValue;
						self.sendPTZ(cmd);
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
				label: 'Exposure - ND Filter Up',
				callback: function (action, bank) {
					if (self.ndfilterIndex == s.ndfilter.dropdown.length) {
						self.ndfilterIndex = s.ndfilter.dropdown.length
					} else if (self.ndfilterIndex < s.ndfilter.dropdown.length) {
						self.ndfilterIndex++
					}
					self.ndfilterValue = s.ndfilter.dropdown[self.ndfilterIndex].id
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.ndfilterDown = {
				label: 'Exposure - ND Filter Down',
				callback: function (action, bank) {
					if (self.ndfilterIndex == 0) {
						self.ndfilterIndex = 0
					} else if (self.ndfilterIndex > 0) {
						self.ndfilterIndex--
					}
					self.ndfilterValue = s.ndfilter.dropdown[self.ndfilterIndex].id
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.filterSet = {
				label: 'Exposure - Set ND Filter',
				options: [
					{
						type: 'dropdown',
						label: 'ND Filter setting',
						id: 'val',
						default: s.ndfilter.dropdown[0].id,
						choices: s.ndfilter.dropdown,
					},
				],
				callback: function (action, bank) {
					self.ndfilterIndex = s.ndfilter.dropdown.findIndex((NDFILTER) => NDFILTER.id == action.options.val);
					self.ndfilterValue = action.options.val;
					self.data.ndfilterValue = self.ndfilterValue;
					cmd = s.ndfilter.cmd + self.ndfilterValue;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.pedestal.cmd) {
			if (s.pedestal.dropdown === undefined) {
				s.pedestal.dropdown = c.CHOICES_PEDESTAL_OTHER();
			}

			actions.pedestalUp = {
				label: 'Exposure - Pedestal Up',
				callback: function (action, bank) {
					if (self.pedestalIndex == s.pedestal.dropdown.length) {
						self.pedestalIndex = s.pedestal.dropdown.length
					} else if (self.pedestalIndex < s.pedestal.dropdown.length) {
						self.pedestalIndex++
					}
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.pedestalDown = {
				label: 'Exposure - Pedestal Down',
				callback: function (action, bank) {
					if (self.pedestalIndex == 0) {
						self.pedestalIndex = 0
					} else if (self.pedestalIndex > 0) {
						self.pedestalIndex--
					}
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.pedestalSet = {
				label: 'Exposure - Set Pedestal',
				options: [
					{
						type: 'dropdown',
						label: 'Pedestal setting',
						id: 'val',
						default: s.pedestal.dropdown[0].id,
						choices: s.pedestal.dropdown,
					},
				],
				callback: function (action, bank) {
					self.pedestalIndex = s.pedestal.dropdown.findIndex((PEDESTAL) => PEDESTAL.id == action.options.val);
					self.pedestalValue = s.pedestal.dropdown[self.pedestalIndex].id
					self.data.pedestalValue = self.pedestalValue;
					cmd = s.pedestal.cmd + self.pedestalValue;
					self.sendPTZ(cmd)
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
				label: 'White Balance - Set Mode',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode Setting',
						id: 'val',
						default: s.whitebalanceMode.dropdown[0].id,
						choices: s.whitebalanceMode.dropdown,
					},
				],
				callback: function (action, bank) {
					cmd = s.whitebalanceMode.cmd + action.options.val;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceModeToggle = {
				label: 'White Balance Mode Toggle',
				callback: function (action, bank) {
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
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}

			actions.whitebalanceCalibration = {
				label: 'White Balance Calibration',
				options: [
					{
						type: 'dropdown',
						label: 'White Balance Mode',
						id: 'mode',
						default: 'a',
						choices: [ { id: 'a', label: 'WB A Mode'}, { id: 'b', label: 'WB B Mode'}]
					}
				],
				callback: function (action, bank) {
					cmd = 'c.1.wb.action=one_shot_' + action.options.mode;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.kelvin.cmd) {
			if (s.kelvin.dropdown === undefined) {
				s.kelvin.dropdown = c.CHOICES_KELVIN_OTHER();
			}
			actions.kelvinUp = {
				label: 'White Balance - Kelvin Value Up',
				callback: function (action, bank) {
					if (self.kelvinIndex >= s.kelvin.dropdown.length) {
						self.kelvinIndex = s.kelvin.dropdown.length
					} else if (self.kelvinIndex < s.kelvin.dropdown.length) {
						self.kelvinIndex++
					}
					self.kelvinValue = s.kelvin.dropdown[self.kelvinIndex].id
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.kelvinDown = {
				label: 'White Balance - Kelvin Value Down',
				callback: function (action, bank) {
					if (self.kelvinIndex <= 0) {
						self.kelvinIndex = 0
					} else if (self.kelvinIndex > 0) {
						self.kelvinIndex--
					}
					self.kelvinValue = s.kelvin.dropdown[self.kelvinIndex].id
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.kelvinSet = {
				label: 'White Balance - Set Kelvin Value',
				options: [
					{
						type: 'dropdown',
						label: 'Kelvin Setting',
						id: 'val',
						default: s.kelvin.dropdown[0].id,
						choices: s.kelvin.dropdown,
					},
				],
				callback: function (action, bank) {
					self.kelvinIndex = s.kelvin.dropdown.findIndex((KELVIN) => KELVIN.id == action.options.val);
					self.kelvinValue = action.options.val;
					self.data.kelvinValue = self.kelvinValue;
					cmd = s.kelvin.cmd + self.kelvinValue;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.rGain.cmd) {
			if (s.rGain.dropdown === undefined) {
				s.rGain.dropdown = c.CHOICES_RGAIN_OTHER();
			}
			actions.rGainUp = {
				label: 'White Balance - Red Gain Up',
				callback: function (action, bank) {
					if (self.rGainIndex >= s.rGain.dropdown.length) {
						self.rGainIndex = s.rGain.dropdown.length
					} else if (self.rGainIndex < s.rGain.dropdown.length) {
						self.rGainIndex++
					}
					self.rGainValue = s.rGain.dropdown[self.rGainIndex].id
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.rGainDown = {
				label: 'White Balance - Red Gain Down',
				callback: function (action, bank) {
					if (self.rGainIndex <= 0) {
						self.rGainIndex = 0
					} else if (self.rGainIndex > 0) {
						self.rGainIndex--
					}
					self.rGainValue = s.rGain.dropdown[self.rGainIndex].id
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.rGainSet = {
				label: 'White Balance - Set Red Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Red Gain Setting',
						id: 'val',
						default: s.rGain.dropdown[0].id,
						choices: s.rGain.dropdown
					},
				],
				callback: function (action, bank) {
					self.rGainIndex = s.rGain.dropdown.findIndex((RGAIN) => RGAIN.id == action.options.val);
					self.rGainValue = action.options.val;
					self.data.rGainValue = self.rGainValue;
					cmd = s.rGain.cmd + self.rGainValue;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		if (s.bGain.cmd) {
			if (s.bGain.dropdown === undefined) {
				s.bGain.dropdown = c.CHOICES_BGAIN_OTHER();
			}
			actions.bGainUp = {
				label: 'White Balance - Blue Gain Up',
				callback: function (action, bank) {
					if (self.bGainIndex >= s.bGain.dropdown.length) {
						self.bGainIndex = s.bGain.dropdown.length
					} else if (self.bGainIndex < s.bGain.dropdown.length) {
						self.bGainIndex++
					}
					self.bGainValue = s.bGain.dropdown[self.bGainIndex].id
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.bGainDown = {
				label: 'White Balance - Blue Gain Down',
				callback: function (action, bank) {
					if (self.bGainIndex <= 0) {
						self.bGainIndex = 0
					} else if (self.bGainIndex > 0) {
						self.bGainIndex--
					}
					self.bGainValue = s.bGain.dropdown[self.bGainIndex].id
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(cmd)
					self.getCameraInformation_Delayed();
				}
			}

			actions.bGainSet = {
				label: 'White Balance - Set Blue Gain',
				options: [
					{
						type: 'dropdown',
						label: 'Blue Gain Setting',
						id: 'val',
						default: s.bGain.dropdown[0].id,
						choices: s.bGain.dropdown,
					},
				],
				callback: function (action, bank) {
					self.bGainIndex = s.bGain.dropdown.findIndex((BGAIN) => BGAIN.id == action.options.val);
					self.bGainValue = action.options.val;
					self.data.bGainValue = self.bGainValue;
					cmd = s.bGain.cmd + self.bGainValue;
					self.sendPTZ(cmd);
					self.getCameraInformation_Delayed();
				}
			}
		}

		// #########################
		// #### Presets Actions ####
		// #########################

		if (s.presets == true) {
			actions.savePset = {
				label: 'Preset - Save',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS[0].id,
						choices: c.CHOICES_PRESETS,
					},
					{
						type: 'textinput',
						label: 'Preset Name',
						id: 'name',
						default: 'preset',
						tooltip: 'Set the name of the preset.'
					}
				],
				callback: function (action, bank) {
					cmd = 'p=' + action.options.val + '&name=' + action.options.name + '&all=enabled';
					self.sendSavePreset(cmd);
				}
			}
		
			actions.recallPset = {
				label: 'Preset - Recall',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Number',
						id: 'val',
						default: c.CHOICES_PRESETS[0].id,
						choices: c.CHOICES_PRESETS,
					},
				],
				callback: function (action, bank) {
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

					self.data.presetLastUsed = action.options.val;

					self.sendPTZ(cmd);
				}
			}
		}
		if (s.presets == true) {
			actions.recallModePsetToggle = {
				label: 'Preset - Toggle Recall Mode',
				callback: function (action, bank) {
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
				label: 'Preset - Set Recall Mode',
				options: [
					{
						type: 'dropdown',
						label: 'Preset Mode',
						id: 'val',
						default: c.CHOICES_PRESETRECALLMODES[0].id,
						choices: c.CHOICES_PRESETRECALLMODES
					},
				],
				callback: function (action, bank) {
					self.presetRecallMode = action.options.val;
					self.data.presetRecallMode = action.options.val;
					self.checkVariables();
				}
			}
		}

		if (s.timePset == true) {
			actions.timePsetUp = {
				label: 'Preset - Drive Time Up',
				callback: function (action, bank) {
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
				label: 'Preset - Drive Time Down',
				callback: function (action, bank) {
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
				label: 'Preset - Set Drive Time',
				options: [
					{
						type: 'dropdown',
						label: 'Time Seconds',
						id: 'time',
						default: 2000,
						choices: c.CHOICES_PSTIME(),
					},
				],
				callback: function (action, bank) {
					self.presetRecallTime = action.options.time;
					self.data.presetTimeValue = action.options.time;
					self.checkVariables();
				}
			}
		}

		if (s.speedPset == true) {
			actions.speedPsetUp = {
				label: 'Preset - Drive Speed Up',
				callback: function (action, bank) {
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
				label: 'Preset - Drive Speed Down',
				callback: function (action, bank) {
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
				label: 'Preset - Set Drive Speed',
				options: [
					{
						type: 'dropdown',
						label: 'Speed Setting',
						id: 'speed',
						default: 100,
						choices: c.CHOICES_PSSPEED(),
					},
				],
				callback: function (action, bank) {
					self.presetRecallSpeed = action.options.speed;
					self.data.presetSpeedValue = action.options.speed;
					self.checkVariables();
				}
			}
		}

		return actions
	}
}
