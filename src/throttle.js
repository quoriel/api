const { Logger } = require("@tryforge/forgescript");

const rateTracking = new Map();
const burstTracking = new Map();
const blockedIPs = new Map();

let rateWindowMs = 60000;
let rateMaxRequests = 60;
let burstWindowMs = 1000;
let burstMaxRequests = 3;
let blockDuration = 600000;
let cleanupIntervalMs = 180000;
let maxTrackedIPs = 1500;
let logBlocks = false;

function setupThrottle(options = {}) {
    if (options === true) options = {};
    if (options.logBlocks) logBlocks = true;
    rateWindowMs = +options.rateWindowMs || 60000;
    rateMaxRequests = +options.rateMaxRequests || 60;
    burstWindowMs = +options.burstWindowMs || 1000;
    burstMaxRequests = +options.burstMaxRequests || 3;
    blockDuration = +options.blockDuration || 600000;
    cleanupIntervalMs = +options.cleanupIntervalMs || 180000;
    maxTrackedIPs = +options.maxTrackedIPs || 1500;
    setInterval(() => {
        const now = Date.now();
        for (const entry of rateTracking.entries()) if (now > entry[1].time) rateTracking.delete(entry[0]);
        for (const entry of burstTracking.entries()) if (now > entry[1].time) burstTracking.delete(entry[0]);
        for (const entry of blockedIPs.entries()) if (now >= entry[1]) blockedIPs.delete(entry[0]);
    }, cleanupIntervalMs);
}

function checkThrottle(ip) {
    const now = Date.now();
    if (blockedIPs.has(ip)) {
        if (now < blockedIPs.get(ip)) return true;
        blockedIPs.delete(ip);
    }
    if (burstTracking.size >= maxTrackedIPs) burstTracking.delete(burstTracking.keys().next().value);
    if (!burstTracking.has(ip)) {
        burstTracking.set(ip, { count: 1, time: now + burstWindowMs });
    } else {
        const burstRecord = burstTracking.get(ip);
        if (now > burstRecord.time) {
            burstRecord.count = 1;
            burstRecord.time = now + burstWindowMs;
        } else {
            burstRecord.count++;
            if (burstRecord.count > burstMaxRequests) {
                if (logBlocks) Logger.warn(`IP ${ip} blocked due to burst limit!`);
                blockIP(ip, now, "burst");
                return true;
            }
        }
    }
    if (rateTracking.size >= maxTrackedIPs) rateTracking.delete(rateTracking.keys().next().value);
    if (!rateTracking.has(ip)) {
        rateTracking.set(ip, { count: 1, time: now + rateWindowMs });
        return false;
    }
    const record = rateTracking.get(ip);
    if (now > record.time) {
        record.count = 1;
        record.time = now + rateWindowMs;
        return false;
    }
    if (record.count >= rateMaxRequests) {
        if (logBlocks) Logger.warn(`IP ${ip} blocked due to rate limit!`);
        blockIP(ip, now, "throttle");
        return true;
    }
    record.count++;
    return false;
}

function blockIP(ip, now, reason) {
    let duration = blockDuration;
    if (reason === "burst") duration *= 2;
    if (blockedIPs.size >= maxTrackedIPs) blockedIPs.delete(blockedIPs.keys().next().value);
    blockedIPs.set(ip, now + duration);
}

function throttleStats() {
    return {
        rateTracking: rateTracking.size,
        burstTracking: burstTracking.size,
        blockedIPs: blockedIPs.size
    };
}

module.exports = { setupThrottle, checkThrottle, throttleStats };