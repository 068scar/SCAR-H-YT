var number = 0
var processes = []
var disableSpin = false

window.gameFunctions.gameSrocessGameUpdate = function () {
}
window.gameFunctions.gameUpdate = function () {
    var game = this;

    if(!game){
        console.log(this)
    }

    if (!window.gameVars)
        return;
    var state = window.gameVars.Game;
    var gameData = state.GameData;

    if (!gameData)
        return;
	
    //Clicking 'G' will leave your game and start a team game instantly.
    if(game[obfuscate.input].keys["71"]){
        game[obfuscate.input].keys["32"] = false
        document.getElementById("btn-game-quit").click()
        setTimeout(document.getElementById("btn-start-team").click(), 50)
        return;
}
    //Clicking 'H' will leave your game and start a solos game instantly.
    if(game[obfuscate.input].keys["72"]){
        game[obfuscate.input].keys["32"] = false
        document.getElementById("btn-game-quit").click()
        setTimeout(document.getElementById("btn-start-mode-0").click(), 50)
        return;
    }
    
    //Render trees, bushes, and tables as semi-transparent (alpha = 0.5)
    var updateObstacleAlpha = function(obstacle) {
        if(!obstacle || !obstacle.img)
            return;
        
        var alpha = 1.0;
        
        var setting = window.menu.UserSetting.look;
        
        if(obstacle.img.includes("map-tree"))
            alpha = 0.5
        if(obstacle.img.includes("map-bush"))
            alpha = 0.5
        if(obstacle.img.includes("map-table"))
            alpha = 0.5

        obstacle.sprite.alpha = alpha;
    }

    if (!window.menu || !window.menu.UserSetting)
        return;
    // Local functions for math and physics calculations

    var getDistance = function (p1, p2) {
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    var getDistance2 = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2))
    }

    var getVector = function (x, y) {
        return Math.sqrt((x*x) + (y*y)) 
    }

    var getSecondsElapsed = function (time) {
        return (window.performance.now() - time) / 1000;
    };

    var getTimeElapsed = function (time) {
        return (window.performance.now() - time);
    };

    //Detect live enemies that are in the same layer, used for live aimbot.
    var detectEnimies = function () {
        var selfId = game[obfuscate.activeId];
        var selfTeamId = game[obfuscate.playerBarn][obfuscate.playerInfo][game[obfuscate.activeId]].teamId;
        var objectIds = Object.keys(game[obfuscate.objectCreator].idToObj);
        var playerIds = Object.keys(game[obfuscate.playerBarn][obfuscate.playerInfo]);
        var allPlayers = game[obfuscate.playerBarn][obfuscate.playerInfo];
        var firstPlayerId = Object.keys(allPlayers)[0];
        var firstPlayerObj = game[obfuscate.objectCreator].idToObj[firstPlayerId];
        var allPlayerDict = {};

        var isTeammate = function (plrId, plrObj) {
            var isTmmt = game[obfuscate.playerBarn][obfuscate.playerInfo][plrId].teamId == selfTeamId;
            plrObj.teammate = isTmmt;
            return isTmmt;
        }

        var isUnderground = function (plrObj) {
            if(plrObj[obfuscate.netData][obfuscate.layer] == 0 && curPlayer[obfuscate.netData][obfuscate.layer] == 1){
                return true
            }
            if(plrObj[obfuscate.netData][obfuscate.layer] == 1 && curPlayer[obfuscate.netData][obfuscate.layer] == 0){
                return true
            }

        }

        return playerIds
            .filter(function (id) {
                var playerObject = game[obfuscate.objectCreator].idToObj[id];
                return playerObject &&
                    (!isTeammate(id, playerObject)) &&
                    (!playerObject[obfuscate.netData][obfuscate.dead]) &&
                    (!playerObject[obfuscate.netData][obfuscate.downed]) &&
                    (!isUnderground(playerObject)) &&
                    id != selfId;
            })
            .map(function (id) {
                return game[obfuscate.objectCreator].idToObj[id];
            });
    }  
    
    //Detect downed enemies in the same layer, used for downed aimbot.
    var detectDownedEnimies = function () {
        var selfId = game[obfuscate.activeId];
        var selfTeamId = game[obfuscate.playerBarn][obfuscate.playerInfo][game[obfuscate.activeId]].teamId;
        var objectIds = Object.keys(game[obfuscate.objectCreator].idToObj);
        var playerIds = Object.keys(game[obfuscate.playerBarn][obfuscate.playerInfo]);
        var allPlayers = game[obfuscate.playerBarn][obfuscate.playerInfo];
        var firstPlayerId = Object.keys(allPlayers)[0];
        var firstPlayerObj = game[obfuscate.objectCreator].idToObj[firstPlayerId];
        var allPlayerDict = {};

        var isTeammate = function (plrId, plrObj) {
            var isTmmt = game[obfuscate.playerBarn][obfuscate.playerInfo][plrId].teamId == selfTeamId;
            plrObj.teammate = isTmmt;
            return isTmmt;
        }

        var isUnderground = function (plrObj) {
            if(plrObj[obfuscate.netData][obfuscate.layer] == 0 && curPlayer[obfuscate.netData][obfuscate.layer] == 1){
                return true
            }
            if(plrObj[obfuscate.netData][obfuscate.layer] == 1 && curPlayer[obfuscate.netData][obfuscate.layer] == 0){
                return true
            }

        }

        return playerIds
            .filter(function (id) {
                var playerObject = game[obfuscate.objectCreator].idToObj[id];
                return playerObject &&
                    (!isTeammate(id, playerObject)) &&
                    (!playerObject[obfuscate.netData][obfuscate.dead]) &&
                    (playerObject[obfuscate.netData][obfuscate.downed]) &&
                    (!isUnderground(playerObject)) &&
                    id != selfId;
            })
            .map(function (id) {
                return game[obfuscate.objectCreator].idToObj[id];
            });
    }  

    //Detect live and downed enemies, used for drawing lines.
    var detectAll = function () {
        var selfId = game[obfuscate.activeId];
        var selfTeamId = game[obfuscate.playerBarn][obfuscate.playerInfo][game[obfuscate.activeId]].teamId;
        var objectIds = Object.keys(game[obfuscate.objectCreator].idToObj);
        var playerIds = Object.keys(game[obfuscate.playerBarn][obfuscate.playerInfo]);
        var allPlayers = game[obfuscate.playerBarn][obfuscate.playerInfo];
        var firstPlayerId = Object.keys(allPlayers)[0];
        var firstPlayerObj = game[obfuscate.objectCreator].idToObj[firstPlayerId];
        var allPlayerDict = {};

        var isTeammate = function (plrId, plrObj) {
            var isTmmt = game[obfuscate.playerBarn][obfuscate.playerInfo][plrId].teamId == selfTeamId;
            plrObj.teammate = isTmmt;
            return isTmmt;
        }

        return playerIds
            .filter(function (id) {
                var playerObject = game[obfuscate.objectCreator].idToObj[id];
                return playerObject &&
                    (!isTeammate(id, playerObject)) &&
                    (!playerObject[obfuscate.netData][obfuscate.dead]) &&
                    id != selfId;
            })
            .map(function (id) {
                return game[obfuscate.objectCreator].idToObj[id];
            });
    }  

    //Process enemies speed, time taken, in order to predict their position.
    var processEnemy = function (enemy) {
        if (!enemy)
            return;
 
        enemy.prediction = { x: 0.0, y: 0.0 };
        processes.unshift(
            {
                pos: enemy.pos,
                curPos: curPlayer.pos,
                time: window.performance.now() / 1000,
            })

        curPosX = 0
        curPosY = 0

        enemyPosX = 0
        enemyPosY = 0

        avgSpeedX = 0
        avgSpeedY = 0

        avgSpeedX2 = 0
        avgSpeedY2 = 0
	
	//Takes 2 consecutive times and distances (X and Y), takes current enemy and player positions (X and Y). 
        if (processes.length > 3) { 
            
                curPosX = processes[0].curPos.x
                curPosY = processes[0].curPos.y
                enemyPosX = processes[0].pos.x 
                enemyPosY = processes[0].pos.y
               
                timeDiff1 = processes[0].time - processes[1].time
                distDiffX1 = processes[0].pos.x - processes[1].pos.x
                distDiffY1 = processes[0].pos.y - processes[1].pos.y
                
                timeDiff2 = processes[1].time - processes[2].time
                distDiffX2 = processes[1].pos.x - processes[2].pos.x
                distDiffY2 = processes[1].pos.y - processes[2].pos.y
		
		//Calculates X speed and Y speed for both of those times and distances taken.
                avgSpeedX =
                    (distDiffX1) / (timeDiff1)

                avgSpeedY =
                    (distDiffY1) / (timeDiff1)

                avgSpeedX2 =
                    (distDiffX2) / (timeDiff2)
                   
                avgSpeedY2 =
                    (distDiffY2) / (timeDiff2)

        }
	    
	//If using melee, no prediction  due to hitscan nature of melees.
        if (curBulletSpeed == 0){
            enemy.prediction = {
                x: 0,
                y: 0
            };
            return;
        }
 	
	//For projectiles (guns), uses distance = speed * time (Enemy Speed * (Enemy Distance / Bullet Speed)) averaged out over both points.     
        else{
            enemy.prediction = {
                x:
                (
                    ((avgSpeedX) * (getDistance2(curPosX, curPosY, enemyPosX, enemyPosY) / curBulletSpeed)) +
                    ((avgSpeedX2) * (getDistance2(curPosX, curPosY, enemyPosX, enemyPosY) / curBulletSpeed))

                ) / 2,
 
                y:
                (
                    ((avgSpeedY) * (getDistance2(curPosX, curPosY, enemyPosX, enemyPosY) / curBulletSpeed)) + 
                    ((avgSpeedY2) * (getDistance2(curPosX, curPosY, enemyPosX, enemyPosY) / curBulletSpeed))

                ) / 2


        }
 
 
    }
}

    // Local variables
    var curPlayer = game[obfuscate.activePlayer];

    game[obfuscate.map][obfuscate.obstaclePool][obfuscate.pool].forEach(updateObstacleAlpha); //Call our obstacle alpha function for all sprites in the current viewable pool.
   
    var mapScale = game[obfuscate.camera].ppu; //Scale of map

    var snipers = ["m870", "sv98", "awc", "mosin", "spas12", "model94", "potato_cannon", "scout_elite", "blr"] //Weapons for quickswitching

    var bullets = window.gameVars.Game.BulletBarn //Bullets and their data

    var guns = window.gameVars.Game.GunBarn //Guns and their data

    var gunTypes = window.gameVars.Game.GunTypes //Melees actually

    var perks = window.gameVars.Game.Perks //Perks, not too useful

    var curWeapon = curPlayer[obfuscate.localData][obfuscate.weapons][curPlayer[obfuscate.localData][[obfuscate.curWeapIdx]]].type //Current Weapon Name

    var curBulletSpeed = 0; //Define the speed of our weapon's bullet

    if (curPlayer[obfuscate.localData][[obfuscate.curWeapIdx]] < 2) { 
        curBulletSpeed = bullets[guns[curWeapon].bulletType].speed
    }
    else {
        curBulletSpeed = 0
    }
    //If gun is held currently, bullet speed is that gun's bullet speed. Else, speed is 0 (melees).
    
    //AutoQuickSwitch: clicks 'K' (equip other gun), when one bullet is fired from one of the snipers.
    var switchWeapon = function () {
        if (!game[obfuscate.input].keys["75"]) {
            setTimeout(function () {
                game[obfuscate.input].keys["75"] = true;
                setTimeout(function () {
                    delete game[obfuscate.input].keys["75"]
                }, guns[curWeapon].switchDelay * 100);
            }, guns[curWeapon].switchDelay * 100);
        }
    }

    if (game[obfuscate.input].mouseButton && snipers.includes(curWeapon)) { 
        switchWeapon()
    }
    
    //Display Soda Bar above health, rounded to nearest 0.5.
    window.gameVars.UI.FPSText.text("BOOST: " + Math.round(2*Number(curPlayer[obfuscate.localData][obfuscate.sodaBar])) / 2);

    //AutoLoot: spams loot when near loot.
    
    //Current name of weapons 1 and 2.
    var invWeapon1Name = curPlayer[obfuscate.localData][obfuscate.weapons][0].type
    var invWeapon2Name = curPlayer[obfuscate.localData][obfuscate.weapons][1].type;

    //Find out how far loot is.
    var getLootRange = function(loot) {
        var lootDist = getDistance(loot.pos, curPlayer.pos) - loot.rad - gameData.player.radius

        if(lootDist < window.menu.UserSetting.loot.autolootSafeDistance && loot.active){
            return true        
        }
        else{
            return false
        }
    }

    //Returns true if we need to loot, otherwise returns false
    var needToLoot = function() {
	
	//If inventory does not have 2 guns.
        var needGuns = invWeapon1Name == "" || invWeapon2Name == ""
	
	//Filters loot that is active and within the loot range.
        var loot = game[obfuscate.lootBarn][obfuscate.lootPool][obfuscate.pool].filter((l) => l.active && getLootRange(l))

	//If there's loot that is within the range, active, and player is currently using melee, or need guns, then loot.
        if((loot.length > 0 && curPlayer[obfuscate.localData][[obfuscate.curWeapIdx]] > 1) || needGuns){
            return true
        }
	
	//Don't loot if the gun slots are full
        if(!needGuns){
            return false
        }
    };

    // Zoom: Control zoom of window, allowing player to see more
    if(!game[obfuscate.activePlayer][obfuscate.netData]){
        window.gameVars.ZoomDelta = 0
    }
    var currentZoom = window.gameVars.ZoomLevel;

    //Adds 0.1 * ZoomDelta every scroll, caps at 0.5 (out) and 1.1 (in)
    currentZoom += 0.1 * window.gameVars.Input.Cheat.GetZoomDelta()
    currentZoom = currentZoom < 0.5 ? 0.5 : currentZoom > 1.1 ? 1.1 : currentZoom;

    if (!window.gameVars.Menu && window.menu.UserSetting.look.zoomEnabled){
        window.gameVars.ZoomLevel = currentZoom;
    }
    
    // Detect enimies

    var enimies = detectEnimies(); //Live
    
    var downed = detectDownedEnimies() //Downed
    
    var all = detectAll() //All
    
    window.gameVars.Game.Enimies = enimies;

    // Update enemy lines: for all
    allPoints = all.map((enemy) => {
            return {
                x: ((enemy.pos.x) - curPlayer.pos.x) * mapScale,
                y: (curPlayer.pos.y - (enemy.pos.y)) * mapScale
            };
        });

    window.gameVars.Game.EnemyLines.points = allPoints

    //Draw black line from player to enemy.
    var updateEnemyLines = function() {
            
        var enemyLines = window.gameVars.Game.EnemyLines;

        var points = enemyLines.points
        var draw = enemyLines.draw;

        if(!draw){
            draw = new window.PIXI.Graphics();
            enemyLines.draw = draw;
            game[obfuscate.activePlayer].container.addChild(draw);
            game[obfuscate.activePlayer].container.setChildIndex(draw, 0);
        }

        draw.clear();
        draw.beginFill();
        draw.lineStyle(2, 000000);

        points.forEach(function(pnt) {
            draw.moveTo(0, 0);
            draw.lineTo(pnt.x, pnt.y);
        });

        draw.endFill();
 }

    //AutoFollow: Automatically moves to enemy's center position.
    
    //Functions for movements, WASD on the keyboard respectively.
    var W = function () {
        game[obfuscate.input].keys["38"] = true;
    }

    var S = function () {
        game[obfuscate.input].keys["40"] = true;
    }

    var A = function () {
        game[obfuscate.input].keys["37"] = true;     
    }

    var D = function () {
        game[obfuscate.input].keys["39"] = true;
    }
    
    //Functions for stopping movement, WASD.
    var cancelW = function () {
        delete game[obfuscate.input].keys["38"]
    }

    var cancelS = function () {
        delete game[obfuscate.input].keys["40"]
    }

    var cancelA = function () {
        delete game[obfuscate.input].keys["37"]    
    }

    var cancelD = function () {
        delete game[obfuscate.input].keys["39"]
    }
     
    //Update Names: shows names of enemies
     var updateNames = function(player) {
         if(!player || !player.nameText || player.teammate)
          return;
            
         var nameText = player.nameText;
            
         if(window.gameVars.Input.Cheat.ShowNamesPressed)
         {
             nameText.visible = true;

             nameText.tint = 0xffd700;
        
             nameText.scale.set(1, 1);
         }
     }

    // AutoAim: Aims at enemies with prediction
    var target = null;

    window.gameVars.Input.Cheat.ShowNamesPressed = true;

    //If there are live enemies and the auto aim cancel button is not pressed, begin calculating target.
    if (!window.gameVars.Input.Cheat.AutoAimPressed && enimies.length > 0)
    {
	//List of all distances for current enemies in sight.
        distList = []
        
	//Push all enemy distances from player to distList.
        for (i = 0; i < enimies.length; i++) {
            distList.push(parseInt(getDistance2(enimies[i].pos.x, enimies[i].pos.y, curPlayer.pos.x, curPlayer.pos.y)))
        }
        
	//Target is closest one to player.
        target = enimies[distList.indexOf(Math.min(...distList))]

    }
	
    //If there are downed enemies and the auto aim cancel button is not pressed, begin calculating target.
    if (!window.gameVars.Input.Cheat.AutoAimPressed && downed.length > 0)
    {
	//Downed distance list.
        downedDist = []
        
	//Push all downed enemy distances from player to downedDist.
        for (j = 0; j < downed.length; j++) {
            downedDist.push(parseInt(getDistance2(downed[j].pos.x, downed[j].pos.y, curPlayer.pos.x, curPlayer.pos.y)))
        }

	//If SpinBot button pressed or there are no live enemies, target is the closest downed enemy.
        if(window.gameVars.Input.Cheat.SpinPressed || enimies.length == 0){
            target = downed[downedDist.indexOf(Math.min(...downedDist))]
        }

    }
	
    //Apply prediction calculations to this target.
    processEnemy(target)

    window.gameVars.Game.Target = target;

    (function () {
	//Spinbot patterns I have created.
	    
        //X cross number = 8
        // spinListX = [curPlayer.pos.x + 50, curPlayer.pos.x + 50, curPlayer.pos.x + 50, curPlayer.pos.x + 50, curPlayer.pos.x - 50, curPlayer.pos.x - 50, curPlayer.pos.x - 50, curPlayer.pos.x - 50]
        // spinListY = [curPlayer.pos.y - 50, curPlayer.pos.y - 50, curPlayer.pos.y + 50, curPlayer.pos.y + 50, curPlayer.pos.y + 50, curPlayer.pos.y + 50, curPlayer.pos.y - 50, curPlayer.pos.y - 50]
        
        //L number = 2
        // spinListX = [curPlayer.pos.x, curPlayer.pos.x, curPlayer.pos.x + 50, curPlayer.pos.x + 50]
        // spinListY = [curPlayer.pos.y + 50, curPlayer.pos.y + 50, curPlayer.pos.y, curPlayer.pos.y]

        //Windmill spinbot number = 4
        // spinListX = [curPlayer.pos.x, curPlayer.pos.x, curPlayer.pos.x + 50, curPlayer.pos.x - 50]
        // spinListY = [curPlayer.pos.y - 50, curPlayer.pos.y + 50, curPlayer.pos.y, curPlayer.pos.y]

        //square spinbot number = 8 
        // spinListX = [curPlayer.pos.x, curPlayer.pos.x + 1000, curPlayer.pos.x + 1000, curPlayer.pos.x + 1000, curPlayer.pos.x, curPlayer.pos.x - 1000, curPlayer.pos.x - 1000, curPlayer.pos.x - 1000]
        // spinListY = [curPlayer.pos.y + 1000, curPlayer.pos.y + 1000, curPlayer.pos.y, curPlayer.pos.y - 1000, curPlayer.pos.y - 1000, curPlayer.pos.y - 1000, curPlayer.pos.y, curPlayer.pos.y + 1000]

        //triangle spinbot number = 12
        // spinListX = [curPlayer.pos.x, curPlayer.pos.x + 1000, curPlayer.pos.x - 1000,
        // curPlayer.pos.x + 1000, curPlayer.pos.x - 1000, curPlayer.pos.x - 1000,
        // curPlayer.pos.x, curPlayer.pos.x - 1000, curPlayer.pos.x + 1000,
        // curPlayer.pos.x - 1000, curPlayer.pos.x + 1000, curPlayer.pos.x + 1000,
        // ]

        // spinListY = [curPlayer.pos.y + 1000, curPlayer.pos.y - 1000, curPlayer.pos.y - 1000,
        // curPlayer.pos.y, curPlayer.pos.y - 1000, curPlayer.pos.y + 1000,
        // curPlayer.pos.y - 1000, curPlayer.pos.y + 1000, curPlayer.pos.y + 1000,
        // curPlayer.pos.y, curPlayer.pos.y + 1000, curPlayer.pos.y - 1000,
        // ]

	//If SpinBot is enabled, then spinning is active.
        if (window.menu.UserSetting.shoot.spinBotEnabled) {
            window.gameVars.Input.Mouse.SpinActive = true
        }
	    
	//Otherwise spinning is not active.
        else if (!window.menu.UserSetting.shoot.spinBotEnabled) {
            window.gameVars.Input.Mouse.SpinActive = false
            disableSpin = true
        }
	
	//If the SpinBot bind is pressed, spinning is not active.
        if (window.gameVars.Input.Cheat.SpinPressed) {
            window.gameVars.Input.Mouse.SpinActive = false
        }

	//If caps lock or WASD is pressed, all pre-existing movements will be cancelled.
        if(game[obfuscate.input].keys["17"] || game[obfuscate.input].keys["87"] || game[obfuscate.input].keys["65"] || game[obfuscate.input].keys["83"] || game[obfuscate.input].keys["68"]){
            cancelW()
            cancelA()
            cancelS()
            cancelD()
        }

        
	//Main Aimbot / Spinbot Loop.
	
	//Aimbot: If target exists, aiming is true, aim at the current target position + the prediction caclculated. Override the mouse position to the aiming position.
        if (target) {
            var pos = target.pos;
            var distance = target.distance
            var prediction = target.prediction ? target.prediction : { x: 0, y: 0 };

            if (window.gameVars.Input.Cheat.AutoAimPressed == false) {           
                window.gameVars.Input.Mouse.AimActive = true;
                window.gameVars.Input.Mouse.AimPos = game[obfuscate.camera].pointToScreen({ x: pos.x + prediction.x, y: pos.y + prediction.y });
                game[obfuscate.input][obfuscate.mousePosition].x = window.gameVars.Input.Mouse.AimPos.x;
                game[obfuscate.input][obfuscate.mousePosition].y = window.gameVars.Input.Mouse.AimPos.y;
		
		//Activate AutoFollow when distance between player and enemy is less than 3.
                if(getDistance(target.pos, curPlayer.pos) < 4){
                    
	 	    //Pull out melee.
		    if(!game[obfuscate.input].keys["90"]) {
                        setTimeout(function() {
                            game[obfuscate.input].keys["90"] = true;
                                setTimeout(function() {
                                    delete game[obfuscate.input].keys["90"]
                                }, 50);
                            }, 0);
                        }
			
		    //Movement logic
                    if(target.pos.x - curPlayer.pos.x > 0){
                        cancelA()
                        D()
                    }

                    else if(target.pos.x - curPlayer.pos.x < 0){
                        cancelD()
                        A()
                    }

                    if(target.pos.y - curPlayer.pos.y > 0){
                        cancelS()
                        W()
                    }

                    else if(target.pos.y - curPlayer.pos.y < 0){
                        cancelW()
                        S()
                    }
                }
            }

	    //If Aimbot bind is pressed, don't aim.
            else if (window.gameVars.Input.Cheat.AutoAimPressed == true) {
                window.gameVars.Input.Mouse.AimActive = false;
            }
        }

	//SpinBot: If not aiming and spinning is active, spin repeatedly in the positions specified.
        else if (window.gameVars.Input.Mouse.SpinActive) {
            window.gameVars.Input.Mouse.AimActive = false;
	
	    //Cancels from using mouse.
            if (game[obfuscate.input].mouseButton) {
                window.gameVars.Input.Mouse.SpinActive = false
                return;
            }

	    //Spinning position is the cosine and sine of the angle in radians. Based off of the unit circle.
            window.gameVars.Input.Mouse.SpinPos = game[obfuscate.camera].pointToScreen({
                // x: spinListX[number],
                // y: spinListY[number]
                x: ((Math.cos((number * (Math.PI / 180)))) * 1000000),
                y: ((Math.sin((number * (Math.PI / 180)))) * 1000000)
            })

	    //Override mouse position.
            game[obfuscate.input][obfuscate.mousePosition].x = window.gameVars.Input.Mouse.SpinPos.x;
            game[obfuscate.input][obfuscate.mousePosition].y = window.gameVars.Input.Mouse.SpinPos.y;

	    //Sweet angle
            number += 119
        }
    }
    )();

    //Update lines and names to all enemies.
    updateEnemyLines()
    all.forEach(updateNames);

    // Bump fire: Spams mouse button when it is held down, allowing you to punch the fastest.
    window.gameVars.Input.Cheat.RepeatFire = window.menu.UserSetting.shoot.bumpFireEnabled && game[obfuscate.input].mouseButton
    
    // Auto loot: F is the loot key, spam it every 90 milliseconds.    
    var pressF = function () {
     if(!game[obfuscate.input].keys["70"]) {
         setTimeout(function() {
             game[obfuscate.input].keys["70"] = true;
             setTimeout(function() {
                 delete game[obfuscate.input].keys["70"]
             }, 90);
         }, 0);
     }
    }
	
   //Call our F button spammer if we need to loot.
    if(needToLoot()) {
     pressF();
    }
}
