const { combineRgb } = require('@companion-module/base')

const { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	initFeedbacks: function () {
		let feedbacks = {}
		let SERIES = {}

		// Set the model and series selected, if in auto, detect what model is connected
		if (this.config.model === 'Auto') {
			this.data.model = this.data.modelDetected
		} else {
			this.data.model = this.config.model
		}

		if (this.data.model !== '') {
			this.data.series = MODELS.find((MODELS) => MODELS.id == this.data.model).series
		}

		// Find the specific commands for a given series
		if (
			this.data.series === 'Auto' ||
			this.data.series === 'Other' ||
			SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == this.data.series) == undefined
		) {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == 'Other')
		}
		else {
			SERIES = SERIES_SPECS.find((SERIES_SPECS) => SERIES_SPECS.id == this.data.series)
		}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		if (SERIES.feedbacks.powerState == true) {
			feedbacks.powerState = {
				type: 'boolean',
				label: 'System - Power State',
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
							if (this.data.powerState === 'idle') {
								return true
							}
							break
						case '1':
							if (this.data.powerState === 'standby') {
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
				label: 'System - Program Tally State',
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
							if (this.data.tallyProgram === 'off') {
								return true
							}
							break
						case '1':
							if (this.data.tallyProgram === 'on') {
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
				label: 'System - Preview Tally State',
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
							if (this.data.tallyPreview === 'off') {
								return true
							}
							break
						case '1':
							if (this.data.tallyPreview === 'on') {
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
				label: 'System - Digital Zoom State',
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
							if (this.data.digitalZoom === 'off') {
								return true
							}
							break
						case '1':
							if (this.data.digitalZoom === 'dzoom') {
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
				label: 'System - Image Stabilization State',
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
							if (this.data.imageStabilization === 'off') {
								return true
							}
							break
						case '1':
							if (this.data.imageStabilization === 'on1') {
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
				label: 'Lens - Auto Focus State',
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
							if (this.data.autoFocusMode === 'manual') {
								return true
							}
							break
						case '1':
							if (this.data.autoFocusMode === 'auto') {
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
				label: 'Exposure - Shooting Mode',
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
					if (this.data.exposureShootingMode === opt.option) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.exposureMode == true) {
			feedbacks.exposureMode = {
				type: 'boolean',
				label: 'Exposure - Mode',
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
					if ((this.data.exposureShootingMode === 'manual') && (this.data.exposureMode === opt.option)) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.autoShutterMode == true) {
			feedbacks.autoShutter = {
				type: 'boolean',
				label: 'Lens - Auto Shutter State',
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
							if (this.data.shutterMode === 'speed') {
								return true
							}
							break
						case '1':
							if (this.data.shutterMode === 'auto') {
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
				label: 'Lens - Auto Iris State',
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
							if (this.data.irisMode === 'manual') {
								return true
							}
							break
						case '1':
							if (this.data.irisMode === 'auto') {
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
				label: 'Exposure - Auto Gain State',
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
							if (this.data.gainMode === 'manual') {
								return true
							}
							break
						case '1':
							if (this.data.gainMode === 'auto') {
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
				label: 'White Balance - Mode',
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
					if (this.data.whitebalanceMode === opt.option) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.presetLastUsed == true) {
			feedbacks.lastUsedPset = {
				type: 'boolean',
				label: 'Preset - Last Used',
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

					if (this.data.presetLastUsed === opt.preset) {
						return true
					}
					return false
				}
			}
		}

		if (SERIES.feedbacks.presetRecallMode == true) {
			feedbacks.recallModePset = {
				type: 'boolean',
				label: 'Preset - Recall Mode',
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
						default: '0',
						choices: [
							{ id: 'normal', label: 'Normal Mode' },
							{ id: 'time', label: 'Time Mode' },
							{ id: 'speed', label: 'Speed Mode' }
						]
					}
				],
				callback: function (feedback, bank) {
					let opt = feedback.options

					if (this.data.presetRecallMode === opt.option) {
						return true
					}
					return false				}
			}
		}

		this.setFeedbackDefinitions(feedbacks);
	}
}
