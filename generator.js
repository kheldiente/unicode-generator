// Format: 
// - start code point in decimal
// - last code point in decimal
// - number of bytes
const utf8Ranges = [
    [0, 127, 1], // 0000 - 007F
    [128, 2047, 2], // 0080 - 07FF
    [2048, 65535, 3], // 0800 - FFFF
    [65536, 2097151, 4] // 10000 - 1FFFFF
]

// Format: 
// - start code point in decimal
// - last code point in decimal
// - 0 == return, 1 == compute
const utf16Ranges = [
    [0, 65535, 0], // 0000 - FFFF
    [65536, 1114111, 1] // 010000 - 10FFFF
]

/**
 * Procedures:
 * 1. Get what range the hex code falls into
 * 2. Convert hex to decimal then to bits
 * 3. Check the number of expected bytes using the range provided
 * 4. Map the bits from right to left. Beware of bit constants.
 *      If expected no of bytes === 1:
 *          - 0xxxxxxx
 *      Else if expected no of bytes === 2:
 *          - 110xxxxx 10xxxxxx
 *      Else if expected no of bytes === 3:
 *          - 1110xxxx 10xxxxxx 10xxxxxx
 *      Else if expected no of bytes === 4:
 *          - 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
 * 5. Convert every 4 bits to hex
 * 6. Result should not start from 0
 * @param {string} hexCode - E.g C2A2
 */
function computeUTF8(hexCode) {
    const hasOnlyZeros = /^0*$/.test(hexCode)
    if (hexCode.length == 0) {
        console.log("no value. returning empty result")
        return ""
    }
    if (hasOnlyZeros) {
        console.log("hexCode has only zeros. returning 0 as result")
        return "0"
    }
    // Normalize hex code. There should be no leading zeros before the actual hex code
    // E.g 0014 -> 14
    let isZeros = true
    let hexCharIndex = 0
    while (isZeros) {
        const hexChar = hexCode[hexCharIndex]
        if (hexChar === "0") {
            hexCharIndex++
        } else {
            isZeros = false
        }
    }
    hexCode = hexCode.substring(hexCharIndex, hexCode.length)
    if ((hexCode.length % 2) == 1) {
        hexCode = "0" + hexCode
    }

    console.log("computing %s to utf8", hexCode)

    let computedRange = []
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
    const expectedNoOfBytes = computedRange[2]
    let bit8FromDecimal = []
    for (let j = 0;j < hexCode.length;j+=2) {
        let hex2Vals = hexCode.substring(j, j + 2)
        for (let k = 0;k < 2;k++) {
            let hex2Decimal = hexToDecimal(hex2Vals[k])
            let bit4FromDecimal = decimalTo4bit(hex2Decimal)
            bit8FromDecimal = bit8FromDecimal.concat(bit4FromDecimal)
        }
    }
    console.log("bit8FromDecimal: %o", bit8FromDecimal)

    let result = ""
    let computedBits = [] // Should be [0, 1, 1, 0, 1] format
    // Map 8 bits from decimal
    if (expectedNoOfBytes === 1) {
        // Assign constant bits to indices
        computedBits = new Array(8).fill(0) 
        computedBits[0] = 0
        
        let startIndexDest = 7
        let startIndexSource = 7
        const lastIndexDest = 0

        while (startIndexSource >= 0 && startIndexDest > lastIndexDest) {
            computedBits[startIndexDest] = bit8FromDecimal[startIndexSource]
            startIndexDest--
            startIndexSource--
        }
    } else if (expectedNoOfBytes === 2) {
        // Assign constant bits to indices
        computedBits = new Array(16).fill(0) 
        computedBits[0] = 1
        computedBits[1] = 1
        computedBits[2] = 0
        computedBits[8] = 1
        computedBits[9] = 0

        const startIndexOf2ndByte = 8
        const lastIndexDest = 2
        let startIndexDest = 15
        let startIndexSource = 7

        while (startIndexSource >= 0 && startIndexDest > lastIndexDest) {
            computedBits[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexSource: %s, startIndexDest: %s", startIndexSource, startIndexDest)

            if (startIndexDest == startIndexOf2ndByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }
            startIndexSource--
        }
    } else if (expectedNoOfBytes === 3) {
        // Assign constant bits to indices
        computedBits = new Array(24).fill(0) 
        computedBits[0] = 1
        computedBits[1] = 1
        computedBits[2] = 1
        computedBits[3] = 0
        computedBits[8] = 1
        computedBits[9] = 0
        computedBits[16] = 1
        computedBits[17] = 0

        const startIndexOf2ndByte = 8
        const startIndexOf3rdByte = 16
        const lastIndexDest = 3
        let startIndexDest = 23
        let startIndexSource = 15

        while (startIndexSource >= 0 && startIndexDest > lastIndexDest) {
            computedBits[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexSource: %s, startIndexDest: %s", startIndexSource, startIndexDest)

            if (startIndexDest == startIndexOf2ndByte + 2
                || startIndexDest == startIndexOf3rdByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }

            startIndexSource--
        }
    } else if (expectedNoOfBytes === 4) {
        // Assign constant bits to indices
        computedBits = new Array(32).fill(0) 
        computedBits[0] = 1
        computedBits[1] = 1
        computedBits[2] = 1
        computedBits[3] = 1
        computedBits[4] = 0
        computedBits[8] = 1
        computedBits[9] = 0
        computedBits[16] = 1
        computedBits[17] = 0
        computedBits[24] = 1
        computedBits[25] = 0

        const startIndexOf2ndByte = 8
        const startIndexOf3rdByte = 16
        const startIndexOf4thByte = 24
        const lastIndexDest = 4
        let startIndexDest = 31
        let startIndexSource = 23

        while (startIndexSource >= 0 && startIndexDest > lastIndexDest) {
            computedBits[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexSource: %s, startIndexDest: %s", startIndexSource, startIndexDest)

            if (startIndexDest == startIndexOf2ndByte + 2
                || startIndexDest == startIndexOf3rdByte + 2
                ||  startIndexDest == startIndexOf4thByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }

            startIndexSource--
        }
    } else {
        return "-1"
    }
    console.log("computedBits: %o", computedBits)

    // Get the equivalent hex letter.
    // Compute every 4 bits
    let bits = Object.assign([], computedBits)
    let chunk = 4
    let bits4 = []
    let startIndex = 0
    while (startIndex < bits.length) {
        bits4 = bits.slice(startIndex, startIndex + chunk)
        console.log("bits4: %o", bits4)

        const hexLetter = bit4ToDecimal(bits4)
        result = result.concat(hexLetter)

        startIndex += 4
    }

    // Normalize hex code. There should be no leading zeros before the actual hex code
    // E.g 0014 -> 14
    let isResultZeros = true
    let resultCharIndex = 0
    while (isResultZeros) {
        const hexChar = result[resultCharIndex]
        if (hexChar === "0") {
            resultCharIndex++
        } else {
            isResultZeros = false
        }
    }
    result = result.substring(resultCharIndex, result.length)
    return result
}

/**
 * Procedures:
 * 1. If hex code is in equal or in between 0000 - FFFF then return as it is
 *    Else if hex code is equal or in between 010000 - 10FFFF:
 *      - Get decimal values of 010000 and the input
 *      - Subtract the decimal value of 010000 to the decimal value of the input
 *      - Convert the decimal difference to bits. Result should have size of 20
 *      - Get the top and low ten bits from the bits of the difference
 *      - Get the decimal value of top ten bits, low ten bits.
 *      - Get the decimal value of D800 and DC00
 *      - Add the decimal values of top ten bits and D800
 *      - Add the decimal values of low ten bits and DC00
 *      - Convert the sum of top ten bits and D800 to binary
 *      - Convert the sum of low ten bits and DC00 to binary
 *      - Convert the binary of the sum of top ten bits and D800 to hex characters
 *      - Convert the binary of the sum of low ten bits and DC00 to hex characters
 *    Else hex code is out of range
 * 2. Result should have a length of 4 hex characters.
 * @param {*} hexCode 
 */
function computeUTF16(hexCode) {
    const hasOnlyZeros = /^0*$/.test(hexCode)
    if (hexCode.length == 0) {
        console.log("no value. returning empty result")
        return ""
    }
    if (hasOnlyZeros) {
        console.log("hexCode has only zeros. returning input as result")
        return hexCode
    }
    // Normalize hex code. There should be no leading zeros before the actual hex code
    // E.g 0014 -> 14
    let isZeros = true
    let hexCharIndex = 0
    while (isZeros) {
        const hexChar = hexCode[hexCharIndex]
        if (hexChar === "0") {
            hexCharIndex++
        } else {
            isZeros = false
        }
    }
    hexCode = hexCode.substring(hexCharIndex, hexCode.length)
    if ((hexCode.length % 2) == 1) {
        hexCode = "0" + hexCode
    }

    console.log("computing %s to utf16", hexCode)

    let computedRange = []
    const computedDecimal = hexToDecimal(hexCode)
    console.log("computedDecimal: %o", computedDecimal)

    // Get what range the hex code falls into
    for (let i = 0;i < utf16Ranges.length;i++) {
        const range = utf16Ranges[i]
        const startDecimal = range[0]
        const endDecimal = range[1]
        if (computedDecimal >= startDecimal && computedDecimal <= endDecimal) {
            computedRange = range
            break
        }
    }

    console.log("computedRange: %o", computedRange)
    const rangeResult = computedRange[2]
    let bit8FromDecimal = []
    for (let j = 0;j < hexCode.length;j+=2) {
        let hex2Vals = hexCode.substring(j, j + 2)
        for (let k = 0;k < 2;k++) {
            let hex2Decimal = hexToDecimal(hex2Vals[k])
            let bit4FromDecimal = decimalTo4bit(hex2Decimal)
            bit8FromDecimal = bit8FromDecimal.concat(bit4FromDecimal)
        }
    }
    console.log("bit8FromDecimal: %o", bit8FromDecimal)

    let result = ""
    let computedBits = []
    if (rangeResult === 0) {
        computedBits = bit8FromDecimal
    } else if (rangeResult === 1) {
        let minuend = hexToDecimal(hexCode)
        let subtrahend = hexToDecimal("010000")
        let difference = minuend - subtrahend
        let diffToBits = decimalToBits(difference)
        const expectedSize = 20
        const bitDiff = expectedSize - diffToBits.length
        for (let p = 0;p < bitDiff;p++) {
            diffToBits.splice(0, 0, 0)
        }
        const topTenBits = diffToBits.slice(0, 10)
        const lowTenBits = diffToBits.slice(10, diffToBits.length)
        const topTenDecimal = bitsToDecimal(topTenBits)
        const lowTenDecimal = bitsToDecimal(lowTenBits)
        const d800Decimal = hexToDecimal("D800")
        const dc00Decimal = hexToDecimal("DC00")
        const sumTopTenD800 = d800Decimal + topTenDecimal
        const sumLowTenDc00 = dc00Decimal + lowTenDecimal
        const bitsSum1 = decimalToBits(sumTopTenD800)
        const bitsSum2 = decimalToBits(sumLowTenDc00)
        computedBits.push(...bitsSum1)
        computedBits.push(...bitsSum2)
        console.log("bitsSum1: %o, bitsSum2: %o", bitsSum1, bitsSum2)
    } else {
        return "-1"
    }

    console.log("computedBits: %o", computedBits)

    // Get the equivalent hex letter.
    // Compute every 4 bits
    let bits = Object.assign([], computedBits)
    let chunk = 4
    let bits4 = []
    let startIndex = 0
    while (startIndex < bits.length) {
        bits4 = bits.slice(startIndex, startIndex + chunk)
        console.log("bits4: %o", bits4)

        const hexLetter = bit4ToDecimal(bits4)
        result = result.concat(hexLetter)

        startIndex += 4
    }

    // Format result. Length should be 4
    const length = result.length
    const expectedLength = 4
    if (length < expectedLength) {
        const diff = Math.abs(expectedLength - length)
        let count = diff
        while (count > 0) {
            result = "0" + result
            count--
        }
    }
    return result
}

/** 
 * Procedure:
 * 1. Copy the hex code
 * 2. Result should return 8 hex charcters
 * 
 * @param {string} hexCode - E.g 20AC
 */
function computeUTF32(hexCode) {
    const length = hexCode.length
    if (length === 0) {
        console.log("no value. returning empty result")
        return ""
    }
    
    console.log("computing %s to utf32", hexCode)

    // Format result. Length should be 8
    const expectedLength = 8
    const diff = Math.abs(expectedLength - length)
    let count = diff
    while (count > 0) {
        hexCode = "0" + hexCode
        count--
    }
    return hexCode
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

function decimalToBits(decimal) {
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
    return computedBits.reverse()
}

/**
 * 
 * @param {array} bits - E.g [1, 0, 1, 0]
 */
function bitsToDecimal(bits) {
    let decimal = 0
    let startExp = bits.length - 1
    for (let i = 0;i < bits.length;i++) {
        const singleHex = bits[i]
        let decimalEquivalent = 0

        if (isValidHexNumber(singleHex)) {
            decimalEquivalent = parseInt(singleHex)
        } else if (isValidHexLetter(singleHex)) {
            decimalEquivalent = hexLetterToDecimal(singleHex)
        }

        const multiplier = Math.pow(2, startExp)
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