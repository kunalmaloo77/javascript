const welcomeContainer = document.querySelector("#welcomeContainer");
const gameContainer = document.querySelector("#gameContainer");
const road = document.querySelector(".road");

window.addEventListener("keydown", startGame);

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

const car = {
  speed: 10,
}

const gameState = {
  isRunning: false,
  isGameOver: false,
  score: 0,
  animationId: null
}

function startGame(e) {
  if (e.key === "Enter" && gameState.isGameOver) {
    gameState.isGameOver = false;
    resetGame();
  }
  else if(e.key === "Enter" && !gameState.isRunning) {
    // Reset game state
    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.score = 0;

    welcomeContainer.classList.add("hide");
    gameContainer.classList.remove("hide");
    window.removeEventListener("keydown", startGame);

    const existingEnemies = document.querySelectorAll(".enemy");
    existingEnemies.forEach(enemy => enemy.remove());

    const existingLines = document.querySelectorAll(".line");
    existingLines.forEach(line => line.remove());

    // Create new enemies and lines
    for(let i = 0; i < 5; ++i){
      let enemy = document.createElement("div");
      enemy.classList.add("enemy");
      enemy.y = ((i+1)*600)*-1;
      enemy.style.left = Math.floor(Math.random() * 450) + "px";
      let randomColor = `rgb(${Math.floor(Math.random() * 256)},
                           ${Math.floor(Math.random() * 256)},
                           ${Math.floor(Math.random() * 256)})`;
      enemy.style.setProperty('background-color',  randomColor);
      road.appendChild(enemy);
    }

    // Create lines
    for(let i = 0; i < 5; i++) {
      let line = document.createElement("div");
      line.classList.add("line");
      line.style.top = i * 150 + "px";
      line.y = i * 150;
      road.appendChild(line);
    }

    car.posX = document.getElementById("playerCar").offsetLeft;
    car.posY = document.getElementById("playerCar").offsetTop;
    gameState.animationId = window.requestAnimationFrame(animate);
  }
}

document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

function pressOn(event) {
  event.preventDefault();
  keys[event.key] = true;
}

function pressOff(event) {
  event.preventDefault();
  keys[event.key] = false;
}


function animate(time) {
  if(!gameState.isRunning) return;
  
  const playerCar = document.querySelector("#playerCar");
  const roadRect = road.getBoundingClientRect();
  moveLines();
  moveEnemy();

  gameState.score++;
  document.querySelector("#score").textContent = `Score: ${gameState.score}`;

  if (keys.ArrowUp && car.posY > 0) {
    car.posY = Math.max(car.posY - car.speed, 0);
  }
  if (keys.ArrowDown) {       
    car.posY = Math.min(car.posY + car.speed, roadRect.height - 100);
  }
  if (keys.ArrowLeft) {
    car.posX = Math.max(car.posX - car.speed, playerCar.offsetWidth/2);
  }
  if (keys.ArrowRight) {
    car.posX = Math.min(car.posX + car.speed, roadRect.width - playerCar.offsetWidth /2);
  }

  playerCar.style.top = `${car.posY}px`;
  playerCar.style.left = `${car.posX}px`;

  if (!gameState.isGameOver) {
    gameState.animationId = window.requestAnimationFrame(animate);
  }
}


function moveLines(){
  const lines = document.querySelectorAll(".line");
  lines.forEach(function (item) {
    if(item.y >= 750){
      item.y -= 750;
    }
    item.y += car.speed;
    item.style.top = item.y + "px";
  })
}

function collide(player, enemy) {
  const playerRect = player.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();
  return !(
    playerRect.bottom < enemyRect.top || 
    playerRect.top > enemyRect.bottom || 
    playerRect.right < enemyRect.left || 
    playerRect.left > enemyRect.right
  );
}
function moveEnemy(){
  const enemies = document.querySelectorAll(".enemy");
  const playerCar = document.getElementById("playerCar");
  enemies.forEach(function(enemy) {
    if(collide(playerCar, enemy)){
      endGame();
    }
    if(enemy.y >= window.screen.height){
      enemy.y = -600;
      enemy.style.left = Math.floor(Math.random() * 450) + "px";
    }
    enemy.y += car.speed;
    enemy.style.top = enemy.y + "px";
  })
}

function endGame(){
  gameState.isRunning = false;
  gameState.isGameOver = true;

  if(gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
  
  const gameOverMessage = document.createElement("div");
  gameOverMessage.id = "gameOverMessage";
  gameOverMessage.innerHTML = `
    <h2>Game Over!</h2>
    <p>Your score: ${gameState.score}</p>
    <p>Press Enter to restart</p>
  `;
  gameOverMessage.style.position = "absolute";
  gameOverMessage.style.top = "50%";
  gameOverMessage.style.left = "50%";
  gameOverMessage.style.transform = "translate(-50%, -50%)";
  gameOverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  gameOverMessage.style.color = "white";
  gameOverMessage.style.padding = "20px";
  gameOverMessage.style.borderRadius = "10px";
  gameOverMessage.style.textAlign = "center";
  gameOverMessage.style.zIndex = "10";
  
  gameContainer.appendChild(gameOverMessage);
  window.addEventListener("keydown", startGame);
}

function resetGame() {
  const gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage) {
    gameOverMessage.remove();
  }
  startGame({ key: "Enter" });
}