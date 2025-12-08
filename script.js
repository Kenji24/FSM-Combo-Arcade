// --- Integrasi FSM Logic: script.js ---
import { GameFSM, STATUS } from './fsm_logic.js'; 

// --- Konfigurasi FSM & Animasi ---
const ANIMATION_CONFIG = {
    "HADOKEN!": { 
        RATE_MS: 80,
        MOVEMENT: {
            // Jarak yang digeser per langkah (per frame)
            SPEED_X: 20, 
            // Waktu pergerakan (sama dengan RATE_MS animasi)
            RATE_MS: 80,
            // Posisi X awal dalam pixel (di sebelah karakter)
            START_X: 10,
            OFFSET_Y: -50
        },
        LAYERS: {
            character: { 
                FOLDER: 'sprite/hadoken/', START: 554, END: 567, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            projectile: { // Layer Projectile
                FOLDER: 'sprite/projectile_1/', START: 0, END: 13, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'projectile-layer'
            }
        }
    },
    "Shoryuken": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/shoryuken/', START: 525, END: 538, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            }
        }
    },
    "Tatsumaki": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/tatsumaki/', START: 536, END: 561, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            }
        }
    },
    "Dragon Punch": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/dragon_punch/', START: 475, END: 483, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            }
        }
    },
    "Hurricane Kick": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/tatsumaki/', START: 536, END: 561, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            smoke: {
                FOLDER: 'sprite/smoke/', 
                START: 100, END: 127, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'effect-layer'
            }
        }
    },
    "Giga Hadoken": { 
        RATE_MS: 80,
        MOVEMENT: {
            SPEED_X: 20, 
            RATE_MS: 80,
            START_X: 10,
            OFFSET_Y: -50
        },
        LAYERS: {
            character: { 
                FOLDER: 'sprite/hadoken/', START: 554, END: 567, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            projectile: { 
                FOLDER: 'sprite/projectile_1/', START: 0, END: 13, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'projectile-layer'
            }
        }
    },
    "Ultra Shoryuken": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/shoryuken/', START: 525, END: 538, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            smoke: {
                FOLDER: 'sprite/smoke/', 
                START: 100, END: 123, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'effect-layer'
            }
        }
    },
    "Mega Tatsumaki": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/tatsumaki/', START: 536, END: 561, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            smoke: {
                FOLDER: 'sprite/smoke/', 
                START: 100, END: 127, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'effect-layer'
            }
        }
    },
    "Final Dragon Punch": { 
        RATE_MS: 100,
        MOVEMENT: {
            SPEED_X: 20, 
            RATE_MS: 100,
            START_X: 10,
            OFFSET_Y: -50
        },
        LAYERS: {
            character: { 
                FOLDER: 'sprite/dragon_punch/', START: 475, END: 483, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            projectile: { 
                FOLDER: 'sprite/projectile_2/', START: 26, END: 35, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'projectile-layer'
            }
        }
    },
    "Ultimate Hurricane Kick": { 
        RATE_MS: 80,
        LAYERS: {
            character: { 
                FOLDER: 'sprite/tatsumaki/', START: 536, END: 561, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'character-layer'
            },
            smoke: {
                FOLDER: 'sprite/smoke/', 
                START: 100, END: 127, BASE_NAME: 'Ryu_', 
                ELEMENT_ID: 'effect-layer'
            }
        }
    }
};

let animationInterval = null;
let isAnimating = false;
let currentAnimations = {};
let movementInterval = null;
let currentProjectileX = 0;

// Inisialisasi Game FSM
const gameEngine = new GameFSM(); 

// --- DOM Elements ---
const display = document.getElementById('game-display');
const charLayer = document.getElementById('character-layer');
const effectLayer = document.getElementById('effect-layer');
const textOverlay = document.getElementById('text-overlay');
const projectileLayer = document.getElementById('projectile-layer');
const displayContainer = document.getElementById('game-display-container');

const visualInputs = {
    // Mapping Key Code ke ID Visual
    'ArrowUp': document.getElementById('visual-up'),
    'ArrowDown': document.getElementById('visual-down'),
    'ArrowLeft': document.getElementById('visual-left'),
    'ArrowRight': document.getElementById('visual-right'),
    'Space': document.getElementById('visual-space'), 
};

const KEY_MAP = {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'Space': 'SPACE'
};

const VALID_KEYS = Object.keys(KEY_MAP);


// --- Fungsi Tampilan & Animasi ---
function updateDisplay(message, type = 'normal', isMove = false) {
    if (isAnimating) return; 

    // Teks sekarang di #text-overlay
    textOverlay.textContent = message;
    
    // Reset background dan warna di container utama
    displayContainer.style.backgroundImage = 'none'; 
    displayContainer.style.backgroundColor = (type === 'success') ? '#00cc00' : 
                                             (type === 'failure') ? '#ff0000' : 
                                             '#0c0';
    textOverlay.style.color = isMove ? '#fff' : '#000';
    
    // Pastikan layer animasi kosong saat IDLE
    if (charLayer) charLayer.style.backgroundImage = 'none';
    if (effectLayer) effectLayer.style.backgroundImage = 'none';
}

const LAYER_ELEMENTS = {
    'character-layer': charLayer,
    'effect-layer': effectLayer,
    'projectile-layer': projectileLayer
};


function startAnimation(moveName) {
    if (isAnimating) return;
    
    const config = ANIMATION_CONFIG[moveName];
    if (!config) return;

    isAnimating = true;
    currentAnimations = {}; 
    
    // Tampilkan nama move di overlay dan ubah background container
    textOverlay.textContent = moveName;
    displayContainer.style.backgroundColor = '#000';

    // 1. Inisialisasi status frame untuk setiap layer
    for (const layerName in config.LAYERS) {
        const layerConfig = config.LAYERS[layerName];
        
        // **PERBAIKAN DI SINI:** Gunakan LAYER_ELEMENTS yang sudah didefinisikan
        const element = LAYER_ELEMENTS[layerConfig.ELEMENT_ID]; 
        
        if (!element) {
             console.error(`Elemen DOM tidak ditemukan untuk ID: ${layerConfig.ELEMENT_ID}`);
             continue;
        }

        currentAnimations[layerName] = { 
            frameNumber: layerConfig.START,
            element: element // Simpan referensi elemen DOM di sini
        };
        
        displayContainer.classList.add('animating-mode'); 
    }

    if (config.MOVEMENT) {
        currentProjectileX = config.MOVEMENT.START_X;
        const offsetY = config.MOVEMENT.OFFSET_Y || 0;
        
        // Tetapkan posisi awal layer Hadouken
        projectileLayer.style.transform = `translateX(${currentProjectileX}px) translateY(${offsetY}px)`;
        
        // Mulai interval pergerakan terpisah
        movementInterval = setInterval(() => {
            moveProjectile(config.MOVEMENT);
        }, config.MOVEMENT.RATE_MS);
    }
    
    // 2. Mulai loop animasi tunggal dengan kecepatan global move
    animationInterval = setInterval(() => nextFrame(config), config.RATE_MS);
}


function nextFrame(config) {
    let allLayersFinished = true;

    for (const layerName in config.LAYERS) {
        const layerConfig = config.LAYERS[layerName];
        const animationState = currentAnimations[layerName];
        
        // Cek apakah layer ini masih memiliki frame untuk dimainkan
        if (animationState.frameNumber <= layerConfig.END) {
            allLayersFinished = false; 

            // Bentuk path dan update background
            const imagePath = `${layerConfig.FOLDER}${layerConfig.BASE_NAME}${animationState.frameNumber}.png`;
            animationState.element.style.backgroundImage = `url('${imagePath}')`;

            // Naikkan nomor frame
            animationState.frameNumber++;
        }
    }

    // Jika semua layer sudah mencapai END frame mereka, hentikan animasi
    if (allLayersFinished) {
        stopAnimation();
    }
}

function moveProjectile(movementConfig) {
    const { SPEED_X, OFFSET_Y } = movementConfig;
    
    currentProjectileX -= SPEED_X;  
    
    // Terapkan translasi CSS
    projectileLayer.style.transform = `translateX(${currentProjectileX}px) translateY(${OFFSET_Y}px)`;
    
    // Batas Akhir: Jika projectile sudah keluar layar, hentikan pergerakan
    // Asumsi display width sekitar 500px, kita hentikan di 300px
    if (currentProjectileX > 300) {
        clearInterval(movementInterval);
        movementInterval = null;
    }
}

function stopAnimation() {
    clearInterval(animationInterval);

    if (movementInterval) {
        clearInterval(movementInterval);
        movementInterval = null;
    }

    isAnimating = false;
    currentAnimations = {};

    if (projectileLayer) {
        projectileLayer.style.transform = 'translateX(0px)';
        projectileLayer.style.backgroundImage = 'none';
    }
    
    // Hapus class CSS dari container
    displayContainer.classList.remove('animating-mode'); 
    
    // Reset background layer
    if (charLayer) charLayer.style.backgroundImage = 'none';
    if (effectLayer) effectLayer.style.backgroundImage = 'none';

    initialize(); 
}

function activateVisual(key) {
    const element = visualInputs[key];
    if (element) {
        element.classList.add('active');
    }
}

function deactivateVisual(key) {
    const element = visualInputs[key];
    if (element) {
        element.classList.remove('active');
    }
}

// --- Integrasi FSM ---

function handleInput(key) {
    // 1. Kirim input ke FSM (sama seperti sebelumnya)
    const command = KEY_MAP[key];
    const { status, lastMove } = gameEngine.addInput(command);
    
    // 2. Visualisasi Input
    activateVisual(key);

    // 3. Update Tampilan Input Buffer
    let bufferDisplay = gameEngine.getBuffer().map(k => `[${k}]`).join(' > ');
    updateDisplay(`Input Buffer: ${bufferDisplay}`, 'normal');

    // 4. Cek Hasil FSM (Hanya setelah SPACE)
    if (command === "SPACE") {
        if (status === STATUS.MOVE_ACCEPTED) {
            updateDisplay(`MOVE ACCEPTED: ${lastMove}`, 'success', true);
            
            // Panggil Animasi untuk Hadoken atau Shoryuken
            if (ANIMATION_CONFIG[lastMove]) {
                startAnimation(lastMove);
            } else {
                // Untuk move yang tidak ada animasinya
                setTimeout(initialize, 1500); 
            }
            
        } else if (status === STATUS.INVALID_MOVE) {
            updateDisplay("INVALID MOVE!", 'failure', true);
            setTimeout(initialize, 1500);
        }
    }
}

// --- Event Listeners Keyboard ---
document.addEventListener('keydown', (event) => {
    const key = event.code; 
    
    if (VALID_KEYS.includes(key) || (event.key === ' ' && key === 'Space')) {
        event.preventDefault(); 
        
        // Cek agar tidak memproses input berulang
        const visualKey = key === 'Space' ? 'Space' : key;
        if (!visualInputs[visualKey].classList.contains('active')) {
             handleInput(visualKey);
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.code;
    
    if (VALID_KEYS.includes(key)) {
        deactivateVisual(key);
    }
});


// --- Inisialisasi ---
function initialize() {
    gameEngine.currentStatus = STATUS.RECEIVE_INPUT;
    gameEngine.buffer.length = 0;
    
    updateDisplay("FSM Siap. Tekan tombol. Waktu input: 1 detik.", 'normal');
    
    if (displayContainer) {
        displayContainer.style.backgroundImage = 'none'; 
    }
}

// Panggil initialize saat start
initialize();