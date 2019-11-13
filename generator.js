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
 */
function computeUTF8(hexCode) {
    console.log("computing %s to utf8", hexCode)
    if ((hexCode.length % 2) == 1) {
        console.log("hexCode size should be even", hexCode)
        hexCode = "0" + hexCode
    }

    let expectedNoOfBytes = 1
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
    expectedNoOfBytes = computedRange[2]

    let result = ""
    let bit8FromDecimal = []
    let computedBytes = new Array(8).fill(0) // Should be [0, 1, 1, 0, 1]

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
        computedBytes = new Array(8).fill(0) // Required number of bits
        computedBytes[0] = 0
        
        let startIndexDest = 7
        let startIndexSource = 7
        const lastIndexDest = 0

        while (startIndexSource > lastIndexDest) {
            computedBytes[startIndexDest] = bit8FromDecimal[startIndexSource]
            startIndexDest--
            startIndexSource--
        }
    } else if (expectedNoOfBytes === 2) {
        computedBytes = new Array(16).fill(0) // Required number of bits
        // Assign constant bits to indices
        computedBytes[0] = 1
        computedBytes[1] = 1
        computedBytes[2] = 0
        computedBytes[8] = 1
        computedBytes[9] = 0

        const startIndexOf2ndByte = 8
        const lastIndexDest = 2
        let startIndexDest = 15
        let startIndexSource = 7

        while (startIndexSource > lastIndexDest) {
            computedBytes[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexDest: %s, startIndexSource: %s", startIndexDest, startIndexSource)

            if (startIndexDest == startIndexOf2ndByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }
            startIndexSource--
        }
        console.log("computedBytes: %o", computedBytes)
    } else if (expectedNoOfBytes === 3) {
        computedBytes = new Array(24).fill(0) // Required number of bits
        // Assign constant bits to indices
        computedBytes[0] = 1
        computedBytes[1] = 1
        computedBytes[2] = 1
        computedBytes[3] = 0
        computedBytes[8] = 1
        computedBytes[9] = 0
        computedBytes[16] = 1
        computedBytes[17] = 0

        const startIndexOf2ndByte = 8
        const startIndexOf3rdByte = 16
        const lastIndexDest = 3
        let startIndexDest = 23
        let startIndexSource = 15

        while (startIndexSource > lastIndexDest) {
            computedBytes[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexDest: %s, startIndexSource: %s", startIndexDest, startIndexSource)

            if (startIndexDest == startIndexOf2ndByte + 2
                || startIndexDest == startIndexOf3rdByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }

            startIndexSource--
        }
    } else if (expectedNoOfBytes === 4) {
        computedBytes = new Array(32).fill(0) // Required number of bits
        // Assign constant bits to indices
        computedBytes[0] = 1
        computedBytes[1] = 1
        computedBytes[2] = 1
        computedBytes[3] = 1
        computedBytes[4] = 0
        computedBytes[8] = 1
        computedBytes[9] = 0
        computedBytes[16] = 1
        computedBytes[17] = 0
        computedBytes[24] = 1
        computedBytes[25] = 0

        const startIndexOf2ndByte = 8
        const startIndexOf3rdByte = 16
        const startIndexOf4thByte = 24
        const lastIndexDest = 4
        let startIndexDest = 31
        let startIndexSource = 23

        while (startIndexSource > lastIndexDest) {
            computedBytes[startIndexDest] = bit8FromDecimal[startIndexSource]
            console.log("startIndexDest: %s, startIndexSource: %s", startIndexDest, startIndexSource)

            if (startIndexDest == startIndexOf2ndByte + 2
                || startIndexDest == startIndexOf3rdByte + 2
                ||  startIndexDest == startIndexOf4thByte + 2) {
                startIndexDest -= 3
            } else {
                startIndexDest--
            }

            startIndexSource--
        }
    }

    // Get the equivalent hex letter.
    // Compute every 4 bits
    let bits = Object.assign([], computedBytes)
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