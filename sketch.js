// --- 全域變數宣告 ---
let circles = [];
const colorPalette = ['#FFFFFF', '#FFCAD4', '#F4ACB7', '#9D8189'];
// *** 修改點 1: 定義加分顏色為 #FFFFFF (白色) ***
const TARGET_COLOR = '#FFFFFF'; 
const BG_COLOR = '#D8E2DC';
const NUM_CIRCLES = 30;

let popSound; 
let audioReady = false; 
let score = 0; 
const USER_ID = "414730241"; 

// --- 預載音效檔 (保持不變) ---
function preload() {
  popSound = loadSound('pop.mp3'); 
}

// --- Circle 類別 (保持不變) ---
class Circle {
  constructor(colorPalette) {
    this.x = random(width);
    this.y = random(height, height + 50);
    this.r = random(20, 80); 
    this.fillColor = random(colorPalette);
    this.alpha = random(100, 200);
    this.speedY = random(-0.5, -3); 
    this.speedX = random(-0.5, 0.5);
    
    this.isExploding = false;
    this.explosionDuration = 0; 
    this.fragments = [];      
    this.MAX_DURATION = 30;   
  }

  isClicked(mx, my) {
    let distance = dist(mx, my, this.x, this.y);
    return distance < this.r && !this.isExploding;
  }
  
  explode() {
    this.isExploding = true;
    this.explosionDuration = this.MAX_DURATION;
    this.fragments = [];

    if (audioReady && popSound.isLoaded()) {
        popSound.playMode('sustain');
        popSound.play(0, random(0.8, 1.2), 0.5); 
    }

    let numFragments = floor(random(5, 11)); 
    for (let i = 0; i < numFragments; i++) {
      this.fragments.push({
        x: this.x,
        y: this.y,
        size: this.r * random(0.1, 0.3),
        vx: random(-3, 3), 
        vy: random(-3, 3)
      });
    }
  }
  
  display() {
    if (this.isExploding) {
      let currentAlpha = map(this.explosionDuration, this.MAX_DURATION, 0, this.alpha, 0); 
      let fragmentColor = color(this.fillColor);
      fragmentColor.setAlpha(currentAlpha);
      fill(fragmentColor);
      noStroke();

      for (let fragment of this.fragments) {
        circle(fragment.x, fragment.y, fragment.size * 2);
        fragment.x += fragment.vx;
        fragment.y += fragment.vy;
        fragment.vy += 0.1; 
      }
      
      this.explosionDuration--;
      if (this.explosionDuration <= 0) {
        this.isExploding = false;
        this.reset();
      }
    } else {
      let c = color(this.fillColor);
      c.setAlpha(this.alpha);
      fill(c);
      noStroke();
      circle(this.x, this.y, this.r * 2);

      let squareSize = this.r / 5; 
      let squareColor = color('#A0C4FF');
      squareColor.setAlpha(150);
      fill(squareColor); 
      noStroke(); 
      
      let angle = -45;
      let distFromCenter = this.r * 0.7;
      let squareCenterX = this.x + distFromCenter * cos(radians(angle));
      let squareCenterY = this.y + distFromCenter * sin(radians(angle));

      rectMode(CENTER);
      rect(squareCenterX, squareCenterY, squareSize, squareSize);
      rectMode(CORNER);
    }
  }

  move() {
    if (this.isExploding) {
      return;
    }
    
    this.y += this.speedY; 
    this.x += this.speedX; 
    
    if (this.y < -this.r) {
      this.reset();
    }
  }
  
  reset() {
    this.x = random(width);
    this.y = height + this.r;
    this.r = random(20, 80);
    this.fillColor = random(colorPalette);
    this.alpha = random(100, 200);
    this.speedY = random(-0.5, -3);
    this.speedX = random(-0.5, 0.5);
    this.isExploding = false;
  }
}

// --- p5.js 核心函式 ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES); 
  
  for (let i = 0; i < NUM_CIRCLES; i++) {
    circles.push(new Circle(colorPalette));
  }
}

function draw() {
  background(BG_COLOR); 
  
  for (let i = 0; i < circles.length; i++) {
    circles[i].move();
    circles[i].display();
  }
  
  // 繪製介面元素
  fill(0); 
  textSize(24);
  noStroke();
  
  // 繪製左上角 ID
  textAlign(LEFT, TOP);
  text(USER_ID, 10, 10);
  
  // 繪製右上角計分表
  textAlign(RIGHT, TOP);
  text(`得分: ${score}`, width - 10, 10);
  
  // 繪製底部提示文字
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(0, 50);
  // *** 修改點 2: 更新提示文字中的加分色 ***
  text("點擊 #FFFFFF 圓形 +1 分，其他 -1 分 (需先點擊畫面啟動音訊)", width / 2, height - 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (!audioReady) {
    userStartAudio();
    audioReady = true;
  }
}

// --- 2. mouseClicked 函式 (邏輯保持不變，但由於 TARGET_COLOR 變了，功能隨之改變) ---
function mouseClicked() {
  for (let circle of circles) {
    if (circle.isClicked(mouseX, mouseY)) {
      
      // 邏輯判斷使用 TARGET_COLOR (現為 #FFFFFF)
      if (circle.fillColor === TARGET_COLOR) {
        score += 1; // 點擊白色圓形加一分
      } else {
        score -= 1; // 點擊其他顏色圓形扣一分
      }
      
      circle.explode(); 
      return; 
    }
  }
}