
function getAgents (systemIRI) {
let agents = fetch("getAgentsInExecutionTraces?systemIRI="+ systemIRI);
agents.then(
			(data) => {
				
				return data.json();
			}).then(agentsIRI => {
				
				let html = "";
				
				for (let i =0; i <agentsIRI.length; i++) {
					let div = document.createElement('div');
					div.innerHTML = '<div id="agent'+i+'" class="agentWidget"> <a > '+agentsIRI[i] + ' </a></div>';
					document.getElementById ("agent_pane").append(div);
					$('#agent'+i).click(function() {
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
	
	return (string.replace(rainsPlanPrefix, "rains:"))
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
				console.log(details);
				
				let resultObjectDependentActionsMerged = {};
				
				for (let i=0;i<details.length;i++ ) {
					
					if (resultObjectDependentActionsMerged[details[i].accountableAction]==null ) {
					resultObjectDependentActionsMerged[details[i].accountableAction] = {};
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableAction'] = details[i].accountableAction;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableActionLabel'] = details[i].accountableActionLabel;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableActionType'] = details[i].accountableActionType;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableObject'] = details[i].accountableObject;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableObjectLabel'] = details[i].accountableObjectLabel;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableResult'] = details[i].accountableResult;
					resultObjectDependentActionsMerged[details[i].accountableAction]['activity'] = details[i].activity;
					resultObjectDependentActionsMerged[details[i].accountableAction]['infoRealization'] = details[i].infoRealization;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableResultType'] = details[i].accountableResultType;
					resultObjectDependentActionsMerged[details[i].accountableAction]['accountableResultLabel'] = details[i].accountableResultLabel;
					resultObjectDependentActionsMerged[details[i].accountableAction]['dependentAccountableActions'] = [];
					
					if (details[i].dependentAccountableAction!=null) {
					
					let dependentActionDetails = {};
					dependentActionDetails.dependentAccountableActionActivity =  details[i].dependentAccountableActionActivity; 
					dependentActionDetails.dependentAccountableActionLabel =  details[i].dependentAccountableActionLabel; 
					dependentActionDetails.dependentAccountableActionType =  details[i].dependentAccountableActionType; 
					
					resultObjectDependentActionsMerged[details[i].accountableAction]['dependentAccountableActions'].push(dependentActionDetails);
					
					}
					
					}
					else {
						
						if (details[i].dependentAccountableAction!=null) {
							let dependentActionDetails = {};
							dependentActionDetails.dependentAccountableActionActivity =  details[i].dependentAccountableActionActivity; 
							dependentActionDetails.dependentAccountableActionLabel =  details[i].dependentAccountableActionLabel; 
							dependentActionDetails.dependentAccountableActionType =  details[i].dependentAccountableActionType; 
							
							resultObjectDependentActionsMerged[details[i].accountableAction]['dependentAccountableActions'].push(dependentActionDetails);
							
							}
						
					}
					
					
				}
				
				
				console.log(resultObjectDependentActionsMerged);
				
				let tableBody = document.getElementById ('agent_result_body');
				tableBody.innerHTML="";
				
				for (const [key, value] of Object.entries(resultObjectDependentActionsMerged)) {
					
					let th = document.createElement('td');
					th.innerHTML="<strong>Label:</strong> "+value.accountableActionLabel + "<br><strong> Activity IRI:</strong> "+ replaceDataInstancePrefix(value.activity) +"<br><strong>Action type:</strong> "+ replaceRainsPrefix(value.accountableActionType);
					th.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,value.activity) });
					
					let th2 = document.createElement('td');
					th2.innerHTML=value.accountableResultLabel + "<br>" + replaceDataInstancePrefix(value.infoRealization) +"<br>"+ replaceRainsPrefix(value.accountableResultType);
					th2.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,value.infoRealization) });
					
					let th3 = document.createElement('td');
					console.log(value.dependentAccountableActions)
					for (let j=0;j<value.dependentAccountableActions.length; j++ ) {
						console.log("creating span")
					let span = document.createElement('span');
					
					span.innerHTML=value.dependentAccountableActions[j].dependentAccountableActionLabel + "<br>" + replaceDataInstancePrefix(value.dependentAccountableActions[j].dependentAccountableActionActivity) +"<br>"+ replaceRainsPrefix(value.dependentAccountableActions[j].dependentAccountableActionType)+"<br>";
					span.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,value.dependentAccountableActions[j].dependentAccountableActionActivity) });
					
					th3.append(span);
					}
					
					let th4 = document.createElement('td');
					th4.innerHTML=value.accountableObjectLabel ;
					//th4.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					
					let tr = document.createElement('tr'); 
					tr.append(th);
					tr.append(th2);
					tr.append(th3);
					tr.append(th4);
					tableBody.append(tr);
				
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

function getOutputDetailsInExecutionTraces (systemIRI,entityIRI) {
	let details = fetch("getOutputDetailsInExecutionTraces?systemIRI="+ systemIRI+"&infoRealizationIRI="+entityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(data => {
				//data = JSON.stringify(data);
				console.log(data);
				
				
				let transforms = {
					    "list":{"<>":"ul","html":function(){
					        return($.json2html(data,transforms.items));   
					    }},
					    
					    "items":{"<>":"li","html":function(obj,index){
					                return( replaceRainsPrefix (obj.infoElementType));
					            },"onclick":function(e){
					        $("#object-details .details").empty().json2html(e.obj,transforms.details);
					    }},
					    
					    "details":[
					        {"<>":"div","html":[
					            {"<>":"h5","text":"${infoElementType}"}
					        ]},
					        {"<>":"div","text":"Name: ${infoElementLabel}"},
					        {"<>":"div","text":"Comment: ${infoElementComment}"},
					    ]
					};
				
				
               let objectDetailsPane = document.getElementById ('object-details');
				
				objectDetailsPane.innerHTML = '<div class="row"><div class="col-md-4 list"></div><div class="col-md-4 details"></div></div> ';
				$("#object-details .list").json2html({},transforms.list);
				
				
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}


function getActivityDetailsInExecutionTraces (systemIRI,activityIRI) { 
	
	let details = fetch("getActivityDetailsInExecutionTraces?systemIRI="+ systemIRI+"&activityIRI="+activityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log(details);
				
				let objectDetailsPane = document.getElementById ('object-details');
				
				objectDetailsPane.innerHTML = JSON.stringify(details);
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}


//getAgentsParticipationDetailsInExecutionTraces?systemIRI='+ systemIRI&agentIRI='+agentsIRI[i]+