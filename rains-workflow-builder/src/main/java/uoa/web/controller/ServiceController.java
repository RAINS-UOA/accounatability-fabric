package uoa.web.controller;

import java.util.NoSuchElementException;

import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import uoa.init.graphdb.ConnectionFactory;
import uoa.init.graphdb.GraphDBUtils;
import uoa.model.components.NewSystemForm;
import uoa.model.components.SystemDetails;
import uoa.web.handlers.SystemRecordManager;

@Controller
public class ServiceController {
	Repository repository = GraphDBUtils.getFabricRepository(GraphDBUtils.getRepositoryManager());
	
	private ObjectPool connectionPool = new GenericObjectPool<RepositoryConnection>(new ConnectionFactory(repository));
	
	@GetMapping("/")
	public String index(Model model) {
		
		return "index";
	}
	
	@GetMapping("/home")
	public String home( Model model) {
		return "home";
	}
	
	@GetMapping("/plan")
	public String planDesigner( Model model) {
		model.addAttribute("stage", "Design");
		return "planDesigner";
	}
	
	
	@GetMapping("/system")
	public String systemDetails(@RequestParam String iri, Model model) throws NoSuchElementException, IllegalStateException, Exception {
		SystemRecordManager manager = new SystemRecordManager(connectionPool);
		
		SystemDetails system = manager.getSystemDetails (iri);
		
		
		model.addAttribute("systemDetails", system);
		manager.shutdown();
		
		
		return "systemDetails";
	}
	
	@GetMapping("/systems")
	public String systemLibrary(Model model) throws NoSuchElementException, IllegalStateException, Exception {		
		SystemRecordManager manager = new SystemRecordManager(connectionPool);
		model.addAttribute("systems", manager.getStoredSystemsIRI());
		manager.shutdown();
		return "systemLibrary";
	}
	
	@PostMapping("/systems")
	public String systemLibraryNewSystemAdded(@ModelAttribute NewSystemForm newSystem) throws NoSuchElementException, IllegalStateException, Exception {
		
		SystemRecordManager manager = new SystemRecordManager(connectionPool);
		manager.addSystemInfo(newSystem); 
		//System.out.println(newSystem.getIri());
		manager.shutdown();
		//System.out.println(manager.getStoredSystemsIRI());
		return "index";
		//return "redirect:/systems";
	}
	

	@GetMapping("/createSystemForm")
	public String addSystem(Model model) {
		model.addAttribute("newSystem", new NewSystemForm());
		return "createSystemForm";
	}
	
	
	
	
	
}
