//Canvas variables
var canvas;
var canvasContext;
var canvasX;
var canvasY;
var mouseIsDown = 0;
//Sprites and time
var sAsteroid;
var sAsteroid2;
var sAsteroid3;
var sAsteroid4;
var bkgdImage;
var sPlayerShip;
var sPlasmaBall;
var sStartButton;
var sInstructionButton;
var sMenuButton;
var sRetryButton;
var sReplayButton;
var currentTime;
var startTimeMS;
//Bool variables
var lastPt=null;
var gameOverScreen = false;
var shotFired = false;
var calculated = false;
var asteroidSpawned = false;
var asteroidSpawned2 = false;
var asteroidSpawned3 = false;
//Score, health and game state variables
var gameState = 0;
var highscore = 0;
var score = 0;
var shipHealth = 100;
var x = 0;
//Coordinates
var touchX = 0;
var touchY = 0;
var touchXup = 0;
var touchYup = 0;
var targetX = 0;
var targetY = 0;
//Audio
var shootNoise = new Audio("PlasmaFire.wav");
var asteroidDestroy = new Audio("AsteroidDestroy.wav");
var shipDestroy = new Audio("ShipExplode.wav");


//Load function (runs on load)
function load()
{
    //Set canvas
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    //Check if local storage is available
    if (storageAvailable('localStorage'))
    {
       showScore();
    }
    //Set and play main theme
    var mainAudio = new Audio();
    mainAudio.src = "MainTheme.wav";
    mainAudio.loop = true;
    mainAudio.autoplay = true;
    //Run initilisation
    init();
    //Set the canvas coords
    canvasX = canvas.width/2;
    canvasY = canvas.height - 30;
    //Run the main game loop
    gameLoop();
}
//Sprite variables
function aSprite(x, y, imageSRC, velx, vely)
{
    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
}
//Sprite render function with set width and height
aSprite.prototype.renderF = function(width, height)
{
    canvasContext.drawImage(this.sImage, this.x, this.y, width, height);
}
//Sprite render function without width and height setter
aSprite.prototype.render = function()
{
    canvasContext.drawImage(this.sImage, this.x, this.y);
}
//Move a sprite in the x & y plane
aSprite.prototype.update = function(deltaTime)
{
    this.x += deltaTime * this.vx;
    this.y += deltaTime * this.vy;
}
//Bullet update function
aSprite.prototype.updateBullet = function(deltaTime, tX, tY)
{
    //Calculate the target and play the fire sound
    if(calculated == false)
    {
       targetX = tX;
       targetY = tY;

       calculated = true;
       shootNoise.play();
    }
    //Move the sprite towards the target
    var tx = targetX - this.x,
    ty = targetY - this.y,
    dist = Math.sqrt(tx*tx + ty*ty);;

    this.vx = (tx/dist);
    this.vy = (ty/dist);

    this.x += this.vx * 10;
    this.y += this.vy * 10;
    //Check if the sprite has arrived at the target
    if(dist < 5)
    {
        //Reset shot
        shotFired = false;
        this.x = sPlayerShip.x + 38;
        this.y = sPlayerShip.y;
        calculated = false;
    }
}
//Initialisation function
function init()
{
    //If the canvas exists
    if(canvas.getContext)
    {
        //Set event listeners
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);
        //Resize the canvas for the screen
        resizeCanvas();
        //Set the background image and sprites, also get current time for timing functions
        bkgdImage = new aSprite(0,0,"Background.png",0,0);
        sPlayerShip = new aSprite(canvas.width/2 - 50, canvas.height - 150, "PlayerShip.png", 0, 0);
        sPlasmaBall = new aSprite(sPlayerShip.x + 38, sPlayerShip.y,"PlasmaBall.png",0,0);

        currentTime = Date.now();

        sAsteroid = new aSprite(Math.random() * canvas.width , -300 , "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
        sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 , "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
        sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 , "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
        sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 , "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));

        sStartButton = new aSprite(canvas.width/2 - 120, canvas.height / 2 - 100, "Button.png", 0, 0);
        sInstructionButton = new aSprite(canvas.width/2 - 120, canvas.height / 2 + 100, "Button.png", 0, 0);
        sMenuButton = new aSprite(canvas.width/2 - 120, canvas.height / 2 + 200, "Button.png", 0, 0);
        sRetryButton = new aSprite(canvas.width/2 - 120, canvas.height / 1.5, "Button.png", 0, 0);
        sReplayButton = new aSprite(canvas.width/2 - 120, canvas.height / 1.5, "Button.png", 0, 0);

        startTimeMS = Date.now();
    }
}
//Function to resize the canvas to the window size
function resizeCanvas()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
//Function to determine if local storage is available
function storageAvailable(type)
{
    try
    {
        var storage = window[type],
        x = '__Storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e)
    {
        return e instanceof DOMExeption && (
        //everything except firefox
        e.code === 22 ||
        //Firefox
        e.code === 1014 ||
        //test name field too because code might not be present
        //everything except firefox
        e.name === 'QuotaExceededError' ||
        //Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        //check the error only if something is already stored
        storage.length !== 0;
    }
}
//Main game loop
function gameLoop()
{
    //Get elapsed time and call functions
    var elapsed = (Date.now() - startTimeMS)/1000;
    update(elapsed);
    render(elapsed);
    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);
    collisionDetection();
    //Spawn extra asteroids depending on time passed and check if player has survived
    if(Date.now() >= currentTime + 3000 && asteroidSpawned == false)
    {
        asteroidSpawned = true;
    }
    if(Date.now() >= currentTime + 6000 && asteroidSpawned2 == false)
    {
        asteroidSpawned2 = true;
    }
    if(Date.now() >= currentTime + 9000 && asteroidSpawned3 == false)
    {
        asteroidSpawned3 = true;
    }
    if(Date.now() >= currentTime + 120000 && gameState == 1)
    {
        touchX = null;
        touchY = null;
        gameState = 4;
    }
    //Update the local storage score
    showScore();
}
//Render sprites depending on the game state
function render(delta)
{
    bkgdImage.renderF(canvas.width, canvas.height);

    switch(gameState)
    {
        case 0:
            sStartButton.renderF(240, 100);
            styleText('white', '35px Courier New','center','middle');
            canvasContext.fillText("Asteroid Panic!", canvas.width/2, 100);
            styleText('black', '30px Courier New','center','middle');
            canvasContext.fillText("Play", canvas.width/2, canvas.height / 2 - 50);
            sInstructionButton.renderF(240, 100);
            canvasContext.fillText("Instructions", canvas.width/2, canvas.height / 2 + 150);
        break;

        case 1:
            sAsteroid.renderF(100, 100);
            sPlayerShip.renderF(100, 150);

            if (asteroidSpawned == true)
            {
                sAsteroid2.renderF(100, 100);
            }

            if (asteroidSpawned2 == true)
            {
                sAsteroid3.renderF(100, 100);
            }

            if (asteroidSpawned3 == true)
            {
                sAsteroid4.renderF(100, 100);
            }

            if (shotFired == true)
            {
                sPlasmaBall.renderF(25, 25);
            }

            styleText('white', '30px Courier New','left','middle');
            canvasContext.fillText("Score: " + score, 20, 20);
            canvasContext.fillText("Shield: " + shipHealth + "%", 20, 40);
        break;

        case 2:
            sRetryButton.renderF(240, 100);
            styleText('black', '30px Courier New','center','middle');
            canvasContext.fillText("Retry", canvas.width/2, canvas.height / 1.5 + 50);
            styleText('white', '35px Courier New','center','middle');
            canvasContext.fillText("Game Over!", canvas.width/2, 100);
            canvasContext.fillText("Score:" + score, canvas.width/2, 200);
        break;

        case 3:
            styleText('white', '15px Courier New','left','middle');
            canvasContext.fillText("Tap the screen to shoot plasma balls", 5, 100);
            canvasContext.fillText("Destroy asteroids to gain score", 5, 150);
            canvasContext.fillText("Don't let asteroids hit the ship", 5, 200);
            canvasContext.fillText("Survive for two minutes to win", 5, 250);
            sMenuButton.renderF(240, 100);
            styleText('black', '30px Courier New','center','middle');
            canvasContext.fillText("Return", canvas.width/2, canvas.height / 2 + 250);
        break;

        case 4:
            sReplayButton.renderF(240, 100);
            styleText('black', '30px Courier New','center','middle');
            canvasContext.fillText("Replay", canvas.width/2, canvas.height / 1.5 + 50);
            styleText('white', '35px Courier New','center','middle');
            canvasContext.fillText("Victory!", canvas.width/2, 100);
            canvasContext.fillText("Score:" + score, canvas.width/2, 200);
        break;
    }
}
//Update sprites depending on the game state
function update(delta)
{
    switch(gameState)
    {
        case 1:
            sAsteroid.update(delta);

            if (shotFired == true)
            {
                sPlasmaBall.updateBullet(delta, touchX, touchY);
            }

            if (asteroidSpawned == true)
            {
                sAsteroid2.update(delta);
            }

            if (asteroidSpawned2 == true)
            {
                sAsteroid3.update(delta);
            }

            if (asteroidSpawned3 == true)
            {
                sAsteroid4.update(delta);
            }
        break;
    }
}
//Check for collisions depending on the game states
function collisionDetection()
{
    switch(gameState)
    {
        case 0:
            if(touchX < sStartButton.x + 240 && touchX > sStartButton.x)
            {
                if(touchY < sStartButton.y + 100 && touchY > sStartButton.y)
                {
                    touchX = null;
                    touchY = null;
                    currentTime = Date.now();
                    asteroidSpawned == false
                    asteroidSpawned2 == false
                    asteroidSpawned3 == false
                    gameState = 1;
                }
            }
            if (touchX < sInstructionButton.x + 240 && touchX > sInstructionButton.x)
            {
                if(touchY < sInstructionButton.y + 100 && touchY > sInstructionButton.y)
                {
                    touchX = null;
                    touchY = null;
                    gameState = 3
                }
            }
        break;

        case 1:
            if(sAsteroid.y > canvas.height)
            {
                 sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                 "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
            }
            else if(sAsteroid.x > canvas.width || (sAsteroid.x + 100) < 0)
            {
                sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
            }

            if (asteroidSpawned == true)
            {
                if(sAsteroid2.y > canvas.height)
                {
                     sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                     "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
                else if(sAsteroid2.x > canvas.width || (sAsteroid2.x + 100) < 0)
                {
                    sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
            }

            if (asteroidSpawned2 == true)
            {
                if(sAsteroid3.y > canvas.height)
                {
                     sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                     "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
                else if(sAsteroid3.x > canvas.width || (sAsteroid3.x + 100) < 0)
                {
                    sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
            }

            if (asteroidSpawned3 == true)
            {
                if(sAsteroid4.y > canvas.height)
                {
                     sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                     "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
                else if(sAsteroid4.x > canvas.width || (sAsteroid4.x + 100) < 0)
                {
                    sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                }
            }

            if((sPlasmaBall.x + 12.5) > sAsteroid.x && (sPlasmaBall.x + 12.5) < (sAsteroid.x + 100)
            && sPlasmaBall.y > sAsteroid.y &&sPlasmaBall.y < (sAsteroid.y + 100) && shotFired == true)
            {
                 sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                 "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                 shotFired = false;
                 sPlasmaBall.x = sPlayerShip.x + 38;
                 sPlasmaBall.y = sPlayerShip.y;
                 calculated = false;
                 asteroidDestroy.play();
                 score += 5;
            }

            if((sPlasmaBall.x + 12.5) > sAsteroid2.x && (sPlasmaBall.x + 12.5) < (sAsteroid2.x + 100)
            && sPlasmaBall.y > sAsteroid2.y && sPlasmaBall.y < (sAsteroid2.y + 100) && shotFired == true)
            {
                 sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                 "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                 shotFired = false;
                 sPlasmaBall.x = sPlayerShip.x + 38;
                 sPlasmaBall.y = sPlayerShip.y;
                 calculated = false;
                 asteroidDestroy.play();
                 score += 5;
            }

            if((sPlasmaBall.x + 12.5) > sAsteroid3.x && (sPlasmaBall.x + 12.5) < (sAsteroid3.x + 100)
            && sPlasmaBall.y > sAsteroid3.y && sPlasmaBall.y < (sAsteroid3.y + 100) && shotFired == true)
            {
                 sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                 "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                 shotFired = false;
                 sPlasmaBall.x = sPlayerShip.x + 38;
                 sPlasmaBall.y = sPlayerShip.y;
                 calculated = false;
                 asteroidDestroy.play();
                 score += 5;
            }

            if((sPlasmaBall.x + 12.5) > sAsteroid4.x && (sPlasmaBall.x + 12.5) < (sAsteroid4.x + 100)
            && sPlasmaBall.y > sAsteroid4.y && sPlasmaBall.y < (sAsteroid4.y + 100) && shotFired == true)
            {
                 sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                 "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                 shotFired = false;
                 sPlasmaBall.x = sPlayerShip.x + 38;
                 sPlasmaBall.y = sPlayerShip.y;
                 calculated = false;
                 asteroidDestroy.play();
                 score += 5;
            }

            if((sAsteroid.x > sPlayerShip.x && sAsteroid.x < sPlayerShip.x + 100) ||
            (sAsteroid.x + 100 > sPlayerShip.x && sAsteroid.x + 100 < sPlayerShip.x + 100))
            {
                if(sAsteroid.y + 100 > sPlayerShip.y)
                {
                    sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                    shipDestroy.play();
                    shipHealth -= 50;

                    if(shipHealth <= 0)
                    {
                        touchX = null;
                        touchY = null;
                        gameState = 2;
                    }
                }
            }

            if((sAsteroid2.x > sPlayerShip.x && sAsteroid2.x < sPlayerShip.x + 100) ||
            (sAsteroid2.x + 100 > sPlayerShip.x && sAsteroid2.x + 100 < sPlayerShip.x + 100))
            {
                if(sAsteroid2.y + 100 > sPlayerShip.y)
                {
                    sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                    shipDestroy.play();
                    shipHealth -= 50;

                    if(shipHealth <= 0)
                    {
                        touchX = null;
                        touchY = null;
                        gameState = 2;
                    }
                }
            }

            if((sAsteroid3.x > sPlayerShip.x && sAsteroid3.x < sPlayerShip.x + 100) ||
            (sAsteroid3.x + 100 > sPlayerShip.x && sAsteroid3.x + 100 < sPlayerShip.x + 100))
            {
                if(sAsteroid3.y + 100 > sPlayerShip.y)
                {
                    sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                    shipDestroy.play();
                    shipHealth -= 50;

                    if(shipHealth <= 0)
                    {
                        touchX = null;
                        touchY = null;
                        gameState = 2;
                    }
                }
            }

            if((sAsteroid4.x > sPlayerShip.x && sAsteroid4.x < sPlayerShip.x + 100) ||
            (sAsteroid4.x + 100 > sPlayerShip.x && sAsteroid4.x + 100 < sPlayerShip.x + 100))
            {
                if(sAsteroid4.y + 100 > sPlayerShip.y)
                {
                    sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                    "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                    shipDestroy.play();
                    shipHealth -=50;

                    if(shipHealth <= 0)
                    {
                        touchX = null;
                        touchY = null;
                        gameState = 2;
                    }
                }
            }
        break;

        case 2:
             if (touchX < sRetryButton.x + 240 && touchX > sRetryButton.x)
             {
                  if(touchY < sRetryButton.y + 100 && touchY > sRetryButton.y)
                  {
                      score = 0;
                      shipHealth = 100;
                      sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      asteroidSpawned = false;
                      asteroidSpawned2 = false;
                      asteroidSpawned3 = false;
                      currentTime = Date.now();

                      touchX = null;
                      touchY = null;
                      gameState = 1;
                  }
             }
        break;

        case 3:
            if(touchX < sMenuButton.x + 240 && touchX > sMenuButton.x)
            {
                if(touchY < sMenuButton.y + 100 && touchY > sMenuButton.y)
                {
                    touchX = null;
                    touchY = null;
                    gameState = 0;
                }
            }
        break;

        case 4:
             if (touchX < sReplayButton.x + 240 && touchX > sReplayButton.x)
             {
                  if(touchY < sReplayButton.y + 100 && touchY > sReplayButton.y)
                  {
                      score = 0;
                      shipHealth = 100;
                      sAsteroid = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid2 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid3 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      sAsteroid4 = new aSprite(Math.random() * canvas.width , -300 ,
                      "Asteroid.png", ((Math.random() * 50) - 25), ((Math.random() * 100) + 50));
                      asteroidSpawned = false;
                      asteroidSpawned2 = false;
                      asteroidSpawned3 = false;
                      currentTime = Date.now();

                      touchX = null;
                      touchY = null;
                      gameState = 1;
                  }
             }
        break;
    }
}
//Save score to local storage
function populateStorage()
{
    localStorage.setItem('player_score', document.getElementById('score').value);
    showScore();
}
//Display score in web storage
function showScore()
{
    var highscore = localStorage.getItem('player_score');
    if (highscore < score)
    {
        highscore = score;
        localStorage.setItem('player_score', highscore);
    }

    document.getElementById('show').innerHTML = "High Score: " + highscore;
}
//Set the text variables
function styleText(txtColour, txtFont, txtAlign, txtBaseline)
{
    canvasContext.fillStyle = txtColour;
    canvasContext.font = txtFont;
    canvasContext.textAlign = txtAlign;
    canvasContext.textBaseline = txtBaseline;
}
//touchUP event
function touchUp(evt)
{
    evt.preventDefault();
    lastPt = null;
}
//touchDown event
function touchDown(evt)
{
   evt.preventDefault();
   touchXY(evt);
}
//set the touchX and touchY coords of last touch
function touchXY(evt)
{
    evt.preventDefault();

    touchX = evt.touches[0].pageX - canvas.offsetLeft;
    touchY = evt.touches[0].pageY - canvas.offsetTop;
    //Check the game is in play state before firing a shot
    if(gameState == 1)
    {
        shotFired = true;
    }
}