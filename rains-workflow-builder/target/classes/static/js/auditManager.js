
function getAgents (systemIRI) {
let agents = fetch("getAgentsInExecutionTraces?systemIRI="+ systemIRI);
agents.then(
			(data) => {
				
				return data.json();
			}).then(agentsIRI => {
				
				let html = "";
				
				for (let i =0; i <agentsIRI.length; i++) {
					let div = document.createElement('div');
					div.innerHTML = '<div id="agent'+i+'" class="agentWidget"> <a > '+replaceRainsPrefix(agentsIRI[i]) + ' </a></div>';
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
					resultObjectDependentActionsMerged[details[i].accountableAction]['reused'] = details[i].reused;
					
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
				let counter = 1; 
				for (const [key, value] of Object.entries(resultObjectDependentActionsMerged)) {
					
					let rowNumb = document.createElement('th');
					rowNumb.innerHTML=counter;
				
					
					let th = document.createElement('td');
					th.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.accountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> "+ replaceRainsPrefix(value.accountableActionType)+"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong> "+ replaceDataInstancePrefix(value.activity) +"</div> ";
					th.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,value.activity) });
					
					let th2 = document.createElement('td');
					th2.innerHTML="<div class=\"planWidget\"><strong>Result Name:</strong> "+value.accountableResultLabel + "</div><div class=\"planWidget\" ><strong>Result type: </strong>" + replaceRainsPrefix(value.accountableResultType +"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Entity IRI: </strong>"+ replaceDataInstancePrefix(value.infoRealization)+"</div> ");
					th2.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,value.infoRealization) });
					
					let th3 = document.createElement('td');
					console.log(value.dependentAccountableActions)
					for (let j=0;j<value.dependentAccountableActions.length; j++ ) {
						console.log("creating span")
					let span = document.createElement('span');
					
					span.innerHTML="<div class=\"planWidget\"><strong>Action Name:</strong> "+value.dependentAccountableActions[j].dependentAccountableActionLabel + "</div><div class=\"planWidget\" ><strong>Action type:</strong> " +replaceRainsPrefix(value.dependentAccountableActions[j].dependentAccountableActionType)  +"</div><div class=\"executionTraceWidget\" ><strong> Corresponding Activity IRI: </strong>"+replaceDataInstancePrefix(value.dependentAccountableActions[j].dependentAccountableActionActivity) +"</div> ";
					span.addEventListener("click", function(){ getActivityDetailsInExecutionTraces (systemIRI,value.dependentAccountableActions[j].dependentAccountableActionActivity) });
					
					th3.append(span);
					}
					
					let th4 = document.createElement('td');
					th4.innerHTML="<div class=\"planWidget\"><strong>Accountable Object Name:</strong> "+value.accountableObjectLabel+ "</div><div class=\"executionTraceWidget\" ><strong> Object IRI: </strong>"+replaceDataInstancePrefix(value.accountableObject) +"</div> ";
					//th4.addEventListener("click", function(){ getOutputDetailsInExecutionTraces (systemIRI,details[i]['entity']) });
					
					
					let tr = document.createElement('tr'); 
					
					tr.append(rowNumb);
					tr.append(th);
					tr.append(th2);
					tr.append(th3);
					tr.append(th4);
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

function  createInfoElementDetails (index) {
	console.log("clicked");
	
	for (let i=0;i<detailsInfoElementElementArray.length;i++) {
		document.getElementById ('link'+i).style = "background:white;  width:100%;padding-left:15px;"; 
	}
	document.getElementById ('link'+index).style = "background:#e6eefa;  width:100%;padding-left:15px;"; 
	
	let infoElement = detailsInfoElementElementArray[index];
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
	
	document.getElementById ('elementsDetail').innerHTML = html; 
}

function getOutputDetailsInExecutionTraces (systemIRI,entityIRI, infoRealizationComment) {
	let details = fetch("getOutputDetailsInExecutionTraces?systemIRI="+ systemIRI+"&infoRealizationIRI="+entityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(data => {
				//data = JSON.stringify(data);
				console.log("This Data");
				console.log(data);
				
				document.getElementById ('informationRelaizationDesc').innerHTML = '<div class="row"><div class="col-md-12 list"><strong>Output Description</strong><p>'+data[0].infoRealizationComment+' </p></div></div><hr>';
				
				document.getElementById ('object-details').innerHTML = '<div class="row"> <div class="col-md-5" id="elementsList"></div><div class="col-md-6" id="elementsDetail" style="background:#e0e0eb"></div></div>';
				
				detailsInfoElementElementArray =[];
				
				let listHTML ="<strong>Information Elements:</strong><br><ul>";
				if (data[0].infoElement!=null) {
				for (let i=0; i<data.length;i++) {
					listHTML +='<li id ="link'+i+'"><a  href="#" onclick="createInfoElementDetails ('+i+')">'+replaceRainsPrefix(data[i].infoElementType)+'</a></li>';
					
					detailsInfoElementElementArray.push (data[i]); 
				}
				listHTML +="</ul>";
				
				document.getElementById ('elementsList').innerHTML =  listHTML;
				
				
				createInfoElementDetails (0);
				}
				else {
					document.getElementById ('elementsDetail').innerHTML =  "No information elements found";
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


function getActivityDetailsInExecutionTraces (systemIRI,activityIRI) { 
	
	let details = fetch("getActivityDetailsInExecutionTraces?systemIRI="+ systemIRI+"&activityIRI="+activityIRI);
	details.then(
			(data) => {
				
				return data.json();
			}).then(details => {
				
				console.log(details);
				
				document.getElementById ('informationRelaizationDesc').innerHTML = '<div class="row"><div class="col-md-12 list"><strong>Action Description</strong><p>'+details[0].stepComment+' </p></div></div>';
				
				let objectDetailsPane = document.getElementById ('object-details');
				
				let html = "<strong>Start:</strong>" + details[0].start.replace ('"','').replace('"^^','');
				    html += "<br><strong>End:</strong>" + details[0].end.replace ('"','').replace('"^^','');
				    html += "<br><strong>Part of Plan:</strong>" + replaceDataInstancePrefix(details[0].plan);
				    html += "<br><strong>Plan Type:</strong>" + replaceRainsPrefix(details[0].planType);
				
				   console.log(details)
				objectDetailsPane.innerHTML =  html;
				
				
				
			})
			.catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise find agents details in execution traces ('+reason+') here.');
    			           
    			        });
}


//getAgentsParticipationDetailsInExecutionTraces?systemIRI='+ systemIRI&agentIRI='+agentsIRI[i]+