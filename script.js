/* Файл: script.js */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Состояния игры: loading, forest, findKey, night, holeInside, final
let gameState = 'loading';
let timer = 0;
let worldOffset = 0;
let speedMult = 1;
let dialogueStep = 0;
let moveDir = 0; // -1 лево, 0 стоп, 1 право
let walkCycle = 0;

// Объекты
const polina = { x: 100, y: 0, w: 40, h: 80, color: '#0000FF' };
const kristina = { x: 600, y: 0, w: 40, h: 80, color: '#FF69B4', isCaged: false, red: false };
const chameleon = { x: 300, y: 0, active: true };

// Координаты земли
const groundY = canvas.height - 100;
polina.y = groundY - polina.h;
kristina.y = groundY - kristina.h;

// Функции отрисовки человечка
function drawHuman(x, y, color, isWalking, isPolina = true) {
    const time = Date.now() / 150;
    const legMove = isWalking ? Math.sin(time) * 15 : 0;
    const armMove = isWalking ? Math.cos(time) * 15 : 0;

    ctx.fillStyle = color;
    // Голова
    ctx.fillRect(x + 10, y - 25, 20, 20);
    // Тело
    ctx.fillRect(x + 5, y - 5, 30, 45);
    // Ноги
    ctx.fillRect(x + 5, y + 40 + (isWalking ? Math.max(0, legMove) : 0), 10, 25); 
    ctx.fillRect(x + 25, y + 40 + (isWalking ? Math.max(0, -legMove) : 0), 10, 25);
    // Руки
    ctx.fillRect(x - 5, y + 5 + armMove, 8, 25);
    ctx.fillRect(x + 37, y + 5 - armMove, 8, 25);
    
    if (isPolina && kristina.red && Math.abs(polina.x - kristina.x) < 50) {
        // Поцелуй (наклон)
    }
}

function drawHearts() {
    for(let i=0; i<15; i++) {
        const x = (Math.sin(Date.now()/1000 + i) * canvas.width/2) + canvas.width/2;
        const y = (i * 50 + Date.now()/10) % canvas.height;
        ctx.fillStyle = '#ff1493';
        ctx.font = '30px Arial';
        ctx.fillText('❤', x, y);
    }
}

function update() {
    if (gameState === 'loading') {
        timer += 1/60;
        if (timer > 10) gameState = 'forest';
    }

    if (moveDir !== 0 && !document.getElementById('dialogue-cloud').offsetParent) {
        let speed = 5 * moveDir * speedMult;
        
        if (gameState === 'findKey') {
            // Замедление при приближении к краю (якобы к ключу)
            if (polina.x > 1200) {
                speedMult -= 0.005;
                if (speedMult <= 0.05) {
                    gameState = 'night';
                    speedMult = 1;
                    polina.x = 100; // Сбрасываем позицию для ночной сцены
                    document.getElementById('objective-text').innerText = "Найти Кристину";
                }
            }
        }
        
        polina.x += speed;
        if (polina.x > canvas.width / 2) worldOffset = polina.x - canvas.width / 2;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'loading') {
        ctx.fillStyle = '#ffc0cb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawHearts();
        ctx.fillStyle = 'white';
        ctx.font = '24px Courier';
        ctx.fillText('Загрузка любви... ' + Math.floor(timer*10) + '%', canvas.width/2-100, canvas.height/2);
    } 

    else if (gameState === 'forest' || gameState === 'findKey' || gameState === 'night') {
        // Небо
        ctx.fillStyle = (gameState === 'night') ? '#0c0c20' : '#ffe4e1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Горы и туман (статичные)
        ctx.fillStyle = (gameState === 'night') ? '#1a1a2e' : '#e0b0ff';
        ctx.beginPath();
        ctx.moveTo(0, groundY); ctx.lineTo(200, 100); ctx.lineTo(400, groundY);
                ctx.moveTo(300, groundY); ctx.lineTo(600, 150); ctx.lineTo(900, groundY);
        ctx.fill();

        // Трава
        ctx.fillStyle = (gameState === 'night') ? '#052005' : '#90ee90';
        ctx.fillRect(0, groundY, 5000, 100);

        // Кристина
        if (gameState !== 'findKey') {
            if (kristina.red) ctx.shadowBlur = 20; ctx.shadowColor = "red";
            drawHuman(kristina.x - worldOffset, groundY - 80, kristina.color, false, false);
            ctx.shadowBlur = 0;

            if (kristina.isCaged) {
                ctx.strokeStyle = '#333'; ctx.lineWidth = 5;
                ctx.strokeRect(kristina.x - worldOffset - 10, groundY - 100, 60, 100);
                for(let i=0; i<60; i+=15) {
                    ctx.beginPath(); ctx.moveTo(kristina.x - worldOffset - 10 + i, groundY - 100);
                    ctx.lineTo(kristina.x - worldOffset - 10 + i, groundY); ctx.stroke();
                }
            }
        }

        // Яма ночью
        if (gameState === 'night') {
            ctx.fillStyle = 'black';
            ctx.fillRect(600 - worldOffset, groundY, 100, 20);
        }

        drawHuman(polina.x - worldOffset, groundY - 80, polina.color, moveDir !== 0);
    }

    else if (gameState === 'holeInside' || gameState === 'final') {
        // Розовая комната
        ctx.fillStyle = (gameState === 'final') ? '#2c001e' : '#ffb6c1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Декор
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for(let i=0; i<canvas.width; i+=100) { ctx.fillText('❤', i, 50); ctx.fillText('❤', i+50, 150); }

        if (chameleon.active) {
            ctx.fillStyle = 'green';
            ctx.fillRect(chameleon.x - worldOffset, groundY - 20, 30, 15);
        }

        // Аквариум
        ctx.fillStyle = '#add8e6';
        ctx.fillRect(500 - worldOffset, groundY - 50, 60, 40);
        ctx.fillStyle = 'orange'; ctx.fillRect(510-worldOffset, groundY-40, 10, 5);

        // Свеча в финале
        if (gameState === 'final') {
            ctx.fillStyle = 'yellow';
            ctx.beginPath(); ctx.arc(800 - worldOffset, groundY - 40, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.beginPath(); ctx.arc(800 - worldOffset, groundY - 40, 50, 0, Math.PI*2); ctx.fill();
        }

        drawHuman(polina.x - worldOffset, groundY - 80, polina.color, moveDir !== 0);
        if (gameState === 'final') {
            drawHuman(850 - worldOffset, groundY - 80, kristina.color, false, false);
        }
    }

    requestAnimationFrame(render);
}

// Управление
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnAction = document.getElementById('btn-action');

btnLeft.ontouchstart = () => moveDir = -1;
btnRight.ontouchstart = () => moveDir = 1;
btnLeft.ontouchend = btnRight.ontouchend = () => moveDir = 0;

btnAction.onclick = () => {
    const distToK = Math.abs(polina.x - kristina.x);

    if (gameState === 'forest' && distToK < 100) {
        showDialogue([
            { n: "Кристина", t: "Полина! Я так скучала!" },
            { n: "Полина", t: "Я тоже" },
            { n: "Кристина", t: "Что за хрень?! (пала клетка)" },
            { n: "Полина", t: "Я найду ключ!" }
        ], () => {
            kristina.isCaged = true;
            gameState = 'findKey';
            document.getElementById('objective-text').innerText = "Найти ключ";
        });
    }

    if (gameState === 'night' && Math.abs(polina.x - 650) < 100) {
        showDialogue([{ n: "Полина", t: "Что это? Какая-то яма..." }], () => {
            document.getElementById('confirm-modal').classList.remove('hidden');
        });
    }

    if (gameState === 'holeInside') {
        if (Math.abs(polina.x - chameleon.x) < 100 && chameleon.active) {
            showDialogue([{ n: "Хамелеон", t: "Ква." }], () => { chameleon.active = false; });
        }
        if (polina.x > 1000) {
            gameState = 'final';
            polina.x = 100;
                        document.getElementById('objective-tag').classList.add('hidden');
        }
    }

    if (gameState === 'final' && Math.abs(polina.x - 800) < 150) {
        showDialogue([
            { n: "Кристина", t: "С годовщиной, Любимая, сюрприз!" },
            { n: "Система", t: "*Поцелуй*" }
        ], () => {
            kristina.red = true;
            setTimeout(() => {
                document.getElementById('gameCanvas').classList.add('blur-screen');
                document.getElementById('final-credits').classList.remove('hidden');
            }, 2000);
        });
    }
};

function showDialogue(lines, callback) {
    const cloud = document.getElementById('dialogue-cloud');
    const name = document.getElementById('speaker-name');
    const text = document.getElementById('speech-text');
    cloud.classList.remove('hidden');
    
    let currentLine = 0;
    const updateLine = () => {
        name.innerText = lines[currentLine].n;
        text.innerText = lines[currentLine].t;
    };
    
    updateLine();
    document.getElementById('next-btn').onclick = () => {
        currentLine++;
        if (currentLine < lines.length) updateLine();
        else {
            cloud.classList.add('hidden');
            callback();
        }
    };
}

document.getElementById('confirm-yes').onclick = () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    gameState = 'holeInside';
    polina.x = 50;
    document.getElementById('objective-text').innerText = "Идти в дверь в конце коридора";
};

document.getElementById('confirm-no').onclick = () => {
    document.getElementById('confirm-modal').classList.add('hidden');
};

// Старт
render();
setInterval(update, 1000/60);