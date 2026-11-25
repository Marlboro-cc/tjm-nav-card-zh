"""Convert GNU Unifont 16.0.04 .hex.gz into fixed-width rows for road-font.js."""
import gzip
import sys
from pathlib import Path

ranges = [(0x3400, 0x9FFF), (0xF900, 0xFAFF), (0xFF01, 0xFF60)]
with gzip.open(sys.argv[1], 'rt', encoding='ascii') as source:
    glyphs = {int(code, 16): bytes.fromhex(bits) for code, bits in
              (line.strip().split(':') for line in source)}
rows = bytearray()
for first, last in ranges:
    for code in range(first, last + 1):
        data = glyphs[code]
        assert len(data) == 32, hex(code)
        rows.extend(data)
out = Path(__file__).resolve().parents[1] / 'kit/runtime/fonts/road-16.gz'
out.write_bytes(gzip.compress(bytes(rows), mtime=0))
