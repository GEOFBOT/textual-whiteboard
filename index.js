/*
Copyright 2020 William Hoza

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

let lines = [];
let activeLine = null;

function save() {
    console.log('save');
    let contents = [];
    for (const line of lines) {
        contents.push(line.val);
    }
    document.querySelector("#name").value = document.querySelector("#name").value.trim();
    let name = document.querySelector("#name").value;
    if (name==='') return;
    del();
    window.localStorage.setItem('saved_'+name, JSON.stringify(contents));
    updateSaved();
}

function del() {
    console.log('del');
    let name = document.querySelector("#name").value;
    window.localStorage.removeItem('saved_'+name);
    updateSaved();
}


function load() {
    console.log('load');
    let name = document.querySelector("#name").value;
    let contents = JSON.parse(window.localStorage.getItem('saved_'+name));
    let i = 0;
    for (const line of contents) {
        if (lines.length < i+1) {
            newLine();
        }
        lines[i].textBox.value = line;
        lines[i].activateDisplay();
        i++;
    }
}

function updateName() {
    document.querySelector("#name").value = document.querySelector("#saved").value;
}

function updateSaved() {
    let saved = document.querySelector("#saved");
    while (saved.lastElementChild) {
        saved.removeChild(saved.lastElementChild);
    }

    for (var i = 0; i < window.localStorage.length; i++){
        var value = window.localStorage.key(i);
        if (value.startsWith('saved_')) {
            var opt = document.createElement('option');
            opt.value = value.slice(6);
            opt.innerHTML = value.slice(6);
            saved.appendChild(opt);
        }
    }
}

function init() {
  let macros = localStorage.getItem("macros");
  if (macros != null) {
    document.querySelector("#macros").value = macros;
    updateMacros();
  }

    updateSaved();

  newLine();
}

function considerNewLine() {
  if (lines[lines.length - 1].textBox.value != "") {
    newLine();
  }
}

function newLine() {
  lines.push(new Line(lines.length));
}

function Line(index) {
  this.textBox = document.createElement("input");
  this.textBox.type = "text";
  this.textBox.classList.add("edit");
  let parentLine = this;
  this.textBox.addEventListener("keydown", function(evt) {
    if (evt.keyCode == 13) { // ENTER
      if (parentLine.index < lines.length - 1) {
        lines[lines.length - 1].activateEdit();
      } else {
        considerNewLine();
      }
    } else if(evt.keyCode == 38) { // UP ARROW
      if (parentLine.index > 0) {
        lines[parentLine.index - 1].activateEdit();
      }
    } else if (evt.keyCode == 40) { // DOWN ARROW
      if (parentLine.index < lines.length - 1) {
        lines[parentLine.index + 1].activateEdit();
      } else if (parentLine.index == lines.length - 1) {
        considerNewLine();
      }
    }
  });
  this.displayBox = document.createElement("div");
  this.displayBox.classList.add("display");
  this.displayBox.addEventListener("click", function() {
    parentLine.activateEdit();
  });
  document.querySelector("#container").appendChild(this.textBox);
  document.querySelector("#container").appendChild(this.displayBox);

  this.val = "";
  this.index = index;
  this.activateEdit();
}
Line.prototype.activateDisplay = function() {
  this.textBox.style.display = "none";
  this.displayBox.style.display = "";
  if (this.textBox.value != this.val) {
    this.val = this.textBox.value;
    MathJax.typesetClear([this.displayBox]);
    this.displayBox.innerHTML = this.val;
    MathJax.typeset();
  }

  activeLine = null;
}
Line.prototype.activateEdit = function() {
  if (activeLine != null) activeLine.activateDisplay();
  this.displayBox.style.display = "none";
  this.textBox.style.display = "";
  this.textBox.focus();
  activeLine = this;
}

function updateMacros() {
  let macros = document.querySelector("#macros").value;
  if (MathJax.typesetClear) MathJax.typesetClear();
  document.querySelector("#macrosDisplay").innerHTML = "$" + macros + "$";
  for (let i = 0; i < lines.length; i++) {
    lines[i].displayBox.innerHTML = lines[i].val;
  }
  if (MathJax.typeset) MathJax.typeset();
  localStorage.setItem("macros", macros);
}

init();
