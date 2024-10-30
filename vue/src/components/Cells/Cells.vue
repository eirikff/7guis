<script setup>
import { ref, nextTick } from 'vue';

const rowCount = 10;
const colCount = 4;
const cells = ref([]);
resetCells(cells.value, rowCount, colCount);


function resetCells(cells, rowCount, colCount) {
  for (let row = 0; row < rowCount; row++) {
    cells.push([]);
    for (let col = 0; col < colCount; col++) {
      cells[row].push({
        input: null, // raw input entered into the cell
        result: null, // result after processing the input, evaluating formulas, etc
        affects: [], // cells changes in this cell affects
      });
    }
  }
}

function gridToLinearIndex(r, c) {
  return r * colCount + c;
}

function linearToGridIndex(i) {
  const c = i % colCount;
  const r = Math.floor(i / colCount);
  return {
    row: r,
    col: c,
  };
}

function gridIndexToId(r, c) {
  return `cell-${gridToLinearIndex(r, c)}`;
}

function idToGridIndex(id) {
  const linearIndex = parseInt(id.split("-")[1]);
  return linearToGridIndex(linearIndex);
}

function generateColumnHeaders(colCount) {
  // Thanks, ChatGPT
  const generateHeader = (num) => {
    let header = '';
    while (num >= 0) {
      header = String.fromCharCode((num % 26) + 65) + header;
      num = Math.floor(num / 26) - 1;
    }
    return header;
  };

  const headers = [];
  for (let i = 0; i < colCount; i++) {
    headers.push(generateHeader(i));
  }

  return headers;
}

function handleCellKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur();
  }
  else if (event.key === "Tab") {
    event.preventDefault();
    event.target.focus();
  }
  else if (event.key === "Escape") {
    event.preventDefault();

    // reset cell content
    const { row, col } = idToGridIndex(event.target.id);
    event.target.innerHTML = cells.value[row][col].input;

    event.target.blur();
  }
}

function handleCellDoubleClick(event) {
  event.target.contentEditable = true;
  const { row, col } = idToGridIndex(event.target.id);
  event.target.innerHTML = cells.value[row][col].input;
  window.getSelection().selectAllChildren(event.target);
}

function handleCellFocus(event) {
  event.target.className = "in-focus";
}

function handleCellBlur(event) {
  if (event.target.contentEditable === "true") {
    const { row, col } = idToGridIndex(event.target.id);
    cells.value[row][col].input = event.target.innerHTML;

    process(row, col);
  }

  event.target.contentEditable = false;
  event.target.className = "";
}

async function process(row, col) {
  const cell = cells.value[row][col];
  cell.result = cell.input;

  // Hack to make vue's reactivity system see a change and then react to the new 
  // computation. This is essential to get the blur function to work correctly
  await nextTick();

  const input = cell.input;
  if (input.startsWith("=")) {
    const { result, error } = processEquation(input, row, col);
    if (!error) {
      cell.result = result;
    }
    else {
      cell.result = "!!ERROR!!";
    }
  }
  else if (/^[0-9]+$/.test(input)) {
    cell.result = parseInt(input);
  }
}

const ParseType = Object.freeze({
  OPERATOR: Symbol("op"),
  CELL: Symbol("cell"),
  NUMBER: Symbol("number"),
});

// Compute row and column indices from cell name. e.g. B3 -> row=2, col=1
function rowColFromCellName(cellName) {
  const cellPattern = /^([A-Z]+)([0-9]+)$/;

  const [ _, letter, number ] = cellPattern.exec(cellName);
  const row = parseInt(number) - 1;
  
  let col = 0;
  if (letter.length === 1) {
    col = cellName.charCodeAt(0) - "A".charCodeAt(0);
  }
  else {
    for (let j = 0; j < letter.length; j++) {
      col *= 26;
      col += cellName.charCodeAt(j) - "A".charCodeAt(0) + 1;
    }
    col -= 1;
  }

  return {
    row: row,
    col: col
  };
}

function processEquation(input, row, col) {
  const { elements, error: parseError } = parseEquation(input);
  let error = parseError;

  if (!error) {
    console.log("updating affects for", input);
    updateEquationAffects(elements, row, col);
  }

  for (let i = 0; i < elements.length && !error; i++) {
    const elem = elements[i];

    if (elem.type === ParseType.CELL) {
      const { row, col } = rowColFromCellName(elem.value);

      elements[i].value = cells.value[row][col].result;
    }
    else if (elem.type === ParseType.NUMBER) {
      elements[i].value = parseInt(elem.value);
    }
  }

  for (let i = 0; i < elements.length && !error; i++) {
    const elem = elements[i];
    if (elem.type === ParseType.OPERATOR) {
      const operand1 = elements[i-1].value;
      const operand2 = elements[i+1].value;
      let partial = 0;
      switch (elem.value) {
        case "+":
          partial = operand1 + operand2;
          break;
        case "-":
          partial = operand1 - operand2;
          break;
        case "*":
          partial = operand1 * operand2;
          break;
        case "/":
          partial = operand1 / operand2;
          break;
        default:
          error = true;
          break;
      }
      // need to set the second operand to the result so the next operator gets
      // the correct operands
      elements[i+1].value = partial;
    }
  }

  let result = null;
  if (!error) {
    result = elements[elements.length - 1].value;
  }

  return {
    result: result,
    error: error,
  };
}

function updateEquationAffects(elements, sourceRow, sourceCol) {
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];

    if (elem.type === ParseType.CELL) {
      const { row, col } = rowColFromCellName(elem.value);
      console.log(sourceRow, sourceCol, elem.value, row, col)
      cells.value[row][col].affects.push({ row: sourceRow, col: sourceCol });
    }
  }
  console.log(cells.value)
}

/* GRAMMAR
-- Variables --
Format: <letter(s)><number(s)>
Letter is A-indexed.
Number is 1-indexed.
Example: 
  A1 (first cell)
  B4
  AA3,
  B54,
  BA323

-- Operators --
Allowed operators:
  + (addition)
  - (subtraction)
  * (multiplication)
  / (division)

-- Literals --
Numbers can appear on their own as positive (no prefix) and negative (prefixed with "-") numbers.
Floating point numbers are NOT supported.

-- Errors --
A number can never precede a letter. 
The first character after "=" cannot be an operator.
The last character cannot be an operator or letter.
*/
function parseEquation(input) {
  const operators = /[\+\-\*\/]/;
  const uppercase = /[A-Z]/;
  const numbers = /[0-9]/;

  let partialCell = "";
  let partialNumber = "";
  let negative = false;
  let error = false;

  // if only "=" is entered, this is an error
  error ||= input.length === 1;

  let elements = [];
  for (let i = 0; i < input.length && !error; i++) {
    const char = input[i];
    const isFirstChar = i === 1;
    const isLastChar = i === input.length - 1;

    if (operators.test(char)) {
      // if the first character after "=" is an operator or the last character
      if (isFirstChar || isLastChar) {
        error = true;
      }

      if (input[i+1] === "-") {
        negative = true;
        i++;
      }

      // an operator will always follow a number
      if (partialNumber) {
        elements.push({
          value: partialNumber,
          type: ParseType.NUMBER,
        });
        partialNumber = "";
      }
      else if (partialCell) {
        elements.push({
          value: partialCell,
          type: ParseType.CELL,
        });
        partialCell = "";
      }

      elements.push({
        value: char,
        type: ParseType.OPERATOR,
      });

    }
    else if (uppercase.test(char)) {
      partialCell += char;

      if (partialNumber) {
        error = true;
      }
      if (isLastChar) {
        error = true;
      }
    }
    else if (numbers.test(char)) {
      if (partialCell) {
        partialCell += char;
      }
      else {
        if (negative) {
          partialNumber += "-";
          negative = false;
        }

        partialNumber += char;
      }
    }
  }
  
  if (partialNumber) {
    elements.push({
      value: partialNumber,
      type: ParseType.NUMBER,
    });
    partialNumber = "";
  }
  else if (partialCell) {
    elements.push({
      value: partialCell,
      type: ParseType.CELL,
    });
    partialCell = "";
  }

  return {
    elements: elements,
    error: error,
  };
}

cells.value[1][0].input = "n1";
cells.value[1][1].input = "1";
cells.value[2][0].input = "n2";
cells.value[2][1].input = "1";
cells.value[3][0].input = "sum";
cells.value[3][1].input = "=B2+B3";
cells.value[4][0].input = "add 1";
cells.value[4][1].input = "=B4+1";
process(1, 0);
process(1, 1);
process(2, 0);
process(2, 1);
process(3, 0);
process(3, 1);
process(4, 0);
process(4, 1);
</script>

<template>
  <h1>Cells</h1>

  <p>Change value of B2 or B3 to see the other values change</p>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th></th>
          <th v-for="c in generateColumnHeaders(colCount)">{{ c }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rowCount" :key="r">
          <th>{{ r }}</th>
          <td 
            v-for="c in colCount"
            :key="gridToLinearIndex(r - 1, c - 1)"
            :id="gridIndexToId(r - 1, c - 1)"
            tabIndex="0"
            contenteditable="false"
            class=""
            @keydown="handleCellKeydown"
            @dblclick="handleCellDoubleClick"
            @blur="handleCellBlur"
          >
            {{ cells[r - 1][c - 1].result }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div>
    <h2>How to use</h2>
    <p>Single-clicking a cell focuses on that cell. Double-click to edit the content. If you press Escape while editing, the changes are discarded.</p>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  height: 60vh;
  overflow: auto;
  border: 1px dashed purple;
}

table {
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid black;
}

thead th {
  width: 5rem;
}

thead th:nth-child(1) {
  width: 2rem;
}

td, 
th {
  border: 1px solid black;
  background: white;
  padding: 0.2rem;
}

td:focus {
  background: #e0e0e0;
}

td[contenteditable="true"] {
  border: 4px solid rgb(98, 157, 251);
}
</style>
