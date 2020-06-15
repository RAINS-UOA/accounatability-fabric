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
	

function getStepComponents (targetElementId, emptystepLibraryMessage, draggable, dragEvent,rootStep) {
	let steps = fetch("/getStepComponentHierarchy");
		steps.then(
	    			(data) => {
	    				
	    				return data.json();
	    			}).then(steps => {
	    			 
	    			  console.log(steps);
	    			  
	    			  let stepArray = steps[context.Step];
	    				
	    			  let htmlSteps ="";
	    			  
	    			  //for (let i=0;i<stepArray.length;i++) {
	    				  htmlSteps = htmlSteps + constructComponentHerarchy (steps, context.Step, draggable, dragEvent, rootStep);
	    			 // }
	    			  if (htmlSteps==="") {
	    				  document.getElementById(emptystepLibraryMessage).innerHTML = ' <div class="alert alert-primary" role="alert"> There are no stored step components in the fabric.</div>';
	    				 
	    			  } 
	    			  else {
	    			  document.getElementById(emptystepLibraryMessage).innerHTML ="";
	    			  document.getElementById(targetElementId).innerHTML = htmlSteps;
	    			  console.log(htmlSteps);
	    			  let toggler = document.getElementsByClassName("caret");
	    			  for (let i = 0; i < toggler.length; i++) {
	    				   toggler[i].addEventListener("click", function() {
	    				     this.parentElement.querySelector(".nested").classList.toggle("active");
	    				     this.classList.toggle("caret-down");
	    				   });
	    				 }
	    			  }
	    			}
	    		).catch(
	    		        // Log the rejection reason
	    			       (reason) => {
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

	function constructComponentHerarchy (componentObject, startComponent,  draggable, dragEvent, rootStep) {
		let html = "";
		console.log(startComponent + ": " +componentObject[startComponent] );
		if (componentObject[startComponent] !=null) {
		 let childElementsArray = componentObject[startComponent];
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
			
			 //ignore the root step
			 if (rootStep && nestedElement!="")  {
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