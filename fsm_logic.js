// --- FSM Logic: fsm_logic.js ---

// Global status codes (diadaptasi dari 'status' global C++)
export const STATUS = {
    RECEIVE_INPUT: 0,
    MOVE_ACCEPTED: 1,
    INVALID_MOVE: -1,
};

// --- Moveset Interface (diganti dengan Class dasar) ---
class Moveset {
    constructor(sequence, name) {
        this.seq = sequence;
        this.moveName = name;
    }

    sequence() {
        return this.seq;
    }

    name() {
        return this.moveName;
    }

    /**
     * Mengecek apakah urutan input (buffer) cocok dengan moveset ini.
     * Logic ini identik dengan Moveset::match() di C++.
     * @param {string[]} buffer - Riwayat input saat ini.
     * @returns {boolean}
     */
    match(buffer) {
        const seq = this.sequence();
        
        if (buffer.length < seq.length) return false;
        
        const start = buffer.length - seq.length;
        for (let i = 0; i < seq.length; i++) {
            if (buffer[start + i] !== seq[i]) return false;
        }
        
        return true;
    }
}

// --- Moveset Definitions (Diadaptasi dari C++) ---
// Catatan: Sequencing disamakan persis dengan kode C++
const MOVESETS = [
    // Ultimate moves (Input ultimate moves first to prevent misdetection)
    new Moveset(["RIGHT", "RIGHT", "UP", "DOWN", "RIGHT", "UP", "RIGHT", "RIGHT", "SPACE"], "Ultimate Hurricane Kick"),
    new Moveset(["LEFT", "UP", "RIGHT", "RIGHT", "DOWN", "UP", "RIGHT", "SPACE"], "Final Dragon Punch"),
    new Moveset(["UP", "UP", "DOWN", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "SPACE"], "Mega Tatsumaki"),
    new Moveset(["RIGHT", "RIGHT", "DOWN", "RIGHT", "UP", "DOWN", "RIGHT", "SPACE"], "Ultra Shoryuken"),
    new Moveset(["RIGHT", "RIGHT", "RIGHT", "DOWN", "UP", "RIGHT", "SPACE"], "Giga Hadoken"),
    
    // Super moves
    new Moveset(["RIGHT", "DOWN", "RIGHT", "RIGHT", "SPACE"], "Hurricane Kick"),
    new Moveset(["UP", "UP", "DOWN", "RIGHT", "SPACE"], "Dragon Punch"),
    new Moveset(["LEFT", "RIGHT", "LEFT", "RIGHT", "SPACE"], "Tatsumaki"),
    new Moveset(["UP", "DOWN", "UP", "RIGHT", "SPACE"], "Shoryuken"),
    new Moveset(["RIGHT", "RIGHT", "RIGHT", "SPACE"], "HADOKEN!"),
];


// --- Game Engine Class (FSM Controller) ---
export class GameFSM {
    constructor() {
        this.buffer = [];
        this.lastMove = "";
        this.currentStatus = STATUS.RECEIVE_INPUT;
        this.lastInputTime = Date.now(); // Menggunakan waktu JS dalam ms
        this.INPUT_TIMEOUT_MS = 1000; // 1 detik dari C++
    }

    /**
     * Menambahkan input baru dan mengecek reset time.
     * Logic inti Game::addInput()
     * @param {string} key - Input (misalnya "RIGHT", "SPACE")
     * @returns {{ status: number, lastMove: string }} - Status FSM setelah input
     */
    addInput(key) {
        const now = Date.now();

        // 1. Cek Timeout (Game::addInput())
        if (now - this.lastInputTime > this.INPUT_TIMEOUT_MS) {
            this.buffer.length = 0; // Bersihkan buffer
        }

        this.lastInputTime = now;
        this.buffer.push(key);
        
        // 2. Jika SPACE, cek combo
        if (key === "SPACE") {
            this.checkCombos();
        } else {
            // Status kembali ke menerima input setelah setiap input non-SPACE
            this.currentStatus = STATUS.RECEIVE_INPUT;
        }

        return {
            status: this.currentStatus,
            lastMove: this.lastMove
        };
    }

    /**
     * Mengecek semua Moveset
     * Logic inti Game::checkCombos()
     */
    checkCombos() {
        for (const combo of MOVESETS) {
            if (combo.match(this.buffer)) {
                this.lastMove = combo.name();
                this.currentStatus = STATUS.MOVE_ACCEPTED;
                this.buffer.length = 0; // Bersihkan buffer setelah combo berhasil
                return;
            }
        }
        // Jika loop selesai tanpa kecocokan
        this.currentStatus = STATUS.INVALID_MOVE;
        this.buffer.length = 0; // Bersihkan buffer setelah combo gagal
    }
    
    // Getter untuk status saat ini
    getStatus() {
        return this.currentStatus;
    }
    
    // Getter untuk buffer (untuk ditampilkan)
    getBuffer() {
        return this.buffer;
    }
}