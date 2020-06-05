package uoa.init.graphdb;






import java.util.Iterator;
import java.util.UUID;

import org.eclipse.rdf4j.model.IRI;
import org.eclipse.rdf4j.model.Namespace;
import org.eclipse.rdf4j.model.Resource;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.impl.TreeModel;
import org.eclipse.rdf4j.model.vocabulary.PROV;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;

import uoa.semantic.system.SystemComponentsIRI;






public class CheckAndSetUpGraphDB {



public static void checkRepositorySetUp () {
	
	RepositoryManager repositoryManager = new RemoteRepositoryManager( "http://localhost:7200" );
	// Get the repository from repository manager, note the repository id set in configuration .ttl file
	
	
	Repository repository = GraphDBUtils.getFabricRepository(repositoryManager);
	ValueFactory f = repository.getValueFactory();
		
    
    if (repository!=null) {

	// Open a connection to this repository
	RepositoryConnection conn = repository.getConnection();	
	
	//check if rainsnamespace present
	if (!GraphDBUtils.checkNamespacePresent (conn.getNamespaces(), Constants.RAINS_NAMESPACE)) {
		System.out.println ("Setting rains namespace") ; 
		conn.setNamespace("rains", Constants.RAINS_NAMESPACE);
	}
	
	if (!GraphDBUtils.checkNamespacePresent (conn.getNamespaces(), Constants.AF_NAMESPACE)) {
		System.out.println ("Setting accountability fabric namespace") ; 
		conn.setNamespace("af", Constants.AF_NAMESPACE);
	}
	
	if (!GraphDBUtils.checkResourcePresent (conn.getContextIDs(), Constants.SYSTEMS_NAMED_GRAPH_IRI)) {
		System.out.println ("Adding the default Systems named graph") ;
		
		Resource systemCollection = f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI+"/"+UUID.randomUUID());
		IRI context = f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI);
		conn.add(systemCollection, RDF.TYPE, f.createIRI(SystemComponentsIRI.SYSTEM_COLLECTION), context); 		
	}
	
	if (!GraphDBUtils.checkResourcePresent (conn.getContextIDs(), Constants.TEMPLATES_NAMED_GRAPH_IRI)) {
		System.out.println ("Adding the default Systems named graph") ;
		
		Resource templateCollection = f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI+"/"+UUID.randomUUID());
		IRI context = f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI);
		conn.add(templateCollection, RDF.TYPE, f.createIRI(SystemComponentsIRI.TEMPLATE_COLLECTION), context); 		
	}
	/*
	// Get all statements in the context
	IRI context = f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI);
	try (RepositoryResult<Statement> result = conn.getStatements(null, null, null, context)) {
	   while (result.hasNext()) {
	      Statement st = result.next();
	    
	   }
	}
	*/
	
	//conn.clear(f.createIRI("https://rainsproject.org/PlanComponentLibrary"));
		
	// ... use the repository

	// Shutdown connection, repository and manager
	conn.close();
	repository.shutDown();
	repositoryManager.shutDown();
    }
    
    else {
    	
    	//HAndle if there  is no repository
    	 System.out.println("TO DO - Setting up repository");
    	 System.exit (0);
    	 
    }
	
}







}
