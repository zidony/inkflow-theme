import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Minimal CRC32 Implementation ---
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
}

function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// --- Zero-Dependency ZIP Writer ---
class ZipWriter {
    constructor(outPath) {
        this.fd = fs.openSync(outPath, 'w');
        this.offset = 0;
        this.centralDirectories = [];
    }
    
    addFile(zipPath, fileBuffer) {
        // Ensure forward slashes for ZIP paths
        const name = zipPath.replace(/\\/g, '/');
        const nameBuf = Buffer.from(name, 'utf8');
        const compressed = zlib.deflateRawSync(fileBuffer);
        const crc = crc32(fileBuffer);
        const date = new Date();
        const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
        const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
        
        // 1. Local File Header
        const lfh = Buffer.alloc(30);
        lfh.writeUInt32LE(0x04034b50, 0); // signature
        lfh.writeUInt16LE(20, 4);         // version needed to extract
        lfh.writeUInt16LE(1 << 11, 6);    // general purpose bit flag (UTF-8)
        lfh.writeUInt16LE(8, 8);          // compression method (deflate)
        lfh.writeUInt16LE(dosTime, 10);   // mod time
        lfh.writeUInt16LE(dosDate, 12);   // mod date
        lfh.writeUInt32LE(crc, 14);       // crc32
        lfh.writeUInt32LE(compressed.length, 18); // compressed size
        lfh.writeUInt32LE(fileBuffer.length, 22); // uncompressed size
        lfh.writeUInt16LE(nameBuf.length, 26);    // name length
        lfh.writeUInt16LE(0, 28);                 // extra field length
        
        const localOffset = this.offset;
        
        fs.writeSync(this.fd, lfh);
        fs.writeSync(this.fd, nameBuf);
        fs.writeSync(this.fd, compressed);
        
        this.offset += lfh.length + nameBuf.length + compressed.length;
        
        // 2. Central Directory Header (Save for later)
        const cdfh = Buffer.alloc(46);
        cdfh.writeUInt32LE(0x02014b50, 0); // signature
        cdfh.writeUInt16LE((3 << 8) | 20, 4); // version made by (UNIX, 2.0)
        cdfh.writeUInt16LE(20, 6);         // version needed to extract
        cdfh.writeUInt16LE(1 << 11, 8);    // gp flag (UTF-8)
        cdfh.writeUInt16LE(8, 10);         // compression method
        cdfh.writeUInt16LE(dosTime, 12);   // mod time
        cdfh.writeUInt16LE(dosDate, 14);   // mod date
        cdfh.writeUInt32LE(crc, 16);       // crc32
        cdfh.writeUInt32LE(compressed.length, 20); // compressed size
        cdfh.writeUInt32LE(fileBuffer.length, 24); // uncompressed size
        cdfh.writeUInt16LE(nameBuf.length, 28);    // name length
        cdfh.writeUInt16LE(0, 30);                 // extra field length
        cdfh.writeUInt16LE(0, 32);                 // file comment length
        cdfh.writeUInt16LE(0, 34);                 // disk number start
        cdfh.writeUInt16LE(0, 36);                 // internal file attributes
        cdfh.writeUInt32LE(0x81a40000, 38);        // external file attributes (regular file)
        cdfh.writeUInt32LE(localOffset, 42);       // relative offset of local header
        
        this.centralDirectories.push(Buffer.concat([cdfh, nameBuf]));
    }
    
    finalize() {
        const cdOffset = this.offset;
        let cdSize = 0;
        
        // 3. Write all Central Directory Headers
        for (const cd of this.centralDirectories) {
            fs.writeSync(this.fd, cd);
            cdSize += cd.length;
        }
        
        // 4. End of Central Directory Record
        const eocd = Buffer.alloc(22);
        eocd.writeUInt32LE(0x06054b50, 0); // signature
        eocd.writeUInt16LE(0, 4);          // number of this disk
        eocd.writeUInt16LE(0, 6);          // disk where cd starts
        eocd.writeUInt16LE(this.centralDirectories.length, 8); // entries on disk
        eocd.writeUInt16LE(this.centralDirectories.length, 10); // total entries
        eocd.writeUInt32LE(cdSize, 12);    // size of central directory
        eocd.writeUInt32LE(cdOffset, 16);  // offset of central directory
        eocd.writeUInt16LE(0, 20);         // zip file comment length
        
        fs.writeSync(this.fd, eocd);
        fs.closeSync(this.fd);
    }
}

// --- Main Packaging Logic ---
console.log("=== Starting native Node.js zero-dependency release packaging ===");

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'releases');
const packageJsonPath = path.join(rootDir, 'package.json');

if (!fs.existsSync(distDir)) {
    console.error("Error: 'dist/' directory does not exist! Please run 'npm run build' first.");
    process.exit(1);
}

let version = '1.0.0';
let name = 'inkflow-theme';

if (fs.existsSync(packageJsonPath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.version) version = pkg.version;
        if (pkg.name) name = pkg.name;
    } catch (e) {
        console.warn(`Warning: could not read package.json: ${e.message}`);
    }
}

if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
}

const zipFilename = `${name}-v${version}.zip`;
const zipPath = path.join(releaseDir, zipFilename);

if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log(`Removed old package: ${zipFilename}`);
}

console.log(`Creating ZIP archive: releases/${zipFilename}...`);

const zipWriter = new ZipWriter(zipPath);
const topFolder = `${name}-v${version}`;

// Helper to recursively read directory
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

// Add dist files
walkDir(distDir, (filePath) => {
    const relPath = path.relative(distDir, filePath);
    const zipDest = path.posix.join(topFolder, relPath.replace(/\\/g, '/'));
    zipWriter.addFile(zipDest, fs.readFileSync(filePath));
});

// Add README files
fs.readdirSync(rootDir).forEach(f => {
    if (f.toLowerCase().startsWith('readme') && f.toLowerCase().endsWith('.md')) {
        const filePath = path.join(rootDir, f);
        const zipDest = path.posix.join(topFolder, f);
        zipWriter.addFile(zipDest, fs.readFileSync(filePath));
        console.log(`Added to ZIP: ${f}`);
    }
});

zipWriter.finalize();

const stats = fs.statSync(zipPath);
console.log(`=== Success! Package created: releases/${zipFilename} ===`);
console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
