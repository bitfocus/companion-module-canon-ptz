//Initial instance state, kept here so the smoke test builds the same
//instance the module does. Anything added to a model profile that needs
//backing state belongs in one of these two.

module.exports = {
	//Values read back from the camera, plus the cached lists the action
	//dropdowns are rebuilt from. A list must start as null: initActions()
	//treats "not null" as "the camera has told us, rebuild from it".
	defaultData: function () {
		return {
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
			digitalMagnificationValue: '',
			digitalMagnificationListString: '',
			digitalMagnificationList: null,
			imageStabilization: '',
			firmwareVersion: '',
			protocolVersion: '',
			macAddress: '',
			platformStatus: '',
	
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
		
			//Other
			colorBars: '',
	
			//Recall Preset
			presetCount: 100,
			presetLastUsed: 1,
			presetRecallMode: 'normal',
			presetTimeValue: 2000,
			presetSpeedValue: 1,
	
			trackingConfig: {},
			trackingInformation: {},
		}
	},

	//Cursor positions for the up/down actions, and their matching values
	defaultIndexes: function () {
		return {
			ptSpeed: 625,
			ptSpeedIndex: 4,
			zSpeed: 8,
			zSpeedIndex: 7,
			fSpeed: 1,
			fSpeedIndex: 1,
			exposureModeIndex: 0,
			shutterValue: 0,
			shutterIndex: 0,
			irisValue: 'auto',
			irisIndex: 0,
			gainValue: 'auto',
			gainIndex: 0,
			ndfilterValue: '0',
			ndfilterIndex: 0,
			pedestalValue: 0,
			pedestalIndex: 51,
			whitebalanceModeIndex: 0,
			kelvinIndex: 0,
			kelvinValue: 2820,
			rGainIndex: 50,
			rGainValue: 0,
			bGainIndex: 50,
			bGainValue: 0,
			presetRecallModeIndex: 0,
			presetLastUsedIndex: 0,
			presetDriveTimeIndex: 0,
			presetDriveSpeedIndex: 0,
		}
	}
}
