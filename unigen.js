const modes = [
    "UTF-8", 
    "UTF-16", 
    "UTF-32"
]

const hexCodes = [
    ["1", "2", "3", "4"],
    ["5", "6", "7", "8"],
    ["8", "9", "0"],
    ["A", "B", "C"],
    ["D", "E", "F"]
]

const execBtns = [
    "Convert", "Delete", "Reset"
]

let selectedModePos = 0

function loadViews() {
    init()
    addModes()
    addButtons()
}

function init() {
    const inputHexCodeView = document.getElementById("input-hexcode")
    const outputHexCodeView = document.getElementById("output-hexcode")
    inputHexCodeView.value = ""
    outputHexCodeView.value = ""
    inputHexCodeView.innerHTML = "U+"
    outputHexCodeView.innerHTML = "<h2>" + "U+" + "</h2>"
}

function addButtons() {
    const container = document.getElementById("hexbutton-view")
    const table = document.createElement("table")
    const tbody = document.createElement("tbody")
    table.style.width = "100%"

    for (let i = 0;i < hexCodes.length;i++) {
        const hexCodeSet = hexCodes[i]
        const tr = document.createElement("tr")

        for (let j = 0;j < hexCodeSet.length;j++) {
            const hexCode = hexCodes[i][j]
            const td = document.createElement("td")
            const button = document.createElement("button")
            button.innerHTML = hexCode
            button.className = "hex-code-btn"
            button.value = hexCode
            button.addEventListener("click", addHexToInput)
            td.appendChild(button)
            tr.appendChild(td)

            // // Convert button
            // if (i == 2 && j == hexCodeSet.length - 1) {
            //     const label = execBtns[0]
            //     const eTd = document.createElement("td")
            //     const eBtn = document.createElement("button")
            //     eBtn.className = "convert-btn"
            //     eBtn.innerHTML = label
            //     eTd.appendChild(eBtn)
            //     tr.appendChild(eTd)
            // }

            // Delete button
            if (i == 3 && j == hexCodeSet.length - 1) {
                const label = execBtns[1]
                const eTd = document.createElement("td")
                const eBtn = document.createElement("button")
                eBtn.className = "delete-btn"
                eBtn.innerHTML = label
                eBtn.addEventListener("click", onDelete)
                eTd.appendChild(eBtn)
                tr.appendChild(eTd)
            }

            // Reset button
            if (i == 4 && j == hexCodeSet.length - 1) {
                const label = execBtns[2]
                const eTd = document.createElement("td")
                const eBtn = document.createElement("button")
                eBtn.className = "reset-btn"
                eBtn.innerHTML = label
                eBtn.addEventListener("click", onReset)
                eTd.appendChild(eBtn)
                tr.appendChild(eTd)
            }
        }
        tbody.appendChild(tr)
    }
    table.appendChild(tbody)
    container.appendChild(table)
}

function addModes() {
    const container = document.getElementById("mode-view")
    const table = document.createElement("table")
    const tbody = document.createElement("tbody")
    const tr = document.createElement("tr")
    table.style.width = "100%"
    tr.align = "center"

    for (let i = 0;i < modes.length;i++) {
        const mode = modes[i]
        const td = document.createElement("td")
        const button = document.createElement("button")

        button.id = "modeBtn" + i
        button.value = i
        button.innerHTML = mode
        button.addEventListener("click", onSelectMode)
        button.style.width = "75px"
        button.style.display = "inline-block"

        if (i == selectedModePos) {
            button.className = "mode-selected-btn"
        } else {
            button.className = "mode-unselected-btn"
        }

        td.appendChild(button)
        tr.appendChild(td)
        tbody.appendChild(tr)
    }
    table.appendChild(tbody)
    container.appendChild(table)
}

function refreshModes() {
    for (let i = 0;i < modes.length;i++) {
        const button = document.getElementById("modeBtn" + i)
        if (i == selectedModePos) {
            button.className = "mode-selected-btn"
        } else {
            button.className = "mode-unselected-btn"
        }
    }
}

function onSelectMode(ref) {
    const inputHexCodeView = document.getElementById("input-hexcode")
    const position = ref.target.value
    const inputHexCode = inputHexCodeView.innerHTML.replace("U+", "")

    selectedModePos = position
    updateResult(position, inputHexCode)
    refreshModes()
}

function onReset() {
    const inputHexCodeView = document.getElementById("input-hexcode")
    inputHexCodeView.value = ""
    inputHexCodeView.innerHTML = "U+"

    updateResult(selectedModePos, "")
}

function onDelete() {
    const inputHexCodeView = document.getElementById("input-hexcode")
    const hexCode = inputHexCodeView.value
    if (hexCode.length == 0) {
        return
    }

    const newHexCode = hexCode.substring(0, hexCode.length - 1)
    inputHexCodeView.value = newHexCode
    inputHexCodeView.innerHTML = "U+" + newHexCode

    updateResult(selectedModePos, newHexCode)
}

function updateResult(position, hexCode) {
    let result = ""
    if (position == 0) {
        result = computeUTF8(hexCode)
    } else if (position == 1) {
        result = computeUTF16(hexCode)
    } else {
        result = computeUTF32(hexCode)
    }

    if (result === "-1") {
        showResult("Out of range")
    } else {
        showResult("U+" + result)
    }
}

function addHexToInput(ref) {
    const value = ref.target.value
    const inputHexCodeView = document.getElementById("input-hexcode")
    const hexCode = inputHexCodeView.value
    if (hexCode.length == 6) {
        return
    }

    const newHexCode = hexCode + value
    console.log("addHexToInput: %s", newHexCode)
    inputHexCodeView.value = newHexCode
    inputHexCodeView.innerHTML = "U+" + newHexCode
    
    updateResult(selectedModePos, newHexCode)
}

function showResult(resultInString) {
    const output = document.getElementById("output-hexcode")
    output.value = resultInString
    output.innerHTML = "<h2>" + resultInString + "</h2>"
}