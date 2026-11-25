'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// A full-width, 16-by-16 bitmap. The ranges match tools/bake-road-font.py.
const ranges = [[0x3400, 0x9fff], [0xf900, 0xfaff], [0xff01, 0xff60]];
let rows;

function glyphIndex(code) {
    let base = 0;
    for (const [first, last] of ranges) {
        if (code < first) break;
        if (code <= last) return base + code - first;
        base += last - first + 1;
    }
    return -1;
}

// Use horizontal runs on both canvases. New road names do not allocate GPU textures.
function draw(cv, index, x, baseline, size, colour) {
    if (!rows) rows = zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fonts', 'road-16.gz')));
    const scale = size / 16, top = baseline - 14 * scale;
    for (let y = 0; y < 16; y++) {
        const bits = rows.readUInt16BE(index * 32 + y * 2);
        let start = -1;
        for (let column = 0; column <= 16; column++) {
            if (column < 16 && (bits & (0x8000 >>> column))) {
                if (start < 0) start = column;
            } else if (start >= 0) {
                cv.fillRect(x + start * scale, top + y * scale, (column - start) * scale, scale, colour);
                start = -1;
            }
        }
    }
}

module.exports = { glyphIndex, draw };
