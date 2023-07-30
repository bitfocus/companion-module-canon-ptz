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

	CHOICES_ZOOM_SPEED: [
		{ id: 15, label: 'Speed 15 (Fast)' },
		{ id: 14, label: 'Speed 14' },
		{ id: 13, label: 'Speed 13' },
		{ id: 12, label: 'Speed 12' },
		{ id: 11, label: 'Speed 11' },
		{ id: 10, label: 'Speed 10' },
		{ id: 9,  label: 'Speed 09' },
		{ id: 8,  label: 'Speed 08' },
		{ id: 7,  label: 'Speed 07' },
		{ id: 6,  label: 'Speed 06' },
		{ id: 5,  label: 'Speed 05' },
		{ id: 4,  label: 'Speed 04' },
		{ id: 3,  label: 'Speed 03' },
		{ id: 2,  label: 'Speed 02' },
		{ id: 1,  label: 'Speed 01' },
		{ id: 0,  label: 'Speed 00 (Slow)' }
	],

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
	// ####       Presets         ####
	// ###############################

	CHOICES_PRESETS: function () {
		var p = [];
		for (let i = 1; i <= 100; i++) {
			p.push({ id: i, label: 'Preset ' + i})
		}
		return p
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
