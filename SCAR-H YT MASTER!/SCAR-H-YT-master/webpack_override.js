(function webpack_inject() {

	window.isset = function (v) {
		return typeof v !== "undefined" && v !== null && v !== "" ? true : false;
	}

	window.obfuscate = {
	    "mainModule": "Or",
	    "init": "o",
	    "free": "n",
	    "update": "m",
	    "render": "br",
	    "sendMessage": "Cr",
	    "processGameUpdate": "Sr",
	    "EmoteManager": "ir",
	    "camera": "De",
	    "targetZoom": "O",
	    "activePlayer": "dr",
	    "input": "bt",
	    "mousePosition": "Ue",
	    "keyPressed": "We",
	    "mousePressed": "Ge",
	    "mouseDown": "Ke",
	    "map": "Et",
	    "obstaclePool": "Ve",
	    "buildingPool": "nr",
	    "pool": "mt",
	    "weapons": "tt",
	    "curWeapIdx": "rt",
	    "playerBarn": "Rt",
	    "playerPool": "$e",
	    "playerInfo": "Rr",
	    "layer": "pe",
	    "dead": "he",
	    "downed": "ue",
	    "sodaBar": "qr",
	    "activeId": "pr",
	    "objectCreator": "mr",
	    "netData": "Le",
	    "pieTimer": "ar",
	    "lootBarn": "Yt",
	    "closestLoot": "Dr",
	    "lootPool": "sr",
	    "localData": "Re",
	    "cheatVersion": "0.30.0"
	};

	window.webpackJsonp([0], {
		"webpack_inject": function (wrapper, exports, getModule) {

			var mainModule = getModule("9b5f96fd")[obfuscate.mainModule];
			// console.log(mainModule);

			// init
			var gameInitBase = mainModule.prototype[obfuscate.init];
			mainModule.prototype[obfuscate.init] = function () {
				gameInitBase.apply(this, arguments);
				window.gameFunctions.gameInit.call(this);
			};

			// free
			var gameFreeBase = mainModule.prototype[obfuscate.free];
			// console.log(gameFreeBase);
			mainModule.prototype[obfuscate.free] = function () {
				gameFreeBase.apply(this, arguments);
				window.gameFunctions.gameFree.call(this);
			};

			// update and override
			var gameUpdateBase = mainModule.prototype[obfuscate.update];
			mainModule.prototype[obfuscate.update] = function () {
				if (!this.override)
					window.gameFunctions.gameOverride.call(this);
				gameUpdateBase.apply(this, arguments);
				window.gameFunctions.gameUpdate.call(this);
			};

			// render
			// var gameRenderBase = mainModule.prototype[obfuscate.render];
			// mainModule.prototype[obfuscate.render] = function () {
			// 	gameRenderBase.apply(this, arguments);
			// 	window.gameFunctions.gameRender.call(this);
			// };

			// sendMessage
			// var gameSendMessageBase = mainModule.prototype[obfuscate.sendMessage];
			// mainModule.prototype[obfuscate.sendMessage] = function () {
			// 	gameSendMessageBase.apply(this, arguments);
			// 	window.gameFunctions.gameSendMessage.apply(this, arguments);
			// };

			// processGameUpdate
			var gameSrocessGameUpdateBase = mainModule.prototype[obfuscate.processGameUpdate];
			mainModule.prototype[obfuscate.processGameUpdate] = function () {
				gameSrocessGameUpdateBase.apply(this, arguments);
				window.gameFunctions.gameSrocessGameUpdate.apply(this, arguments);
			};

			// PING
			var emoteModule = getModule("e5d16b4d");
			
			// console.log(emoteModule);

			// var someModule = getModule("c99e6613");
			// console.log(someModule);

			// var anotherModule = getModule('61fc98e9');
			// console.log(anotherModule.prototype.connect);


			// override
			var emoteManagerUpdateBase = emoteModule[obfuscate.EmoteManager].prototype[obfuscate.update]; //emoteModule.EmoteManager.prototype.update
			// console.log(emoteManagerUpdateBase);
			emoteModule[obfuscate.EmoteManager].prototype[obfuscate.update] = function () {
				if (!this.override)
					window.gameFunctions.pingOverride.call(this);

				emoteManagerUpdateBase.apply(this, arguments);
			};

			// DATA
			window.gameVars.Game.GameData = getModule("989ad62a");
			window.gameVars.Game.model = getModule("10899aea");

			window.gameVars.Game.BulletBarn = getModule("beeed8a4");
			window.gameVars.Game.GunBarn = getModule("ad1c4e70");
			window.gameVars.Game.GunTypes = getModule("ccb6ad93");
			window.gameVars.Game.Perks = getModule("590afbba")


			// window.setInterval(function() { window.gameVars.Game.updateTeamTab = true; }, 1000);
		}
	}, ["webpack_inject"]);

})();
