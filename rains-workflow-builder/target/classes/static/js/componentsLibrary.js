var counterAddedSteps = 1;


function toggle () {	
	    this.parentElement.querySelector(".nested").classList.toggle("active");
	    this.classList.toggle("caret-down");	
}

function addLink(id) {
		
		let li = document.createElement('li');
		counterAddedSteps++;
		
		let carret = document.createElement('span');
		li.append(carret);
		carret.className = "caret";
		carret.innerHTML = "new";
		document.getElementById(id).append(li);
		let ul = document.createElement('ul');
		ul.className = "nested container";
		ul.id = counterAddedSteps;
		li.append(ul);
		let button = document.createElement('button');
		
		button.innerHTML = "Add Field";
		let string = 'addLink('+counterAddedSteps+' )';
		button.setAttribute('onclick',string);
		
		button.className="bottom_list"
		ul.append(button);
		carret.addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
	}	
	

function getVariableComponents (targetElementId, emptystepLibraryMessage) {
	 setSpinnerComponents ('loaderVariables', 'contentVariables');
	let steps = fetch("/getVariableComponentHierarchy");
		steps.then(
	    			(data) => {
	    				
	    				return data.json();
	    			}).then(steps => {
	    			  
	    			  let stepArray = steps[context.Step];
	    				
	    			  let html ="";
	    			  
	    			  //for (let i=0;i<stepArray.length;i++) {
	    			   
	    			    	  html = html + constructVariablesComponentHierarchy (steps, context.MultiVariable); 
	    			      
	    			 // }
	    			  if (html==="") {
	    				  document.getElementById(emptystepLibraryMessage).innerHTML = ' <div class="alert alert-primary" role="alert"> There are no stored ep-plan:Variable components in the fabric.</div>';
	    				 
	    			  } 
	    			  else {
	    			  document.getElementById(emptystepLibraryMessage).innerHTML ="";
	    			  document.getElementById(targetElementId).innerHTML = html;
	    			  
	    			  //this needs to be redone because at the moment this needs to be called only once after all html elements for steps and variables have been created - need to come back to this
	    			  //activateToggling ();
	    			 
	    			  }
	    			  hideSpinnerComponents ('loaderVariables', 'contentVariables');
	    			}
	    		).catch(
	    		        // Log the rejection reason
	    			       (reason) => {
	    			    	   hideSpinnerComponents ('loaderVariables', 'contentVariables');
	    			            console.log('Handle rejected promise getting variables components ('+reason+') here.');
	    			           	    			        });
		
}

function activateToggling () {
	 let toggler = document.getElementsByClassName("caret");
	  for (let i = 0; i < toggler.length; i++) {
		   toggler[i].addEventListener("click", function() {
		     this.parentElement.querySelector(".nested").classList.toggle("active");
		     this.classList.toggle("caret-down");
		   });
		 }
}

function getStepComponents (targetElementId, emptystepLibraryMessage, draggable, dragEvent,rootStep) {
	 setSpinnerComponents ('loaderSteps', 'contentSteps');
	let steps = fetch("/getStepComponentHierarchy");
		steps.then(
	    			(data) => {
	    				
	    				return data.json();
	    			}).then(steps => {
	    			 
	    			  console.log(steps);
	    			  
	    			  let stepArray = steps[context.Step];
	    				
	    			  let htmlSteps ="";
	    			  
	    			  //for (let i=0;i<stepArray.length;i++) {
	    			      if (rootStep!=null) {
	    				  htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.MultiStep, draggable, dragEvent, rootStep, true);
	    			      }
	    			      //alway order design, implementation, deployment, operation - TO DO this is lazy approach as it will make the constructComponentHerarchy run 4 times -> improve in the future
	    			      else {
	    			    	  //htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.Step, false,null, context.DesigStep, false);
	    			    	  //htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.Step, false, null, context.ImplementationStep, false);
	    			    	  //htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.Step, false, null, context.DeploymentStep, false);
	    			    	  //htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.Step, false, null, context.OperationStep, false);
	    			    	  
	    			    	  htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.MultiStep, false,null, context.AccountableAction, false);
	    			    	 

	    			    	  
	    			      }
	    			 // }
	    			  if (htmlSteps==="") {
	    				  document.getElementById(emptystepLibraryMessage).innerHTML = ' <div class="alert alert-primary" role="alert"> There are no stored ep-plan:Step components in the fabric.</div>';
	    				 
	    			  } 
	    			  else {
	    			  document.getElementById(emptystepLibraryMessage).innerHTML ="";
	    			  document.getElementById(targetElementId).innerHTML = htmlSteps;
	    			  
	    			  activateToggling ();
	    			  //console.log(htmlSteps);
	    			  /*
	    			  let toggler = document.getElementsByClassName("caret");
	    			  for (let i = 0; i < toggler.length; i++) {
	    				   toggler[i].addEventListener("click", function() {
	    				     this.parentElement.querySelector(".nested").classList.toggle("active");
	    				     this.classList.toggle("caret-down");
	    				   });
	    				 }
	    			  */
	    			  }
	    			  hideSpinnerComponents ('loaderSteps', 'contentSteps');
	    			}
	    		).catch(
	    		        // Log the rejection reason
	    			       (reason) => {
	    			    	   hideSpinnerComponents ('loaderSteps', 'contentSteps');
	    			            console.log('Handle rejected promise getting steps components ('+reason+') here.');
	    			           
	    			        });
		
 }




 
//for IRIs with #
    function replaceForNameSpace (str) {
    	let withPrefix="";
    	let passedHash = false;
    	
    	for (let j=str.length-1; j >0 ; j--) {
    		
    		if (str[j] === "#" && !passedHash) {
    			passedHash = true;
    			withPrefix = withPrefix.concat(" :");
    			console.log(withPrefix);
    		} 
    		else {
    		if (passedHash === true) {
    			if (str[j] === "/") {
    				break;
    			}
    			withPrefix =withPrefix.concat(str[j]);
    			
    		}
    		else {
    			withPrefix =withPrefix.concat(str[j]);
    			
    		}
    		}
    	}
    	
    	return withPrefix.split("").reverse().join("");
    }

	function constructComponentHerarchy (componentObject, topLevelClass,  draggable, dragEvent, rootStep, ignoreRootStep) {
		let html = "";
		
		if (componentObject[topLevelClass] !=null) {
		 let childElementsArray = componentObject[topLevelClass];
		 let dragProperty = "";
	     if (draggable==true) {
	    	 dragProperty = 'draggable="true" ondragstart="'+dragEvent+'"';	
	     }
		 for (let i=0;i<childElementsArray.length;i++) {
			 console.log("Comparing rootstep " + rootStep + " with "+childElementsArray[i]);
			
			 //when we only need a subset of steps (e.g. in workflow builder skip the others
			 if (rootStep && rootStep !=childElementsArray[i]) {
				 continue;
			 }
			 
			 let nestedElement = constructComponentHerarchy(componentObject, childElementsArray[i],  draggable, dragEvent);
			
			 //ignore the rootStep step
			 if (ignoreRootStep )  {
				 html =  nestedElement;
			 }
			 
			 else {
				 
			 if (nestedElement!="") {
			 html = html + '<li  ><span id="'+childElementsArray[i]+'" '+dragProperty+' class="caret container typeWidget"   >'+  replaceForNameSpace (childElementsArray[i])+'</span>  <ul    class="nested container"> '+nestedElement+' </ul></li><br>';
			 }
			 else {
				 html = html + '<li class="typeWidget"><span  id="'+childElementsArray[i]+'" '+dragProperty+' class="leaf"   >'+  replaceForNameSpace (childElementsArray[i])+'</span> </li><br>'; 
			 }
			 }
		  }
		}
		return html;
	}
	
	
	function constructVariablesComponentHierarchy (componentObject, topLevelClass) {
		let html = "";
		console.log("Variables:" + componentObject);
		if (componentObject[topLevelClass] !=null) {
		 let childElementsArray = componentObject[topLevelClass];
		
		 for (let i=0;i<childElementsArray.length;i++) {
			
	
			 
			 let nestedElement = constructVariablesComponentHierarchy(componentObject, childElementsArray[i]);
			
				 
			 if (nestedElement!="") {
			 html = html + '<li  ><span id="'+childElementsArray[i]+'"  class="caret container typeWidget"   >'+  replaceForNameSpace (childElementsArray[i])+'</span>  <ul    class="nested container"> '+nestedElement+' </ul></li><br>';
			 }
			 else {
				 html = html + '<li class="typeWidget"><span  id="'+childElementsArray[i]+'"  class="leaf"   >'+  replaceForNameSpace (childElementsArray[i])+'</span> </li><br>'; 
			 }
			 
		  }
		}
		return html;
	}
	
	
	function setSpinnerComponents (spinerId, contentId) {
		document.getElementById(spinerId).style.display = "inline";
		document.getElementById(contentId).style.display = "none";
	}

	function hideSpinnerComponents (spinerId, contentId) {
		document.getElementById(spinerId).style.display = "none";
		document.getElementById(contentId).style.display = "inline";
	}