package  {
	
	import flash.display.*;
	import flash.text.*;
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	public class SpacecraftDockingSimulator extends MovieClip {
		
		const SHIP_WID = 800;
		const SHIP_HEI = 300;
		const KNOB_X = 725;
		const KNOB_Y = 533;
		const R_LIM = 60;
		
		var devR;
		var theta;
		
		var tgX;
		var tgY;
		var tgZ;
		var errorAllowed;
		var offAllowed;
		var szX;
		var szY;
		var vx;
		var vy;
		var vz;
		var scale;
		var dragging:Boolean;
		
		public function SpacecraftDockingSimulator() {
			gotoAndStop("preload");
			addEventListener(Event.ENTER_FRAME, preload);
		}
		
		function preload(e:Event) {
			var byteloaded = loaderInfo.bytesLoaded;
			var bytetotal = loaderInfo.bytesTotal;
			loadText.text = byteloaded + "/" + bytetotal;
			if (byteloaded == bytetotal) {
				removeEventListener(Event.ENTER_FRAME, preload);
				selectDifficulty();
			}
		}
		
		function selectDifficulty() {
			gotoAndStop("difficulty");
			easy.addEventListener(MouseEvent.CLICK, function() { reset(12, 28, 2.56) });
			mid.addEventListener(MouseEvent.CLICK, function() { reset(16, 32, 1.28) });
			hard.addEventListener(MouseEvent.CLICK, function() { reset(18, 36, 0.96) });
		}
		
		function reset(r:uint, velocity:Number, errorRange:Number) {
			devR = Math.random() * r + r;
			theta = Math.random() * 2 * Math.PI;
		
			tgX = Math.cos(theta) * devR;
			tgY = Math.sin(theta) * devR;
			tgZ = 190000.0;
			errorAllowed = errorRange;
			offAllowed = 256;
			szX = 0.0;
			szY = 0.0;
			vx = 0.0;
			vy = 0.0;
			vz = velocity;
			scale = 49453.125 / (tgZ + 7812.5);
			dragging = false;
			
			gotoAndStop("gameplay");
			knob.x = KNOB_X;
			knob.y = KNOB_Y;
			
			introBtn.addEventListener(MouseEvent.CLICK, function () {
									  	intro.gotoAndPlay(2);
										introBtn.visible = false;
									  });
			intro.addEventListener(MouseEvent.CLICK, function () {
								   		intro.gotoAndPlay(26);
										introBtn.visible = true;
								   });
			
			knob.addEventListener(MouseEvent.MOUSE_DOWN, function() { dragging = true });
			addEventListener(MouseEvent.MOUSE_UP, function() { dragging = false });
			addEventListener(Event.ENTER_FRAME, update);
		}
		
		function update(event:Event) {
			// update data
			szX += vx;
			szY += vy;
			tgZ -= vz;
			
			// visual matching
			scale = 49453.125 / (tgZ + 7812.5);
			
			tgyh.width = SHIP_WID * scale;
			tgyh.height = SHIP_HEI * scale;
			tgyh.x = (tgX - szX) * scale + 400;
			tgyh.y = (tgY - szY) * scale + 300;
			
			// monitor report
			var distance = Math.sqrt((szX - tgX)*(szX - tgX) + (szY - tgY)*(szY - tgY) + tgZ*tgZ) / 1000;
			var velocity = Math.sqrt(vx*vx*122500 + vy*vy*122500 + vz*vz) * 60 / 1000;
			var error = Math.sqrt((tgX - szX)*(tgX - szX) + (tgY - szY)*(tgY - szY));
			
			distanceTrace.text = distance;
			velocityTrace.text = velocity;
			errorTrace.text = error;
			errorAllowedTrace.text = errorAllowed + "";
			
			if (error >= offAllowed) {
				gameOver("off");
			}
			if (tgZ <= 0) {
				distanceTrace.text = "0";
				if (error <= errorAllowed) {
					gameOver("win");
				} else {
					gameOver("lose");
				}
			}
			
			// control of the stick
			if (dragging) {
				knob.x = mouseX;
				knob.y = mouseY;
				var radius = Math.sqrt(Math.pow(knob.x - KNOB_X, 2) + Math.pow(knob.y - KNOB_Y, 2));
				var dx = KNOB_X - knob.x;
				var dy = KNOB_Y - knob.y;
				if (radius > R_LIM) {
					var angle = Math.atan2(dy, dx);
					var limitX = KNOB_X - Math.cos(angle) * R_LIM;
					var limitY = KNOB_Y - Math.sin(angle) * R_LIM;

					knob.x = limitX;
					knob.y = limitY;
				}
				
				var xCompo = (KNOB_X - knob.x) / 100;
				var yCompo = (KNOB_Y - knob.y) / 100;
				
				vx += xCompo * (2.0E-4 + Math.random() * 4.0E-5);
				vy += yCompo * (2.0E-4 + Math.random() * 4.0E-5);
			} else { // drag released
				knob.x = KNOB_X;
				knob.y = KNOB_Y;
			}
		}
		
		function resetGame(event:MouseEvent) {
			reset(devR, vz, errorAllowed);
		}
		
		function gameOver(outcome:String) {
			removeEventListener(Event.ENTER_FRAME, update);
			dragging = false;
			knob.x = KNOB_X;
			knob.y = KNOB_Y;
			gotoAndStop(outcome);
			resetBtn.addEventListener(MouseEvent.CLICK, resetGame);
			resetDiffiBtn.addEventListener(MouseEvent.CLICK, function() { selectDifficulty(); });
		}
	}
	
}
