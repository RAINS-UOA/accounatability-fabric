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
        console.log ("decoding");
        console.log (tmp[1]);
        console.log (decodeURIComponent(tmp[1]));
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
    			            console.log('Handle rejected promise createHumanProvenaceGenerationTask ('+reason+') here.');
    			           
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
    					let uploadButton =  `<form method="POST" enctype="multipart/form-data" id="uploadForm" action="/uploadTrace">
    						 <div class="custom-file" style="width:300px; margin-bottom:15px;">
    						   <input type="file" class="custom-file-input" name="file" id="customFile">
    						   <input type="hidden" class="custom-file-input" name="executionTraceBundleIRI" id="executionTraceBundleIRI" value="${tasks[i]['executiontraceBundleIRI']}">
    						   <label class="custom-file-label" for="customFile">Choose file</label>
    						 </div>
    						 <button class="btn btn-primary pull-right" id="uploadButton"  >Upload  (.ttl)</button>	
    								</form>`
    					document.getElementById ('taskTableBody').innerHTML	= '<tr> <th scope="row">'+i+'</th> <td>'+tasks[i]['executiontraceBundleIRI']+'</td><td>'+tasks[i]['status']+'</td><td>'+uploadButton+'</td><td><a href="/createProvenanceTrace?token='+tasks[i]['token']+'" target="_blank">click to complete task</a></td></tr>';
    					document.getElementById ('taskTableMessage').innerHTML = '';
    					
    					 $(".custom-file-input").on("change", function() {
    						  let fileName = $(this).val().split("\\").pop();
    						  $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    						});
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

$("#uploadButton").click(function() {
	 console.log("trying to submit");
	 $("#uploadForm").submit(function(e) {
		
		    e.preventDefault(); // avoid to execute the actual submit of the form.

		    let form = $(this);
		    let url = form.attr('action');
		    console.log("sending");
		    
		    let data = new FormData();
		   
		    
		    data.append('file', jQuery('#customFile')[0].files[0]);
		    data.append('executionTraceBundleIRI', jQuery('#executionTraceBundleIRI').val())
		    
		    $.ajax({
		           type: "POST",
		           
		           url: url,
		           data: data,
		           cache: false,
		           contentType: false,
		           processData: false,
		           method: 'POST',
		           type: 'POST',
		           success: function(data)
		           {
		              alert (data)
		           }
		         });


		});
	});
 
