const { combineRgb } = require('@companion-module/base')

let { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')
const ICONS = require('./icons.js')

module.exports = {
	initPresets: function () {
		let self = this;
		
		let presets = {}
		let SERIES = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

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

		let s = SERIES.actions;

		// ########################
		// #### System Presets ####
		// ########################

		if (s.powerState == true) {
			presets.powerOff = {
				category: 'System',
				type: 'button',
				name: 'Power Off',
				style: {
					text: 'Power\\nOFF',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'powerOff',
								options: {}
							}
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'powerState',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.powerOn = {
				category: 'System',
				type: 'button',
				name: 'Power On',
				style: {
					text: 'Power\\nON',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'powerOn',
								options: {}
							}
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'powerState',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.powerToggle = {
				category: 'System',
				type: 'button',
				name: 'Power Toggle',
				style: {
					text: 'Power\\nTOGGLE',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'powerToggle',
								options: {}
							}
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'powerState',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		if (s.cameraName == true) {
			presets.cameraName = {
				category: 'System',
				type: 'button',
				name: 'Camera Name',
				style: {
					text: '$(canon-ptz:cameraName)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.tallyProgram == true) {
			presets.tallyProgramOnOff = {
				category: 'System',
				type: 'button',
				name: 'Tally Program On/Off',
				style: {
					text: 'Tally\\nPGM\\nON/OFF',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'tallyProgramOn',
								options: {}
							}
						],
						up: [
							{
								actionId: 'tallyProgramOff',
								options: {}
							}
						],
					},
				],
				feedbacks: [
					{
						feedbackId: 'tallyProgram',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		if (s.tallyPreview == true) {
			presets.tallyPreviewOnOff = {
				category: 'System',
				type: 'button',
				name: 'Tally Preview On/Off',
				style: {
					text: 'Tally\\nPVW\\nON/OFF',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'tallyPreviewOn',
								options: {}
							}
						],
						up: [
							{
								actionId: 'tallyPreviewOff',
								options: {}
							}
						],
					},
				],
				feedbacks: [
					{
						feedbackId: 'tallyPreview',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorGreen
						}
					}
				]
			}

			presets.tallyToggle = {
				category: 'System',
				type: 'button',
				name: 'Tally Toggle',
				style: {
					text: 'Tally\\nTOGGLE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'tallyToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'tallyPreview',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorGreen,
						}
					},
					{
						feedbackId: 'tallyProgram',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		if (s.digitalZoom == true) {
			presets.digitalZoomOnOff = {
				category: 'System',
				type: 'button',
				name: 'Digital Zoom On/Off',
				style: {
					text: 'DZOOM\\n$(canon-ptz:digitalZoom)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'digitalZoom',
								options: {
									bol: 1
								}
							}
						],
						up: [
							{
								actionId: 'digitalZoom',
								options: {
									bol: 0
								}
							}
						]
					},
				],
				feedbacks: [
					{
						feedbackId: 'digitalZoom',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		if (s.imageStabilization == true) {
			presets.imageStabilization = {
				category: 'System',
				type: 'button',
				name: 'Image Stabilization On/Off',
				style: {
					text: 'IS\\n$(canon-ptz:imageStabilization)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'imageStabilization',
								options: {
									bol: 1
								}
							}
						],
						up: [
							{
								actionId: 'imageStabilization',
								options: {
									bol: 0
								}
							}
						]
					},
				],
				feedbacks: [
					{
						feedbackId: 'imageStabilization',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		// ##########################
		// #### Pan/Tilt Presets ####
		// ##########################

		if (s.panTilt == true) {
			presets.panTiltUpStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'UP',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.UP,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'up',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stopTilt',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltDownStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'DOWN',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.DOWN,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'down',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stopTilt',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltLeftStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'LEFT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'left',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stopPan',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltRightStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'RIGHT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'right',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stopPan',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltUpRightStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'UP RIGHT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.UP_RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'upRight',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stop',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltUpLeftStop = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'UP LEFT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.UP_LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'upLeft',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stop',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltDownLeft = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'DOWN LEFT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.DOWN_LEFT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'downLeft',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stop',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltDownRight = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'DOWN RIGHT',
				style: {
					style: 'png',
					text: '',
					png64: ICONS.DOWN_RIGHT,
					pngalignment: 'center:center',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'downRight',
								options: {}
							}
						],
						up: [
							{
								actionId: 'stop',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.panTiltHome = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Home',
				style: {
					
					text: 'HOME',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'home',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		if (s.ptSpeed == true) {
			presets.ptSpeedUp = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Speed Up',
				style: {
					
					text: 'SPEED\\nUP\\n$(canon-ptz:panTiltSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ptSpeedU',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.ptSpeedDown = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Speed Down',
				style: {
					
					text: 'SPEED\\nDOWN\\n$(canon-ptz:panTiltSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ptSpeedD',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.ptSpeedSetHigh = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Speed Set High',
				style: {
					
					text: 'SET\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ptSpeedS',
								options: {
									speed: 5000
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.ptSpeedSetMid = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Speed Set Mid',
				style: {
					
					text: 'SET\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ptSpeedS',
								options: {
									speed: 625
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.ptSpeedSetLow = {
				category: 'Pan/Tilt',
				type: 'button',
				name: 'Speed Set Low',
				style: {
					
					text: 'SET\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ptSpeedS',
								options: {
									speed: 10
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		// ######################
		// #### Lens Presets ####
		// ######################

		if (s.zoom == true) {
			presets.zoomIn = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom In',
				style: {
					
					text: 'ZOOM\\nIN',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zoomI',
								options: {}
							}
						],
						up: [
							{
								actionId: 'zoomS',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.zoomOut = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Out',
				style: {
					
					text: 'ZOOM\\nOUT',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zoomO',
								options: {}
							}
						],
						up: [
							{
								actionId: 'zoomS',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}
		}

		if (s.zoomSpeed == true) {
			presets.zoomSpeedUp = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Speed Up',
				style: {
					
					text: 'ZOOM\\nSPEED\\nUP\\n$(canon-ptz:zoomSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zSpeedU',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.zoomSpeedDown = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Speed Down',
				style: {
					
					text: 'ZOOM\\nSPEED\\nDOWN\\n$(canon-ptz:zoomSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zSpeedD',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.zoomSpeedSetHigh = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Speed High',
				style: {
					
					text: 'ZOOM\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zSpeedS',
								options: {
									speed: 127
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.zoomSpeedSetMid = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Speed Mid',
				style: {
					
					text: 'ZOOM\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zSpeedS',
								options: {
									speed: 63
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.zoomSpeedSetLow = {
				category: 'Lens',
				type: 'button',
				name: 'Zoom Speed Low',
				style: {
					
					text: 'ZOOM\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'zSpeedS',
								options: {
									speed: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		if (s.focus == true) {
			presets.focusNear = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Near',
				style: {
					
					text: 'FOCUS\\nNEAR',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusN',
								options: {}
							}
						],
						up: [
							{
								actionId: 'focusS',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}

			presets.focusFar = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Far',
				style: {
					
					text: 'FOCUS\\nFAR',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusF',
								options: {}
							}
						],
						up: [
							{
								actionId: 'focusS',
								options: {}
							}
						]
					},
				],
				feedbacks: []
			}
		}

		if (s.focusSpeed == true) {
			presets.focusSpeedUp = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed Up',
				style: {
					
					text: 'FOCUS\\nSPEED\\nUP\\n$(canon-ptz:focusSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeedU',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.focusSpeedDown = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed Down',
				style: {
					
					text: 'FOCUS\\nSPEED\\nDOWN\\n$(canon-ptz:focusSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeedD',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.focusSpeedSetHigh = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed High',
				style: {
					
					text: 'FOCUS\\nSPEED\\nHIGH',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeedS',
								options: {
									speed: 2
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.focusSpeedSetMid = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed Mid',
				style: {
					
					text: 'FOCUS\\nSPEED\\nMID',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeedS',
								options: {
									speed: 1
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.focusSpeedSetLow = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed Low',
				style: {
					
					text: 'FOCUS\\nSPEED\\nLOW',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeedS',
								options: {
									speed: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.focusSpeedToggle = {
				category: 'Lens',
				type: 'button',
				name: 'Focus Speed Toggle',
				style: {
					
					text: 'FOCUS\\nSPEED\\nTOGGLE\\n$(canon-ptz:focusSpeed)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'fSpeeToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		if (s.autoFocus == true) {
			presets.manualFocus = {
				category: 'Lens',
				type: 'button',
				name: 'Manual Focus',
				style: {
					
					text: 'MANUAL\\nFOCUS',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusM',
								options: {
									bol: 1
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoFocus',
						options: {
							option: '0',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.autoFocus = {
				category: 'Lens',
				type: 'button',
				name: 'Auto Focus',
				style: {
					text: 'AUTO\\nFOCUS',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusM',
								options: {
									bol: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.focusToggle = {
				category: 'Lens',
				type: 'button',
				name: 'Toggle Auto/Manual Focus',
				style: {
					text: 'TOGGLE\\nFOCUS MODE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		if (s.oneshotAutoFocus == true) {
			presets.oneshotAutoFocus = {
				category: 'Lens',
				type: 'button',
				name: 'One Shot Auto Focus',
				style: {
					
					text: 'One Shot\\nAF',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'focusOSAF',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoFocus',
						options: {
							option: '1',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}
		}

		// ##########################
		// #### Exposure Presets ####
		// ##########################

		if (s.exposureShootingMode.cmd) {
			for (let x in s.exposureShootingMode.dropdown) {
				presets['exposureShootingMode-' + s.exposureShootingMode.dropdown[x].id] = {
					category: 'Exposure',
					type: 'button',
					name: 'Exposure Shooting: ' + s.exposureShootingMode.dropdown[x].label,
					style: {
						
						text: s.exposureShootingMode.dropdown[x].label,
						size: '18',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [
						{
							down: [
								{
									actionId: 'exposureShootingMode',
									options: {
										val: s.exposureShootingMode.dropdown[x].id
									}
								}
							],
							up: []
						},
					],
					feedbacks: [
						{
							feedbackId: 'exposureShootingMode',
							options: {
								option: s.exposureShootingMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed,
							}
						}
					]
				}
			}
		}

		if (s.exposureMode.cmd) {
			presets.exposureMode = {
				category: 'Exposure',
				type: 'button',
				name: 'Toggle Exposure Mode',
				style: {
					
					text: 'TOGGLE\\nEXPOSURE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'exposureModeToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			for (let x in s.exposureMode.dropdown) {
				presets['exposure-' + s.exposureMode.dropdown[x].id] = {
					category: 'Exposure',
					type: 'button',
					name: 'Exposure: ' + s.exposureMode.dropdown[x].label,
					style: {
						
						text: s.exposureMode.dropdown[x].label,
						size: '18',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [
						{
							down: [
								{
									actionId: 'exposureM',
									options: {
										val: s.exposureMode.dropdown[x].id
									}
								}
							],
							up: []
						},
					],
					feedbacks: [
						{
							feedbackId: 'exposureMode',
							options: {
								option: s.exposureMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed,
							}
						}
					]
				}
			}
		}

		if (s.shutter.cmd) {
			presets.shutterUp = {
				category: 'Exposure',
				type: 'button',
				name: 'Shutter Up',
				style: {
					text: 'SHUTTER\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'shutterUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.shutterDown = {
				category: 'Exposure',
				type: 'button',
				name: 'Shutter Down',
				style: {
					text: 'SHUTTER\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'shutterDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.manualShutter = {
				category: 'Exposure',
				type: 'button',
				name: 'Manual Shutter',
				style: {
					text: 'MANUAL\\nSHUTTER',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'shutterM',
								options: {
									bol: 1
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoShutter',
						options: {
							option: '0'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				],
			}

			presets.autoShutter = {
				category: 'Exposure',
				type: 'button',
				name: 'Auto Shutter',
				style: {
					text: 'AUTO\\nSHUTTER',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'shutterM',
								options: {
									bol: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoShutter',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.toggleShutterMode = {
				category: 'Exposure',
				type: 'button',
				name: 'Toggle Shutter Mode',
				style: {
					text: 'TOGGLE\\nSHUTTER MODE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'shutterToggle',
								options: {
									bol: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoShutter',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.exposureShutterValue = {
				category: 'Exposure',
				type: 'button',
				name: 'Shutter Value',
				style: {
					text: '$(canon-ptz:shutterValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.iris.cmd) {
			presets.irisUp = {
				category: 'Exposure',
				type: 'button',
				name: 'Iris Up',
				style: {
					
					text: 'IRIS\\nUP',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'irisU',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.irisDown = {
				category: 'Exposure',
				type: 'button',
				name: 'Iris Down',
				style: {
					
					text: 'IRIS\\nDOWN',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'irisD',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.manualIris = {
				category: 'Exposure',
				type: 'button',
				name: 'Manual Iris',
				style: {
					
					text: 'MANUAL\\nIRIS',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'irisM',
								options: {
									bol: 1
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoIris',
						options: {
							option: '0'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.autoIris = {
				category: 'Exposure',
				type: 'button',
				name: 'Auto Iris',
				style: {
					
					text: 'AUTO\\nIRIS',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'irisM',
								options: {
									bol: 0
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoIris',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.toggleIris = {
				category: 'Exposure',
				type: 'button',
				name: 'Toggle Iris Mode',
				style: {
					
					text: 'TOGGLE\\nIRIS MODE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'irisToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoIris',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			}

			presets.showIrisValue = {
				category: 'Exposure',
				type: 'button',
				name: 'Iris Value',
				style: {
					
					text: '$(canon-ptz:irisValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.gain.cmd) {
			presets.gainUp = {
				category: 'Exposure',
				type: 'button',
				name: 'Gain Up',
				style: {
					
					text: 'GAIN\\nUP',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'gainU',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.gainDown = {
				category: 'Exposure',
				type: 'button',
				name: 'Gain Down',
				style: {
					
					text: 'GAIN\\nDOWN',
					size: '18',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'gainD',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.toggleGain = {
				category: 'Exposure',
				type: 'button',
				name: 'Toggle Gain Mode',
				style: {
					
					text: 'TOGGLE\\nGAIN MODE',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'gainToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'autoGain',
						options: {
							option: '1'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			}

			presets.showGainValue = {
				category: 'Exposure',
				type: 'button',
				name: 'Gain Value',
				style: {
					text: '$(canon-ptz:gainValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.ndfilter.cmd) {
			presets.ndfilterUp = {
				category: 'Exposure',
				type: 'button',
				name: 'ND Filter Up',
				style: {
					text: 'ND Filter\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ndfilterUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.ndFilterDown = {
				category: 'Exposure',
				type: 'button',
				name: 'ND Filter Down',
				style: {
					
					text: 'ND Filter\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'ndfilterDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			for (let x in s.ndfilter.dropdown) {
				presets['ndfilterset-' + s.ndfilter.dropdown[x].id] = {
					category: 'Exposure',
					type: 'button',
					name: 'ND Filter Set ' + s.ndfilter.dropdown[x].label,
					style: {
						text: 'ND FILTER\\nSET\\n' + s.ndfilter.dropdown[x].label,
						size: '14',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'ndfilterSet',
									options: {
										val: s.ndfilter.dropdown[x].id,
									}
								}
							],
							up: []
						},
					],
					feedbacks: [],
				}
			}

			presets.showNDfilterValue = {
				category: 'Exposure',
				type: 'button',
				name: 'ND Filter Value',
				style: {
					
					text: '$(canon-ptz:ndfilterValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.pedestal.cmd) {
			presets.pedestalUp = {
				category: 'Exposure',
				type: 'button',
				name: 'Pedestal Up',
				style: {
					
					text: 'Pedestal\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'pedestalUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.pedestalDown = {
				category: 'Exposure',
				type: 'button',
				name: 'Pedestal Down',
				style: {
					
					text: 'Pedestal\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'pedestalDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.showPedestalValue = {
				category: 'Exposure',
				type: 'button',
				name: 'Pedestal Value',
				style: {
					
					text: '$(canon-ptz:pedestalValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		// ##########################
		// #### White Balance Presets ####
		// ##########################

		if (s.whitebalanceMode.cmd) {
			presets.toggleWhiteBalanceMode = {
				category: 'White Balance',
				type: 'button',
				name: 'Toggle White Balance Mode',
				style: {
					
					text: 'TOGGLE\\nWB:$(canon-ptz:whitebalanceMode)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'whitebalanceModeToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.whiteBalanceCalibrationA = {
				category: 'White Balance',
				type: 'button',
				name: 'White Balance Calibration',
				style: {
					
					text: 'WB CALIB A',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'whitebalanceCalibration',
								options: {
									mode: 'a'
								}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.whiteBalanceCalibrationB = {
				category: 'White Balance',
				type: 'button',
				name: 'White Balance Calibration',
				style: {
					
					text: 'WB CALIB B',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'whitebalanceCalibration',
								options: {
									mode: 'b'
								}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			presets.toggleWhiteBalanceMode = {
				category: 'White Balance',
				type: 'button',
				name: 'Current White Balance Mode',
				style: {
					
					text: '$(canon-ptz:whitebalanceMode)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'whitebalanceModeToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: [],
			}

			for (let x in s.whitebalanceMode.dropdown) {
				presets['whitebalanceMode-' +  s.whitebalanceMode.dropdown[x].id] = {
					category: 'White Balance',
					type: 'button',
					name: 'White Balance Mode Set ' + s.whitebalanceMode.dropdown[x].label,
					style: {
						text: 'WB MODE\\nSET\\n' + s.whitebalanceMode.dropdown[x].label,
						size: '14',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'whitebalanceModeSet',
									options: {
										val: s.whitebalanceMode.dropdown[x].id,
									}
								}
							],
							up: []
						},
					],
					feedbacks: [
						{
							feedbackId: 'whitebalanceMode',
							options: {
								option: s.whitebalanceMode.dropdown[x].id
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed
							}
						}
					]
				}
			}
		}

		if (s.kelvin.cmd) {
			presets.kelvinUp = {
				category: 'White Balance',
				type: 'button',
				name: 'Kelvin Up',
				style: {
					
					text: 'KELVIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'kelvinUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.kelvinDown = {
				category: 'White Balance',
				type: 'button',
				name: 'Kelvin Down',
				style: {
					
					text: 'KELVIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'kelvinDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.showKelvinValue = {
				category: 'White Balance',
				type: 'button',
				name: 'Kelvin Value',
				style: {
					
					text: '$(canon-ptz:kelvinValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.rGain.cmd) {
			presets.redGainUp = {
				category: 'White Balance',
				type: 'button',
				name: 'Red Gain Up',
				style: {
					
					text: 'RED\\nGAIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'rGainUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.redGainDown = {
				category: 'White Balance',
				type: 'button',
				name: 'Red Gain Down',
				style: {
					
					text: 'RED\\nGAIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'rGainDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.showRedGainValue = {
				category: 'White Balance',
				type: 'button',
				name: 'Red Gain Value',
				style: {
					
					text: '$(canon-ptz:rGainValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.bGain.cmd) {
			presets.blueGainUp = {
				category: 'White Balance',
				type: 'button',
				name: 'Blue Gain Up',
				style: {
					
					text: 'BLUE\\nGAIN\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'bGainUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.blueGainDown = {
				category: 'White Balance',
				type: 'button',
				name: 'Blue Gain Down',
				style: {
					
					text: 'BLUE\\nGAIN\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'bGainDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.showBlueGainValue = {
				category: 'White Balance',
				type: 'button',
				name: 'Blue Gain Value',
				style: {
					
					text: '$(canon-ptz:bGainValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		// ###########################
		// #### Load/Save Presets ####
		// ###########################

		if (s.presets == true) {
			presets.presetRecallModeToggle = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Preset Recall Mode - Toggle',
				style: {
					
					text: 'TOGGLE PSET MODE\\n:$(canon-ptz:presetRecallMode)',
					size: '7',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'recallModePsetToggle',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}

			presets.presetRecallModeNormal = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Set Preset Recall Mode - Normal',
				style: {
					
					text: 'PRESET\\nMODE NORMAL',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'recallModePset',
								options: {
									val: 'normal'
								}
							}
						],
						up: []
					},
				],
				feedbacks: [
					{
						feedbackId: 'recallModePset',
						options: {
							option: 0,
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			}
		}

		if (s.timePset == true) {
			presets.recallPresetModeTime = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Set Preset Recall Mode - Time',
				style: {
					
					text: 'PRESET\\nMODE\\nTIME',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'recallModePset',
								options: {
									val: 'time'
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		if (s.speedPset == true) {
			presets.recallPresetModeSpeed = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Set Preset Recall Mode - Speed',
				style: {
					
					text: 'PRESET\\nMODE\\nSPEED',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'recallModePset',
								options: {
									val: 'speed'
								}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
		}

		if (s.presets == true) {
			presets.showRecallPresetModeValue = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Preset Recall Mode Value',
				style: {
					
					text: '$(canon-ptz:presetRecallMode)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.timePset == true) {
			presets.timePsetUp = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Time Up',
				style: {
					
					text: 'RECALL\\nTIME\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'timePsetUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
			presets.timePsetDown = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Time Down',
				style: {
					
					text: 'RECALL\\nTIME\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'timePsetDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
			presets.showPresetTimeValue = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Time Value',
				style: {
					
					text: 'TIME:\\n$(canon-ptz:presetTimeValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.speedPset == true) {
			presets.speedPsetUp = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Speed Up',
				style: {
					
					text: 'RECALL\\nSPEED\\nUP',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'speedPsetUp',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
			presets.speedPsetDown = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Speed Down',
				style: {
					
					text: 'RECALL\\nSPEED\\nDOWN',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'speedPsetDown',
								options: {}
							}
						],
						up: []
					},
				],
				feedbacks: []
			}
			presets.showPSetSpeedValue = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Recall Speed Value',
				style: {
					
					text: 'SPEED:\\n$(canon-ptz:presetSpeedValue)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}

		if (s.presets == true) {
			for (let save = 1; save <= 100; save++) {
				presets['presetSave' + save] = {
					category: 'Save Preset',
					type: 'button',
					name: 'Save Preset ' + save,
					style: {
						
						text: 'SAVE\\nPSET\\n' + save,
						size: '14',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [
						{
							down: [
								{
									actionId: 'savePset',
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
							],
							up: []
						},
					],
					feedbacks: []
				}
			}

			for (let recall = 1; recall <= 100; recall++) {
				presets['recallPreset' + recall] = {
					category: 'Recall Preset',
					type: 'button',
					name: 'Recall Preset ' + recall,
					style: {
						
						text: 'Recall\\nPSET\\n' + recall,
						size: '14',
						color: '16777215',
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [
						{
							down: [
								{
									actionId: 'recallPset',
									options: {
										val: recall
									}
								}
							],
							up: []
						},
					],
					feedbacks: [
						{
							feedbackId: 'lastUsedPset',
							options: {
								preset: recall,
							},
							style: {
								color: foregroundColor,
								bgcolor: backgroundColorRed,
							}
						}
					]
				}
			}

			presets.showPsetLastUsed = {
				category: 'Recall Preset',
				type: 'button',
				name: 'Preset Last Used',
				style: {
					
					text: '$(canon-ptz:presetLastUsed)',
					size: '14',
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [],
				feedbacks: []
			}
		}		

		self.setPresetDefinitions(presets);
	}
}
