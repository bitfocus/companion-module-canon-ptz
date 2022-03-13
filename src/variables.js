var { MODELS, SERIES_SPECS } = require('./models.js')
const c = require('./choices.js')

module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		var self = i
		var variables = []
		var SERIES = {}

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

		variables.push({ name: 'series', label: 'Camera Series' })
		variables.push({ name: 'model', label: 'Model of Camera' })

		//System
		if (SERIES.variables.powerState == true) {
			variables.push({ name: 'powerState', label: 'Power State Idle/Standby' })
		}
		if (SERIES.variables.cameraName == true) {
			variables.push({ name: 'cameraName', label: 'Camera Name' })
		}
		if (SERIES.variables.tallyProgram == true) {
			variables.push({ name: 'tallyProgram', label: 'Tally Program ON/OFF' })
		}
		if (SERIES.variables.tallyPreview == true) {
			variables.push({ name: 'tallyPreview', label: 'Tally Preview ON/OFF' })
		}
		if (SERIES.variables.digitalZoom == true) {
			variables.push({ name: 'digitalZoom', label: 'Digital Zoom ON/OFF' })
		}
		if (SERIES.variables.imageStabilization == true) {
			variables.push({ name: 'imageStabilization', label: 'Image Stabilization ON/OFF' })
		}		
		if (SERIES.variables.firmwareVersion == true) {
			variables.push({ name: 'firmwareVersion', label: 'Firmware Version' })
		}
		if (SERIES.variables.protocolVersion == true) {
			variables.push({ name: 'protocolVersion', label: 'Protocol Version' })
		}

		//Zoom/Focus
		if (SERIES.variables.zoomSpeed == true) {
			variables.push({ name: 'zoomSpeed', label: 'Zoom Speed' })
		}
		if (SERIES.variables.focusSpeed == true) {
			variables.push({ name: 'focusSpeed', label: 'Focus Speed' })
		}
		if (SERIES.variables.focusValue == true) {
			variables.push({ name: 'focusValue', label: 'Focus Value' })
		}
		if (SERIES.variables.autoFocusMode == true) {
			variables.push({ name: 'autoFocusMode', label: 'Auto Focus Mode' })
		}

		//Pan/Tilt
		if (SERIES.variables.panTiltSpeedValue == true) {
			variables.push({ name: 'panTiltSpeedValue', label: 'Pan/Tilt Speed Value' })
		}

		//Exposure
		if (SERIES.variables.exposureMode == true) {
			variables.push({ name: 'exposureShootingMode', label: 'Exposure Shooting Mode' })
			variables.push({ name: 'exposureMode', label: 'Exposure Mode' })
		}
		if (SERIES.variables.shutterMode == true) {
			variables.push({ name: 'shutterMode', label: 'Shutter Mode' })
		}
		if (SERIES.variables.shutterValue == true) {
			variables.push({ name: 'shutterValue', label: 'Shutter Value' })
		}
		if (SERIES.variables.irisMode == true) {
			variables.push({ name: 'irisMode', label: 'Iris Mode' })
		}
		if (SERIES.variables.irisValue == true) {
			variables.push({ name: 'irisValue', label: 'Iris Value' })
		}
		if (SERIES.variables.gainMode == true) {
			variables.push({ name: 'gainMode', label: 'Gain Mode' })
		}
		if (SERIES.variables.gainValue == true) {
			variables.push({ name: 'gainValue', label: 'Gain Value' })
		}
		if (SERIES.variables.ndfilterValue == true) {
			variables.push({ name: 'ndfilterValue', label: 'Neutral Density Value' })
		}
		if (SERIES.variables.pedestalValue == true) {
			variables.push({ name: 'pedestalValue', label: 'Pedestal Value' })
		}

		//White Balance
		if (SERIES.variables.whitebalanceMode == true) {
			variables.push({ name: 'whitebalanceMode', label: 'White Balance Mode' })
		}
		if (SERIES.variables.kelvinValue == true) {
			variables.push({ name: 'kelvinValue', label: 'Kelvin Value' })
		}
		if (SERIES.variables.rGainValue == true) {
			variables.push({ name: 'rGainValue', label: 'Red Gain Value' })
		}
		if (SERIES.variables.bGainValue == true) {
			variables.push({ name: 'bGainValue', label: 'Blue Gain Value' })
		}

		//Recall Preset
		if (SERIES.variables.presetNames == true) {
			for (let i = 1; i <= 100; i++) {
				variables.push({ name: 'presetname_' + i, label: 'Preset ' + i + ' Name' });
			}
		}
		if (SERIES.variables.presetLastUsed == true) {
			variables.push({ name: 'presetLastUsed', label: 'Preset Last Used' })
		}
		if (SERIES.variables.presetRecallMode == true) {
			variables.push({ name: 'presetRecallMode', label: 'Preset Recall Mode' })
		}
		if (SERIES.variables.presetTimeValue == true) {
			variables.push({ name: 'presetTimeValue', label: 'Preset Time Value' })
		}
		if (SERIES.variables.presetSpeedValue == true) {
			variables.push({ name: 'presetSpeedValue', label: 'Preset Speed Value' })
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		try {
			var self = i;

			var SERIES = {};

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

			self.setVariable('series', self.data.series);
			self.setVariable('model', self.data.model);
	
			//System
			self.setVariable('cameraName', self.data.cameraName);
			self.setVariable('powerState', self.data.powerState);
			self.setVariable('tallyProgram', self.data.tallyProgram);
			self.setVariable('tallyPreview', self.data.tallyPreview);
			self.setVariable('digitalZoom', self.data.digitalZoom);
			self.setVariable('imageStabilization', self.data.imageStabilization);
			self.setVariable('firmwareVersion', self.data.firmwareVersion);
			self.setVariable('protocolVersion', self.data.protocolVersion);
	
			//Zoom/Focus
			self.setVariable('zoomSpeed', self.data.zoomSpeed);
			self.setVariable('focusSpeed', c.CHOICES_FOCUS_SPEED[self.fSpeedIndex].label);
			self.setVariable('focusValue', self.data.focusValue);
			self.setVariable('autoFocusMode', self.data.autoFocusMode);
	
			//Pan/Tilt
			self.setVariable('panTiltSpeedValue', c.CHOICES_PT_SPEED[self.ptSpeedIndex].label);
	
			//Exposure
			if (SERIES.variables.exposureShootingMode == true) {
				let index;
				let exposureShootingModeValue = self.data.exposureShootingMode;
				if (SERIES.actions.exposureShootingMode.dropdown) {
					index = SERIES.actions.exposureShootingMode.dropdown.findIndex((EXPSHOOTINGMODE) => EXPSHOOTINGMODE.id == self.data.exposureShootingMode);
					self.exposureShootingModeIndex = index;
					let exposureShootingMode = SERIES.actions.exposureShootingMode.dropdown[self.exposureShootingModeIndex];
					if (exposureShootingMode) {
						exposureShootingModeValue = exposureShootingMode.label;
					}
				}
				else {
					index = c.CHOICES_EXPOSURESHOOTINGMODES_OTHER().findIndex((EXPSHOOTINGMODE) => EXPSHOOTINGMODE.id == self.data.exposureShootingMode);
					self.exposureShootingModeIndex = index;
					let exposureShootingMode = SERIES.actions.exposureShootingMode.dropdown[self.exposureShootingModeIndex];
					if (exposureShootingMode) {
						exposureShootingModeValue = exposureShootingMode.label;
					}
				}
				self.setVariable('exposureShootingMode', exposureShootingModeValue);
			}

			if (SERIES.variables.exposureMode == true) {
				let index;
				let exposureModeValue = self.data.exposureMode;
				if (SERIES.actions.exposureMode.dropdown) {
					index = SERIES.actions.exposureMode.dropdown.findIndex((EXPMODE) => EXPMODE.id == self.data.exposureMode);
					self.exposureModeIndex = index;
					let exposureMode = SERIES.actions.exposureMode.dropdown[self.exposureModeIndex];
					if (exposureMode) {
						exposureModeValue = exposureMode.label;
					}
				}
				else {
					index = c.CHOICES_EXPOSUREMODES_OTHER().findIndex((EXPMODE) => EXPMODE.id == self.data.exposureMode);
					self.exposureModeIndex = index;
					let exposureMode = SERIES.actions.exposureMode.dropdown[self.exposureModeIndex];
					if (exposureMode) {
						exposureModeValue = exposureMode.label;
					}
				}
				self.setVariable('exposureMode', exposureModeValue);
			}

			if (SERIES.variables.shutterMode == true) {
				self.setVariable('shutterMode', self.data.shutterMode);
			}

			if (SERIES.variables.shutterValue == true) {
				let index;
				let shutterValue = self.data.shutterValue;
				if (SERIES.actions.shutter.dropdown) {
					index = SERIES.actions.shutter.dropdown.findIndex((SHUTTER) => SHUTTER.id == self.data.shutterValue);
					self.shutterIndex = index;
					let shutter = SERIES.actions.shutter.dropdown[self.shutterIndex];
					if (shutter) {
						shutterValue = shutter.label;
					}
				}
				else {
					index = c.CHOICES_SHUTTER_OTHER().findIndex((SHUTTER) => SHUTTER.id == self.data.shutterValue);
					self.shutterIndex = index;
					let shutter = SERIES.actions.shutter.dropdown[self.shutterIndex];
					if (shutter) {
						shutterValue = shutter.label;
					}
				}
				self.setVariable('shutterValue', shutterValue);
			}

			if (SERIES.variables.irisMode == true) {
				let value = self.data.irisMode;

				if (self.data.irisMode === 'auto') {
					value = 'Auto';
				}
				else if (self.data.irisMode === 'manual') {
					value = 'Manual';
				}

				self.setVariable('irisMode', value);
			}

			if (SERIES.variables.irisValue == true) {
				let index;
				let irisValue = self.data.irisValue;
				if (SERIES.actions.iris.dropdown) {
					index = SERIES.actions.iris.dropdown.findIndex((IRIS) => IRIS.id == self.data.irisValue);
					self.irisIndex = index;
					let iris = SERIES.actions.iris.dropdown[self.irisIndex];
					if (iris) {
						irisValue = iris.label;
					}
				}
				else {
					index = c.CHOICES_IRIS_OTHER().findIndex((IRIS) => IRIS.id == self.data.irisValue);
					self.irisIndex = index;
					let iris = SERIES.actions.iris.dropdown[self.irisIndex];
					if (iris) {
						irisValue = iris.label;
					}
				}
				self.setVariable('irisValue', irisValue);
			}

			if (SERIES.variables.gainMode == true) {
				let value = self.data.gainMode;

				if (self.data.gainMode === 'auto') {
					value = 'Auto';
				}
				else if (self.data.gainMode === 'manual') {
					value = 'Manual';
				}

				self.setVariable('gainMode', value);
			}

			if (SERIES.variables.gainValue == true) {
				let index;
				let gainValue = self.data.gainValue;
				if (SERIES.actions.gain.dropdown) {
					index = SERIES.actions.gain.dropdown.findIndex((GAIN) => GAIN.id == self.data.gainValue);
					self.gainIndex = index;
					let gain = SERIES.actions.gain.dropdown[self.gainIndex];
					if (gain) {
						gainValue = gain.label;
					}
				}
				else {
					index = c.CHOICES_GAIN_OTHER().findIndex((GAIN) => GAIN.id == self.data.gainValue);
					self.gainIndex = index;
					let gain = SERIES.actions.gain.dropdown[self.gainIndex];
					if (gain) {
						gainValue = gain.label;
					}
				}
				self.setVariable('gainValue', gainValue);
			}

			if (SERIES.variables.ndfilterValue == true) {
				let index;
				let ndfilterValue = self.data.ndfilterValue;
				if (SERIES.actions.ndfilter.dropdown) {
					index = SERIES.actions.ndfilter.dropdown.findIndex((NDFILTER) => NDFILTER.id == self.data.ndfilterValue);
					self.ndfilterIndex = index;
					let ndfilter = SERIES.actions.ndfilter.dropdown[self.ndfilterIndex];
					if (ndfilter) {
						ndfilterValue = ndfilter.label;
					}
				}
				else {
					index = c.CHOICES_NDFILTER_OTHER().findIndex((NDFILTER) => NDFILTER.id == self.data.ndfilterValue);
					self.ndfilterIndex = index;
					let ndfilter = SERIES.actions.ndfilter.dropdown[self.ndfilterIndex];
					if (ndfilter) {
						ndfilterValue = ndfilter.label;
					}
				}
				self.setVariable('ndfilterValue', ndfilterValue);
			}

			if (SERIES.variables.pedestalValue == true) {
				let index;
				let pedestalValue = self.data.pedestalValue;
				if (SERIES.actions.pedestal.dropdown) {
					index = SERIES.actions.pedestal.dropdown.findIndex((PEDESTAL) => PEDESTAL.id == self.data.pedestalValue);
					self.pedestalIndex = index;
					let pedestal = SERIES.actions.pedestal.dropdown[self.pedestalIndex];
					if (pedestal) {
						pedestalValue = pedestal.label;
					}
				}
				else {
					index = c.CHOICES_PEDESTAL_OTHER().findIndex((PEDESTAL) => PEDESTAL.id == self.data.pedestalValue);
					self.pedestalIndex = index;
					let pedestal = SERIES.actions.pedestal.dropdown[self.pedestalIndex];
					if (pedestal) {
						pedestalValue = pedestal.label;
					}
				}
				self.setVariable('pedestalValue', pedestalValue);
			}
	
			//White Balance
			if (SERIES.variables.whitebalanceMode == true) {
				let wbmode = SERIES.actions.whitebalanceMode.dropdown.find((WBMODE) => WBMODE.id == self.data.whitebalanceMode);
				if (wbmode) {
					let value = wbmode.label;
					self.setVariable('whitebalanceMode', value);
				}
			}

			if (SERIES.variables.kelvinValue == true) {
				let kelvin = SERIES.actions.kelvin.dropdown.find((KELVIN) => KELVIN.id == self.data.kelvinValue);
				if (kelvin) {
					let value = kelvin.label;
					self.setVariable('kelvinValue', value);
				}
			}

			if (SERIES.variables.rGainValue == true) {
				let rGain = SERIES.actions.rGain.dropdown.find((RGAIN) => RGAIN.id == self.data.rGainValue);
				if (rGain) {
					let value = rGain.label;
					self.setVariable('rGainValue', value);
				}
			}

			if (SERIES.variables.bGainValue == true) {
				let bGain = SERIES.actions.bGain.dropdown.find((BGAIN) => BGAIN.id == self.data.bGainValue);
				if (bGain) {
					let value = bGain.label;
					self.setVariable('bGainValue', value);
				}
			}
			
			//Recall Preset
			if (SERIES.variables.presetNames == true) {
				for (let i = 1; i <= 100; i++) {
					self.setVariable('presetname_' + i, self.data['presetname' + i]);
				}
			}

			if (SERIES.variables.presetLastUsed == true) {
				let indexLastUsed = c.CHOICES_PRESETS().findIndex((PRESETLASTUSED) => PRESETLASTUSED.id == self.data.presetLastUsed);
				self.presetLastUsedIndex = indexLastUsed;
				self.setVariable('presetLastUsed', c.CHOICES_PRESETS()[indexLastUsed].label);
			}

			if (SERIES.variables.presetRecallMode == true) {
				let index = c.CHOICES_PRESETRECALLMODES.findIndex((PRESETRECALLMODE) => PRESETRECALLMODE.id == self.data.presetRecallMode);
				self.presetRecallModeIndex = index;
				self.setVariable('presetRecallMode', c.CHOICES_PRESETRECALLMODES[index].label);
			}	

			if (SERIES.variables.presetTimeValue == true) {
				let value = c.CHOICES_PSTIME().find((PRESETTIMEVALUE) => PRESETTIMEVALUE.id == self.data.presetTimeValue).varLabel;
				self.setVariable('presetTimeValue', value);
			}

			if (SERIES.variables.presetSpeedValue == true) {
				let value = c.CHOICES_PSSPEED().find((PRESETSPEEDVALUE) => PRESETSPEEDVALUE.id == self.data.presetSpeedValue).varLabel;
				self.setVariable('presetSpeedValue', value);
			}
		}
		catch(error) {
			self.log('error', 'Error parsing Variables from PTZ: ' + String(error))
		}
	}
}
