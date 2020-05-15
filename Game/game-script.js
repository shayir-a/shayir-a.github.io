const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BRICKS_WIDTH = 60;
const BRICKS_HEIGHT = 30;
const BALL_RADIUS = 8;
const FULL_X_SPEED = 7;
var stage;
var paddle;
var ball;
var bricks = [];
var score = 0;
var lives = 3;
var scoreText;
var gameStarted = false;
const KEYCODE_LEFT = 37;
const KEYCODE_RIGHT = 39;
const SPACEBAR = 32;
var keyboarMoveLeft = false;
var keyboardMoveRight = false;
var highScore = 0;

function init() {
    if(typeof(Storage) !== "undefined") {
        if(localStorage.highScore == undefined) {
            localStorage.highScore = 0;
        }
        highScore = localStorage.highScore; 
    } else {
        highScore = 0;
    }

    stage = new createjs.Stage("testCanvas"); 
    createjs.Touch.enable(stage);
    createScoreText();
    addToScore(0);
    createBrickGrid();
    createPaddle();
    createBall();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
    
    window.onkeyup = keyUphandler;
    window.onkeydown = keyDownHandler;

    stage.on("stagemousemove", function(event) {
        paddle.x = stage.mouseX;
    });  

    stage.on("stagemousedown", function(event) {
        startLevel();
    });

}

function startLevel() {
    if(!gameStarted) {
        gameStarted = true;
        ball.xSpeed = 5;
        ball.ySpeed = 5; 
        ball.up = true; 
        ball.right = true;
    }

}

function keyDownHandler(e) {
    switch(e.keyCode) {
        case KEYCODE_LEFT: keyboarMoveLeft = true; break;
        case KEYCODE_RIGHT: keyboardMoveRight = true; break;
        case SPACEBAR: startLevel(); break;
    }
}

function keyUphandler(e) {
    switch(e.keyCode) {
        case KEYCODE_LEFT: keyboarMoveLeft = false; break;
        case KEYCODE_RIGHT: keyboardMoveRight = false; break;
    }

}

function loseLife() {
    lives--;
    scoreText.text = "Score: " + score + " / Lives: " + lives;
    ball.xSpeed = 0;
    ball.ySpeed = 0;
    ball.x = paddle.x;
    ball.y = paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS;
    gameStarted = false; 

    if(lives == 0) {
        resetGame();
    }
}

function resetGame() {
    document.getElementById("popUp-2").style.display = "block";
    score = 0;
    lives = 3; 
    createBrickGrid();
    scoreText.text = "Score: " + score + " / Lives: " + lives;
}


function createScoreText() {
    scoreText = new createjs.Text("","16px Arial", "#000000");
    addToScore(0);
    scoreText.y = stage.canvas.height - 16;
    stage.addChild(scoreText);
}



function addToScore(points) {
    score += points; 
    scoreText.text = "Score: " + score + " / Lives: " + lives;
}



function tick(event) {

     if(keyboarMoveLeft) {
         paddle.x -= 10;
     } 

     if (keyboardMoveRight) {
         paddle.x += 10; 
     }

    if(paddle.x + PADDLE_WIDTH/2 > stage.canvas.width) {
        paddle.x = stage.canvas.width - PADDLE_WIDTH/2;
    }
    if(paddle.x  - PADDLE_WIDTH/2 < 0) {
        paddle.x = PADDLE_WIDTH/2;
    }

    if(!gameStarted) {
        ball.x = paddle.x;
        ball.y = paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS;
        stage.update();
        return;
    }

    //vertical movement
    if(ball.up) {
        ball.y -= ball.ySpeed;
    } else {
        ball.y += ball.ySpeed; 
    }
    //horizontal movement
    if(ball.right) {
        ball.x += ball.xSpeed; 
    } else {
        ball.x -= ball.xSpeed;
    }

    for (var i = 0; i < bricks.length; i++) {
        if(checkCollision(ball, bricks[i])) {
            addToScore(100);
            destroyBrick(bricks[i]);
            bricks.splice(i,1);
            i--;
        }
    }

    if(checkCollision(ball, paddle)) {
        newBallXSpeedAfterCollision(ball, paddle);
    }

    //check to see if the ball hits the walls
    if(ball.x + BALL_RADIUS >= stage.canvas.width) {
        ball.x = stage.canvas.width - BALL_RADIUS;
        ball.right = false;
    }

    if(ball.y + BALL_RADIUS >= stage.canvas.height) {
        loseLife();
    }

    if(ball.x - BALL_RADIUS <= 0 ) {
        ball.x = BALL_RADIUS;
        ball.right = true;
    }

    if(ball.y - BALL_RADIUS <= 0 ) {
        ball.y = BALL_RADIUS;
        ball.up = false;
    }

    ball.lastX = ball.x;
    ball.lastY = ball.y;

    stage.update();
}

function createBrickGrid() {
    for(var i=0; i<14; i++) {
        for(var j=0; j<5;j++) {
            createBrick( i*(BRICKS_WIDTH + 10) + 40, j*(BRICKS_HEIGHT + 5) + 20);
        }
    }

}

function checkCollision(ballElement, hitElement) {
    var leftBorder = (hitElement.x - hitElement.getBounds().width/2);
    var rightBorder = (hitElement.x + hitElement.getBounds().width/2);
    var topBorder = (hitElement.y - hitElement.getBounds().height/2);
    var bottomBorder = (hitElement.y + hitElement.getBounds().height/2);
    var previousBallLeftBorder = ballElement.lastX - BALL_RADIUS;
    var previousBallRightBorder = ballElement.lastX + BALL_RADIUS;
    var previousBallTopBorder = ballElement.lastY - BALL_RADIUS;
    var previousBallBottomBorder = ballElement.lastY + BALL_RADIUS;
    var ballLeftBorder = ballElement.x - BALL_RADIUS;
    var ballRightBorder = ballElement.x + BALL_RADIUS;
    var ballTopBorder = ballElement.y - BALL_RADIUS;
    var ballBottomBorder = ballElement.y + BALL_RADIUS;


    if((ballLeftBorder<=rightBorder) && (ballRightBorder >= leftBorder) && (ballTopBorder <= bottomBorder) && (ballBottomBorder >= topBorder))
    {


        if((ballTopBorder <= bottomBorder)&&(previousBallTopBorder > bottomBorder))
        {
            //Hit from the bottom
            ballElement.up = false;
            ballElement.y = bottomBorder + BALL_RADIUS;
        }

        if((ballBottomBorder >= topBorder)&&(previousBallBottomBorder<topBorder))
        {
            //Hit from the top
            ballElement.up = true;
            ballElement.y = topBorder - BALL_RADIUS;
        }
        if((ballLeftBorder<=rightBorder)&&(previousBallLeftBorder>rightBorder))
        {
            //Hit from the right
            ballElement.right = true;
            ballElement.x = rightBorder + BALL_RADIUS;
        }

        if((ballRightBorder >= leftBorder)&&(previousBallRightBorder < leftBorder))
        {
            //Hit from the left
            ballElement.right = false;
            ballElement.x = leftBorder - BALL_RADIUS;
        }

        ballElement.lastX = ballElement.x;
        ballElement.lastY = ballElement.y;
        return true;
    }
    return false;

}

function createBrick(x,y) {
    var brick = new createjs.Shape();
    brick.graphics.beginFill('DarkCyan');
    brick.graphics.drawRect(0,0, BRICKS_WIDTH, BRICKS_HEIGHT);
    brick.graphics.endFill();
    

    brick.regX = BRICKS_WIDTH/2;
    brick.regX = BRICKS_HEIGHT/2;

    brick.x = x;
    brick.y = y;

    brick.setBounds(brick.regX, brick.regY, BRICKS_WIDTH, BRICKS_HEIGHT);
    stage.addChild(brick);
    bricks.push(brick);
}

function createBall(){
    ball = new createjs.Shape();
    ball.graphics.beginFill("Crimson").drawCircle(0,0,BALL_RADIUS);
    ball.x = paddle.x;
    ball.y = paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS;
    stage.addChild(ball); 

    ball.up = true; 
    ball.right = true; 
    ball.xSpeed = 0; 
    ball.ySpeed = 0; 
    ball.lastX = 0; 
    ball.lastY = 0;

}

function createPaddle(){
    paddle = new createjs.Shape();
    paddle.width = PADDLE_WIDTH;
    paddle.height = PADDLE_HEIGHT;
    paddle.graphics.beginFill('#000000').drawRect(0, 0, paddle.width, paddle.height);
    paddle.x = stage.canvas.width/2-PADDLE_WIDTH/2;
    paddle.y = stage.canvas.height*0.9;
    paddle.regX = PADDLE_WIDTH/2;
    paddle.regY = PADDLE_HEIGHT/2;
    paddle.setBounds(paddle.regX,paddle.regY,PADDLE_WIDTH,PADDLE_HEIGHT);
    stage.addChild(paddle);
}

function destroyBrick(brick) {
    createjs.Tween.get(brick,{}).to({scaleX:0, scaleY:0}, 500);
    setTimeout(removeBrickFromScreem, 500, brick);
}

function removeBrickFromScreem(brick) {
    stage.removeChild(brick);
}

function newBallXSpeedAfterCollision(ballElement, hitElement) {
    var startPoint = hitElement.x - hitElement.getBounds().width/2;
    var midPoint = hitElement.x;
    var endPoint = hitElement.x + hitElement.getBounds().width/2;

    if(ballElement.x < midpoint) {
        ball.right = false; 
        ball.xSpeed = FULL_X_SPEED - ( (ballElement.x - startPoint)/(midPoint - startPoint) ) 
        * FULL_X_SPEED;

    } else {
        ball.xSpeed = FULL_X_SPEED - ( (endPoint - ballElement.x)/(endPoint - midPoint) )
        * FULL_X_SPEED;
        ball.right = true;
    }
}

function play() {
    document.getElementById("popUp-1").style.display = "none";
}

function playAgain() {
    document.getElementById("popUp-2").style.display = "none";
}
