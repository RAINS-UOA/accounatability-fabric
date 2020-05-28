package uoa.web.handlers;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.apache.commons.pool2.ObjectPool;
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
import org.eclipse.rdf4j.repository.RepositoryException;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.RDFParseException;
import org.springframework.util.ResourceUtils;

import uoa.init.graphdb.Constants;
import uoa.init.graphdb.GraphDBUtils;
import uoa.model.components.NewSystemForm;
import uoa.model.components.SystemDetails;
import uoa.semantic.system.EpPlanOntologyComponents;
import uoa.semantic.system.RainsOntologyComponents;
import uoa.semantic.system.SystemComponentsIRI;

public class SystemRecordManager {
	/*
	RepositoryManager repositoryManager = GraphDBUtils.getRepositoryManager();
	
	Repository repository = GraphDBUtils.getFabricRepository(repositoryManager);
	
	RepositoryConnection conn = repository.getConnection();	
	
	ValueFactory f = repository.getValueFactory();
	*/
	
	ValueFactory f;
	RepositoryConnection conn;
	Repository repository;
	ObjectPool <RepositoryConnection> connectionPool;
	
	public SystemRecordManager (ObjectPool <RepositoryConnection> connectionPool) throws NoSuchElementException, IllegalStateException, Exception {
	
	this.conn = connectionPool.borrowObject();
	this.repository = conn.getRepository();
	this.f = repository.getValueFactory();
	this.connectionPool = connectionPool;

	}
	
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
	
	
	
	public void shutdown () throws Exception  {	
		connectionPool.returnObject(conn);
		
		//TO DO need to shutdown everything before garbage collected this will now have to be shut down in the connection pool
		
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
			
			conn.begin();
			
			conn.add(f.createIRI(iri), RDF.TYPE, f.createIRI(RainsOntologyComponents.AI_SYSTEM), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(f.createIRI(iri), RDFS.COMMENT, f.createLiteral(newSystem.getDescription()), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(f.createIRI(iri), RDFS.LABEL, f.createLiteral(newSystem.getLabel()), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
			String plansGraph = Constants.DEFAULT_NAMED_GRAPH_NAMESPACE+UUID.randomUUID();
			conn.add(f.createIRI(iri), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), f.createIRI(plansGraph), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
			
			//needs to create new toplevel default plan as well
			Resource planNamedGraphContext = f.createIRI(plansGraph);
		/*	
			try {
				addPlanNamedGraphOntologies(planNamedGraphContext);
			} catch (RDFParseException | RepositoryException | IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			*/
			Resource plan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(plan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			
			Resource designStep = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(designStep, RDF.TYPE, f.createIRI(EpPlanOntologyComponents.MultiStep), planNamedGraphContext);
			conn.add(designStep, RDF.TYPE, f.createIRI(RainsOntologyComponents.DesignStep), planNamedGraphContext);
			conn.add(designStep, f.createIRI(EpPlanOntologyComponents.isElementOfPlan), plan, planNamedGraphContext);
			
			
			Resource implementationStep = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(implementationStep, RDF.TYPE, f.createIRI(EpPlanOntologyComponents.MultiStep), planNamedGraphContext);
			conn.add(implementationStep, RDF.TYPE, f.createIRI(RainsOntologyComponents.ImplementationStep), planNamedGraphContext);
			conn.add(implementationStep, f.createIRI(EpPlanOntologyComponents.isElementOfPlan), plan, planNamedGraphContext);
			conn.add(implementationStep, f.createIRI(EpPlanOntologyComponents.isPreceededBy), designStep, planNamedGraphContext);
			
			
			Resource deploymentStep = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(deploymentStep, RDF.TYPE, f.createIRI(RainsOntologyComponents.DeploymentStep), planNamedGraphContext);
			conn.add(deploymentStep, f.createIRI(EpPlanOntologyComponents.isElementOfPlan), plan, planNamedGraphContext);
			conn.add(deploymentStep, f.createIRI(EpPlanOntologyComponents.isPreceededBy), implementationStep, planNamedGraphContext);
			conn.add(deploymentStep, RDF.TYPE, f.createIRI(EpPlanOntologyComponents.MultiStep), planNamedGraphContext);
			
			Resource operationStep = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(operationStep, RDF.TYPE, f.createIRI(EpPlanOntologyComponents.MultiStep), planNamedGraphContext);
			conn.add(operationStep, RDF.TYPE, f.createIRI(RainsOntologyComponents.OperationStep), planNamedGraphContext);
			conn.add(operationStep, f.createIRI(EpPlanOntologyComponents.isElementOfPlan), plan, planNamedGraphContext);
			conn.add(operationStep, f.createIRI(EpPlanOntologyComponents.isPreceededBy), deploymentStep, planNamedGraphContext);	
			
			conn.commit();;
		}
		
	}
	
	private void addPlanNamedGraphOntologies (Resource planNamedGraphContext) throws RDFParseException, RepositoryException, IOException {
		
		File file = ResourceUtils.getFile("classpath:ep-plan.ttl"); 
		String baseURI = "https://w3id.org/ep-plan";
		conn.add(file, null, RDFFormat.TURTLE,planNamedGraphContext);
		
		
	}

	public SystemDetails getSystemDetails(String iri) {
		SystemDetails system = new SystemDetails (iri); 
		RepositoryResult<Statement> result = conn.getStatements(f.createIRI(iri), RDFS.COMMENT, null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
		for (Statement st: result) {
			system.setDescription(st.getObject().stringValue()); 
		    }
		result = conn.getStatements(f.createIRI(iri), RDFS.LABEL, null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
		for (Statement st: result) {
			system.setLabel(st.getObject().stringValue()); 
		    }
	
		return system;
	}

}
