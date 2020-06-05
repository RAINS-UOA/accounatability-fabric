/*
class manageFabric {
    
 executeInsertQuery (payload, graph) {
  let query= `SELECT DISTINCT ?g ?s
WHERE {
  GRAPH ?g { ?s ?p ?o }
}`
fetch('http://localhost:7200/repositories/AccountabilityFabric?query='+encodeURI(query))
  .then(response => response.text())
  .then(text => {
    console.log(text);
   
let parsed =  this.csvToMatrix(text,',');
     console.log(this.matrixToJSON(parsed,1));
  });
    
}

 addNewSystemToFabric () {
    let newSystemURI =  document.getElementById('newSystemURI').value;
    console.log(newSystemURI);
    this.executeInsertQuery();
    
}

//from https://gist.github.com/Jonarod/b971b2df24ba46c33c37afb2a1dcb974
 csvToMatrix(csv,delimiter){
  let matrix = [];
  csv.split('\n').map( l => { l.trim() == "" ? 0 : matrix.push(l.trim().split(delimiter).map(v=>v.trim())) })
  return matrix
}
//from https://gist.github.com/Jonarod/b971b2df24ba46c33c37afb2a1dcb974
 matrixToJSON(matrix,from,to){
  let jsonResult = []; from = from||0;  
  matrix.map((a,i) => {
    let obj = Object.assign({}, ...matrix[0].map((h, index) => ({[h]: matrix[i][index]})))
    jsonResult.push(obj)
  })
  return to ? jsonResult.splice(from,to) : jsonResult.splice(from)
}
}

*/

var stepRowCounter = 0; 
var selectedStep;
// convenience reference to plan, steps, constraints, and variables as we will
// be referring to them fairly often
var plan ={};
plan ['@type'] = [];

var stepsArray =[];
var variablesArray =[];
var constraintsArray =[];


var graph ={};
var dataPrefix;
// var fabricManager = new manageFabric();




var inspectorTemplate =`
<div class="container-fluid">
  <div class="form-group">
    <label for="StepID">ID</label>
    <p class="greyBackground" id="StepID" > </p>
  </div>
    <div class="form-group">
    <label for="StepLabel">Step Label</label>
    <p  class="greyBackground" id="StepLabel" > </p>
  </div>
    <div class="row">
    <label for="StepTypes">Types</label>
    <div id="StepTypes" > </div>
   </div>
     <hr>
  <div class="row">
    <label for="StepDescription">Description</label>
     <br>
    <textarea id="StepDescription" > </textarea>
  </div>
 <hr>
  <div class="form-group">
    <label for="StepInputs">Inputs</label>
     <a href="#" class="btn btn-info btn-sm">
          <span class="glyphicon glyphicon-plus"></span>  
        </a>
     <br>
    <div id="StepInputs" > </div>
  </div>
  <hr>
 <div class="form-group">
    <label for="StepOutputs">Outputs</label>
     <a href="#" class="btn btn-info btn-sm">
          <span class="glyphicon glyphicon-plus"></span>  
        </a>
     <br>
    <div id="StepOutputs" > </div>
  </div>
   <hr>
  <div class="form-group">
    <label for="StepConstraints">Constraints</label>
     <a href="#" class="btn btn-info btn-sm">
          <span class="glyphicon glyphicon-plus"></span>  
        </a>
     <br>
    <div id="StepConstraints" > </div>
  </div>
  <hr>
 <div class="form-group">
    <label for="StepRationale">Rationale</label>
     <a href="#" class="btn btn-info btn-sm" data-toggle="modal" data-target="#rationaleModal">
          <span class="glyphicon glyphicon-plus"></span>  
        </a>
     <br>
    <div id="StepRationale" > </div>
  </div>
 <br>
  <hr>
  <button type="submit" class="btn btn-primary">Apply Changes</button>

</div>`; 

function resetInspector () {
   let target = document.getElementById ("inspectPane");
    target.innerHTML=""; 
   console.log("here");
}

function populateInspectPane (element ) {
// make it also available to other functions
selectedStep = element;

let target = document.getElementById ("inspectPane");
target.innerHTML=inspectorTemplate;

let id = document.getElementById ("StepID");
id.innerHTML =  ":"+element['@id'];

let stepLabel = document.getElementById ("StepLabel");
stepLabel.innerHTML =  element['label'];

let stepTypes = document.getElementById ("StepTypes");
stepTypes.innerHTML =  "";

for (let i=0;i<element['@type'].length;i++) {
stepTypes.appendChild (createStepTypeWidget ( element['@type'][i] , false));
}
    
stepTypes.appendChild(document.createElement('hr'));

let stepRationale = document.getElementById ("StepRationale");
stepRationale.innerHTML =  "";
for (let i=0;i<element['hasRationale'].length;i++) {
stepRationale.appendChild (createStepRationaleWidget ( element['hasRationale'][i] , true));
}

console.log(element['@type']);

}

function saveStepRationale () {
// let modal = document.getElementById ('rationaleModal');
let link =  document.getElementById ('rationaleLink').value;
document.getElementById ('rationaleLink').value="";
console.log(link);
selectedStep['hasRationale'].push (link);
populateInspectPane (selectedStep );
$('#rationaleModal').modal('toggle')
}

function createStepRationaleWidget ( rationale , canDelete) {
let widget = document.createElement('div');
widget.className = 'rationaleWidget';
widget.innerHTML = rationale;

return widget;
}


function createStepTypeWidget ( type , canDelete) {

let widget = document.createElement('div');
widget.className = 'typeWidget';
widget.innerHTML = type;

return widget;

}

function editStepNameStart(event) {
 console.log(event)
 console.log(event.srcElement['@id']);
      let area = document.createElement('textarea');
      area.className = 'edit';
      area.value = event.srcElement.innerHTML;

      area.onkeydown = function(event) {
        if (event.key == 'Enter') {
          this.blur();
        }
      };

      area.onblur = function() {
        editStepNameEnd(event.srcElement, area);
      };

      event.srcElement.innerHTML = "";
      
      event.srcElement.appendChild (area);
      console.log(event.srcElement['@id']);
      area.focus();
    }

    function editStepNameEnd(view, area) {
      view.innerHTML = area.value;
      view['label'] = area.value;
      area.remove();
      console.log(view.stepDOMid);
      //there will always only be one result so we can use pop() 
      let step =  stepsArray.filter(obj => {return obj['@id'] === view.stepDOMid}).pop();
      console.log(step);
      step['label'] = area.value;
      populateInspectPane (step );
    }

$.fn.extend({
    treed: function (o) {
      
      var openedClass = 'glyphicon-minus-sign';
      var closedClass = 'glyphicon-plus-sign';
      
      if (typeof o != 'undefined'){
        if (typeof o.openedClass != 'undefined'){
        openedClass = o.openedClass;
        }
        if (typeof o.closedClass != 'undefined'){
        closedClass = o.closedClass;
        }
      };
      
        // initialize each of the top levels
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this); // li with children ul
            branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
            branch.addClass('branch');
            branch.on('click', function (e) {
                if (this == e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            })
            branch.children().children().toggle();
        });
        // fire event from the dynamically added icon
      tree.find('.branch .indicator').each(function(){
        $(this).on('click', function () {
            $(this).closest('li').click();
        });
      });
        // fire event to open branch if the li contains an anchor instead of
		// text
        tree.find('.branch>a').each(function () {
            $(this).on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
        // fire event to open branch if the li contains a button instead of text
        tree.find('.branch>button').each(function () {
            $(this).on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
    }
});

// Initialization of treeviews

$('#tree1').treed();

// drag and drop
function allowDrop(ev) {
  ev.preventDefault();
  
  // display placeholder here TO DO
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

  function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // ev.target.appendChild(document.getElementById(data));
  createNewStep (ev.target, data);
}

 
/**
 * from stack overflow https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
 * @returns unique uuid
 */
  function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }



function createNewStep (target, data) {

let step = document.createElement("div") ;
// need to add prefix here as well
step ['@id'] = dataPrefix+ uuidv4();
step ['@type'] = [];
step ['@type'].push (context.Step);
step ['@type'].push ("https://rains.org#"+data);
step ['label'] = "untitled"; 
//step.types = ["ep-plan:Step", "rains:"+data]; 
step['hasRationale'] = [];  

//push to steps array
stepsArray.push(step);
console.log ("steps array" );
console.log (stepsArray );

let more = document.createElement("button");

more.className= "more close";
more.innerHTML = '<span aria-hidden="true">&times;</span>';
// let more_text = document.createTextNode("X");


more.addEventListener("click", function(event) {
event.stopPropagation();

console.log ("steps array" );
console.log (stepsArray );
step.remove();

stepsArray = stepsArray.filter(function(el) { return el['@id'] != step ['@id']; });

console.log ("steps array after removal" );
console.log (stepsArray );


resetInspector ();
// $('#stepModal').modal('toggle');
});

step.addEventListener("click", function(event) {
populateInspectPane (step);
});



// more.appendChild(more_text);
step.appendChild(more);
             // Create a <h1> element
// let t = document.createTextNode(":"+step.stepID);
let label =   document.createElement("div");
label.innerHTML=step.stepLabel; 
label.stepDOMid= step['@id'];
label.addEventListener("click", function(event) {
 editStepNameStart(event);
});



let strong = document.createElement("strong"); 
let t2 = document.createTextNode(data);
// step.appendChild(t);
step.appendChild(label); 
step.appendChild(strong); 
strong.appendChild(t2); 
step.className= "step";
target.appendChild (step);
console.log(target);
console.log(data);
}

/**
 * Author: Milan Markovic 
 * 
 * Creates the rows in the middle part of the workflow builder and adds listeners for drop events
 */

function createStepRow (element, counter) {

	let r = document.createElement("div");
	r.className= "row";
	let h = document.createElement("div");
	let text = document.createTextNode("drop here to create new step for this line");
	h.appendChild (text);
	h.className= "steps dz-message d-flex flex-column dropzone";
	h.addEventListener("dragover", function(event) {
										event.preventDefault();
									});

	h.addEventListener("drop", function(event) {
	event.preventDefault();
  
	let data = event.dataTransfer.getData("text");
	// ev.target.appendChild(document.getElementById(data));
	createNewStep (r, data);
	});


	if (counter % 2 === 0) {
		r.style.backgroundColor = "#bbbbbb";
	}
	else {
		r.style.backgroundColor = "#f5f5f5";
	}

	r.appendChild (h);
	stepRowCounter++;
	element.appendChild (r);
}


/**
 * Author: Milan Markovic 
 * 
 * Initialises teh layout of teh workflow builder
 */
function initLayout () {	
dataPrefix =  "https://to_do_load_dynamically.org/";
for (let i=0; i<15;i++) {
createStepRow(document.getElementById('workflowStepsPane'), stepRowCounter);
} 
}

/**
 * Author: Milan Markovic 
 * 
 * Initialises new plan object. This method should be
 * called if new workflow plan is created 
 * from scratch
 * 
 * @returns IRI of the new plan object
 */
function initNewPlan () {
	let IRI = dataPrefix + uuidv4(); 
	// save into global variable
	plan ['@id'] = IRI;
	plan ['@type'].push(context.Plan);
	
	//TO DO handle switch between different modes - design/implementation/deployment/operation
	plan ['@type'].push(context.DesignStageTemplate);
	
	
	document.getElementById ('planIRI').innerHTML=IRI;
	return IRI
}


function loadExistingPlan () {
	
}


function prepareGraph () {
	let graph = stepsArray.concat(variablesArray).concat(constraintsArray);
	graph.push(plan);
	return graph;
}


/**
 * Author: Milan Markovic 
 * 
 * This function returns JSON-LD representation of the
 * workflow plan created by the tool
 * 
 * @param context -
 *            this is expected to be object with the vocabulary terms see
 *            JSON-LD_context.js
 * @param graph -
 *            this is an object containing all the elements of the plan
 *            description using the context vocabulary
 * @returns JSON-LD String
 */
function generateJsonLDpayload (context, graph) {
	
	let jsonld = {};
	jsonld ['@context'] = context;
	jsonld ['@graph'] = graph;
	
	return JSON.stringify(jsonld); 
}


function saveTemplate () {
	
	//console.log(generateJsonLDpayload (context,prepareGraph()));
	let xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	console.log("saved");
	    }
	  };
	  xhttp.open("POST", "/saveTemplatePlan" , true);
	  xhttp.setRequestHeader("Content-type", "application/ld+json");
	 let payload = generateJsonLDpayload (context,prepareGraph());
	  console.log(payload);
	  xhttp.send(payload);

}