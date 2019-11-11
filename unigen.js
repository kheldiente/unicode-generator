const modes = [
    "UTF-8", 
    "UTF-16", 
    "UTF-32"
]

const hexCodes = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["A", "B", "C"],
    ["D", "E", "F"]
]

const execBtns = [
    "Convert", "Delete", "Reset"
]

let selectedModePos = 0

function loadViews() {
    addModes()
    addButtons()
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
            td.appendChild(button)
            tr.appendChild(td)

            // Convert button
            if (i == 0 && j == hexCodeSet.length - 1) {
                const label = execBtns[0]
                const eTd = document.createElement("td")
                const eBtn = document.createElement("button")
                eBtn.className = "convert-btn"
                eBtn.innerHTML = label
                eTd.appendChild(eBtn)
                tr.appendChild(eTd)
            }

            // Delete button
            if (i == 3 && j == hexCodeSet.length - 1) {
                const label = execBtns[1]
                const eTd = document.createElement("td")
                const eBtn = document.createElement("button")
                eBtn.className = "delete-btn"
                eBtn.innerHTML = label
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
        button.addEventListener("click", onClickMode)
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

function onClickMode(ref) {
    const view = ref.target
    const inputHexCodeView = document.getElementById("input-hexcode")
    const position = view.value
    const inputHexCode = inputHexCodeView.innerHTML.replace("U+", "")

    selectedModePos = position

    let result = ""
    if (position == 0) {
        result = computeUTF8(inputHexCode)
    } else if (position == 1) {
        result = computeUTF16(inputHexCode)
    } else {
        result = computeUTF32(inputHexCode)
    }

    showResult("U+" + result)
    refreshModes()
}

function showResult(resultInString) {
    const output = document.getElementById("output-hexcode")
    output.innerHTML = resultInString
}