package uoa.web.handlers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

import org.eclipse.rdf4j.model.Resource;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.Value;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.model.vocabulary.RDFS;
import org.eclipse.rdf4j.query.BindingSet;
import org.eclipse.rdf4j.query.TupleQuery;
import org.eclipse.rdf4j.query.TupleQueryResult;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;

import uoa.init.graphdb.Constants;
import uoa.init.graphdb.GraphDBUtils;
import uoa.model.components.NewSystemForm;
import uoa.semantic.system.RainsOntologyComponents;
import uoa.semantic.system.SystemComponentsIRI;

public class SystemRecordManager {
	
	RepositoryManager repositoryManager = GraphDBUtils.getRepositoryManager();
	
	Repository repository = GraphDBUtils.getFabricRepository(repositoryManager);
	
	RepositoryConnection conn = repository.getConnection();	
	
	ValueFactory f = repository.getValueFactory();
	
	public SystemRecordManager () {}
	
	public HashMap <String,String> getStoredSystemsIRI () {
		
		HashMap <String,String > map = new  HashMap <String,String >  ();
		
		String queryString = " Prefix rains:<"+Constants.RAINS_NAMESPACE+"> SELECT DISTINCT ?system ?label FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> WHERE { ?system a rains:AiSystem. OPTIONAL {?system rdfs:label ?label} } ";
		   TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("system");
				         Value label = bindingSet.getValue("label");
				         map.put(iri.stringValue(),label.stringValue());
				      }
				   
			   }
		
		return map;
	}
	
	
	
	public void shutdown ()  {	
		conn.close();
		repository.shutDown();
		repositoryManager.shutDown();
	}

	public void addSystemInfo(NewSystemForm newSystem) {
		
		//check if system IRI already present
		if (getStoredSystemsIRI ().containsKey(newSystem.getIri())) {
			System.out.println("System IRI already present - TO DO! propagate error to systemLibrary.html");
		}
		//add new system entry
		else {
			
			String iri = newSystem.getIri(); 
			System.out.println("Empty "+iri);
			if (newSystem.getIri().equals("")) {
				iri = Constants.DEFAULT_INSTANCE_NAMESPACE + UUID.randomUUID(); 
			}
			System.out.println("New "+iri);
			
			conn.add(f.createIRI(iri), RDF.TYPE, f.createIRI(RainsOntologyComponents.AI_SYSTEM), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(f.createIRI(iri), RDFS.COMMENT, f.createLiteral(newSystem.getDescription()), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(f.createIRI(iri), RDFS.LABEL, f.createLiteral(newSystem.getLabel()), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
		}
		
	}

}
