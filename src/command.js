import jsSHA from 'jssha';

function hmacFromAccessCode(message, accessCode) {
    var shaObj = new jsSHA("SHA-1", "HEX");
    shaObj.setHMACKey(accessCode, "HEX");
    shaObj.update(message);
    return shaObj.getHMAC("HEX");
}

function formatAsHexBytes(value, length) {
    let hexString = value;
    let array = [];
    let i = 0;

    while (i < hexString.length) {
        let len = 2;
        if (i === 0) {
            len = (hexString.length % 2 === 0) ? 2 : 1;
        }

        array.push(parseInt(hexString.substr(i, len), 16));
        i += len;
    }

    // Now we pad the array at the front to make it up to the given length (if not already)
    while (array.length < length) {
        array.unshift(0x00);
    }
    return array;
}
export function randomNumberCommand() {
    let cmd = new Uint8Array(20);
    cmd[0] = 0x40;
    return cmd.buffer;
}

export function signInCommand(userId, code, randomNumber) {
    let cmd = new Uint8Array(20);
    // Add the user ID as the first 4 bytes
    let userIDBytes = formatAsHexBytes(userId, 4);
    userIDBytes.forEach((byt, i) => {
        cmd[i] = byt;
    });

    // Add the access code as the remaining 16 bytes
    const doorAccessHash = hmacFromAccessCode(randomNumber, code);
    const doorAccessBytes = formatAsHexBytes(doorAccessHash, 16);
    const accessHashOffset = 4;

    for (let i = 0; i < 16; i++) {
        cmd[i + accessHashOffset] = doorAccessBytes[i];
    }
    return cmd.buffer;
}

export function unlockDoorCommand() {
    let cmd = new Uint8Array(20);
    cmd[0] = 0x4F;
    return cmd.buffer;
}
