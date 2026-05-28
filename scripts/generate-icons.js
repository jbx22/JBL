const fs = require("fs");
const path = require("path");

// Minimal PNG generator (no canvas dependency)
function createPNG(size) {
  // Create a simple 4-color PNG manually
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG signature
  const width = size;
  const height = size;

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT chunk - raw pixel data
  const rawData = [];
  const bgR = 0x1a, bgG = 0x1a, bgB = 0x2e; // #1a1a2e
  const goldR = 0xc9, goldG = 0xa8, goldB = 0x4c; // #c9a84c

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < width; x++) {
      // Draw "AGD" text-like shape as a simple gold rectangle in center
      const margin = Math.floor(size * 0.25);
      const innerW = width - 2 * margin;
      const innerH = height - 2 * margin;
      const isGold = x >= margin && x < margin + innerW && y >= margin && y < margin + innerH;

      // Create letter-like pattern
      const relX = x - margin;
      const relY = y - margin;
      const letterW = innerW / 3;
      const letterIdx = Math.floor(relX / letterW);
      const localX = relX % letterW;

      let pixel = false;
      if (letterIdx < 3 && relY >= 0 && relY < innerH && relX >= 0 && relX < innerW) {
        // Simple pixel-art letters A, G, D
        if (letterIdx === 0) {
          // A
          const midLocalX = Math.floor(letterW * 0.5);
          const midLocalXStart = midLocalX - Math.floor(letterW * 0.2);
          const midLocalXEnd = midLocalX + Math.floor(letterW * 0.2);
          // Left leg: left edge
          if (localX < Math.floor(letterW * 0.25) || localX >= Math.floor(letterW * 0.75)) {
            // Vertical bars
            if (relY > Math.floor(innerH * 0.2)) pixel = true;
          } else if (localX >= midLocalXStart && localX <= midLocalXEnd && relY > Math.floor(innerH * 0.55) && relY < Math.floor(innerH * 0.75)) {
            pixel = true; // crossbar
          } else if (relY < Math.floor(innerH * 0.2)) {
            pixel = true; // top
          }
        } else if (letterIdx === 1) {
          // G
          const halfW = Math.floor(letterW * 0.5);
          // Top bar, left bar, bottom bar, right notch
          if (relY < Math.floor(innerH * 0.25) || relY >= Math.floor(innerH * 0.75)) {
            if (localX < Math.floor(letterW * 0.85)) pixel = true; // top/bottom horizontal
          } else if (localX < Math.floor(letterW * 0.25)) {
            pixel = true; // left vertical
          } else if (relY > Math.floor(innerH * 0.45) && relY < Math.floor(innerH * 0.65) && localX >= Math.floor(letterW * 0.5) && localX < Math.floor(letterW * 0.9)) {
            pixel = true; // middle bar extending right
          } else if (relY > Math.floor(innerH * 0.45) && localX >= Math.floor(letterW * 0.85)) {
            pixel = true; // right bar bottom part
          }
        } else {
          // D
          const halfW = Math.floor(letterW * 0.5);
          if (localX < Math.floor(letterW * 0.3)) {
            pixel = true; // left vertical
          } else if (relY < Math.floor(innerH * 0.25) || relY >= Math.floor(innerH * 0.75)) {
            pixel = true; // top/bottom horizontal
          } else if (localX >= Math.floor(letterW * 0.7) && relY > Math.floor(innerH * 0.2) && relY < Math.floor(innerH * 0.8)) {
            pixel = true; // right bar
          }
        }
      }

      if (pixel) {
        rawData.push(goldR, goldG, goldB);
      } else {
        rawData.push(bgR, bgG, bgB);
      }
    }
  }

  const raw = Buffer.from(rawData);

  // Use zlib for compression
  const zlib = require("zlib");
  const compressed = zlib.deflateSync(raw);
  const idatChunk = createChunk("IDAT", compressed);

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const outDir = path.join(__dirname, "..", "public", "icons");
for (const size of [192, 512]) {
  const png = createPNG(size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath} (${png.length} bytes)`);
}
