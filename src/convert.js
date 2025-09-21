const HEX_NOPAD = new Array(256);
const HEX_PAD = new Array(256);

for (let i = 0; i < 256; i++) {
    const h = i.toString(16);
    HEX_NOPAD[i] = h;
    HEX_PAD[i] = h.length === 1 ? "0" + h : h;
}

function convertIP(buffer) {
    const buf = Buffer.from(buffer);
    if (buf.length === 4) {
        return `${buf[0]}.${buf[1]}.${buf[2]}.${buf[3]}`;
    }
    if (buf.length !== 16) {
        return null;
    }
    if (buf[0] === 0 && buf[1] === 0 && buf[2] === 0 && buf[3] === 0 && buf[4] === 0 && buf[5] === 0 && buf[6] === 0 && buf[7] === 0 && buf[8] === 0 && buf[9] === 0 && buf[10] === 0xff && buf[11] === 0xff) {
        return `${buf[12]}.${buf[13]}.${buf[14]}.${buf[15]}`;
    }
    const p0 = (buf[0] << 8) | buf[1];
    const p1 = (buf[2] << 8) | buf[3];
    const p2 = (buf[4] << 8) | buf[5];
    const p3 = (buf[6] << 8) | buf[7];
    const p4 = (buf[8] << 8) | buf[9];
    const p5 = (buf[10] << 8) | buf[11];
    const p6 = (buf[12] << 8) | buf[13];
    const p7 = (buf[14] << 8) | buf[15];
    let bestStart = -1,
        bestLen = 0;
    let curStart = -1,
        curLen = 0;
    if (p0 === 0) {
        if (curStart === -1) curStart = 0;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p1 === 0) {
        if (curStart === -1) curStart = 1;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p2 === 0) {
        if (curStart === -1) curStart = 2;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p3 === 0) {
        if (curStart === -1) curStart = 3;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p4 === 0) {
        if (curStart === -1) curStart = 4;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p5 === 0) {
        if (curStart === -1) curStart = 5;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p6 === 0) {
        if (curStart === -1) curStart = 6;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (p7 === 0) {
        if (curStart === -1) curStart = 7;
        curLen++;
    } else {
        if (curLen > bestLen) {
            bestStart = curStart;
            bestLen = curLen;
        }
        curStart = -1;
        curLen = 0;
    }
    if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
    }
    if (bestLen === 8) return "::";
    if (bestLen < 2) bestStart = -1;
    const out = new Array(9);
    let oi = 0;
    let skipped = false;
    const cs = bestStart,
        ce = bestStart + bestLen;
    if (!(bestStart !== -1 && 0 >= cs && 0 < ce)) {
        const hi = p0 >>> 8,
            lo = p0 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 1 >= cs && 1 < ce)) {
        const hi = p1 >>> 8,
            lo = p1 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 2 >= cs && 2 < ce)) {
        const hi = p2 >>> 8,
            lo = p2 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 3 >= cs && 3 < ce)) {
        const hi = p3 >>> 8,
            lo = p3 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 4 >= cs && 4 < ce)) {
        const hi = p4 >>> 8,
            lo = p4 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 5 >= cs && 5 < ce)) {
        const hi = p5 >>> 8,
            lo = p5 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 6 >= cs && 6 < ce)) {
        const hi = p6 >>> 8,
            lo = p6 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    if (!(bestStart !== -1 && 7 >= cs && 7 < ce)) {
        const hi = p7 >>> 8,
            lo = p7 & 0xff;
        out[oi++] = hi === 0 ? HEX_NOPAD[lo] : HEX_NOPAD[hi] + HEX_PAD[lo];
    } else if (!skipped) {
        out[oi++] = "";
        skipped = true;
    }
    let result = out.slice(0, oi).join(":");
    if (bestStart === 0) result = ":" + result;
    else if (bestStart !== -1 && bestStart + bestLen === 8) result += ":";
    return result;
}

module.exports = { convertIP };