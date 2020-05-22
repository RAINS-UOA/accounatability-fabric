package uoa.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import uoa.model.components.NewSystemForm;
import uoa.web.handlers.SystemRecordManager;

@Controller
public class ServiceController {

	
	
	@GetMapping("/")
	public String index(Model model) {
		
		return "index";
	}
	
	@GetMapping("/systems")
	public String systemLibrary(Model model) {
		
		SystemRecordManager manager = new SystemRecordManager();
		System.out.println("System IDS");	
		System.out.println(manager.getStoredSystemsIRI());	
		System.out.println("System IDS");
		model.addAttribute("systems", manager.getStoredSystemsIRI());
		manager.shutdown();
		return "systemLibrary";
	}
	
	@PostMapping("/systems")
	public String systemLibraryNewSystemAdded(@ModelAttribute NewSystemForm newSystem) {
		
		SystemRecordManager manager = new SystemRecordManager();
		manager.addSystemInfo(newSystem); 
		System.out.println(newSystem.getIri());
		manager.shutdown();
		//System.out.println(manager.getStoredSystemsIRI());
		
		return "redirect:/systems";
	}
	

	@GetMapping("/createSystemForm")
	public String addSystem(Model model) {
		model.addAttribute("newSystem", new NewSystemForm());
		return "createSystemForm";
	}
	
	
	
	
	
}
