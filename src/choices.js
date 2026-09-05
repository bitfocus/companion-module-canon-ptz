module.exports = {
	// ########################
	// #### PT, Zoom, Focus Speed Look Ups ####
	// ########################
	CHOICES_PT_SPEED: [
		{ id: 10000, label: 'Speed 10 (Fast)' },
		{ id: 5000,  label: 'Speed 09' },
		{ id: 2500,  label: 'Speed 08' },
		{ id: 1250,  label: 'Speed 07' },
		{ id: 625,   label: 'Speed 06' },
		{ id: 300,   label: 'Speed 05' },
		{ id: 150,   label: 'Speed 04' },
		{ id: 75,    label: 'Speed 03' },
		{ id: 40,    label: 'Speed 02' },
		{ id: 10,    label: 'Speed 01 (Slow)' }
	],

	CHOICES_ZOOM_SPEED: function () {
		var p = []
		for (var i = 0; i <= 127; i++) {
			p.push({ id: i, label: 'Speed ' + i })
		}
		return p
	},

	CHOICES_DIGITALMAGNIFICATION_CRN: function () {
		var list = [100,150,300,600];

		return this.CHOICES_DIGITALMAGNIFICATION_BUILD(list);
	},

	CHOICES_DIGITALMAGNIFICATION_OTHER: function () {
		var list = [100,150,300,600];

		return this.CHOICES_DIGITALMAGNIFICATION_BUILD(list);
	},

	CHOICES_DIGITALMAGNIFICATION_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			p.push({
				id: list[i],
				label: list[i] + '%'
			})
		}

		return p
	},

	CHOICES_FOCUS_SPEED: [
		{ id: 2, label: 'High' },
		{ id: 1, label: 'Medium' },
		{ id: 0, label: 'Low' }
	],

	// ##########################
	// #### Exposure Mode Look Ups ####
	// ##########################

	CHOICES_EXPOSURESHOOTINGMODES_CRN: function () {
		var list = ['fullauto', 'manual', 'scene'];

		return this.CHOICES_EXPOSURESHOOTINGMODES_BUILD(list);
	},

	// CR-N400/CR-N350 (and CR-N700/CR-N500/XF605) have no scene mode
	// XC Protocol Specifications BPE-7216-011, c.<c>.shooting.list
	CHOICES_EXPOSURESHOOTINGMODES_CRN400: function () {
		var list = ['fullauto', 'manual'];

		return this.CHOICES_EXPOSURESHOOTINGMODES_BUILD(list);
	},

	CHOICES_EXPOSURESHOOTINGMODES_OTHER: function () {
		var list = ['fullauto', 'manual', 'scene'];

		return this.CHOICES_EXPOSURESHOOTINGMODES_BUILD(list);
	},

	CHOICES_EXPOSURESHOOTINGMODES_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'fullauto':
					label = 'Full Auto';
					break;
				case 'manual':
					label = 'Manual';
					break;
				case 'scene':
					label = 'Scene';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	CHOICES_EXPOSUREMODES_CRN: function () {
		var list = ['auto', 'tv', 'av', 'manual'];

		return this.CHOICES_EXPOSUREMODES_BUILD(list);
	},

	// CR-N400/CR-N350 (and CR-N700/CR-N500/XF605) have no Av/Tv exposure modes
	// XC Protocol Specifications BPE-7216-011, c.<c>.exp.list
	CHOICES_EXPOSUREMODES_CRN400: function () {
		var list = ['auto', 'manual'];

		return this.CHOICES_EXPOSUREMODES_BUILD(list);
	},

	CHOICES_EXPOSUREMODES_OTHER: function () {
		var list = ['auto', 'tv', 'av', 'manual'];

		return this.CHOICES_EXPOSUREMODES_BUILD(list);
	},

	CHOICES_EXPOSUREMODES_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'auto':
					label = 'P';
					break;
				case 'tv':
					label = 'Tv';
					break;
				case 'av':
					label = 'Av';
					break;
				case 'manual':
					label = 'Manual';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	// ########################
	// #### Scene Mode Look Ups ####
	// ########################

	// Only the CR-N300/CR-N100/CR-X300 offer scene mode
	// XC Protocol Specifications BPE-7216-011, c.<c>.scene.list
	CHOICES_SCENE_CRN: function () {
		var list = ['portrait', 'sports', 'lowlight', 'spotlight'];

		return this.CHOICES_SCENE_BUILD(list);
	},

	CHOICES_SCENE_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'portrait':
					label = 'Portrait';
					break;
				case 'sports':
					label = 'Sports';
					break;
				case 'lowlight':
					label = 'Low Light';
					break;
				case 'spotlight':
					label = 'Spotlight';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	CHOICES_AEBRIGHTNESS_CRN: function () {
		var list = [-8,-6,-4,-2,0,2,4,6,8];

		return this.CHOICES_AEBRIGHTNESS_BUILD(list);
	},

	CHOICES_AEBRIGHTNESS_OTHER: function () {
		var list = [-8,-6,-4,-2,0,2,4,6,8];

		return this.CHOICES_AEBRIGHTNESS_BUILD(list);
	},

	CHOICES_AEBRIGHTNESS_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			p.push({
				id: list[i],
				label: list[i]
			})
		}

		return p
	},

	CHOICES_AEPHOTOMETRY_CRN: function () {
		var list = ['center', 'spotlight', 'backlight'];

		return this.CHOICES_AEPHOTOMETRY_BUILD(list);
	},

	CHOICES_AEPHOTOMETRY_OTHER: function () {
		var list = ['center', 'spotlight', 'backlight'];

		return this.CHOICES_AEPHOTOMETRY_BUILD(list);
	},

	CHOICES_AEPHOTOMETRY_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'center':
					label = 'Center';
					break;
				case 'spotlight':
					label = 'Spotlight';
					break;
				case 'backlight':
					label = 'Backlight';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	CHOICES_AEFLICKERREDUCT_CRN: function () {
		var list = ['off', 'auto'];

		return this.CHOICES_AEFLICKERREDUCT_BUILD(list);
	},

	CHOICES_AEFLICKERREDUCT_OTHER: function () {
		var list = ['off', 'auto'];

		return this.CHOICES_AEFLICKERREDUCT_BUILD(list);
	},

	CHOICES_AEFLICKERREDUCT_BUILD: function (list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'off':
					label = 'Off';
					break;
				case 'auto':
					label = 'Auto';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	// ##########################
	// #### Shutter Look Ups ####
	// ##########################

	CHOICES_SHUTTER_CRN: function () {
		var list = [2,3,4,5,6,8,9,10,12,15,17,20,24,25,30,34,40,48,50,60,75,90,100,120,150,180,210,250,300,360,420,500,600,720,840,1000,1200,1400,1700,2000];

		return this.CHOICES_SHUTTER_BUILD(list);
	},

	CHOICES_SHUTTER_OTHER: function () {
		var list = [2,3,4,5,6,8,9,10,12,15,17,20,24,25,30,34,40,48,50,60,75,90,100,120,150,180,210,250,300,360,420,500,600,720,840,1000,1200,1400,1700,2000];

		return this.CHOICES_SHUTTER_BUILD(list);
	},

	CHOICES_SHUTTER_BUILD: function (list) {
		var p = [];

		p.push({
			id: 'auto',
			label: 'Auto'
		});

		for (let i = 0; i < list.length; i++) {
			p.push({
				id: list[i],
				label: '1/' + list[i]
			})
		}

		return p
	},

	// #######################
	// #### Iris Look Ups ####
	// #######################
	CHOICES_IRIS_CRN: function () {
		var list = [180,200,220,240,260,280,310,340,370,400,440,480,520,560,620,670,730,800,870,950,1000,1100,1200,1400,1500,1600,1700,1900,2100,2200];

		return this.CHOICES_IRIS_BUILD(list);
	},

	CHOICES_IRIS_OTHER: function () {
		var list = [180,200,220,240,260,280,310,340,370,400,440,480,520,560,620,670,730,800,870,950,1000,1100,1200,1400,1500,1600,1700,1900,2100,2200];

		return this.CHOICES_IRIS_BUILD(list);
	},

	CHOICES_IRIS_BUILD: function(list) {
		var p = [];

		for (let i = list.length - 1; i >= 0; i--) { //this should reverse the array so that the highest value is at the beginning for a proper iris up/down
			p.push({
				id: list[i],
				label: 'f' + (list[i]/100)
			})
		}

		/*p.push({
			id: 'auto',
			label: 'Auto'
		});*/

		return p
	},

	// #######################
	// #### Gain Look Ups ####
	// #######################
	CHOICES_GAIN_CRN: function () {
		var p = []

		/*p.push({
			id: 'auto',
			label: 'Auto'
		});*/

		p.push({
			id: '0',
			label: '0dB'
		});

		p.push({
			id: '5',
			label: '0.5dB'
		});

		for (var i = 1; i <= 36; i++) {
			p.push({
				id: i + '0',
				label: i + '.0 dB'
			})
			p.push({
				id: i + '5',
				label: i + '.5 dB'
			})
		}

		return p
	},

	// The CR-N400/CR-N350 top out at 30.0 dB, not the 36.0 dB of the CR-N300/CR-N100
	// XC Protocol Specifications BPE-7216-011, c.<c>.ae.gainlimit.max.max
	CHOICES_GAIN_CRN400: function () {
		return this.CHOICES_GAIN_BUILD(0, 300);
	},

	// min/max are in dB multiplied by 10, and are received in 0.5 dB (5) increments
	CHOICES_GAIN_BUILD: function (min, max) {
		var p = []

		for (var i = min; i <= max; i += 5) {
			p.push({
				id: i.toString(),
				label: (i / 10).toFixed(1) + ' dB'
			})
		}

		return p
	},

	// The CR-N400/CR-N350 (and CR-N700, C-series, XF605) can switch the manual
	// gain step between 1.0 dB (normal) and 0.5 dB (fine)
	// XC Protocol Specifications BPE-7216-011, c.<c>.me.gain.increment.list
	CHOICES_GAININCREMENT: [
		{ id: 'normal', label: 'Normal (1.0 dB)' },
		{ id: 'fine',   label: 'Fine (0.5 dB)' }
	],

	//Cinema EOS bodies reach much further than the remote cameras:
	//me.gain.max is 42.0 dB, or 54.0 dB with extended gain on, and the floor
	//drops to -6.0 dB extended. XC Protocol Specifications BPE-7216-011,
	//c.<c>.me.gain.min / c.<c>.me.gain.max
	CHOICES_GAIN_CINEMA: function () {
		return this.CHOICES_GAIN_BUILD(-60, 540);
	},

	//The C-series carries a wider ND range than the remote cameras when
	//Extended ND is on. c.<c>.nd.filter.list
	CHOICES_NDFILTER_CINEMA: [
		{ id: '0',      label: 'Off' },
		{ id: '400',    label: 'ND 1/4 (2 stops)' },
		{ id: '1600',   label: 'ND 1/16 (4 stops)' },
		{ id: '6400',   label: 'ND 1/64 (6 stops)' },
		{ id: '25600',  label: 'ND 1/256 (8 stops, extended)' },
		{ id: '102400', label: 'ND 1/1024 (10 stops, extended)' }
	],

	//Cinema EOS has no auto or scene exposure: c.<c>.shooting.list and
	//c.<c>.exp.list are both just "manual"
	CHOICES_EXPOSURESHOOTINGMODES_CINEMA: function () {
		return this.CHOICES_EXPOSURESHOOTINGMODES_BUILD(['manual']);
	},

	CHOICES_EXPOSUREMODES_CINEMA: function () {
		return this.CHOICES_EXPOSUREMODES_BUILD(['manual']);
	},

	CHOICES_GAIN_XF605: [
		//-60, -30, 0, 30, 60, 90, 120, 150, 180, 210.
		{ id: '-60',    label: '-6dB' },
		{ id: '-30',    label: '-3dB' },
		{ id: '0',    label: '0dB' },
		{ id: '30',   label: '3dB' },
		{ id: '60',   label: '6dB' },
		{ id: '90',   label: '9dB' },
		{ id: '120',  label: '12dB' },
		{ id: '150',  label: '15dB' },
		{ id: '180',  label: '18dB' },
		{ id: '210',  label: '21dB' },
	],

	CHOICES_GAIN_OTHER: function () {
		var p = []

		/*p.push({
			id: 'auto',
			label: 'Auto'
		});*/

		p.push({
			id: '0',
			label: '0dB'
		});

		p.push({
			id: '5',
			label: '0.5dB'
		});

		for (var i = 1; i <= 36; i++) {
			p.push({
				id: i + '0',
				label: i + '.0 dB'
			})
			p.push({
				id: i + '5',
				label: i + '.5 dB'
			})
		}

		return p
	},

	// ###########################
	// #### ND Filter Look Ups ####
	// ###########################
	CHOICES_NDFILTER_CRN300: [
		{ id: '0',    label: 'Off' },
		{ id: '1',    label: 'On' }
	],

	CHOICES_NDFILTER_CRN500: [
		{ id: '0',    label: 'Off' },
		{ id: '400',    label: 'ND 1/4' },
		{ id: '1600',    label: 'ND 1/16' },
		{ id: '6400',    label: 'ND 1/64' }
	],

	CHOICES_NDFILTER_OTHER: [
		{ id: '0',    label: 'Off' },
		{ id: '400',    label: 'ND 1/4' },
		{ id: '1600',    label: 'ND 1/16' },
		{ id: '6400',    label: 'ND 1/64' }
	],

	// On the CR-N400/CR-N350/CR-N300/CR-N100/CR-X300 the ND filter itself is
	// read-only; what can be controlled is whether it tracks the iris (assist)
	// or stays put (fixed)
	// XC Protocol Specifications BPE-7216-011, c.<c>.nd.mode.list
	CHOICES_NDMODE_CRN: [
		{ id: 'assist', label: 'Assist (Follows Iris)' },
		{ id: 'fixed',  label: 'Fixed' }
	],

	// ###########################
	// #### Pedestal Look Ups ####
	// ###########################
	CHOICES_PEDESTAL_CRN: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: i,
			})
		}
		return p
	},

	CHOICES_PEDESTAL_OTHER: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: i,
			})
		}
		return p
	},

	// ###########################
	// #### White Balance Look Ups ####
	// ###########################

	CHOICES_WBMODE_CRN: function () {
		var list = ['auto','manual','wb_a','wb_b','daylight','tungsten','kelvin'];

		return this.CHOICES_WBMODE_BUILD(list);
	},

	CHOICES_WBMODE_OTHER: function () {
		var list = ['auto','manual','wb_a','wb_b','daylight','tungsten','kelvin'];

		return this.CHOICES_WBMODE_BUILD(list);
	},

	CHOICES_WBMODE_BUILD: function(list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			let label = '';

			switch(list[i]) {
				case 'auto':
					label = 'Auto';
					break;
				case 'manual':
					label = 'Manual';
					break;
				case 'wb_a':
					label = 'WB A';
					break;
				case 'wb_b':
					label = 'WB B';
					break;
				case 'daylight':
					label = 'Daylight';
					break;
				case 'tungsten':
					label = 'Tungsten';
					break;
				case 'kelvin':
					label = 'Kelvin';
					break;
				default:
					label = list[i];
					break;
			}

			p.push({
				id: list[i],
				label: label
			})
		}

		return p
	},

	// #######################
	// #### Kelvin Look Ups ####
	// #######################
	CHOICES_KELVIN_CRN: function () {
		var list = [2000,2020,2040,2060,2080,2110,2130,2150,2170,2200,2220,2250,2270,2300,2330,2350,2380,2410,2440,2470,2500,2530,2560,2600,2630,2670,2700,2740,2780,2820,2860,2900,2940,2990,3030,3080,3130,3200,3230,3280,3330,3390,3450,3510,3570,3640,3700,3770,3850,3920,4000,4080,4170,4300,4350,4440,4550,4650,4760,4880,5000,5130,5260,5410,5600,5710,5880,6060,6300,6450,6670,6900,7140,7410,7690,8000,8330,8700,9090,9520,10000,10530,11110,11760,12500,13330,14290,15000];

		return this.CHOICES_KELVIN_BUILD(list);
	},

	CHOICES_KELVIN_OTHER: function () {
		var list = [2000,2020,2040,2060,2080,2110,2130,2150,2170,2200,2220,2250,2270,2300,2330,2350,2380,2410,2440,2470,2500,2530,2560,2600,2630,2670,2700,2740,2780,2820,2860,2900,2940,2990,3030,3080,3130,3200,3230,3280,3330,3390,3450,3510,3570,3640,3700,3770,3850,3920,4000,4080,4170,4300,4350,4440,4550,4650,4760,4880,5000,5130,5260,5410,5600,5710,5880,6060,6300,6450,6670,6900,7140,7410,7690,8000,8330,8700,9090,9520,10000,10530,11110,11760,12500,13330,14290,15000];

		return this.CHOICES_KELVIN_BUILD(list);
	},

	CHOICES_KELVIN_BUILD: function(list) {
		var p = [];

		for (let i = 0; i < list.length; i++) {
			p.push({
				id: list[i] + '',
				label: list[i] + 'K'
			})
		}

		return p
	},

	// ###########################
	// #### R GAIN Look Ups   ####
	// ###########################
	CHOICES_RGAIN_CRN: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: 'R Gain ' + i,
			})
		}
		return p
	},

	CHOICES_RGAIN_OTHER: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: 'R Gain ' + i,
			})
		}
		return p
	},

	// ###########################
	// #### B GAIN Look Ups   ####
	// ###########################
	CHOICES_BGAIN_CRN: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: 'B Gain ' + i,
			})
		}
		return p
	},

	CHOICES_BGAIN_OTHER: function () {
		var p = []
		for (var i = -50; i <= 50; ++i) {
			p.push({
				id: i + '',
				label: 'B Gain ' + i,
			})
		}
		return p
	},

	// ###############################
	// ####    Zoom / Iris Modes  ####
	// ###############################

	// Soft (ramped) zoom start/stop, on the CR-N400/CR-N350/CR-N300/CR-N100/CR-X300
	// XC Protocol Specifications BPE-7216-011, c.<c>.zoom.accel.list
	CHOICES_ZOOMACCEL_CRN: [
		{ id: 'off',   label: 'Off' },
		{ id: 'start', label: 'Start Only' },
		{ id: 'stop',  label: 'Stop Only' },
		{ id: 'both',  label: 'Start and Stop' }
	],

	// The CR-N400/CR-N350 (and CR-N700, C-series, XF605) can switch the manual
	// iris step between 1/3 and 1/4 stop. The value is the inverse of the step.
	// XC Protocol Specifications BPE-7216-011, c.<c>.me.diaphragm.increment.list
	CHOICES_IRISINCREMENT_CRN400: [
		{ id: '3', label: '1/3 Stop' },
		{ id: '4', label: '1/4 Stop' }
	],

	// ###############################
	// ####   Picture / Focus     ####
	// ###############################

	//Sharpness level, common to every XC model. c.<c>.ac.min / c.<c>.ac.max
	CHOICES_SHARPNESS: function () {
		var p = [];
		for (var i = -10; i <= 50; i++) {
			p.push({ id: i.toString(), label: String(i) });
		}
		return p
	},

	//Noise reduction, CR-N500/N300/N100/X300 only. c.<c>.nr.min / c.<c>.nr.max
	CHOICES_NOISEREDUCTION: function () {
		var p = [];
		for (var i = 0; i <= 12; i++) {
			p.push({ id: i.toString(), label: String(i) });
		}
		return p
	},

	//Face detection AF. c.<c>.focus.detect.list
	CHOICES_FOCUSDETECT_CRN: [
		{ id: 'off',       label: 'Off' },
		{ id: 'faceonly',  label: 'Face Only' },
		{ id: 'facecatch', label: 'Face Catch (tracks when no face)' }
	],

	//The C400/C80/C50 use a different set, including animal detection
	CHOICES_FOCUSDETECT_CINEMA: [
		{ id: 'off',        label: 'Off' },
		{ id: 'ppl_only',   label: 'People Only' },
		{ id: 'ppl_catch',  label: 'People Catch' },
		{ id: 'anml_only',  label: 'Animals Only' },
		{ id: 'anml_catch', label: 'Animals Catch' }
	],

	// ###############################
	// ####       Presets         ####
	// ###############################

	CHOICES_PRESETS: function () {
		var p = [];
		for (let i = 1; i <= 100; i++) {
			p.push({ id: i, label: 'Preset ' + i})
		}
		return p
	},

	// #####################################
	// #### Preset Save Option Look Ups ####
	// #####################################

	//The six things a Save Preset can write. One list feeds the action options,
	//the module toggles, the variables, the feedback and the presets, so a
	//seventh option only has to be added here.
	//  key   - suffix for the module state, variable and feedback
	//  id    - the existing savePset option id, kept for backwards compatibility
	//  cmd   - the parameter name the camera expects
	SAVE_PRESET_OPTIONS: [
		{ key: 'ptz',          id: 'save_ptz',          cmd: 'ptz',   label: 'Position (PTZ)',          short: 'PTZ' },
		{ key: 'focus',        id: 'save_focus',        cmd: 'focus', label: 'Focus',                   short: 'Focus' },
		{ key: 'exposure',     id: 'save_exposure',     cmd: 'exp',   label: 'Exposure',                short: 'Exp' },
		{ key: 'whitebalance', id: 'save_whitebalance', cmd: 'wb',    label: 'White Balance',           short: 'WB' },
		{ key: 'is',           id: 'save_is',           cmd: 'is',    label: 'Image Stabilization (IS)', short: 'IS' },
		{ key: 'cp',           id: 'save_cp',           cmd: 'cp',    label: 'CP',                      short: 'CP' },
	],

	CHOICES_SAVE_PRESET_OPTIONS: function () {
		return this.SAVE_PRESET_OPTIONS.map((option) => ({ id: option.key, label: option.label }))
	},

	// ###############################
	// #### Preset Speed Look Ups ####
	// ###############################

	CHOICES_PRESETRECALLMODES: [
		{ id: 'normal', label: 'Normal' },
		{ id: 'time', label: 'Time' },
		{ id: 'speed', label: 'Speed' }
	],

	CHOICES_PSTIME: function () {
		var p = []
		for (var i = 2; i <= 99; ++i) {
			p.push({ id: (i * 1000), label: i + ' Sec' , varLabel: i })
		}
		return p
	},

	CHOICES_PSSPEED: function() {
		let p = [];

		for (let i = 1; i <= 100; i++) {
			p.push({ id: i, label: 'Speed ' + i, varLabel: i });
		}

		return p
	}
}
