package uoa.web.handlers;


import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.apache.commons.io.IOUtils;
import org.apache.commons.pool2.ObjectPool;
import org.eclipse.rdf4j.model.Model;
import org.eclipse.rdf4j.model.Resource;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.Value;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.impl.LinkedHashModel;
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
import org.eclipse.rdf4j.rio.RDFHandlerException;
import org.eclipse.rdf4j.rio.RDFParseException;
import org.eclipse.rdf4j.rio.RDFParser;
import org.eclipse.rdf4j.rio.Rio;
import org.eclipse.rdf4j.rio.helpers.JSONSettings;
import org.eclipse.rdf4j.rio.helpers.StatementCollector;
import org.omg.CORBA.portable.InputStream;
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
	
	public void savePlanFromJSONLD () throws IOException {
		
		String jsonld_dummy = "{\"@context\":{\"plan\": \"https://w3id.org/ep-plan#plan\",\"step\": \"https://w3id.org/ep-plan#Step\",\"multiStep\": \"https://w3id.org/ep-plan#Step\",\"isElementOfPlan\": \"https://w3id.org/ep-plan#isElementOfPlan\"},\"@graph\": [{\"@id\": \"https://something/plan4\",\"@type\": \"plan\"}, {\"@id\": \"https://something/step3\",\"@type\": [\"multiStep\"]}]}";
	    String BACKSLASH_ESCAPED_TEST_STRING = "{\"@context\": {\"ical\": \"http://www.w3.org/2002/12/cal/ical#\",\"xsd\": \"http://www.w3.org/2001/XMLSchema#\",\"ical:dtstart\": {\"@type\": \"xsd:dateTime\"}},\"ical:summary\": \"Lady Gaga Concert\",\"ical:location\": \"New Orleans Arena, New Orleans, Louisiana, USA\",\"ical:dtstart\": \"2011-04-09T20:00:00Z\"}";
        String test = "{\"@context\": {\"generatedAt\": {\"@id\": \"http://www.w3.org/ns/prov#generatedAtTime\",\"@type\": \"http://www.w3.org/2001/XMLSchema#date\"},\"Person\": \"http://xmlns.com/foaf/0.1/Person\",\"name\": \"http://xmlns.com/foaf/0.1/name\",\"knows\": \"http://xmlns.com/foaf/0.1/knows\"},\"@graph\": [{\"@id\": \"http://manu.sporny.org/about#manu\",\"@type\": \"Person\",\"name\": \"Manu Sporny\",\"knows\": \"http://greggkellogg.net/foaf#me\"}, {\"@id\": \"http://greggkellogg.net/foaf#me\",\"@type\": \"Person\",\"name\": \"Gregg Kellogg\",\"knows\": \"http://manu.sporny.org/about#manu\"}]}";
	//	RDFParser rdfParser = Rio.createParser(RDFFormat.JSONLD);
		//Model model = new LinkedHashModel();
		//rdfParser.setRDFHandler(new StatementCollector(model));
		
		
		
		Model results = null;
		try {
			  // rdfParser.parse(inputStream	, null);
			   
			    RDFParser parser = Rio.createParser(RDFFormat.JSONLD);
			    parser.set(JSONSettings.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER,true);
			    //parser.parse(new StringReader(jsonld_dummy), null);
			   
			    results = Rio.parse(new StringReader(jsonld_dummy), null, RDFFormat.JSONLD);
			}
			catch (IOException e) {
			  // handle IO problems (e.g. the file could not be read)
				System.out.println(e.getLocalizedMessage());
			}
			catch (RDFParseException e) {
			  // handle unrecoverable parse error
				System.out.println(e.getLocalizedMessage());
			}
			catch (RDFHandlerException e) {
			  // handle a problem encountered by the RDFHandler
				System.out.println(e.getLocalizedMessage());
			}
			
		
		if (results!=null) {
			System.out.println("model size" +results.size() );
		conn.add(results.getStatements(null, null, null, (Resource)null), (Resource)null);
		}
		else {
			System.out.println("model is null");
		}
		
		
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

	public void savePlanFromJSONLD(String jsonPayload) {

		Model results = null;
		try {
			  // rdfParser.parse(inputStream	, null);
			   
			    RDFParser parser = Rio.createParser(RDFFormat.JSONLD);
			    parser.set(JSONSettings.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER,true);
			    //parser.parse(new StringReader(jsonld_dummy), null);
			   
			    results = Rio.parse(new StringReader(jsonPayload), null, RDFFormat.JSONLD);
			}
			catch (IOException e) {
			  // handle IO problems (e.g. the file could not be read)
				System.out.println(e.getLocalizedMessage());
			}
			catch (RDFParseException e) {
			  // handle unrecoverable parse error
				System.out.println(e.getLocalizedMessage());
			}
			catch (RDFHandlerException e) {
			  // handle a problem encountered by the RDFHandler
				System.out.println(e.getLocalizedMessage());
			}
			
		
		if (results!=null) {
			System.out.println("model size" +results.size() );
		conn.add(results.getStatements(null, null, null, (Resource)null), f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI));
		}
		else {
			System.out.println("model is null");
		}
		
	}

}
