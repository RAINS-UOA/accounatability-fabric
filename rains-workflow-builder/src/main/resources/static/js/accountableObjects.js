function addAccountableObjectTo (objectReference) {
	console.log("add new object to "+ atob(objectReference));
	document.getElementById('accountableObjectImpacts').value = atob(objectReference);
	document.getElementById('accountableObjectLabel').value = "";
	 document.getElementById('accountableObjectComment').value ="";
	
}

function setAccountableObject () {
	let accountableObject = {}; 
	accountableObject ['@id'] = dataPrefix+ uuidv4();
	accountableObject ['@type'] = [];
	accountableObject ['@type'].push (context.AccountableObject);
	accountableObject ['impacts'] = document.getElementById('accountableObjectImpacts').value; 
	if ( document.getElementById('accountableObjectLabel').value!="") {
		accountableObject ['label'] =  document.getElementById('accountableObjectLabel').value; 
		console.log("saving label " + accountableObject ['label'] )
	}
	else {
		accountableObject ['label'] = "default label"; 
	}
	if ( document.getElementById('accountableObjectComment').value!="") {
		accountableObject ['comment'] =  document.getElementById('accountableObjectComment').value; 
	}
	else {
		accountableObject ['comment'] = "default comment"; 
	}
	
	console.log("saving Accountable Object"); 
	console.log(generateJsonLDpayload (context,accountableObject));
	fetch('/saveAccountableObject', {
	    method: 'post',
	    headers: {
	      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
	    },
	    body: 'payload='+generateJsonLDpayload (context,accountableObject)
	  })
	  .then((data) => {
			return data.json();
		})
	  .then(function (data) {
	    console.log('Request succeeded with JSON response', data);
	    loadAccountableObjectsInDiv();
	  })
	  .catch(function (error) {
	    console.log('Request failed', error);
	  });
	
	
}

function getAccountableObjects (systemIRI) {
	let objects = new Promise ( function (resolve,reject)
	{
		
    fetch("/getAccountableObjects?systemIRI="+systemIRI).then(
			(data) => {	
				return data.json();
			}).then(accountableObjects => {
				console.log("Accountable Objects Retrieved");
				console.log(accountableObjects);
				resolve( accountableObjects);
			}).catch(
    		        // Log the rejection reason
 			       (reason) => {
 			    	  
 			            console.log('Handle rejected promise getting accountable objects  ('+reason+') here.');
 			           
 			        })});
	return objects;
	
}









function loadAccountableObjectsInDiv () {
	
	let objetResult = getAccountableObjects (document.getElementById("systemIRI").value); 
	
	objetResult.then(
			(data) => {console.log("fetch accountable objects result");	console.log(data);
			
			//addAccountableObjectTo is in index.html - you need to genrate HTML differently here if you want to add the function definition in this file..
			document.getElementById("MainAddObjectLink").innerHTML = '<li > <div class="col-md-12"><a href="#" data-toggle="modal" data-target="#accountableObjectModal" onclick="addAccountableObjectTo(\''+btoa(document.getElementById("systemIRI").value)+'\')"> Add Object</a> </div></li>';

			document.getElementById("AccountableObjects").innerHTML = constructAccountableObjects (data,  document.getElementById("systemIRI").value) ;
			 let toggler = document.getElementsByClassName("caret");
			  for (let i = 0; i < toggler.length; i++) {
				   toggler[i].addEventListener("click", function() {
				     this.parentElement.querySelector(".nested").classList.toggle("active");
				     this.classList.toggle("caret-down");
				   });
				 }
			  
			}
			
			);
}


	

//potential repetition of code in component hierarchy
function constructAccountableObjects (accountableObjects,  parentIR) {
	let html = "";
	 //html =  html + '<li> <a href="#"> Add Object</a> </li>';
	if (accountableObjects[parentIR] !=null) {
	 let childElementsArray = accountableObjects[parentIR];
	 
   
	 
	 //for (let i=0;i<childElementsArray.length;i++) {
		for (const [key, value] of Object.entries(childElementsArray)) {
			
	
		
		 
		 let nestedElement = constructAccountableObjects(accountableObjects, key);

			 
		 //addAccountableObjectTo is defined in index.html - if you need it here then you need to change ho wthe link is created (e.g. add id) and attach listener 
			
		 html = html + '<li  ><span id='+key+'  class="caret container "   >'+  value+'</span>  <ul class="nested container"> <li > <a href="#" data-toggle="modal" data-target="#accountableObjectModal" onclick="addAccountableObjectTo(\''+btoa(key)+'\')" > Add Object</a> </li> '+nestedElement+' </ul></li>';

	  }
	}
	return html;
}