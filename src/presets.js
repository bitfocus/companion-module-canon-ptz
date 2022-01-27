var { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

module.exports = {
	setPresets: function (i) {
		var self = i
		var presets = []
		var SERIES = {}

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

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

		// ########################
		// #### System Presets ####
		// ########################

		if (s.powerState == true) {
			presets.push({
				category: 'System',
				label: 'Power Off',
				bank: {
					style: 'text',
					text: 'Power\\nOFF',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'powerOff',
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})

			presets.push({
				category: 'System',
				label: 'Power On',
				bank: {
					style: 'text',
					text: 'Power\\nON',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'powerOn',
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})

			presets.push({
				category: 'System',
				label: 'Power Toggle',
				bank: {
					style: 'text',
					text: 'Power\\nTOGGLE',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'powerToggle',
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})
		}

		if (s.cameraName == true) {
			presets.push({
				category: 'System',
				label: 'Camera Name',
				bank: {
					style: 'text',
					text: '$(canon-ptz:cameraName)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.tallyProgram == true) {
			presets.push({
				category: 'System',
				label: 'Tally Program On/Off',
				bank: {
					style: 'text',
					text: 'Tally\\nPGM\\nON/OFF',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'tallyProgramOn',
					}
				],
				release_actions: [
					{
						action: 'tallyProgramOff',
					}
				],
				feedbacks: [
					{
						type: 'tallyProgram',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})
		}

		if (s.tallyPreview == true) {
			presets.push({
				category: 'System',
				label: 'Tally Preview On/Off',
				bank: {
					style: 'text',
					text: 'Tally\\nPVW\\nON/OFF',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'tallyPreviewOn',
					}
				],
				release_actions: [
					{
						action: 'tallyPreviewOff',
					}
				],
				feedbacks: [
					{
						type: 'tallyPreview',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorGreen,
						}
					}
				]
			})

			presets.push({
				category: 'System',
				label: 'Tally Toggle',
				bank: {
					style: 'text',
					text: 'Tally\\nTOGGLE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'tallyToggle',
					}
				],
				feedbacks: [
					{
						type: 'tallyPreview',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorGreen,
						}
					},
					{
						type: 'tallyProgram',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})
		}

		if (s.digitalZoom == true) {
			presets.push({
				category: 'System',
				label: 'Digital Zoom On/Off',
				bank: {
					style: 'text',
					text: 'DZOOM\\n$(canon-ptz:digitalZoom)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'digitalZoom',
						options: {
							bol: 1
						}
					}
				],
				release_actions: [
					{
						action: 'digitalZoom',
						options: {
							bol: 0
						}
					}
				],
				feedbacks: [
					{
						type: 'digitalZoom',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				]
			})
		}

		if (s.imageStabilization == true) {
			presets.push({
				category: 'System',
				label: 'Image Stabilization On/Off',
				bank: {
					style: 'text',
					text: 'IS\\n$(canon-ptz:imageStabilization)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
					latch: true
				},
				actions: [
					{
						action: 'imageStabilization',
						options: {
							bol: 1
						}
					}
				],
				release_actions: [
					{
						action: 'imageStabilization',
						options: {
							bol: 0
						}
					}
				],
				feedbacks: [
					{
						type: 'imageStabilization',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				]
			})
		}

		// ##########################
		// #### Pan/Tilt Presets ####
		// ##########################

		if (s.panTilt == true) {
			presets.push({
				category: 'Pan/Tilt',
				label: 'UP',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_UP,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'up',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'DOWN',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_DOWN,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'down',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'LEFT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'left',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'RIGHT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'right',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'UP RIGHT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_UP_RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'upRight',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'UP LEFT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_UP_LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'upLeft',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'DOWN LEFT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_DOWN_LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'downLeft',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'DOWN RIGHT',
				bank: {
					style: 'png',
					text: '',
					png64: self.ICON_DOWN_RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'downRight',
					},
				],
				release_actions: [
					{
						action: 'stop',
					},
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'Home',
				bank: {
					style: 'text',
					text: 'HOME',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'home',
					},
				],
			})
		}

		if (s.ptSpeed == true) {
			presets.push({
				category: 'Pan/Tilt',
				label: 'Speed Up',
				bank: {
					style: 'text',
					text: 'SPEED\\nUP\\n$(canon-ptz:panTiltSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ptSpeedU'
					}
				]
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'Speed Down',
				bank: {
					style: 'text',
					text: 'SPEED\\nDOWN\\n$(canon-ptz:panTiltSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ptSpeedD'
					}
				],
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'Speed Set High',
				bank: {
					style: 'text',
					text: 'SET\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ptSpeedS',
						options: {
							speed: 5000
						}
					}
				]
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'Speed Set Mid',
				bank: {
					style: 'text',
					text: 'SET\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ptSpeedS',
						options: {
							speed: 625
						}
					}
				]
			})

			presets.push({
				category: 'Pan/Tilt',
				label: 'Speed Set Low',
				bank: {
					style: 'text',
					text: 'SET\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ptSpeedS',
						options: {
							speed: 10
						}
					}
				]
			})
		}

		// ######################
		// #### Lens Presets ####
		// ######################

		if (s.zoom == true) {
			presets.push({
				category: 'Lens',
				label: 'Zoom In',
				bank: {
					style: 'text',
					text: 'ZOOM\\nIN',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zoomI',
					},
				],
				release_actions: [
					{
						action: 'zoomS',
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Zoom Out',
				bank: {
					style: 'text',
					text: 'ZOOM\\nOUT',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zoomO',
					},
				],
				release_actions: [
					{
						action: 'zoomS',
					},
				],
			})
		}

		if (s.zoomSpeed == true) {
			presets.push({
				category: 'Lens',
				label: 'Zoom Speed Up',
				bank: {
					style: 'text',
					text: 'ZOOM\\nSPEED\\nUP\\n$(canon-ptz:zoomSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zSpeedU',
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Zoom Speed Down',
				bank: {
					style: 'text',
					text: 'ZOOM\\nSPEED\\nDOWN\\n$(canon-ptz:zoomSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zSpeedD',
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Zoom Speed High',
				bank: {
					style: 'text',
					text: 'ZOOM\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zSpeedS',
						options: {
							speed: 15,
						},
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Zoom Speed Mid',
				bank: {
					style: 'text',
					text: 'ZOOM\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zSpeedS',
						options: {
							speed: 8,
						},
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Zoom Speed Low',
				bank: {
					style: 'text',
					text: 'ZOOM\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'zSpeedS',
						options: {
							speed: 0
						}
					}
				]
			})
		}

		if (s.focus == true) {
			presets.push({
				category: 'Lens',
				label: 'Focus Near',
				bank: {
					style: 'text',
					text: 'FOCUS\\nNEAR',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusN'
					}
				],
				release_actions: [
					{
						action: 'focusS'
					}
				]
			})

			presets.push({
				category: 'Lens',
				label: 'Focus Far',
				bank: {
					style: 'text',
					text: 'FOCUS\\nFAR',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusF'
					}
				],
				release_actions: [
					{
						action: 'focusS'
					}
				]
			})
		}

		if (s.focusSpeed == true) {
			presets.push({
				category: 'Lens',
				label: 'Focus Speed Up',
				bank: {
					style: 'text',
					text: 'FOCUS\\nSPEED\\nUP\\n$(canon-ptz:focusSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'fSpeedU'
					}
				]
			})

			presets.push({
				category: 'Lens',
				label: 'Focus Speed Down',
				bank: {
					style: 'text',
					text: 'FOCUS\\nSPEED\\nDOWN\\n$(canon-ptz:focusSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'fSpeedD'
					}
				]
			})
			presets.push({
				category: 'Lens',
				label: 'Focus Speed High',
				bank: {
					style: 'text',
					text: 'FOCUS\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'fSpeedS',
						options: {
							speed: 2
						}
					}
				]
			})

			presets.push({
				category: 'Lens',
				label: 'Focus Speed Mid',
				bank: {
					style: 'text',
					text: 'FOCUS\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'fSpeedS',
						options: {
							speed: 1
						}
					}
				]
			})

			presets.push({
				category: 'Lens',
				label: 'Focus Speed Low',
				bank: {
					style: 'text',
					text: 'FOCUS\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'fSpeedS',
						options: {
							speed: 0
						}
					}
				]
			})
		}

		if (s.autoFocus == true) {
			presets.push({
				category: 'Lens',
				label: 'Manual Focus',
				bank: {
					style: 'text',
					text: 'MANUAL\\nFOCUS',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusM',
						options: {
							bol: 1,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoFocus',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Auto Focus',
				bank: {
					style: 'text',
					text: 'AUTO\\nFOCUS',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusM',
						options: {
							bol: 0,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Lens',
				label: 'Toggle Auto/Manual Focus',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nFOCUS MODE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusToggle'
					},
				],
				feedbacks: [
					{
						type: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})
		}

		if (s.oneshotAutoFocus == true) {
			presets.push({
				category: 'Lens',
				label: 'One Shot Auto Focus',
				bank: {
					style: 'text',
					text: 'One Shot\\nAF',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'focusOSAF'
					}
				],
				feedbacks: [
					{
						type: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			})
		}

		// ##########################
		// #### Exposure Presets ####
		// ##########################

		if (s.exposureShootingMode.cmd) {
			for (var x in s.exposureShootingMode.dropdown) {
				presets.push({
					category: 'Exposure',
					label: 'Exposure Shooting: ' + s.exposureShootingMode.dropdown[x].label,
					bank: {
						style: 'text',
						text: s.exposureShootingMode.dropdown[x].label,
						size: '18',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0)
					},
					actions: [
						{
							action: 'exposureShootingMode',
							options: {
								val: s.exposureShootingMode.dropdown[x].id
							}
						}
					],
					feedbacks: [
						{
							type: 'exposureShootingMode',
							options: {
								option: s.exposureShootingMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						}
					]
				})
			}
		}

		if (s.exposureMode.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'Toggle Exposure Mode',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nEXPOSURE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'exposureModeToggle',
					}
				]
			})

			for (var x in s.exposureMode.dropdown) {
				presets.push({
					category: 'Exposure',
					label: 'Exposure: ' + s.exposureMode.dropdown[x].label,
					bank: {
						style: 'text',
						text: s.exposureMode.dropdown[x].label,
						size: '18',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0)
					},
					actions: [
						{
							action: 'exposureM',
							options: {
								val: s.exposureMode.dropdown[x].id
							}
						}
					],
					feedbacks: [
						{
							type: 'exposureMode',
							options: {
								option: s.exposureMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						}
					]
				})
			}
		}

		if (s.shutter.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'Shutter Up',
				bank: {
					style: 'text',
					text: 'SHUTTER\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'shutterUp',
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Shutter Down',
				bank: {
					style: 'text',
					text: 'SHUTTER\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'shutterDown',
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Manual Shutter',
				bank: {
					style: 'text',
					text: 'MANUAL\\nSHUTTER',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'shutterM',
						options: {
							bol: 1,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoShutter',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Auto Shutter',
				bank: {
					style: 'text',
					text: 'AUTO\\nSHUTTER',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'shutterM',
						options: {
							bol: 0,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoShutter',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Toggle Shutter Mode',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nSHUTTER MODE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'shutterToggle'
					}
				],
				feedbacks: [
					{
						type: 'autoShutter',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						},
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Shutter Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:shutterValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.iris.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'Iris Up',
				bank: {
					style: 'text',
					text: 'IRIS\\nUP',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'irisU'
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Iris Down',
				bank: {
					style: 'text',
					text: 'IRIS\\nDOWN',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'irisD',
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Manual Iris',
				bank: {
					style: 'text',
					text: 'MANUAL\\nIRIS',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'irisM',
						options: {
							bol: 1,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoIris',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Auto Iris',
				bank: {
					style: 'text',
					text: 'AUTO\\nIRIS',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'irisM',
						options: {
							bol: 0,
						},
					},
				],
				feedbacks: [
					{
						type: 'autoIris',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						},
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Toggle Iris Mode',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nIRIS MODE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'irisToggle'
					}
				],
				feedbacks: [
					{
						type: 'autoIris',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Iris Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:irisValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.gain.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'Gain Up',
				bank: {
					style: 'text',
					text: 'GAIN\\nUP',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'gainU',
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Gain Down',
				bank: {
					style: 'text',
					text: 'GAIN\\nDOWN',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'gainD',
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Toggle Gain Mode',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nGAIN MODE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'gainToggle'
					}
				],
				feedbacks: [
					{
						type: 'autoGain',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Gain Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:gainValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.ndfilter.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'ND Filter Up',
				bank: {
					style: 'text',
					text: 'ND Filter\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ndfilterUp',
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'ND Filter Down',
				bank: {
					style: 'text',
					text: 'ND Filter\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'ndfilterDown',
					},
				],
			})

			for (var x in s.ndfilter.dropdown) {
				presets.push({
					category: 'Exposure',
					label: 'ND Filter Set ' + s.ndfilter.dropdown[x].label,
					bank: {
						style: 'text',
						text: 'ND FILTER\\nSET\\n' + s.ndfilter.dropdown[x].label,
						size: '14',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0),
					},
					actions: [
						{
							action: 'ndfilterSet',
							options: {
								val: s.ndfilter.dropdown[x].id,
							},
						},
					],
				})
			}

			presets.push({
				category: 'Exposure',
				label: 'ND Filter Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:ndfilterValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.pedestal.cmd) {
			presets.push({
				category: 'Exposure',
				label: 'Pedestal Up',
				bank: {
					style: 'text',
					text: 'Pedestal\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'pedestalUp',
					},
				],
			})

			presets.push({
				category: 'Exposure',
				label: 'Pedestal Down',
				bank: {
					style: 'text',
					text: 'Pedestal\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'pedestalDown'
					}
				]
			})

			presets.push({
				category: 'Exposure',
				label: 'Pedestal Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:pedestalValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		// ##########################
		// #### White Balance Presets ####
		// ##########################

		if (s.whitebalanceMode.cmd) {
			presets.push({
				category: 'White Balance',
				label: 'Toggle White Balance Mode',
				bank: {
					style: 'text',
					text: 'TOGGLE\\nWB:$(canon-ptz:whitebalanceMode)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'whitebalanceModeToggle',
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'White Balance Calibration',
				bank: {
					style: 'text',
					text: 'WB CALIB A',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'whitebalanceCalibration',
						options: [
							{
								mode: 'a'
							}
						]
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'White Balance Calibration',
				bank: {
					style: 'text',
					text: 'WB CALIB B',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'whitebalanceCalibration',
						options: [
							{
								mode: 'b'
							}
						]
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Current White Balance Mode',
				bank: {
					style: 'text',
					text: '$(canon-ptz:whitebalanceMode)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'whitebalanceModeToggle',
					}
				]
			})

			for (var x in s.whitebalanceMode.dropdown) {
				presets.push({
					category: 'White Balance',
					label: 'White Balance Mode Set ' + s.whitebalanceMode.dropdown[x].label,
					bank: {
						style: 'text',
						text: 'WB MODE\\nSET\\n' + s.whitebalanceMode.dropdown[x].label,
						size: '14',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0),
					},
					actions: [
						{
							action: 'whitebalanceModeSet',
							options: {
								val: s.whitebalanceMode.dropdown[x].id,
							},
						},
					],
					feedbacks: [
						{
							type: 'whitebalanceMode',
							options: {
								option: s.whitebalanceMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						}
					]
				})
			}
		}

		if (s.kelvin.cmd) {
			presets.push({
				category: 'White Balance',
				label: 'Kelvin Up',
				bank: {
					style: 'text',
					text: 'KELVIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'kelvinUp'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Kelvin Down',
				bank: {
					style: 'text',
					text: 'KELVIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'kelvinDown'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Kelvin Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:kelvinValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.rGain.cmd) {
			presets.push({
				category: 'White Balance',
				label: 'Red Gain Up',
				bank: {
					style: 'text',
					text: 'RED\\nGAIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'rGainUp'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Red Gain Down',
				bank: {
					style: 'text',
					text: 'RED\\nGAIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'rGainDown'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Red Gain Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:rGainValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.bGain.cmd) {
			presets.push({
				category: 'White Balance',
				label: 'Blue Gain Up',
				bank: {
					style: 'text',
					text: 'BLUE\\nGAIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'bGainUp'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Blue Gain Down',
				bank: {
					style: 'text',
					text: 'BLUE\\nGAIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'bGainDown'
					}
				]
			})

			presets.push({
				category: 'White Balance',
				label: 'Blue Gain Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:bGainValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		// ###########################
		// #### Load/Save Presets ####
		// ###########################

		if (s.presets == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Preset Recall Mode - Toggle',
				bank: {
					style: 'text',
					text: 'TOGGLE PSET MODE\\n:$(canon-ptz:presetRecallMode)',
					size: '7',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'recallModePsetToggle'
					}
				]
			})

			presets.push({
				category: 'Recall Preset',
				label: 'Set Preset Recall Mode - Normal',
				bank: {
					style: 'text',
					text: 'PRESET\\nMODE NORMAL',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'recallModePset',
						options: {
							val: 'normal'
						}
					}
				],
				feedbacks: [
					{
						type: 'recallModePset',
						options: {
							option: 0,
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})
		}

		if (s.timePset == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Set Preset Recall Mode - Time',
				bank: {
					style: 'text',
					text: 'PRESET\\nMODE\\nTIME',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'recallModePset',
						options: {
							val: 'time'
						}
					}
				]
			})
		}

		if (s.speedPset == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Set Preset Recall Mode - Speed',
				bank: {
					style: 'text',
					text: 'PRESET\\nMODE\\nSPEED',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'recallModePset',
						options: {
							val: 'speed'
						}
					}
				]
			})
		}

		if (s.presets == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Preset Recall Mode Value',
				bank: {
					style: 'text',
					text: '$(canon-ptz:presetRecallMode)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.timePset == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Time Up',
				bank: {
					style: 'text',
					text: 'RECALL\\nTIME\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'timePsetUp'
					}
				]
			})
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Time Down',
				bank: {
					style: 'text',
					text: 'RECALL\\nTIME\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'timePsetDown'
					}
				]
			})
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Time Value',
				bank: {
					style: 'text',
					text: 'TIME:\\n$(canon-ptz:presetTimeValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.speedPset == true) {
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Speed Up',
				bank: {
					style: 'text',
					text: 'RECALL\\nSPEED\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'speedPsetUp'
					}
				]
			})
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Speed Down',
				bank: {
					style: 'text',
					text: 'RECALL\\nSPEED\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'speedPsetDown'
					}
				]
			})
			presets.push({
				category: 'Recall Preset',
				label: 'Recall Speed Value',
				bank: {
					style: 'text',
					text: 'SPEED:\\n$(canon-ptz:presetSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}

		if (s.presets == true) {
			for (var save = 1; save <= 20; save++) {
				presets.push({
					category: 'Save Preset',
					label: 'Save Preset ' + save,
					bank: {
						style: 'text',
						text: 'SAVE\\nPSET\\n' + save,
						size: '14',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0)
					},
					actions: [
						{
							action: 'savePset',
							options: {
								val: save,
								name: 'preset' + save,
								save_ptz: true,
								save_focus: true,
								save_exposure: true,
								save_whitebalance: true,
								save_is: true,
								save_cp: true
							}
						}
					]
				})
			}

			for (var recall = 1; recall <= 20; recall++) {
				presets.push({
					category: 'Recall Preset',
					label: 'Recall Preset ' + recall,
					bank: {
						style: 'text',
						text: 'Recall\\nPSET\\n' + recall,
						size: '14',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0)
					},
					actions: [
						{
							action: 'recallPset',
							options: {
								val: recall
							}
						}
					],
					feedbacks: [
						{
							type: 'lastUsedPset',
							options: {
								preset: recall,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed,
							}
						}
					]
				})
			}

			presets.push({
				category: 'Recall Preset',
				label: 'Preset Last Used',
				bank: {
					style: 'text',
					text: '$(canon-ptz:presetLastUsed)',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				}
			})
		}		

		return presets
	}
}
