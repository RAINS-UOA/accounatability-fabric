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
	