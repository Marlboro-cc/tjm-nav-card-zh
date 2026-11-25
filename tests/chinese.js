'use strict';

// Run on the staged files so that missing assets or an incorrect build language fail here.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const js = '../dist/cluster_nav_card/source/javascript';
const { Canvas } = require(js + '/kit/canvas');
const { Recorder, play } = require(js + '/kit/record');
const source = require(js + '/source');
const { headunit, GUIDANCE, describe } = require(js + '/headunit');
const { draw } = require(js + '/card');
const { drawLayer } = require(js + '/overlay');
const spec = require(js + '/kit/app-spec.json');

assert.strictEqual(require(js + '/kit/locale.json').language, 'zh-CN');
assert.strictEqual(spec.title, 'TJM 仪表盘导航卡片');
assert(spec.settings.every(setting => /[\u3400-\u9fff]/.test(setting.label)));
assert.strictEqual(spec.version, require('../apps/cluster_nav_card/app.json').version);
assert.strictEqual(source.parse({ maneuver: 'left', road: '福'.repeat(59) + '𠮷站' }).road, '福'.repeat(59) + '𠮷');

function pixels(str, gpu) {
    const raster = new Canvas(48, 40);
    const target = gpu ? new Recorder(48, 40) : raster;
    target.text(str, 2, 30, 24, '#ffffff', { font: 'bold', literal: true });
    if (gpu) play(target.words(), raster);
    assert(raster.d.some(byte => byte > 0), str);
    return Buffer.from(raster.d);
}

for (const gpu of [false, true]) {
    const seen = new Set([pixels('?', gpu).toString('base64')]);
    for (const ch of new Set('福州市五四路莘庄立交漕溪北路')) {
        const bmp = pixels(ch, gpu).toString('base64');
        assert(!seen.has(bmp), 'duplicate glyph: ' + ch);
        seen.add(bmp);
    }
}
const samples = ['福州市五四路', '莘庄立交', '漕溪北路', 'G60 沪昆高速（莘庄方向）'];
for (const road of samples) {
    const guidance = source.parse({ maneuver: 'left', distance_m: 450, road });
    const cv = new Canvas(480, 118);
    drawLayer(cv, guidance, 'metric', 'topCenter', 'generic', false);
    assert(cv.d.some(n => n > 0));
    assert.strictEqual(describe({ elements: [{ text: road }] }).road, road);
    if (process.argv[2] && road === '莘庄立交') {
        fs.writeFileSync(path.resolve(process.argv[2]), cv.png());
    }
}
for (const width of [190, 240, 480]) {
    const cv = new Canvas(width, 72);
    const text = cv.text.bind(cv);
    let captured = '';
    cv.text = (s, x, y, size, color, opts) => {
        if (opts && opts.literal) {
            captured = s;
            assert(x + cv.textWidth(s, size, opts) <= width);
            assert(!/[\ud800-\udbff](?![\udc00-\udfff])/.test(s));
        }
        return text(s, x, y, size, color, opts);
    };
    draw(cv, { maneuver: 'right', road: '莘庄立交𠮷野'.repeat(15) });
    assert(captured.endsWith('…'));
}
const handlers = {};
const signals = { watch(iface, instance, fns) {
    handlers[iface] = fns;
    return Promise.resolve({ shutdown() {} });
} };
const car = headunit({ settings: { get: () => 'off' }, log: { info() {}, warn() {} } },
    { signals, eventLog: {}, setInterval: () => 0, setTimeout: () => 0 });
try {
    handlers[GUIDANCE].nextIntersection({ road: '莘庄立交' });
    assert(car.diag().some(line => line.includes('莘庄立交')));
} finally { car.stop(); }
console.log('中文菜单、字体像素、导航输入、卡片截断和诊断页检查通过');
