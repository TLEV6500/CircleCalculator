// Object declarations and DOM retrieval
const formulaContainer = document.getElementById('formula_display');
const historyHTML = document.getElementById('history_body');
const themeBtn = document.getElementById('toggle_theme');
const resetBtn = document.getElementById('reset');
const calculator = document.getElementById('calculator_form');
const calcInputBounds = calculator.getElementsByClassName('calc-input');
const formulaResultsHTML = {
  'radius-area': document.getElementById('radius_by_area_formula').children[1],
  'radius-circumference': document.getElementById('radius_by_circumference_formula').children[1],
  area: document.getElementById('area_formula').children[1],
  circumference: document.getElementById('circumference_formula').children[1],
}
const radioBtns = {
  radius: document.getElementById('radius_solve'),
  area: document.getElementById('area_solve'),
  circumference: document.getElementById('circum_solve'),
}
const FIELDS = {
  radius: document.getElementById('radius_inpt'),
  area: document.getElementById('area_inpt'),
  circumference: document.getElementById('circum_inpt'),
}

const formulas = {
  'radius-area': '\\(r=\\pm\\sqrt{\\frac{!A!}{\\pi}}=!r!\\)',
  'radius-circumference': '\\(r=\\frac{!C!}{2\\pi}=!r!\\)',
  area: '\\(A=\\pi !r!^2=!A!\\)',
  circumference: '\\(C=2\\pi !r!=!C!\\)',
}
const formulaVariables = {
  radius: 'r',
  area: 'A',
  circumference: 'C',
}
const calculationHistory = [];


const CALC = {
  radius: ({ circumference, area } = {}) => {
    if (circumference != null) return circumference / (2 * Math.PI);
    else if (area != null) return Math.sqrt(area / Math.PI);
    return 0;
  },
  area: (radius) => Math.PI * Math.pow(radius, 2),
  circumference: (radius) => 2 * Math.PI * radius,
}


// Event Handlers and Related Operations

const renderMathEquation = (target, formula, variables) => {
  let newString = formula + '';
  console.log(newString);
  Object.values(formulaVariables).forEach((variable) => {
    console.log(newString, variable, variables[variable]);
    newString = newString.replace(new RegExp(`!${variable}!`, 'g'), `(${variables[variable] ?? variable})`);
  });
  target.innerText = newString;
  MathJax.typeset();
  return;
};

const renderMathEquations = (containers, variables) => {
  for (const element of containers) {
    const formula = element.children[0];
    const target = element.children[1];
    renderMathEquation(target, formula, variables);
  }
  return;
};

const removeChildren = (...elements) => {
  let removedNodes = [];
  for (const element of elements) {
    if (!element.firstChild) continue;
    removedNodes.push(element.removeChild(element.firstChild));
  }
  return removedNodes;
};

const copyChildren = (...elements) => {
  let copiedNodes = [];
  for (const element of elements) {
    if (!element.firstChild) continue;
    copiedNodes.push(element.firstChild);
  }
  return copiedNodes;
}

let calculationCount = 0;
const updateHistory = (calculation) => {
  calculationHistory.unshift(calculation);
  const calculationContainer = document.createElement('div');
  calculationContainer.id = `results_${calculationCount}`;
  ++calculationCount;
  const timestamp = document.createElement('p');
  const datetime = new Date();
  timestamp.innerText = `(${calculationCount}) ${datetime.getDate()}/${datetime.getMonth() + 1}; ${datetime.getHours()}:${datetime.getMinutes()}`;
  calculationContainer.appendChild(timestamp);
  let clone;
  for (const element of calculation) {
    clone = element.cloneNode(true);
    calculationContainer.appendChild(clone);
  }
  historyHTML.insertAdjacentElement('afterbegin', calculationContainer);
  return;
};

const saveToHistory = () => {
  const parents = Object.values(formulaResultsHTML);
  const recentCalculations = copyChildren(...parents);
  updateHistory(recentCalculations);
  return parents;
};

const clearValue = (element) => element.value = 0;

const handleSubmit = (e) => {
  e.preventDefault();
  const target = e.currentTarget;
  const data = new FormData(target);
  const input = data.get('input');
  const value = Number(data.get(input));
  let operation, formulaInput, variables, formulaIndex;
  removeChildren(...Object.values(formulaResultsHTML));
  for (const key in FIELDS) {
    if (key === input) continue;
    operation = CALC[key];
    result = operation(key === 'radius' ? { [input]: value } : FIELDS.radius.value);
    clearValue(FIELDS[key]);
    FIELDS[key].value = result.toFixed(4);

    formulaIndex = key !== 'radius' ? key : `${key}-${input}`;
    formulaInput = formulaResultsHTML[formulaIndex];
    variables = { [formulaVariables[key]]: result.toFixed(2), [formulaVariables[input]]: value.toFixed(2), ...variables };
    renderMathEquation(formulaInput, formulas[formulaIndex], variables);
  }
  saveToHistory();
  return;
};

const markFields = (input) => {
  let element;
  if (typeof (input) == 'string') element = FIELDS[input];
  else if (typeof (input) == 'object') element = input;
  else return;

  element.classList.add('focused-input');
  element.classList.remove('solve-for-this');
  element.required = true;
  element.select();
  for (const key in FIELDS) {
    if (key === element.name) continue;
    FIELDS[key].classList.add('solve-for-this');
    FIELDS[key].classList.remove('focused-input');
    FIELDS[key].required = false;
  }
  return;
}

const handleClick = (e) => {
  const target = e.currentTarget;
  const curInputs = target.getElementsByTagName('input');
  curInputs[0].checked = true;
  markFields(curInputs[1]);
  return;
};

const themes = ['light', 'dark'];
let curTheme = 0;
const toggleTheme = (e) => {
  e.currentTarget.innerText = themes[curTheme];
  curTheme = Number(!curTheme);
  document.documentElement.style.colorScheme = themes[curTheme];
  return;
};


// Add event listeners to relevant elements

calculator.addEventListener('submit', (e) => handleSubmit(e));
calculator.addEventListener('reset', () => {
  removeChildren(...Object.values(formulaResultsHTML));
});

for (const element of calcInputBounds) {
  element.addEventListener('click', (e) => handleClick(e));
}

themeBtn.addEventListener('click', (e) => toggleTheme(e));