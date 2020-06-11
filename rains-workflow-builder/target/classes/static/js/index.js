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
    <div id="StepTypes" > </div>
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
id.value =  element['@id'];

let stepLabel = document.getElementById ("StepLabel");
stepLabel.value =  element['label'];

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


function generateLabelsFromTypes () {
	
}

//takes jsonld object representation and the type that needs to be checked if present
function checkTypeInJsonLD (input,type) {
	
	let result = false; 
	//TO do: test if types are always array if not then need to check this if we only have a class with one type
 
	//assuming it is array 
	for (let i=0;i < input.length; i++) {
		console.log("checking: "+ input[i] + " with " +type );
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
  
  
function createNewStep (target, data) {

let step = document.createElement("div") ;
// need to add prefix here as well
step ['@id'] = dataPrefix+ uuidv4();
step ['@type'] = [];
step ['@type'].push (context.Step);
//to do load the IRI from component tree properly
step ['@type'].push ("https://rains.org#"+data);
step ['label'] = "untitled"; 
step ['isElementOfPlan'] = plan['@id']; 
//step.types = ["ep-plan:Step", "rains:"+data]; 
step['hasRationale'] = []; 


step['belongsToRow'] = target.id;

//push to steps array
stepsArray.push(step);

//add the remove button
stepCloseButtonElement (step);

//add the label controls
addLabel (step, "step", data, target);

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
    	let p1 = getSavedPlan(systemiri, topLevelStepIri);
    	p1.then(
    			(data) => {
    				console.log(data);
    				return data.json();
    			}).then(topLevelPlanDetails => {
    			 
    			  //console.log(topLevelPlanDetails);
    			 
    			  for (let i=0; i<15;i++) {
    			       createStepRow(document.getElementById('workflowStepsPane'));
    			} 
    			  parseSavedPlanJsonLD (topLevelPlanDetails);
    			}
    		).catch(
    		        // Log the rejection reason
    			       (reason) => {
    			            console.log('Handle rejected promise ('+reason+') here.');
    			           
    			        });
	}

	
	if (mode==='new') {
	    //load the details of top level plan  
		
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
function initNewPlan (mode,stage, topLevelPlan) {
	let IRI = dataPrefix + uuidv4(); 
	// save into global variable
	plan ['@id'] = IRI;
	plan ['@type'].push(context.Plan);
	
		
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
		console.log(topLevelPlan.designStep);
		plan ['@type'].push(context.AccountabilityPlan);
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


// to do all XMLH should be rewritten as promise
function getTopLevelPlan (systemiri) {
	return fetch("/getTopLevelPlan?systemIri="+systemiri);
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

function getSavedPlan ( systemiri, topLevelStepIri) {
	return fetch("/getSavedPlan?systemIri="+systemiri+"&topLevelStepIri="+topLevelStepIri);
}



