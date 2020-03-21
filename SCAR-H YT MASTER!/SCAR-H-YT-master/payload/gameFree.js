window.gameFunctions = window.gameFunctions || {};
window.gameFunctions.gameFree = function(){
	if(this.override)
		this.override = true;
	
	window.gameVars.Game.GameActive = true;
	
	window.gameVars.Textures.targetTexture = null;
	window.gameVars.Textures.roundTexture = null;
	window.gameVars.Game.Laser.draw = null;
	window.gameVars.Game.EnemyLines.draw = null;
	
	window.gameVars.Perfomance.lastTimeFPS = 0;
}
