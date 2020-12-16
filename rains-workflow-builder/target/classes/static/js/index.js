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
var  dataPrefix =  "https://rainsproject.org/InstanceData/";
var  rainsPlanPrefix =  "https://w3id.org/rains#";
var  saoPrefix =  "https://w3id.org/sao#";
var mlsPrefix = "http://www.w3.org/ns/mls#";
var dcPrefix = "http://purl.org/dc/terms/";
// var fabricManager = new manageFabric();

var inspectorTemplate =`
<div class="container-fluid">
  <div class="form-group">
    <label for="StepID">ID</label>
    <input type="text" readonly class="form-control" id="StepID" >
  </div>
    <div class="form-group">
    <label for="StepLabel">Step Label</label>
    <input type="text" readonly class="form-control" id="StepLabel" >
  </div>
    <div class="row">
    <label for="StepTypes">Types</label>
    <div id="StepTypes" class = "row"> </div>
   </div>
     <hr>
  <div class="row">
    <label for="StepDescription">Description</label>
     <br>
    <textarea class="form-control"  id="StepDescription" > </textarea>
  </div>
 <hr>
  <div class="form-group">
    <label for="StepInputs">Inputs</label>
     <button class="btn btn-info btn-sm" data-toggle="modal" data-flag="Input" data-target="#linkVariables">
          <span class="fa fa-plus-circle"></span>  
        </button>
     <br>
    <div id="StepInputs" class = "row"> </div>
  </div>
  <hr>
 <div class="form-group">
    <label for="StepOutputs">Outputs</label>
    <button class="btn btn-info btn-sm" data-toggle="modal" data-flag="Output" data-target="#linkVariables">
          <span class="fa fa-plus-circle"></span>  
        </button>
     <br>
    <div id="StepOutputs" class = "row"> </div>
  </div>
   <hr>
  <div class="form-group">
    <label for="StepConstraints">Constraints</label>
     <a href="#" class="btn btn-info btn-sm">
          <span class="fa fa-plus-circle"></span>  
        </a>
     <br>
    <div id="StepConstraints" class = "row"> </div>
  </div>
  <hr>
   <!--
 <div class="form-group">
    <label for="StepRationale">Rationale</label>
     <a href="#" class="btn btn-info btn-sm" data-toggle="modal" data-target="#rationaleModal">
          <span class="fa fa-plus-circle"></span>  
        </a>
     <br>
    <div id="StepRationale" class = "row" > </div>
  </div>
 <br>
  <hr>-->
  <button type="button" onclick= "applyChanges()"class="btn btn-primary">Apply Changes</button>

</div>`; 

function applyChanges() {
	
	selectedStep['comment'] = document.getElementById ("StepDescription").value;
}

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
id.value =  element['@id'];

let stepLabel = document.getElementById ("StepLabel");
stepLabel.value =  element['label'];

let stepComment = document.getElementById ("StepDescription");
stepComment.value =  element['comment'];

let stepTypes = document.getElementById ("StepTypes");
stepTypes.innerHTML =  "";

for (let i=0;i<element['@type'].length;i++) {
stepTypes.appendChild (createStepTypeWidget ( replaceForNameSpace (element['@type'][i]) , false));
}

let inputs = document.getElementById ("StepInputs");
for (let i=0;i<variablesArray.length;i++) {
	
	if (variablesArray[i]['isInputVariableOf'].includes(element['@id'])) {
	
	inputs.appendChild (createInputVariableWidget ( variablesArray[i] , false));
	}
}

let outputs = document.getElementById ("StepOutputs");
for (let i=0;i<variablesArray.length;i++) {
	
	if (variablesArray[i]['isOutputVariableOf'].includes(element['@id'])) {
	
		outputs.appendChild (createOutputVariableWidget ( variablesArray[i] , false));
	}
}
    
stepTypes.appendChild(document.createElement('hr'));

/*
let stepRationale = document.getElementById ("StepRationale");
stepRationale.innerHTML =  "";
for (let i=0;i<element['hasRationale'].length;i++) {
stepRationale.appendChild (createStepRationaleWidget ( element['hasRationale'][i] , true));
}
*/

}

function saveStepRationale () {
// let modal = document.getElementById ('rationaleModal');
let link =  document.getElementById ('rationaleLink').value;
document.getElementById ('rationaleLink').value="";
console.log(link);
selectedStep['hasRationale'].push (link);
populateInspectPane (selectedStep );
$('#rationaleModal').modal('toggle');
}



//to do handle deletions
function createStepRationaleWidget ( rationale , canDelete) {
let widget = document.createElement('div');
widget.className = 'rationaleWidget';
widget.innerHTML = rationale;

return widget;
}

//currently not used as not working as expected

function connectSteps () {
	 console.log('CSteps Array');
	 console.log(stepsArray);
	 
	 let pathsArray = [];
	for (let i=0;i < stepsArray.length;i++) {
		let step = stepsArray[i];
		//if step has inputs 
		 console.log('Inputs');
		 console.log(step['hasInputVariable']);
		if (step['hasInputVariable'].length>0) {
			
			let inputs = step['hasInputVariable'];
		//find steps that produce those inputs 
		for (let j=0;j< inputs.length;j++) {
			
			let variable = {};
			for (let b=0;b < variablesArray.length ; b++) {
				if (variablesArray[b]['@id']===inputs[j]) {
					variable = 	variablesArray[b];
				}
				break;
			} 
			
			console.log('FOUND The variable');
			 console.log(variable);
			if (variable['isOutputVariableOf']&&variable['isOutputVariableOf'].length>0) {
				
				//should be only 1 eleemnt as we dont allow two steps to produce same variable but writing it like this in case this gets relaxed in the future
				let stepsIdsProducingOutput = variable['isOutputVariableOf'];
				
				for (let y=0;y< stepsIdsProducingOutput.length;y++) {
					
					//find each producer step div from our array and connect to it
					
					for (let x=0;x< stepsArray.length;x++) {
						
						if (stepsArray[x]['@id']===stepsIdsProducingOutput[y]) {
							
							 console.log('CONNECTING STEPS');
							 console.log($("#"+stepsArray[x].id));
							 console.log($("#"+step.id));
							 
							 new LeaderLine(
								 document.getElementById (step.id),
								 document.getElementById (stepsArray[x].id)
								 
								 );
							

							
							
						}
					
					}
					
					
				}
				
			}
		
		}
		
	    }
	}
	
	
	
}

//to do handle deletions
function createStepTypeWidget ( type , canDelete) {

let widget = document.createElement('div');
widget.className = 'typeWidget';
widget.innerHTML = type;

return widget;

}

//to do handle deletions
function createInputVariableWidget ( input , canDelete) {

	let widget = document.createElement('div');
	widget.className = 'inputVariableWidget';
	widget.innerHTML = `<label class="form-check-label" data-toggle="tooltip" data-html="true" data-placement="top" title="<strong>Types</strong>: ${input['@type']} <br> <strong>Description</strong>: ${input['comment']}"> ${input['label']} </label>`;

	return widget;

	}

//to do handle deletions
function createOutputVariableWidget ( output , canDelete) {

	let widget = document.createElement('div');
	widget.className = 'outputVariableWidget';
	widget.innerHTML = `<label class="form-check-label" data-toggle="tooltip" data-html="true" data-placement="top" title="<strong>Types</strong>: ${output['@type']} <br> <strong>Description</strong>:${output['comment']}"> ${output['label']} </label>`;


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

 //creates all the interface elements that were defined by the JSON-LD
  
function parseTemplateJsonLD (jsonld) {
	console.log("parser called");
	let graphArray = JSON.parse (jsonld);
	console.log(graphArray.length);
	for (let i=0;i<graphArray.length; i++) {
		
		let element = graphArray[i];
		console.log( "Element "+graphArray[i]);
		if (element['@type']!=null) {
			
			console.log("found element with @type");
			if (checkTypeInJsonLD (element['@type'],context.Step)) {
				console.log("found element with @type STEP");
				//ASSUMPTION THERE IS ALWAYS LABEL (WE ALWAYS FORCE DEFAULT LABEL) AND THERE IS ONLY ONE
				let label = "default value";
				if (element[context.label][0]['@value']!=null) {
					label = element[context.label][0]['@value'];
				} 
			    loadTemplateStep (element['@type'],label, "https://to_do_loading label.org"  , element[context.belongsToRow][0]['@value']);
				
			}			
		} 	
	}
}



function parseSavedPlanJsonLD (graphArray) {
	console.log("saved system plan parser called");
	//let graphArray = JSON.parse (jsonld);
	console.log(graphArray.length);
	for (let i=0;i<graphArray.length; i++) {
		
		let element = graphArray[i];
		console.log( graphArray[i]);
		if (element['@type']!=null) {
			
			console.log("found element with @type");
			if (checkTypeInJsonLD (element['@type'],context.AccountabilityPlan)) {
				console.log("found element with @type Plan");
				console.log("found Plan");
				plan ['@id'] = element['@id'];
				plan ['@type'] = element['@type'];
				document.getElementById ('planIRI').value=plan ['@id'];
				
			}
			if (checkTypeInJsonLD (element['@type'],context.Step)) {
				console.log("found element with @type STEP");
				//ASSUMPTION THERE IS ALWAYS LABEL (WE ALWAYS FORCE DEFAULT LABEL) AND THERE IS ONLY ONE
				let label = "default value";
				
				if (element[context.label][0]['@value']!=null) {
					label = element[context.label][0]['@value'];
					console.log("saved label: "+ label);
				} 
				
				
				loadSavedStep (element['@id'],element['@type'],label, "https://to_do_loading label.org"  , element[context.belongsToRow][0]['@value']);
				
			}			
		} 	
	}
}




//takes jsonld object representation and the type that needs to be checked if present
function checkTypeInJsonLD (input,type) {
	
	let result = false; 
	//TO do: test if types are always array if not then need to check this if we only have a class with one type
 
	//assuming it is array 
	for (let i=0;i < input.length; i++) {
	//	console.log("checking: "+ input[i] + " with " +type );
		if (input[i] == type) {result=true;}
	}
	return result;
}


// TO do handle other elementas that might be present in the graph

function loadSavedStep (id,types,label ="default value", data, rowID) {
console.log("creating step with label" + label);
	let step = document.createElement("div") ;
	step ['@id'] = id;
	step ['@type'] = types;
	step ['label'] = label;
	
	step ['isElementOfPlan'] = plan['@id']; 
	step['hasRationale'] = []; 
	
	stepsArray.push(step);
	
	step.addEventListener("click", function(event) {
		console.log("called");
		populateInspectPane (step);
		});
	
	//add the remove button
	//stepCloseButtonElement (step);

	//add the label controls
	addLabel (step, "step", data, document.getElementById(rowID));
	
	return step;
} 

 // TO do handle other elementas that might be present in the graph
  
function loadTemplateStep (types,label ="default value", data, rowID) {
console.log("creating step with label" + label);
	let step = document.createElement("div") ;
	step ['@id'] = dataPrefix+ uuidv4();
	step ['@type'] = types;
	step ['label'] = label;
	step ['isElementOfPlan'] = plan['@id']; 
	step['hasRationale'] = []; 
	step['belongsToRow'] = rowID;
	
	stepsArray.push(step);
	
	//inspector listener
	
	step.addEventListener("click", function(event) {
		console.log("called");
		populateInspectPane (step);
		});
		
	
	//add the remove button
	stepCloseButtonElement (step);

	//add the label controls
	addLabel (step, "step", data, document.getElementById(rowID));
	
	return step;
}   
  


function createNewVariable (label, description, type, rowId, mode, accountableObjectRel ) {
	
	
	let variable = {} ;
	variable ['@id'] = dataPrefix+ uuidv4();
	variable ['@type'] = [];
	variable ['@type'].push (context.Variable);
	variable ['@type'].push (context.namedIndividual);
	variable ['@type'].push (context.MultiVariable);
	variable ['@type'].push (type);
	variable ['label'] = label; 
	variable ['comment'] = description; 
	variable ['isElementOfPlan'] = plan['@id'];
	variable['belongsToRow'] = rowId;
	variable['isInputVariableOf'] = [];
	variable['isOutputVariableOf'] =[];
	variable['relatesTo'] =accountableObjectRel;
	
	if (mode==="Input") {
		
		variable['isInputVariableOf'].push( selectedStep["@id"]);
		
		
	}
	if (mode==="Output") {
		
		variable['isOutputVariableOf'].push(selectedStep["@id"]);
		
	}
	
	for (let i=0; i< stepsArray.length;i++ ) {
		if (stepsArray[i]['@id']===selectedStep["@id"]) {
			if (mode==="Input") {
				stepsArray[i]['hasInputVariable'].push( variable["@id"]);
			}
			if (mode==="Output") {
				console.log("index.js line 610 pushing output variable to " + selectedStep["@id"]);
				console.log("index.js line 610 pushing var " + variable["@id"]);
				stepsArray[i]['hasOutputVariable'].push( variable["@id"]);
			}
			break;
			
		}
		
	}
	
	
	variablesArray.push(variable);

	
	
}



function createNewStep (target, data) {

let step = document.createElement("div") ;
let uuid = uuidv4();
step.id = uuid;
// need to add prefix here as well
step ['@id'] = dataPrefix+ uuid;
step ['@type'] = [];
step ['@type'].push (context.Step);
step ['@type'].push (context.namedIndividual);
step ['@type'].push (context.MultiStep);
//to do load the IRI from component tree properly
step ['@type'].push (data);
step ['label'] = labelFromIRI (data); 
step ['comment'] = "default comment";
step ['isElementOfPlan'] = plan['@id']; 
//step.types = ["ep-plan:Step", "rains:"+data]; 
step['hasRationale'] = []; 
step['hasInputVariable'] = [];
step['hasOutputVariable'] =[];


step['belongsToRow'] = target.id;
step.addEventListener("click", function(event) {
	console.log("called");
	populateInspectPane (step);
	});
//push to steps array
stepsArray.push(step);

//add the remove button
stepCloseButtonElement (step);

//add the label controls
addLabel (step, "step", data, target);

}

//for IRIs with #
function labelFromIRI (str) {
	let label="";
	let passedHash = false;
	
	for (let j=str.length-1; j >0 ; j--) {
		
		if (str[j] === "#") {
			break;
		} 
	
		else {
			label =label.concat(str[j]);
			
		}
		
	}
	
	return label.split("").reverse().join("").replace( /([A-Z])/g, " $1" );;
}

function addLabel (element, className, data, target) {
	
	// Create a <h1> element
	// let t = document.createTextNode(":"+step.stepID);
	let label =   document.createElement("div");
	label.innerHTML=element['label']; 
	label.stepDOMid= element['@id'];
	label.addEventListener("click", function(event) {
	editStepNameStart(event);
	});



	//let strong = document.createElement("strong"); 
	//let t2 = document.createTextNode(data);
	// step.appendChild(t);
	element.appendChild(label); 
    //element.appendChild(strong); 
	//strong.appendChild(t2); 
	element.className= className;
	target.appendChild (element);
	
	
}

function stepCloseButtonElement (step) {
	
	let more = document.createElement("button");

	more.className= "more close";
	more.innerHTML = '<span aria-hidden="true">&times;</span>';
	// let more_text = document.createTextNode("X");


	more.addEventListener("click", function(event) {
	event.stopPropagation();
	step.remove();
//remove also from cached steps array
	stepsArray = stepsArray.filter(function(el) { return el['@id'] != step ['@id']; });
	resetInspector ();
	// $('#stepModal').modal('toggle');
	});

	
	step.appendChild(more);
	
}

/**
 * Author: Milan Markovic 
 * 
 * Creates the rows in the middle part of the workflow builder and adds listeners for drop events
 */

function createStepRow (element) {

	let r = document.createElement("div");
	r.id = "step_row_"+stepRowCounter;
	r.className= "row steprow";
	let h = document.createElement("div");
	let text = document.createTextNode("drop here to create new step for this row");
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


	if (stepRowCounter % 2 === 0) {
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
 * Initialises the layout of the workflow builder
 */
function initLayout (mode, stage, systemiri, topLevelStepIri) {	
	console.log(systemiri);	
    if (mode ==='open') {
    	let p1 = getSavedPlan(systemiri, stage);
    	//let p1 = getSavedPlan(systemiri, topLevelStepIri);
    	p1.then(
    			(data) => {
    				console.log(data);
    				return data.json();
    			//}).then(topLevelPlanDetails => {
    			}).then(planDetails => {
    			  //console.log(topLevelPlanDetails);
    			 
    			  for (let i=0; i<15;i++) {
    			       createStepRow(document.getElementById('workflowStepsPane'));
    			} 
    			  //parseSavedPlanJsonLD (topLevelPlanDetails);
    			  parseSavedPlanJsonLD (planDetails);
    			}
    		).catch(
    		        // Log the rejection reason
    			       (reason) => {
    			            console.log('Handle rejected promise ('+reason+') here.');
    			           
    			        });
	}

	
	if (mode==='new') {
	    //load the details of top level plan  
		/*
		let p1 = getTopLevelPlan(systemiri);
		p1.then(
			(data) => {
				return data.json();
			}).then(topLevelPlanDetails => {
			 
			  
			  initNewPlan (mode,stage, topLevelPlanDetails);
			  for (let i=0; i<15;i++) {
			       createStepRow(document.getElementById('workflowStepsPane'));
			} 
			}
		).catch(
		        // Log the rejection reason
			       (reason) => {
			            console.log('Handle rejected promise ('+reason+') here.');
			           
			        });
		*/
		let p1 = getStagePlanIRI (systemiri,stage);
		p1.then(
			(data) => {
				return data.json();
			}).then(plan => {
			 
			  
			  initNewPlan (mode,stage, plan.planIRI);
			  for (let i=0; i<15;i++) {
			       createStepRow(document.getElementById('workflowStepsPane'));
			} 
			}
		).catch(
		        // Log the rejection reason
			       (reason) => {
			            console.log('Handle rejected promise ('+reason+') here.');
			           
			        });
	
	
	}
	else if (mode==='template'){
		
      
       initNewPlan (mode,stage);
       for (let i=0; i<15;i++) {
       createStepRow(document.getElementById('workflowStepsPane'));
} 
	}
}

/**
 * from https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
 * @param parameterName
 * @returns
 */
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
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
function initNewPlan (mode,stage, ExistingPlanIRI) {
	let IRI ="";
	if (ExistingPlanIRI=="") {
	 IRI = dataPrefix + uuidv4();
	}else{
	 IRI = ExistingPlanIRI;
	}
	console.log("Empty plan IRI is: "+ IRI);
	// save into global variable
	plan ['@id'] = IRI;
	plan ['@type'].push(context.Plan);
	plan ['@type'].push(context.AccountabilityPlan);
	plan ['@type'].push (context.namedIndividual);
		
	if (mode ==='template')  {
	switch (stage) {
	
	case "design":
	plan ['@type'].push(context.DesignStageTemplate);
	break; 
	
	case "implementation":
	plan ['@type'].push(context.ImplementationStageTemplate);
	break; 
	
	case "deployment":
	plan ['@type'].push(context.DeploymentStageTemplate);
	break; 
	
	case "operation":
	plan ['@type'].push(context.OperationStageTemplate);
	break; 
	}
	}
	
	if (mode ==='new') {
		//console.log(topLevelPlan.designStep);
		//plan ['@type'].push(context.AccountabilityPlan);
		/*
		plan ['isSubPlanOfPlan'] = topLevelPlan.plan;
		
		switch (stage) {
		
		case "design":
		plan ['decomposesMultiStep']= topLevelPlan.designStep;
		break; 
		
		case "implementation":
			plan ['decomposesMultiStep']= topLevelPlan.implementationStep;
		break; 
		
		case "deployment":
			plan ['decomposesMultiStep']= topLevelPlan.deployStep;
		break; 
		
		case "operation":
			plan ['decomposesMultiStep']= topLevelPlan.operationStep;
		break; 
		}
		*/
		
		
	}
	
	document.getElementById ('planIRI').value=IRI;
	return IRI;
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

/*
// to do all XMLH should be rewritten as promise
function getTopLevelPlan (systemiri) {
	return fetch("/getTopLevelPlan?systemIri="+systemiri);
}
*/	

//to do all XMLH should be rewritten as promise
function getStagePlanIRI (systemiri, stage) {
	return fetch("/getStagePlanIRI?systemIri="+systemiri+"&stage="+stage);
}

function savePlan () {
	
	console.log("saving" + findGetParameter('systemIri'));
	
	
	fetch('/savePlan', {
	    method: 'post',
	    headers: {
	      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
	    },
	    body: 'systemIri='+findGetParameter('systemIri')+'&payload='+generateJsonLDpayload (context,prepareGraph())
	  })
	  .then((data) => {
			return data.json();
		})
	  .then(function (data) {
	    console.log('Request succeeded with JSON response', data);
	  })
	  .catch(function (error) {
	    console.log('Request failed', error);
	  });
	  
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

function getTemplates () {
	setSpinner ();
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
        	   
        	   let templates = JSON.parse(xmlhttp.responseText);
        	   let IRIs = Object.keys(templates);
        	   let html ="";
        	   
        	   if (IRIs.length==0) {
        		   html ="no templates";
        	   }
        	   else {
        	    html = '<div class="list-group">';
        		for (i=0; i<IRIs.length;i++) {
        		   console.log(IRIs[i]);
        		   if ( templates [IRIs[i]]=== "") {
        			   html = html + '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onclick= "importTemplate (\''+IRIs[i]+'\')"> '+IRIs[i]+'</a>';
        		   }
        		   else {
        			 html = html + '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onclick= "importTemplate (\''+IRIs[i]+'\')">'+templates[IRIs[i]]+'</a>';
        		   }
        	    }
        		html = html + '<\div>';
        	   
        	   }
               document.getElementById("templateList").innerHTML = html;
               hideSpinner();
               
           }
           else if (xmlhttp.status == 400) {
              console.log('getTemplates ():There was an error 400');
              hideSpinner();
           }
           else {
        	   console.log('getTemplates ():something else other than 200 was returned');
        	   hideSpinner();
           }
        }
    };

    xmlhttp.open("GET", "/getTemplatePlans", true);
    xmlhttp.send();
}

//this loads the components of a template plan and assigns new uri and links them to the current one
//TO DO: currently only handles steps 
function importTemplate (templatePlanIRI) {
	
	console.log("Querying for template: "+ templatePlanIRI);
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
        	   
        	   console.log (xmlhttp.responseText);
        	   parseTemplateJsonLD (xmlhttp.responseText);
               
           }
           else if (xmlhttp.status == 400) {
              console.log('importTemplate ():There was an error 400');
              
           }
           else {
        	   console.log('importTemplate ():something else other than 200 was returned');
        	  
           }
        }
    };

    xmlhttp.open("GET", "/getTemplate?planIri="+ templatePlanIRI, true);
    xmlhttp.send();
}

/*
function getSavedPlan ( systemiri, topLevelStepIri) {
	return fetch("/getSavedPlan?systemIri="+systemiri+"&topLevelStepIri="+topLevelStepIri);
}
*/
function getSavedPlan ( systemiri, stage) {
	return fetch("/getSavedPlan?systemIri="+systemiri+"&stage="+stage);
}




