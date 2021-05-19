let currentResultElementClicked = "";

let currentAgentClicked = "";

let currentResultElementClickedProcessPane = "";

let currentResultElementClickedEntityPane = "";


//COMBINE ALL METHODS INTO ONE AFTER DECIDING IF WE ARE KEEPING THE DIFFERENT TABS
function agentClickHighlighter (event) {
	console.log("event")
	if (currentAgentClicked!="") {
		currentAgentClicked.classList.toggle("clicked");
	}
	currentAgentClicked = event.srcElement
	event.srcElement.classList.toggle("clicked");
	$('#object-details').html('Click on the items in the result table to view details.');
	$('#informationRelaizationDesc').html('');
}

function resultClickHighlighter (event) {
	console.log("event")
	if (currentResultElementClicked!="") {
	   currentResultElementClicked.classList.toggle("clicked");
	}
	currentResultElementClicked = event.srcElement
	event.srcElement.classList.toggle("clicked");
}

function resultClickHighlighterRocessPane (event) {
	console.log("event")
	if (currentResultElementClickedProcessPane!="") {
		currentResultElementClickedProcessPane.classList.toggle("clicked");
	}
	currentResultElementClickedProcessPane = event.srcElement
	event.srcElement.classList.toggle("clicked");
}

function resultClickHighlighterEntityPane (event) {
	console.log("event")
	if (currentResultElementClickedEntityPane!="") {
		currentResultElementClickedEntityPane.classList.toggle("clicked");
	}
	currentResultElementClickedEntityPane = event.srcElement
	event.srcElement.classList.toggle("clicked");
}


//----------> Process view Pane Start

function getAllActivitiesInExecutionTraces (systemIRI) {

	let details = fetch("getAllActivitiesInExecutionTraces?systemIRI="+ systemIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log("RESULT getAllActivitiesInExecutionTraces ");
				console.log(details);
				
				let resultObjectDependentActionsMerged = [];
				
				let dependentAccountableActions = {};
				let dependentAccountableActionsIDs = {};
				
				let activityOutputsCounter = {};
				
				
				let inputs = {};
				let inputsIDs = {};
				
				for (let i=0;i<details.length;i++ ) {
					
					
					resultObjectDependentActionsMerged[i] = {};
					resultObjectDependentActionsMerged[i]['accountableAction'] = details[i].accountableAction;
					resultObjectDependentActionsMerged[i]['accountableActionLabel'] = details[i].accountableActionLabel;
					resultObjectDependentActionsMerged[i]['accountableActionType'] = details[i].accountableActionType;
					resultObjectDependentActionsMerged[i]['wasassociatedWith'] = details[i].agent;
					resultObjectDependentActionsMerged[i]['accountableObject'] = details[i].accountableObject;
					resultObjectDependentActionsMerged[i]['accountableObjectLabel'] = details[i].accountableObjectLabel;
					resultObjectDependentActionsMerged[i]['accountableResult'] = details[i].accountableResult;
					resultObjectDependentActionsMerged[i]['activity'] = details[i].activity;
					resultObjectDependentActionsMerged[i]['infoRealization'] = details[i].infoRealization;
					resultObjectDependentActionsMerged[i]['accountableResultType'] = details[i].accountableResultType;
					resultObjectDependentActionsMerged[i]['accountableResultLabel'] = details[i].accountableResultLabel;
					resultObjectDependentActionsMerged[i]['dependentAccountableActions'] = [];
					resultObjectDependentActionsMerged[i]['reused'] = details[i].reused;
					
					
					//Handle dependent inputs
					if (details[i].input!=null) {
					
					 let inputDetails = {};
					 
					
					 if (inputsIDs[details[i].accountableAction]==null) {
						 inputsIDs[details[i].accountableAction] = [];
					  }
					 
					 if (!inputsIDs[details[i].accountableAction].includes(details[i].input)) {
						 inputDetails['input'] = details[i].input;
						 inputDetails['accountableResultInputLabel'] = details[i].accountableResultInputLabel;
						 inputDetails['accountableResultInputComment'] = details[i].accountableResultInputComment;
						 inputDetails['accountableResultInputType'] = details[i].accountableResultInputType;
						 inputDetails['inputInfoRealization'] = details[i].inputInfoRealization;
						 
						
					 
					  if (inputs[details[i].accountableAction]==null) {
						 inputs[details[i].accountableAction] = [];
					  }
					  inputs[details[i].accountableAction].push(inputDetails);	
					  inputsIDs[details[i].accountableAction].push (details[i].input);
					
					 }
				   }
					 
					//count outputs so we know how to merge cells
					if (activityOutputsCounter[details[i].accountableAction]==null) {
						activityOutputsCounter[details[i].accountableAction] = new Set ();
					}
					activityOutputsCounter[details[i].accountableAction].add(details[i].accountableResult);
					
					
					//Handle dependent activities
					if (details[i].dependentAccountableActionActivity!=null) {
						
						let dependentActionDetails = {};
						
						 if (dependentAccountableActionsIDs[details[i].accountableAction]==null) {
							 dependentAccountableActionsIDs[details[i].accountableAction] = [];
						  }
						
						 if (!dependentAccountableActionsIDs[details[i].accountableAction].includes(details[i].dependentAccountableActionActivity)) {
						dependentActionDetails.dependentAccountableActionActivity =  details[i].dependentAccountableActionActivity; 
						dependentActionDetails.dependentAccountableActionLabel =  details[i].dependentAccountableActionLabel; 
						dependentActionDetails.dependentAccountableActionType =  details[i].dependentAccountableActionType; 
						
					   
						 if (dependentAccountableActions[details[i].accountableAction]==null) {
						    dependentAccountableActions[details[i].accountableAction] = [];
					        }
					     dependentAccountableActions[details[i].accountableAction].push(dependentActionDetails);
					     dependentAccountableActionsIDs[details[i].accountableAction].push (details[i].dependentAccountableActionActivity);
						
						 }
					}
					
				}
				
				console.log("ALL ACTIVITIES");
				console.log(resultObjectDependentActionsMerged);
				
				let tableBody = document.getElementById ('process_result_body');
				tableBody.innerHTML="";
				
				let outputsSeen = [];
				let activitiesSeen = [];
				
				let counter = 1; 
				for (let x=0; x< resultObjectDependentActionsMerged.length;x++) {
					let value = resultObjectDependentActionsMerged[x];
					if (outputsSeen.includes(value.infoRealization)) {
						continue;
					}
					
					let rowNumb = document.createElement('th');
					rowNumb.innerHTML=counter;
				
					
					let th = document.createElement('td');
					
					let th4 = document.createElement('td');
					
					let th5 = document.createElement('td');
					
					
					
					let inputsCell = document.createElement('td');
					//th.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.accountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> "+ replaceRainsPrefix(value.accountableActionType)+"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong> "+ replaceDataInstancePrefix(value.activity) +"</div> ";
					let addcolumns=false;
					
					if (!activitiesSeen.includes(value.activity)) {
					
					 th.rowSpan =activityOutputsCounter[value.accountableAction].size;
					 th.innerHTML = `<div  class="instanceTraceWidget"> ${value.accountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableActionType)}"></i>)</div> ` 
					 th.addEventListener("click", function(event){ 					
						resultClickHighlighterRocessPane(event);	
						getActivityDetailsInExecutionTraces (systemIRI,value.activity, "ProcessView") 
					
					 });
					
					 activitiesSeen.push(value.activity);
					
					
					inputsCell.rowSpan =activityOutputsCounter[value.accountableAction].size;
					
					
					 
					 
	                if (inputs[value.accountableAction]!=null) { 
						
						for (let j=0;j< inputs[value.accountableAction].length; j++ ) {
							console.log(inputs[value.accountableAction])
							let spanOutputs = document.createElement('span');
							
							spanOutputs.innerHTML = ` <div  class="resultsEntityTraceWidget"> ${inputs[value.accountableAction][j].accountableResultInputLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(inputs[value.accountableAction][j].accountableResultInputType)}"></i>)</div> `
							spanOutputs.addEventListener("click", function(){ 
							resultClickHighlighterRocessPane(event);	
							getOutputDetailsInExecutionTraces (systemIRI,inputs[value.accountableAction][j].inputInfoRealization,"ProcessView") });
							
							inputsCell.append(spanOutputs);
						}
					 } else {
						 let spanOutputs = document.createElement('span');
							
							spanOutputs.innerHTML = `no inputs recorded`;
							inputsCell.append(spanOutputs);
						 
					 }
					
					
					th4.rowSpan =activityOutputsCounter[value.accountableAction].size;
					th4.innerHTML=` <div><div  class="agentWidgetTable"> ${value.wasassociatedWith} </div> </div>`
				

				    th5.rowSpan =activityOutputsCounter[value.accountableAction].size;
				    th5.innerHTML=` <div  class="instanceTraceWidget"> ${value.accountableObjectLabel.replaceAll("\"","")} </div> `
					
				
					
					addcolumns=true;
					}
					
					
					
					
					let th2 = document.createElement('td');
				//	th2.innerHTML="<div class=\"planWidget\"> <h5>"+value.accountableResultLabel.replaceAll("\"","") + "<br> <span style=\"background:black;color:white; \">[" + replaceRainsPrefix(value.accountableResultType) +"]</span></h5></div><div class=\"executionTraceWidget\" ><strong> Corresponding Entity IRI: </strong>"+ replaceDataInstancePrefix(value.infoRealization)+"</div> ");
					th2.innerHTML = ` <div  class="resultsEntityTraceWidget"> ${value.accountableResultLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableResultType)}"></i>)</div> `
					th2.addEventListener("click", function(){ 
						resultClickHighlighterRocessPane(event);	
						getOutputDetailsInExecutionTraces (systemIRI,value.infoRealization, "ProcessView") });
					outputsSeen.push(value.infoRealization)
					
					
					let th3 = document.createElement('td');
					console.log(value.dependentAccountableActions)
					
					
					
					if (dependentAccountableActions[value.accountableAction]!=null) { 
						
						for (let j=0;j< dependentAccountableActions[value.accountableAction].length; j++ ) {
							
						 
							let span = document.createElement('span');					
							span.innerHTML = ` <div  class="instanceTraceWidget"> ${dependentAccountableActions[value.accountableAction][j].dependentAccountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(dependentAccountableActions[value.accountableAction][j].dependentAccountableActionType)}"></i>)</div> `
						    span.addEventListener("click", function(){ 
							resultClickHighlighterRocessPane(event);	
							getActivityDetailsInExecutionTraces (systemIRI,dependentAccountableActions[value.accountableAction][j].dependentAccountableActionActivity,"ProcessView") });
							th3.append(span);
						}
					 }
					
					else {
						let span = document.createElement('span');					
						span.innerHTML = `no dependable actions recorded`;
						th3.append(span);
					}
					 
					
					
					//th4.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					
					let tr = document.createElement('tr'); 
					
					tr.append(rowNumb);
					if (addcolumns) {
					tr.append(th);
					tr.append(inputsCell);
					}
					
					tr.append(th2);
					tr.append(th3);
					if (addcolumns) {
					tr.append(th4);
					tr.append(th5);
					}
					
					tableBody.append(tr);
					
					counter++;
				}
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}

//----------> Process view Pane End


//----------> Entity view Pane Start

function selectEntity (entityID) {
	$('#queryResultModal').toggle();
	
	$('#'+entityID).click();
	
}

function getEntityInfluencePath (systemIRI, entityIRI) {
	let details = fetch("getEntitiesOnInfluencePath?systemIRI="+ systemIRI+"&entityIRI="+entityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				console.log(details);
				let html = '<ul class="list-group">';
				for (let i=0; i <details.length;i++) {
				html = `${html} <li onclick="selectEntity('${details[i].entity.split("/")[4]}')" class="list-group-item"><a href="#">${details[i].label.replaceAll("\"","")}</a></li>`
					
				}
				html = `${html} </ul>`
				if (details.length ==0) {
					html = `<p>No results</p>`
				}
				$('#queryResultModalBody').html (html);
				
				
			}).catch(
    		        // Log the rejection reason
 			       (reason) => {   			    	 
 			            console.log('Handle rejected promise getEntityDerivationPath  ('+reason+') here.');
 			           
 			        });
}

function getEntityDerivationPath (systemIRI, entityIRI) {
	let details = fetch("getEntitiesOnDerivationPath?systemIRI="+ systemIRI+"&entityIRI="+entityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				console.log(details);
				let html = '<ul class="list-group">';
				for (let i=0; i <details.length;i++) {
				html = `${html} <li onclick="selectEntity('${details[i].influenceEntity.split("/")[4]}')" class="list-group-item"><a href="#">${details[i].influenceVariableLabel.replaceAll("\"","")}</a></li>`
					
				}
				html = `${html} </ul>`
				if (details.length ==0) {
					html = `<p>No results</p>`
				}
				$('#queryResultModalBody').html (html);
				
				
			}).catch(
    		        // Log the rejection reason
 			       (reason) => {   			    	 
 			            console.log('Handle rejected promise getEntityDerivationPath  ('+reason+') here.');
 			           
 			        });
}


function getAllEntitiesInExecutionTraces (systemIRI) {

	let details = fetch("getAllEntitiesInExecutionTraces?systemIRI="+ systemIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log("RESULT getAllEntitiesInExecutionTraces ");
				console.log(details);
				
				let resultObject = {};
				
				for (let i=0;i<details.length;i++ ) {
					
					
						resultObject[details[i].infoRealization] = {};
						resultObject[details[i].infoRealization]['accountableAction'] = details[i].accountableAction;
						resultObject[details[i].infoRealization]['accountableActionLabel'] = details[i].accountableActionLabel;
						resultObject[details[i].infoRealization]['accountableActionType'] = details[i].accountableActionType;
						resultObject[details[i].infoRealization]['wasassociatedWith'] = details[i].agent;
						resultObject[details[i].infoRealization]['accountableObject'] = details[i].accountableObject;
						resultObject[details[i].infoRealization]['accountableObjectLabel'] = details[i].accountableObjectLabel;
						resultObject[details[i].infoRealization]['accountableResult'] = details[i].accountableResult;
						resultObject[details[i].infoRealization]['activity'] = details[i].activity;
						resultObject[details[i].infoRealization]['infoRealization'] = details[i].infoRealization;
						resultObject[details[i].infoRealization]['accountableResultType'] = details[i].accountableResultType;
						resultObject[details[i].infoRealization]['accountableResultLabel'] = details[i].accountableResultLabel;
						resultObject[details[i].infoRealization]['dependentAccountableActions'] = [];
						resultObject[details[i].infoRealization]['reused'] = details[i].reused;
					
				}
				
				console.log("ALL Entities");
				console.log(resultObject);
				
				let tableBody = document.getElementById ('entity_result_body');
				tableBody.innerHTML="";
				let counter = 1; 
				for (const [key, value] of Object.entries(resultObject)) {
					
					let rowNumb = document.createElement('th');
					rowNumb.innerHTML=counter;
				
					let entityType = document.createElement('td');
					entityType.innerHTML = replaceRainsPrefix(value.accountableResultType).split(":")[1].replace(/([a-z](?=[A-Z]))/g, '$1 ');
					
					
					let parentActivity = document.createElement('td');
					//th.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.accountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> "+ replaceRainsPrefix(value.accountableActionType)+"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong> "+ replaceDataInstancePrefix(value.activity) +"</div> ";
					parentActivity.innerHTML = `<div  class="instanceTraceWidget"> ${value.accountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableActionType)}"></i>)</div> ` 
						parentActivity.addEventListener("click", function(event){ 					
						resultClickHighlighterEntityPane(event);	
						getActivityDetailsInExecutionTraces (systemIRI,value.activity, "EntityView") 
					
					});
					
					let influencePath = document.createElement('td');
					influencePath.innerHTML = "<a href='#'>Click to view</a>";
					influencePath.addEventListener("click", function(){
						getEntityInfluencePath( systemIRI,value.infoRealization );
						$('#queryResultModal').toggle();});
					
					let derivationPath = document.createElement('td');
					derivationPath.innerHTML = "<a href='#'>Click to view</a>";
					derivationPath.addEventListener("click", function(){
						getEntityDerivationPath( systemIRI,value.infoRealization );
						$('#queryResultModal').toggle();});
					
					let allEntities = document.createElement('td');
				//	th2.innerHTML="<div class=\"planWidget\"> <h5>"+value.accountableResultLabel.replaceAll("\"","") + "<br> <span style=\"background:black;color:white; \">[" + replaceRainsPrefix(value.accountableResultType) +"]</span></h5></div><div class=\"executionTraceWidget\" ><strong> Corresponding Entity IRI: </strong>"+ replaceDataInstancePrefix(value.infoRealization)+"</div> ");
					let id = value.infoRealization.split("/")[4];
					allEntities.innerHTML = ` <div id=${id} class="resultsEntityTraceWidget"> ${value.accountableResultLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableResultType)}"></i>)</div> `
					allEntities.addEventListener("click", function(){ 
						resultClickHighlighterEntityPane(event);	
						getOutputDetailsInExecutionTraces (systemIRI,value.infoRealization, "EntityView") });
					
					let th3 = document.createElement('td');
					console.log(value.dependentAccountableActions)
					for (let j=0;j<value.dependentAccountableActions.length; j++ ) {
						console.log("creating span")
					let span = document.createElement('span');
					
					//span.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.dependentAccountableActions[j].dependentAccountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> " +replaceRainsPrefix(value.dependentAccountableActions[j].dependentAccountableActionType)  +"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong>"+replaceDataInstancePrefix(value.dependentAccountableActions[j].dependentAccountableActionActivity) +"</div> ";
					span.innerHTML = ` <div  class="instanceTraceWidget"> ${value.dependentAccountableActions[j].dependentAccountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.dependentAccountableActions[j].dependentAccountableActionType)}"></i>)</div> `
						
					span.addEventListener("click", function(){ 
						resultClickHighlighterEntityPane(event);	
						getActivityDetailsInExecutionTraces (systemIRI,value.dependentAccountableActions[j].dependentAccountableActionActivity,"EntityView") });
					
					th3.append(span);
					}
					
					let th4 = document.createElement('td');
						th4.innerHTML=` <div><div  class="agentWidgetTable"> ${value.wasassociatedWith} </div> </div>`
					
					
					let th5 = document.createElement('td');
					//th4.innerHTML="<div class=\"planWidget\"><strong>Accountable Object Name:</strong> "+value.accountableObjectLabel+ "</div><div class=\"executionTraceWidget\" ><strong> Object IRI: </strong>"+replaceDataInstancePrefix(value.accountableObject) +"</div> ";
					th5.innerHTML=` <div  class="instanceTraceWidget"> ${value.accountableObjectLabel.replaceAll("\"","")} </div> `
						
					
					//th4.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					
					let tr = document.createElement('tr'); 
					
					tr.append(rowNumb);
					tr.append(entityType);
					tr.append(allEntities);
					tr.append(parentActivity);
					tr.append(influencePath);
					tr.append(derivationPath);
					//tr.append(th4);
					//tr.append(th5);
					tableBody.append(tr);
					
					counter++;
				}
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}

//----------> Entity view Pane End


function getAgents (systemIRI) {
let agents = fetch("getAgentsInExecutionTraces?systemIRI="+ systemIRI);
agents.then(
			(data) => {
				
				return data.json();
			}).then(agentsIRI => {
				
				let html = "";
				
				for (let i =0; i <agentsIRI.length; i++) {
					let div = document.createElement('div');
					div.innerHTML = '<div id="agent'+i+'" class="agentWidget">  '+replaceRainsPrefix(agentsIRI[i]) + ' </div>';
					document.getElementById ("agent_pane").append(div);
					$('#agent'+i).click(function(even) {
						
						agentClickHighlighter(event);
						getAgentsParticipationDetailsInExecutionTraces(systemIRI,agentsIRI[i]);
					});
				}
				
				
			}
    		).catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents in execution traces ('+reason+') here.');
    			           
    			        });
}

function replaceRainsPrefix (string) {
	
	return (string.replace(rainsPlanPrefix, "rains:").replace(mlsPrefix, "mls:").replace(saoPrefix, "sao:").replace("http://example.com", "ex:").replace("https://en.wikipedia.org/wiki/", "wiki:"))
}
/*
function getAgentsParticipationDetailsInExecutionTraces (systemIRI,agentIRI) {

	let details = fetch("getAgentsParticipationDetailsInExecutionTraces?systemIRI="+ systemIRI+"&agentIRI="+agentIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log(details);
				
				let tableBody = document.getElementById ('agent_result_body');
				tableBody.innerHTML="";
				
				for (let i =0; i <details.length; i++) {
					console.log
					let th = document.createElement('th');
					th.innerHTML=replaceRainsPrefix(details[i]['stepType']);
					th.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,details[i]['activity']) });
					
					let th2 = document.createElement('th');
					th2.innerHTML=replaceRainsPrefix(details[i]['outputType']);
					th2.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					let dependingActivities = fetch("getDependingActivities?systemIRI="+ systemIRI+"&entityIRI="+details[i]['entity']);
					dependingActivities.then(
							(data) => {
								return data.json();
							}).then(details => {
								let th3 = document.createElement('th');
								console.log ("dependancies");
								console.log (details);
								for (let i =0; i <details.length; i++) {
								let span = document.createElement('span');
								span.innerHTML=replaceRainsPrefix(details[i]['stepType']);
								span.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,details[i]['stepType']) });
								th3.appendChild(span);
								}
								
								
								
								
								let tr = document.createElement('tr'); 
								tr.append(th);
								tr.append(th2);
								tr.append(th3);
								tableBody.append(tr);
					
							}).catch(
					    		        // Log the rejection reason
					    			       (reason) => {   			    	 
					    			            console.log('Handle rejected promise find dependent activities in execution traces ('+reason+') here.');
					    			           
					    			        });
					
					
					
					
				}
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}
*/

function getAgentsParticipationDetailsInExecutionTraces (systemIRI,agentIRI) {

	let details = fetch("getAgentsParticipationDetailsInExecutionTraces?systemIRI="+ systemIRI+"&agentIRI="+agentIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log("RESULT getAgentsParticipationDetailsInExecutionTraces ");
let resultObjectDependentActionsMerged = [];
				


let dependentAccountableActions = {};

let activityOutputsCounter = {};
				
				for (let i=0;i<details.length;i++ ) {
					
					
					resultObjectDependentActionsMerged[i] = {};
					resultObjectDependentActionsMerged[i]['accountableAction'] = details[i].accountableAction;
					resultObjectDependentActionsMerged[i]['accountableActionLabel'] = details[i].accountableActionLabel;
					resultObjectDependentActionsMerged[i]['accountableActionType'] = details[i].accountableActionType;
					resultObjectDependentActionsMerged[i]['wasassociatedWith'] = details[i].agent;
					resultObjectDependentActionsMerged[i]['accountableObject'] = details[i].accountableObject;
					resultObjectDependentActionsMerged[i]['accountableObjectLabel'] = details[i].accountableObjectLabel;
					resultObjectDependentActionsMerged[i]['accountableResult'] = details[i].accountableResult;
					resultObjectDependentActionsMerged[i]['activity'] = details[i].activity;
					resultObjectDependentActionsMerged[i]['infoRealization'] = details[i].infoRealization;
					resultObjectDependentActionsMerged[i]['accountableResultType'] = details[i].accountableResultType;
					resultObjectDependentActionsMerged[i]['accountableResultLabel'] = details[i].accountableResultLabel;
					resultObjectDependentActionsMerged[i]['dependentAccountableActions'] = [];
					resultObjectDependentActionsMerged[i]['reused'] = details[i].reused;
					
					if (activityOutputsCounter[details[i].accountableAction]==null) {
						activityOutputsCounter[details[i].accountableAction] = new Set ();
					}
					activityOutputsCounter[details[i].accountableAction].add(details[i].accountableResult);
					
					if (details[i].dependentAccountableActionActivity!=null) {
						
						let dependentActionDetails = {};
						dependentActionDetails.dependentAccountableActionActivity =  details[i].dependentAccountableActionActivity; 
						dependentActionDetails.dependentAccountableActionLabel =  details[i].dependentAccountableActionLabel; 
						dependentActionDetails.dependentAccountableActionType =  details[i].dependentAccountableActionType; 
						
					if (dependentAccountableActions[details[i].accountableAction]==null) {
						dependentAccountableActions[details[i].accountableAction] = [];
					}
					dependentAccountableActions[details[i].accountableAction].push(dependentActionDetails);	
					
					}
					
				}
				
				
				console.log(resultObjectDependentActionsMerged);
				
				let tableBody = document.getElementById ('agent_result_body');
				tableBody.innerHTML="";
				
				let outputsSeen = [];
				let activitiesSeen = [];
				
				
				let counter = 1; 
				for (let x=0; x< resultObjectDependentActionsMerged.length;x++) {
					let value = resultObjectDependentActionsMerged[x];
					if (outputsSeen.includes(value.infoRealization)) {
						continue;
					}
					
					let rowNumb = document.createElement('th');
					rowNumb.innerHTML=counter;
				
					
					let th = document.createElement('td');
					
					
					
					let th5 = document.createElement('td');
					
					
					
					
					//th.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.accountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> "+ replaceRainsPrefix(value.accountableActionType)+"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong> "+ replaceDataInstancePrefix(value.activity) +"</div> ";
					let addcolumns=false;
					if (!activitiesSeen.includes(value.activity)) {
					
					th.rowSpan =activityOutputsCounter[value.accountableAction].size;
					th.innerHTML = `<div  class="instanceTraceWidget"> ${value.accountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableActionType)}"></i>)</div> ` 
					th.addEventListener("click", function(event){ 					
						resultClickHighlighterRocessPane(event);	
						getActivityDetailsInExecutionTraces (systemIRI,value.activity, "AgentView") 
					
					});
					activitiesSeen.push(value.activity);
					
					
					
					
					
				

				    th5.rowSpan =activityOutputsCounter[value.accountableAction].size;
				    th5.innerHTML=` <div  class="instanceTraceWidget"> ${value.accountableObjectLabel.replaceAll("\"","")} </div> `
					
				
					
					addcolumns=true;
					}
					
					let th2 = document.createElement('td');
					//	th2.innerHTML="<div class=\"planWidget\"> <h5>"+value.accountableResultLabel.replaceAll("\"","") + "<br> <span style=\"background:black;color:white; \">[" + replaceRainsPrefix(value.accountableResultType) +"]</span></h5></div><div class=\"executionTraceWidget\" ><strong> Corresponding Entity IRI: </strong>"+ replaceDataInstancePrefix(value.infoRealization)+"</div> ");
						th2.innerHTML = ` <div  class="resultsEntityTraceWidget"> ${value.accountableResultLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(value.accountableResultType)}"></i>)</div> `
						th2.addEventListener("click", function(){ 
							resultClickHighlighterRocessPane(event);	
							getOutputDetailsInExecutionTraces (systemIRI,value.infoRealization, "AgentView") });
						outputsSeen.push(value.infoRealization)
						
						
						let th3 = document.createElement('td');
						console.log(value.dependentAccountableActions)
						
						let span = document.createElement('span');
						th3.append(span);
						console.log("creating span")
						console.log(dependentAccountableActions)
						console.log(value.accountableAction)
						if (dependentAccountableActions[value.accountableAction]!=null) { 
							
							for (let j=0;j< dependentAccountableActions[value.accountableAction].length; j++ ) {
								console.log("creating span - loop")
							 
													
								span.innerHTML = `${span.innerHTML} <div  class="instanceTraceWidget"> ${dependentAccountableActions[value.accountableAction][j].dependentAccountableActionLabel.replaceAll("\"","")} <br>(<i class="fas fa-info" data-toggle="tooltip" title="${replaceRainsPrefix(dependentAccountableActions[value.accountableAction][j].dependentAccountableActionType)}"></i>)</div> `
							    span.addEventListener("click", function(){ 
								resultClickHighlighterRocessPane(event);	
								getActivityDetailsInExecutionTraces (systemIRI,value.dependentAccountableActions[j].dependentAccountableActionActivity,"AgentView") });
								th3.append(span);
							}
						 }
					
							
					
					//th4.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					
					let tr = document.createElement('tr'); 
					
					tr.append(rowNumb);
					if (addcolumns) {
						tr.append(th);
						}
						
						tr.append(th2);
						tr.append(th3);
						if (addcolumns) {
						
						tr.append(th5);
						}
					tableBody.append(tr);
					
					
					counter++;
				}
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}

function replaceDataInstancePrefix (string) {
  return 	string.replace("https://rainsproject.org/InstanceData/","rains-data:")
}

function  createInfoElementDetails (index, stage, detailsInfoElementElementArray) {
	console.log("clicked");
	console.log(index);
	console.log(stage);
	
	for (let i=0;i<detailsInfoElementElementArray.length;i++) {
		if (document.getElementById (stage+'link'+i)!=null) {
		document.getElementById (stage+'link'+i).style = "background:black; color:white;  width:100%;padding-left:15px;"; 
		}
	}
	
	if (document.getElementById (stage+'link'+index)!=null) {
	  document.getElementById (stage+'link'+index).style = "background:#6600cc;  color:white; width:100%;padding-left:15px;"; 
	}
	
	let infoElement = detailsInfoElementElementArray[index];
	
	/*
	let html = "";
	
	html = "<br><strong>IRI:</strong>" + replaceDataInstancePrefix(infoElement.infoElement);
	html += "<br><strong>Name:</strong>" + infoElement.infoElementLabel;
	html += "<br><strong>Comment:</strong>" + infoElement.infoElementComment;
	
	if (infoElement.reused!=null) {
		html += "<br><strong>Reused Object: </strong>" + infoElement.reused.replace ('"','').replace('"^^','');
	}
	
	if (infoElement.isAccountableFor!=null) {
		html += "<br><strong>Accountable For: </strong>" + replaceDataInstancePrefix(infoElement.isAccountableFor);
	}
	*/
	
	let reusedHead = "";
	let reusedTd = ""; 
	
	let sliceHead = ""; 
	let sliceTd = ""; 
	
	let resultUpperBoundHead = ""; 
	let resultUpperBounTd = ""; 
	
	let resultLowerBoundHead = ""; 
	let resultLowerBounTd = ""; 
	
	let decisionThresholdHead = "";
	let  decisionThresholdTd = ""; 
	
	let resultValueHead = "";
	let  resultValueTd = ""; 
	
	let accountableForHead = "";
	let accountableForTd = ""; 
	
	let evalMeasureHead = "";
	let evalMeasureTd = "";
	
	let versionHead = "";
	let versionTd = "";
	
	let versionDateHead = "";
	let versionDateTd = "";
	
	let versionNoteHead = "";
	let versionNoteTd = "";
	
	let seeAlsoHead = "";
	let seeAlsoTd = "";
	
	if (infoElement.seeAlso!=null) {
		seeAlsoHead= `<th  scope="col">See Also</th>`;
		seeAlsoTd =`<td>${infoElement.seeAlso.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.versionNote!=null) {
		versionNoteHead= `<th  scope="col">Version Note</th>`;
		versionNoteTd =`<td>${infoElement.versionNote.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.versionDate!=null) {
		versionDateHead= `<th  scope="col">Version Date</th>`;
		versionDateTd =`<td>${infoElement.versionDate.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.version!=null) {
		versionHead= `<th  scope="col">Version</th>`;
		versionTd =`<td>${infoElement.version.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.reused!=null) {
		reusedHead= `<th  scope="col">Reused</th>`;
		reusedTd =`<td>${infoElement.reused.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.slice!=null) {
		sliceHead= `<th  scope="col">Computed on Slice</th>`;
		sliceTd =`<td>${infoElement.slice.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.decisionThreshold!=null) {
		decisionThresholdHead= `<th  scope="col">Decision Threshold</th>`;
		decisionThresholdTd =`<td>${infoElement.decisionThreshold.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.resultUpperBound!=null) {
		resultUpperBoundHead= `<th  scope="col">Result Upper Bound</th>`;
		resultUpperBounTd =`<td>${infoElement.resultUpperBound.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.resultLowerBound!=null) {
		resultLowerBoundHead= `<th  scope="col">Result Lower Bound</th>`;
		resultLowerBounTd =`<td>${infoElement.resultLowerBound.replaceAll ('"','')}</td>`;
	}
	
	if (infoElement.resultValue!=null) {
		resultValueHead= `<th  scope="col">Result Value</th>`;
		resultValueTd =`<td>${infoElement.resultValue.replaceAll ('"','')}</td>`;
	}
	
	
	if (infoElement.isAccountableFor!=null) {
		accountableForHead = `<th  scope="col">Accountable For</th>`;
		accountableForTd = `<td>${replaceDataInstancePrefix(infoElement.isAccountableFor)}</td>`;
	}
	
	if (infoElement.infoElementLabel==null) {
		infoElement.infoElementLabel ='<i class="fa fa-question-circle"></i>'
	}
	else {
		infoElement.infoElementLabel = infoElement.infoElementLabel.replaceAll("\"","")
	}
	if (infoElement.infoElementComment==null) {
		infoElement.infoElementComment ='<i class="fa fa-question-circle"></i>'
	}
	else{
		infoElement.infoElementComment =infoElement.infoElementComment.replaceAll("\"","")
	}
	
	let img = "";
	if (infoElement.image!=null) {
		img = '<img src="data:image/png;base64,'+infoElement.image.replaceAll("\"","")+'" alt="Result image" ><br>'
	}
	
	let evalMeasure = "";
	evalMeasureIndex = '';
	
	if (infoElement.evaluationMeasure!=null) {
		
		evalMeasureIndex = '';
		for (let j=0;j<detailsInfoElementElementArray.length;j++) {
			if ( detailsInfoElementElementArray[j].infoElement == infoElement.evaluationMeasure) {
				evalMeasureIndex = j;
				break;
			}
		}	
		/*let element = document.createElement('li');
		let span = document.createElement('span');
		element.href='#';
		element.innerHTML ="click here"
		element.addEventListener("click", function() {
			createInfoElementDetails (index, stage, detailsInfoElementElementArray);
		});
		span.append(element)
		evalMeasure = element.outerHTML*/
		//createInfoElementDetails (i, stage, detailsInfoElementElementArray);
		evalMeasureHead= `<th  scope="col">Evaluation Measure</th>`;
		evalMeasureTd = `<td><a href='#' id="evalMeasure${index}"> click here</a></td>`
	}
	
	let mapEvalMeasureToResults = '';
	if (infoElement.infoElementType.includes('EvaluationMeasure')) {
	    elementIRI = infoElement.infoElement; 
	    let seenResults = [];
	    let results = [];
	    for (let j=0;j<detailsInfoElementElementArray.length;j++) {
	    	if (detailsInfoElementElementArray[j].evaluationMeasure!=null&&!seenResults.includes(detailsInfoElementElementArray[j].infoElement)) {
	    		if (detailsInfoElementElementArray[j].evaluationMeasure==elementIRI) {
	    			results.push(j);
	    			seenResults.push(detailsInfoElementElementArray[j].infoElement);
	    		}
	    		
	    	}
	    }
	    mapEvalMeasureToResults = results;
	}
	
	let html = `	
	<table class="table table-dark table-bordered">
     <thead>
      <tr>
      <th scope="col">Name</th>
      <th scope="col">Comment</th>
      ${reusedHead}
      ${accountableForHead}
      ${sliceHead}
      ${decisionThresholdHead}
      ${resultUpperBoundHead}
      ${resultLowerBoundHead}
      ${resultValueHead}
      ${evalMeasureHead}
      ${versionHead}
      ${versionDateHead}
      ${versionNoteHead}
      ${seeAlsoHead}
      </tr>
      </thead>
     <tbody>
     <tr>
     <td>${infoElement.infoElementLabel}</td>
     <td >${infoElement.infoElementComment}</td>
     ${reusedTd}
      ${accountableForTd}
      ${sliceTd}
      ${decisionThresholdTd}
      ${resultUpperBounTd}
      ${resultLowerBounTd}
      ${resultValueTd}
      ${evalMeasureTd}
      ${versionTd}
      ${versionDateTd}
      ${versionNoteTd}
      ${seeAlsoTd}
     </tbody>
     </table>	
      ${img}
         
      </tr>
	`;
	
	if (mapEvalMeasureToResults!='') {
		
		let resultsLinks = '';
		
		for (let x=0;x<mapEvalMeasureToResults.length;x++) {
			resultsLinks = `${resultsLinks} <tr><td><a href='#' id="evalMeasureResult${x}"> click here</a></td></tr>`
		}
		
		if (resultsLinks=='') {
			resultsLinks ='no linked results recorded';
		}
		
		
		html = `${html} 
		<div class="card overflow-auto" style="max-height:300px;">
		<table class="table table-dark table-bordered">
     <thead>
      <tr>
      <th scope="col">Related Evaluation Results</th>
      </tr>
      </thead>
     <tbody>
     ${resultsLinks}
     </tbody>
     </table>	 
     </div> 
		`
	}
	
	document.getElementById ('elementsDetail'+stage).innerHTML = html;
	
	if (infoElement.evaluationMeasure!=null) {
		
	 $('#evalMeasure'+index).click(function() {
		createInfoElementDetails (evalMeasureIndex, stage, detailsInfoElementElementArray);
	 });
	}
	
	if (mapEvalMeasureToResults!='') {		
		for (let x=0;x<mapEvalMeasureToResults.length;x++) {
			console.log('mapping event')
			$('#evalMeasureResult'+x).click(function() {
				createInfoElementDetails (mapEvalMeasureToResults[x], stage, detailsInfoElementElementArray);
			 });
		}
	}
	 
	 
	 
	
}

function getOutputDetailsInExecutionTraces (systemIRI,entityIRI, stage) {
	let details = fetch("getOutputDetailsInExecutionTraces?systemIRI="+ systemIRI+"&infoRealizationIRI="+entityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(data => {
				//data = JSON.stringify(data);
				console.log("This Data");
				console.log(data);
				
				let infoRealization = "";
				let objectDetailsPane = "";
				let stageIndex = 8;
				
				if (stage == "ProcessView") {
					infoRealization = document.getElementById ('informationRelaizationDescProcess');
				    objectDetailsPane = document.getElementById ('object-detailsProcess');
				    stageIndex=0;
				}
				
				if (stage == "AgentView") {
					infoRealization = document.getElementById ('informationRelaizationDesc');
					objectDetailsPane = document.getElementById ('object-details');
					 stageIndex=1;
				}
				
				if (stage == "EntityView") {
					infoRealization = document.getElementById ('informationRelaizationDescEntity');
					objectDetailsPane = document.getElementById ('object-detailsEntity');
					 stageIndex=2;
				}
				
				console.log(stage);
				//document.getElementById ('informationRelaizationDesc').innerHTML = '<div class="row"><div class="col-md-12 list"><strong>Output Description</strong><p>'+data[0].infoRealizationComment+' </p></div></div><hr>';
				
				infoRealization.innerHTML = '<div class="row"><div class="col-md-12 list-group"><div class= "list-group-item list-group-item-secondary"> <h4 class="list-group-item-heading">Output Description</h4><p class="list-group-item-text ">'+data[0].infoRealizationComment+' </p></div><br><br></div>';
				
				objectDetailsPane.innerHTML = '<div class="row"> <div class="col-md-5" id="elementsList'+stage+'"></div><div class="col-md-7" id="elementsDetail'+stage+'" ></div></div>';
				
				let detailsInfoElementElementArray =[];
				
				//let listHTML ="<strong>Information Elements:</strong><br><ul>";
				
				let heading = document.createElement('strong');
				heading.innerHTML = 'Information Elements:<br>'
			    
				let elementList = document.createElement('ul');
					
				let elementTypes = {}
				if (data[0].infoElement!=null) {
					for (let i=0; i<data.length;i++) {
						
						if (elementTypes[data[i].infoElement] ==null) {
							elementTypes[data[i].infoElement] =[];
						}
						elementTypes[data[i].infoElement].push(replaceRainsPrefix(data[i].infoElementType).split(":")[1])
						
					}
				}
				
				console.log(elementTypes)
				
				let seenElements = [];
				
				if (data[0].infoElement!=null) {
				for (let i=0; i<data.length;i++) {
					let label = data[i].infoElementLabel;
					if (label==null) {
						label = '<i class="fa fa-question-circle"></i>';
					}
					else {
						label = data[i].infoElementLabel.replaceAll("\"","");
					}
					if (!seenElements.includes(data[i].infoElement)) {
						let element = document.createElement('li');
						element.id = stage+'link'+i;
						element.innerHTML = '<a  href="#" style="color:white; " >'+label+' - ('+elementTypes[data[i].infoElement]+')</a>';
						element.addEventListener("click", function() {
							createInfoElementDetails (i, stage, detailsInfoElementElementArray);
						});
						//listHTML +='<li id ="'+stage+'link'+i+'" style="color:white; background:black;width:100%;padding-left:15px;"><a  href="#" style="color:white; " >'+label+' - ('+elementTypes[data[i].infoElement]+')</a> </li>';
						elementList.append(element);
					
					seenElements.push(data[i].infoElement)
					
					}
					detailsInfoElementElementArray.push (data[i]);
					
					 
				}
				//listHTML +="</ul>";
				
				document.getElementById ('elementsList'+stage).innerHTML =  "";
				document.getElementById ('elementsList'+stage).append(elementList);
				
				
				createInfoElementDetails (0, stage,detailsInfoElementElementArray);
				}
				else {
					document.getElementById ('elementsDetail'+stage).innerHTML =  "No information elements found";
				}
				
				//let transformArray = [];
				//transformArray.push ({"<>":"div class= \"infoElementBox\"","html":[{"<>":"div","html":[ {"<>":"h5","text":"${infoElementType}"}]});
				//transformArray.push ({"<>":"div class= \"infoElementBox\"","html":[{"<>":"div","html":[ {"<>":"h5","text":"${infoElementType}"}]});
				
				/*
				let detailsDiv ;
				
			    detailsDiv = [
			    	{"<>":"div class= \"infoElementBox\"","html":[
				        {"<>":"div","html":[
				            {"<>":"h5","text":"${infoElementType}"}
				        ]},
				        {"<>":"div","text":"Name: ${infoElementLabel}"},
				        {"<>":"div","text":"Comment: ${infoElementComment}"},
				    ]}];
				console.log(data[0].reused);
				if (data[0].reused!="") {
					detailsDiv = [
				    	{"<>":"div class= \"infoElementBox\"","html":[
					        {"<>":"div","html":[
					            {"<>":"h5","text":"${infoElementType}"}
					        ]},
					        {"<>":"div","text":"Name: ${infoElementLabel}"},
					        {"<>":"div","text":"Comment: ${infoElementComment}"},
					        {"<>":"div","text":"Is Reused Object: ${reused}"}
					    ]}];
				}
				
				let transforms = {
					    "list":{"<>":"ul","html":function(){
					        return($.json2html(data,transforms.items));   
					    }},
					    
					    "items":{"<>":"li class=\"infoElement\" ","html":function(obj,index){
					                return( replaceRainsPrefix (obj.infoElementType));
					            },"onclick":function(e){
					        $("#object-details .details").empty().json2html(e.obj,transforms.details);
					    }},
					    
					    "details":detailsDiv
					};
				
				
               let objectDetailsPane = document.getElementById ('object-details');
				
				objectDetailsPane.innerHTML = '<div class="row"><div class="col-md-4 list"></div><div class="col-md-6 details"></div></div> ';
				
				$("#object-details .list").json2html({},transforms.list);
				let transformedHTML = objectDetailsPane.innerHTML; 
				*/
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}


function getActivityDetailsInExecutionTraces (systemIRI,activityIRI, stage) { 
	
	let details = fetch("getActivityDetailsInExecutionTraces?systemIRI="+ systemIRI+"&activityIRI="+activityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log(details);
				
				let constraintsHtml = ''
			    
					//check if we found some constraints as well
			    for (let i=0;i < details.length;i++) {
			    	if (details[i].constraint!=null) {
			    		let constraintType = '';
			    		if (details[i].constraintType.includes('Human')) {
			    			constraintType = 'Human Validated'
			    		}
			    		
			    		if (details[i].constraintType.includes('Auto')) {
			    			constraintType = 'Auto Validated'
			    		}
			    		
			    		let constraintResult = 'no result?';
			    		if (details[i].constraintresult.includes('satisfied')) {
			    			constraintResult = '<span style="color:darkgreen">OK</span>';
			    		}
                        if (details[i].constraintresult.includes('violated')) {
                        	constraintResult = '<span style="color:red">FAILED</span>';	
			    		}
			    		
			    		constraintsHtml = `<tr><td>${details[i].constraintLabel}</td><td>${constraintType}</td><td>${details[i].constraintComment}</td><td>${constraintResult}</td> </tr>` 
			    	}
			    }
				
				if (constraintsHtml=='') {
					constraintsHtml= '<td>no constraints found</td>';
				}
				
				let infoRealization = "";
				let objectDetailsPane = "";
				
				if (stage == "ProcessView") {
					infoRealization = document.getElementById ('informationRelaizationDescProcess');
				    objectDetailsPane = document.getElementById ('object-detailsProcess');
				}
				
				if (stage == "AgentView") {
					infoRealization = document.getElementById ('informationRelaizationDesc');
					objectDetailsPane = document.getElementById ('object-details');
				}
				
				if (stage == "EntityView") {
					infoRealization = document.getElementById ('informationRelaizationDescEntity');
					objectDetailsPane = document.getElementById ('object-detailsEntity');
				}
				
				infoRealization.innerHTML = '<div class="row"><div class="col-md-12 list-group"><div class= "list-group-item list-group-item-secondary"> <h4 class="list-group-item-heading">Action Description</h4><p class="list-group-item-text ">'+details[0].stepComment+' </p></div></div></div>';
				
				let startParts = [];
				if (details[0].start!=null) {
				   startParts = details[0].start.replace ('"','').replace('"^^','').split("T");
				}
				else {
				   startParts[0]= 'no record found';
				   startParts[1]= 'no record found';
				}
				
				let endParts = [];
				if (details[0].end!=null) {	
					endParts= details[0].end.replace ('"','').replace('"^^','').split("T");
				}
				else {
					endParts[0]= 'no record found';
					endParts[1]= 'no record found';
					}
				
				let lifeCycleStage = "";
				
				if (details[0].planType.includes('DesignStageAccountabilityPlan') ) {
					lifeCycleStage = "Design";
				}
				if (details[0].planType.includes('ImplementationStageAccountabilityPlan') ) {
					lifeCycleStage = "Implementation";
				}
				if (details[0].planType.includes('DeploymentStageAccountabilityPlan') ) {
					lifeCycleStage = "Deployment";
				}
				if (details[0].planType.includes('OperationStageAccountabilityPlan') ) {
					lifeCycleStage = "Operation";
				}
				
				let html = `
				           <table class="table">
							<thead>
								<tr>
								<th scope="col">Start</th>
								<th scope="col">End</th>
								<th scope="col">Life Cycle Stage</th>
								<th scope="col">Accountable Agents</th>
								</tr>
							</thead>
							 <tbody>
							 <td><i class="fas fa-calendar-alt"> </i> ${startParts[0]}<br><i class="fas fa-clock"> </i> ${startParts[1]} </td>
							  <td><i class="fas fa-calendar-alt"> </i> ${endParts[0]}<br><i class="fas fa-clock"> </i> ${endParts[1]} </td>
							  <td>${lifeCycleStage} </td>
							  <td><span class="agentWidgetTable">${replaceRainsPrefix(details[0].agent)}</span> </td>
							 </tbody>
							 </table>
							
							 <table class="table">
							<thead>
								<tr>
								<th scope="col">Constraint</th>
								<th scope="col">Type</th>
								<th scope="col">Comment</th>
								<th scope="col">Complied with?</th>
								</tr>
							</thead>
							 <tbody>
							 ${constraintsHtml}
							 </tbody>
							 </table>
							 
				`
				/*
				let html = "<strong>Start:</strong>" + details[0].start.replace ('"','').replace('"^^','');
				    html += "<br><strong>End:</strong>" + details[0].end.replace ('"','').replace('"^^','');
				    html += "<br><strong>Part of Plan:</strong>" + replaceDataInstancePrefix(details[0].plan);
				    html += "<br><strong>Plan Type:</strong>" + replaceRainsPrefix(details[0].planType);
				    
				    html += "<br><strong>Accountable Agent:</strong>" + replaceRainsPrefix(details[0].agent);
				
				   console.log(details)
				*/
				objectDetailsPane.innerHTML =  html;
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}


//getAgentsParticipationDetailsInExecutionTraces?systemIRI='+ systemIRI&agentIRI='+agentsIRI[i]+