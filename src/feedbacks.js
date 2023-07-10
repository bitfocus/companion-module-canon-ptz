const { combineRgb } = require('@companion-module/base')

const { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

module.exports = {
	initFeedbacks: function () {
		let self = this;

		let feedbacks = {}
		let SERIES = {}

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

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		if (SERIES.feedbacks.powerState == true) {
			feedbacks.powerState = {
				type: 'boolean',
				name: 'System - Power State',
				description: 'Indicate if PTZ is Idle or Standby',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Idle' },
							{ id: '1', label: 'Standby' },
						],
					},
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if ((self.data.powerState === 'idle') || (self.data.powerState === 'switch-idle')) {
								return true
							}
							break
						case '1':
							if ((self.data.powerState === 'standby') || (self.data.powerState === 'switch-standby')) {
								return true
							}
							break
						default:
							break
					}
					return false
				},
			}
		}

		if (SERIES.feedbacks.tallyProgram == true) {
			feedbacks.tallyProgram = {
				type: 'boolean',
				name: 'System - Program Tally State',
				description: 'Indicate if Program Tally is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'OFF' },
							{ id: '1', label: 'ON' },
						],
					},
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.tallyProgram === 'off') {
								return true
							}
							break
						case '1':
							if (self.data.tallyProgram === 'on') {
								return true
							}
							break
						default:
							break
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.tallyPreview == true) {
			feedbacks.tallyPreview = {
				type: 'boolean',
				name: 'System - Preview Tally State',
				description: 'Indicate if Preview Tally is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorGreen,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'OFF' },
							{ id: '1', label: 'ON' },
						],
					},
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.tallyPreview === 'off') {
								return true
							}
							break
						case '1':
							if (self.data.tallyPreview === 'on') {
								return true
							}
							break
						default:
							break
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.digitalZoom == true) {
			feedbacks.digitalZoom = {
				type: 'boolean',
				name: 'System - Digital Zoom State',
				description: 'Indicate if Digital Zoom is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Off' },
							{ id: '1', label: 'On' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.digitalZoom === 'off') {
								return true
							}
							break
						case '1':
							if (self.data.digitalZoom === 'dzoom') {
								return true
							}
							break
						default:
							break
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.imageStabilization == true) {
			feedbacks.imageStabilization = {
				type: 'boolean',
				name: 'System - Image Stabilization State',
				description: 'Indicate if Image Stabilization is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Off' },
							{ id: '1', label: 'On' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.imageStabilization === 'off') {
								return true
							}
							break
						case '1':
							if (self.data.imageStabilization === 'on1') {
								return true
							}
							break
						default:
							break
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.autoFocusMode == true) {
			feedbacks.autoFocus = {
				type: 'boolean',
				name: 'Lens - Auto Focus State',
				description: 'Indicate if Auto focus is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Manual' },
							{ id: '1', label: 'Auto' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.autoFocusMode === 'manual') {
								return true
							}
							break
						case '1':
							if (self.data.autoFocusMode === 'auto') {
								return true
							}
							break
						default:
							break
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.exposureShootingMode == true) {
			feedbacks.exposureShootingMode = {
				type: 'boolean',
				name: 'Exposure - Shooting Mode',
				description: 'Indicate if in the selected Exposure Shooting Mode',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: SERIES.actions.exposureShootingMode.dropdown[0].id,
						choices: SERIES.actions.exposureShootingMode.dropdown
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					//opt.option
					if (self.data.exposureShootingMode === opt.option) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.exposureMode == true) {
			feedbacks.exposureMode = {
				type: 'boolean',
				name: 'Exposure - Mode',
				description: 'Indicate if in the selected Exposure Mode',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: SERIES.actions.exposureMode.dropdown[0].id,
						choices: SERIES.actions.exposureMode.dropdown
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					//opt.option
					if ((self.data.exposureShootingMode === 'manual') && (self.data.exposureMode === opt.option)) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.autoShutterMode == true) {
			feedbacks.autoShutter = {
				type: 'boolean',
				name: 'Lens - Auto Shutter State',
				description: 'Indicate if Auto Shutter is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Manual' },
							{ id: '1', label: 'Auto' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.shutterMode === 'speed') {
								return true
							}
							break
						case '1':
							if (self.data.shutterMode === 'auto') {
								return true
							}
							break
						default:
							break
					}
					return false
				},
			}
		}

		if (SERIES.feedbacks.autoIrisMode == true) {
			feedbacks.autoIris = {
				type: 'boolean',
				name: 'Lens - Auto Iris State',
				description: 'Indicate if Auto iris is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Manual' },
							{ id: '1', label: 'Auto' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.irisMode === 'manual') {
								return true
							}
							break
						case '1':
							if (self.data.irisMode === 'auto') {
								return true
							}
							break
						default:
							break
					}
					return false
				},
			}
		}

		if (SERIES.feedbacks.autoGainMode == true) {
			feedbacks.autoGain = {
				type: 'boolean',
				name: 'Exposure - Auto Gain State',
				description: 'Indicate if Auto Gain is ON or OFF',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: '1',
						choices: [
							{ id: '0', label: 'Manual' },
							{ id: '1', label: 'Auto' },
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					switch (opt.option) {
						case '0':
							if (self.data.gainMode === 'manual') {
								return true
							}
							break
						case '1':
							if (self.data.gainMode === 'auto') {
								return true
							}
							break
						default:
							break
					}
					return false
				},
			}
		}

		if (SERIES.feedbacks.whitebalanceMode == true) {
			feedbacks.whitebalanceMode = {
				type: 'boolean',
				name: 'White Balance - Mode',
				description: 'Indicate if in the selected White Balance Mode',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: SERIES.actions.whitebalanceMode.dropdown[0].id,
						choices: SERIES.actions.whitebalanceMode.dropdown
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					//opt.option
					if (self.data.whitebalanceMode === opt.option) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.presetLastUsed == true) {
			feedbacks.lastUsedPset = {
				type: 'boolean',
				name: 'Preset - Last Used',
				description: 'Indicate what preset was last recalled on the camera',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Select Preset',
						id: 'preset',
						default: 1,
						choices: c.CHOICES_PRESETS()
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options

					if (self.data.presetLastUsed === opt.preset) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.presetRecallMode == true) {
			feedbacks.recallModePset = {
				type: 'boolean',
				name: 'Preset - Recall Mode',
				description: 'Indicate what preset mode is curently selected on the camera',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColorRed,
				},
				options: [
					{
						type: 'dropdown',
						label: 'Select Mode',
						id: 'option',
						default: 'normal',
						choices: [
							{ id: 'normal', label: 'Normal Mode' },
							{ id: 'time', label: 'Time Mode' },
							{ id: 'speed', label: 'Speed Mode' }
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options

					if (self.data.presetRecallMode === opt.option) {
						return true
					}
					return false
				}
			}
		}

		self.setFeedbackDefinitions(feedbacks);
	}
}
