// Format: 
// - start code point in decimal
// - last code point in decimal
// - number of bytes
const utf8Ranges = [
    [0, 127, 1], // 0000 - 007F, 0xxxxxxx
    [128, 2047, 2], // 0080 - 07FF, 110xxxxx 10xxxxxx
    [2048, 65535, 3], // 0800 - FFFF, 1110xxxx 10xxxxxx 10xxxxxx
    [65536, 2097151, 4] // 10000 - 1FFFFF, 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
]

/**
 * Procedures:
 * 1. Get what range the hex code falls into
 * 2. 
 */
function computeUTF8(hexCode) {
    console.log("computing %s to utf8", hexCode)
    if ((hexCode.length % 2) == 1) {
        console.log("hexCode size should be even", hexCode)
        return false
    }

    let expectedNoOfBytes = 1
    let computedRange = []
    let computedBytes = [] // Should be [0, 1, 1, 0, 1]
    const computedDecimal = hexToDecimal(hexCode)
    console.log("computedDecimal: %o", computedDecimal)

    // Get what range the hex code falls into
    for (let i = 0;i < utf8Ranges.length;i++) {
        const range = utf8Ranges[i]
        const startDecimal = range[0]
        const endDecimal = range[1]
        if (computedDecimal >= startDecimal && computedDecimal <= endDecimal) {
            computedRange = range
            break
        }
    }
    console.log("computedRange: %o", computedRange)
    expectedNoOfBytes = computedRange[2]

    let result = ""
    let bit8FromDecimal = []

    for (let j = 0;j < hexCode.length;j+=2) {
        let hex2Vals = hexCode.substring(j, j + 2)

        if (hex2Vals === "00") {
            continue
        }

        for (let k = 0;k < 2;k++) {
            let hex2Decimal = hexToDecimal(hex2Vals[k])
            let bit4FromDecimal = decimalTo4bit(hex2Decimal)
            bit8FromDecimal = bit8FromDecimal.concat(bit4FromDecimal)
        }
    }
    console.log("bit8FromDecimal: %o", bit8FromDecimal)

    // Map 8 bits from decimal
    if (expectedNoOfBytes === 1) {
        computedBytes.push(0)
        
        // Create 1 byte
        let startIndex = 8 - (8 - computedBytes.length)
        while (computedBytes.length < 8) {
            computedBytes.push(bit8FromDecimal[startIndex])
            startIndex++
        }
        
        // Get the equivalent hex letter.
        // Compute every 4 bits
        let startComputedByteIndex = 4
        while (startComputedByteIndex > -1) {
            let bits = Object.assign([], computedBytes)
            bits.splice(startComputedByteIndex, 4)

            const hexLetter = bit4ToDecimal(bits)
            result = result.concat(hexLetter)

            startComputedByteIndex -= 4
        }
    } else if (expectedNoOfBytes === 2) {
        computedBytes.push(1)
        computedBytes.push(0)
    }
    console.log("result: %s", result)
    return result
}

function computeUTF16(hexCode) {
    console.log("computing %s to utf16", hexCode)
    return "20AC"
}

function computeUTF32(hexCode) {
    console.log("computing %s to utf32", hexCode)
    return "000020AC"
}

function hexToDecimal(hexCode) {
    let decimal = 0
    let startExp = hexCode.length - 1
    for (let i = 0;i < hexCode.length;i++) {
        const singleHex = hexCode[i]
        let decimalEquivalent = 0

        if (isValidHexNumber(singleHex)) {
            decimalEquivalent = parseInt(singleHex)
        } else if (isValidHexLetter(singleHex)) {
            decimalEquivalent = hexLetterToDecimal(singleHex)
        }

        const multiplier = Math.pow(16, startExp)
        const product = decimalEquivalent * multiplier
        startExp = startExp - 1
        decimal += product
    }
    return decimal
}

/**
 * 
 * @param {number} decimal - 0 - 15
 */
function decimalTo4bit(decimal) {
    if (decimal > 15 || decimal < 0) {
        return false
    }

    const expectedSize = 4
    let quotient = decimal
    let computedBits = [] 

    while (quotient > 0) {
        let remainder = parseInt(quotient % 2)
        quotient =  parseInt(quotient / 2)
        if (remainder != 0) {
            remainder = 1
        }
        computedBits.push(remainder)
    }
    if (computedBits.length < expectedSize) {
        const diff = expectedSize - computedBits.length
        let incompleteBits = computedBits
        incompleteBits.reverse()
        for (let i = 0;i < diff;i++) {
            incompleteBits.splice(0, 0, 0)
        }
        computedBits = incompleteBits.reverse()
    }
    return computedBits.reverse()
}

/**
 * 
 * @param {array} bits - E.g [1, 0, 0, 1]
 */
function bit4ToDecimal(bits) {
    if (bits.length > 4 || bits.length < 4) {
        return false
    }
    let startExp = bits.length - 1
    let sum = 0
    for (let i = 0;i < bits.length;i++) {
        let multiplier = Math.pow(2, startExp)
        let product = bits[i] * multiplier
        startExp = startExp - 1
        sum += product
    }
    return decimalToHexLetter(sum)
}

/**
 * 
 * @param {array} bits - if array sum is not 0. E.g [0, 0, 0] and sum is 0, return false
 */
function isValid8Bit(bits) {
    return bits.reduce((a, b) => a + b, 0) > 0
}

function hexLetterToDecimal(letter) {
    let decimal = 0
    if (letter === "A") {
        decimal = 10
    } else if (letter === "B") {
        decimal = 11
    } else if (letter === "C") {
        decimal = 12
    } else if (letter === "D") {
        decimal = 13
    } else if (letter === "E") {
        decimal = 14
    } else if (letter === "F") {
        decimal = 15
    }
    return decimal
}

function decimalToHexLetter(decimal) {
    if (decimal == 10) {
        return "A"
    } else if (decimal == 11) {
        return "B"
    } else if (decimal == 12) {
        return "C"
    } else if (decimal == 13) {
        return "D"
    } else if (decimal == 14) {
        return "E"
    } else if (decimal == 15) {
        return "F"
    } else {
        return decimal
    }
}

function isValidHexNumber(number) {
    return !isNaN(number)
}

function isValidHexLetter(character) {
    return character === "A"
        || character === "B"
        || character === "C"
        || character === "D"
        || character === "E"
        || character === "F"
}