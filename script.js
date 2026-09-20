'use strict';

const display = document.getElementById('display');
const exprEl  = document.getElementById('expr');

let current    = '';   // number being typed
let stored     = null; // previously stored operand
let pendingOp  = null; // +, −, ×, ÷
let justEvaled = false;

// ── Helpers ───────────────────────────────────────────────

function fmt(n) {
  // Trim floating-point noise but keep meaningful decimals
  const fixed = parseFloat(n.toPrecision(10));
  const str   = fixed.toString();
  // Truncate very long strings
  return str.length > 12 ? fixed.toExponential(4) : str;
}

function setDisplay(val) {
  display.textContent = val;
}

function setExpr(val) {
  exprEl.textContent = val;
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
  }
}

// ── Actions ───────────────────────────────────────────────

function inputDigit(d) {
  if (justEvaled) {
    // Start fresh after an evaluation
    current    = d;
    stored     = null;
    pendingOp  = null;
    justEvaled = false;
    setExpr('');
    setDisplay(current);
    return;
  }
  current = (current === '0' || current === '') ? d : current + d;
  setDisplay(current);
}

function inputDot() {
  if (justEvaled) {
    current    = '0.';
    justEvaled = false;
    setExpr('');
    setDisplay(current);
    return;
  }
  if (current.includes('.')) return;
  current = (current === '') ? '0.' : current + '.';
  setDisplay(current);
}

function inputOp(op) {
  const val = parseFloat(current || '0');

  if (stored !== null && pendingOp && !justEvaled) {
    // Chain: evaluate what we have then keep going
    const result = compute(stored, val, pendingOp);
    if (result === null) {
      setDisplay('Error');
      setExpr('');
      reset();
      return;
    }
    stored = result;
  } else {
    stored = val;
  }

  pendingOp  = op;
  current    = '';
  justEvaled = false;
  setExpr(fmt(stored) + ' ' + op);
  setDisplay(fmt(stored));
}

function evaluate() {
  if (stored === null || pendingOp === null) return;

  const val    = parseFloat(current || '0');
  const result = compute(stored, val, pendingOp);

  if (result === null) {
    setExpr(fmt(stored) + ' ' + pendingOp + ' ' + fmt(val) + ' =');
    setDisplay('Error');
    reset();
    return;
  }

  setExpr(fmt(stored) + ' ' + pendingOp + ' ' + fmt(val) + ' =');
  setDisplay(fmt(result));

  current    = fmt(result);
  stored     = null;
  pendingOp  = null;
  justEvaled = true;
}

function clearEntry() {
  // C: clear current input only
  current = '';
  setDisplay('0');
  if (justEvaled) { setExpr(''); justEvaled = false; }
}

function allClear() {
  reset();
  setDisplay('0');
  setExpr('');
}

function reset() {
  current    = '';
  stored     = null;
  pendingOp  = null;
  justEvaled = false;
}

// ── Event wiring ──────────────────────────────────────────

document.querySelectorAll('.btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const action = btn.dataset.action;

    switch (action) {
      case 'digit':  inputDigit(btn.dataset.val); break;
      case 'dot':    inputDot();                  break;
      case 'op':     inputOp(btn.dataset.op);     break;
      case 'equals': evaluate();                  break;
      case 'c':      clearEntry();                break;
      case 'ac':     allClear();                  break;
    }
  });

  // Visual press feedback
  btn.addEventListener('mousedown',  function() { btn.classList.add('pressed'); });
  btn.addEventListener('mouseleave', function() { btn.classList.remove('pressed'); });
  btn.addEventListener('mouseup',    function() { btn.classList.remove('pressed'); });
});

// ── Keyboard support ──────────────────────────────────────

document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9')  { inputDigit(e.key); return; }
  if (e.key === '.')                  { inputDot();         return; }
  if (e.key === '+')                  { inputOp('+');       return; }
  if (e.key === '-')                  { inputOp('−');       return; }
  if (e.key === '*')                  { inputOp('×');       return; }
  if (e.key === '/')                  { e.preventDefault(); inputOp('÷'); return; }
  if (e.key === 'Enter' || e.key === '=') { evaluate();    return; }
  if (e.key === 'Escape')             { allClear();         return; }
  if (e.key === 'Backspace')          { clearEntry();       return; }
});
