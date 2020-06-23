/**
 * 
 * @param parameterName
 * @returns
 */
function findGetBase64Parameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = atob(decodeURIComponent(tmp[1]));
    }
    return result;
}

function generateHumanTasksLinks(planIRI, systemIRI) {
	console.log(planIRI);
	let tasks = fetch("createHumanProvenaceGenerationTask?planIRI="+encodeURIComponent(btoa(planIRI)) +"&systemIRI="+ encodeURIComponent(btoa(systemIRI)));
	tasks.then(
			(data) => {
				
				fetchHumanTasks (planIRI );
			}
    		).catch(
    		        // Log the rejection reason
    			       (reason) => {   			    	 
    			            console.log('Handle rejected promise ggenerateHumanTasksLinks ('+reason+') here.');
    			           
    			        });
	console.log (planIRI);
}

function fetchHumanTasks (planIRI ) {
	
	let tasks = fetch("/getHumanProvenaceGenerationTasksForPlan?planIRI="+encodeURIComponent(btoa(planIRI)));
	tasks.then(
    			(data) => {
    				
    				return data.json();
    			}).then(tasks => {
    			
    			console.log(tasks);
    			
    			if (tasks.length >0 ) {
    				for (let i=0;i<tasks.length;i++) {
    					document.getElementById ('taskTableBody').innerHTML	= '<tr> <th scope="row">'+i+'</th> <td>'+tasks[i]['agentIRI']+'</td><td>'+tasks[i]['executiontraceBundleIRI']+'</td><td>'+tasks[i]['status']+'</td><td><a href="/createProvenanceTrace?token='+tasks[i]['token']+'" target="_blank">click to complete task</a></td></tr>';
    				}
    			}
    			
    			else {
    				document.getElementById ('taskTableMessage').innerHTML = '<div class="alert alert-primary" role="alert">No tasks have been generated for this plan</div> <button  class="btn btn-primary"  onclick="generateHumanTasksLinks(\''+findGetBase64Parameter('planIri')+'\', \''+findGetBase64Parameter('systemIri')+'\')"> Generate Provenance Collection Tasks</button>';
    			}
    			
    			
    			}
	    		).catch(
	    		        // Log the rejection reason
	    			       (reason) => {
	    			    	 
	    			            console.log('Handle rejected promise fetchHumanTasks ('+reason+') here.');
	    			           
	    			        });
	
}