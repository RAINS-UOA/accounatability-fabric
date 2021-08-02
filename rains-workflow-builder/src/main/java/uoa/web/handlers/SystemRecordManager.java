package uoa.web.handlers;


import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.pool2.ObjectPool;
import org.eclipse.rdf4j.model.Model;
import org.eclipse.rdf4j.model.Resource;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.Value;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.model.vocabulary.RDF;
import org.eclipse.rdf4j.model.vocabulary.RDFS;
import org.eclipse.rdf4j.query.BindingSet;
import org.eclipse.rdf4j.query.GraphQuery;
import org.eclipse.rdf4j.query.QueryLanguage;
import org.eclipse.rdf4j.query.TupleQuery;
import org.eclipse.rdf4j.query.TupleQueryResult;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.RepositoryException;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.rio.RDFFormat;
import org.eclipse.rdf4j.rio.RDFHandlerException;
import org.eclipse.rdf4j.rio.RDFParseException;
import org.eclipse.rdf4j.rio.RDFParser;
import org.eclipse.rdf4j.rio.RDFWriter;
import org.eclipse.rdf4j.rio.Rio;
import org.eclipse.rdf4j.rio.helpers.JSONSettings;
import org.springframework.util.ResourceUtils;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import uoa.init.graphdb.Constants;
import uoa.model.components.NewSystemForm;
import uoa.model.components.SystemDetails;
import uoa.semantic.system.EpPlanOntologyComponents;
import uoa.semantic.system.OwlOntologyComponents;
import uoa.semantic.system.RainsOntologyComponents;
import uoa.semantic.system.SaoOntologyElements;
import uoa.semantic.system.SystemComponentsIRI;
import uoa.web.storage.AuthorisationCacheStorage;

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
		
		String queryString = " Prefix rains:<"+Constants.RAINS_PLAN_NAMESPACE+"> SELECT DISTINCT ?system ?label FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> WHERE { ?system a <"+RainsOntologyComponents.AI_SYSTEM+">. OPTIONAL {?system rdfs:label ?label} } ";
		   TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("system");
				         String label = "";
				         if (bindingSet.getValue("label") !=null) {
				        	 label = bindingSet.getValue("label").stringValue();
				         }
				         map.put(iri.stringValue(),label);
				      }
				   
			   }
		
		return map;
	}
	
	
	
	public void shutdown () throws Exception  {	
		connectionPool.returnObject(conn);
		
		//TO DO need to shutdown everything before garbage collected this will now have to be shut down in the connection pool
		
	}
	
	public void savePlanFromJSONLD (String systemIri, String jsonPayload, String shaclImpl) throws IOException {
		Model shaclImplModel = null;
		Model results = null;
		try {
			  // rdfParser.parse(inputStream	, null);
			   System.out.println(shaclImpl);
			    //RDFParser parser = Rio.createParser(RDFFormat.JSONLD);
			    //parser.set(JSONSettings.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER,true);
			    //parser.parse(new StringReader(jsonld_dummy), null);
			   
			    results = Rio.parse(new StringReader(jsonPayload), null, RDFFormat.JSONLD);
			    
			    
			    //parser.parse(new StringReader(jsonld_dummy), null);
			   
			    shaclImplModel = Rio.parse(new StringReader(shaclImpl), "http://shaclImpl.rains/", RDFFormat.TURTLE);
			    
			    results.addAll(shaclImplModel);
			    
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
		conn.add(results.getStatements(null, null, null, (Resource)null), f.createIRI(getPlansNamedGraph(systemIri)));
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
			Resource system = f.createIRI(iri) ;
			conn.add(system, RDF.TYPE, f.createIRI(RainsOntologyComponents.AI_SYSTEM), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(system, RDF.TYPE, f.createIRI(SaoOntologyElements.SYSTEM), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(system, RDF.TYPE, f.createIRI(OwlOntologyComponents.NamedIndividual), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			conn.add(system, RDF.TYPE, f.createIRI(SaoOntologyElements.AccountableObject), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
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
			//Resource plan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			//conn.add(plan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			
			
			/*
			 * Create accountability plans for four different stages
			 */
			
			Resource designPlan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(designPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.DesignStageAccountabilityPlan), planNamedGraphContext);
			conn.add(designPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			conn.add(designPlan, RDF.TYPE, f.createIRI(OwlOntologyComponents.NamedIndividual), planNamedGraphContext);
			conn.add(designPlan, f.createIRI(RainsOntologyComponents.specifiedForSystem),system, planNamedGraphContext);
			
			Resource implementationPlan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(implementationPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.ImplementationStageAccountabilityPlan), planNamedGraphContext);
			conn.add(implementationPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			conn.add(implementationPlan, RDF.TYPE, f.createIRI(OwlOntologyComponents.NamedIndividual), planNamedGraphContext);
			conn.add(implementationPlan, f.createIRI(RainsOntologyComponents.specifiedForSystem),system, planNamedGraphContext);
			
			
			Resource deploymentPlan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(deploymentPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.DeploymentStageAccountabilityPlan), planNamedGraphContext);
			conn.add(deploymentPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			conn.add(deploymentPlan, RDF.TYPE, f.createIRI(OwlOntologyComponents.NamedIndividual), planNamedGraphContext);
			conn.add(deploymentPlan, f.createIRI(RainsOntologyComponents.specifiedForSystem),system, planNamedGraphContext);
			
			Resource operationPlan = f.createIRI(Constants.DEFAULT_INSTANCE_NAMESPACE+UUID.randomUUID());
			conn.add(operationPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.OperationStageAccountabilityPlan), planNamedGraphContext);
			conn.add(operationPlan, RDF.TYPE, f.createIRI(RainsOntologyComponents.AccountabilityPlan), planNamedGraphContext);
			conn.add(operationPlan, RDF.TYPE, f.createIRI(OwlOntologyComponents.NamedIndividual), planNamedGraphContext);
			conn.add(operationPlan, f.createIRI(RainsOntologyComponents.specifiedForSystem),system, planNamedGraphContext);
			
			/*
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
			*/
			
			
			
			conn.commit();
			
	
		}
		
	}
	
	private void addPlanNamedGraphOntologies (Resource planNamedGraphContext) throws RDFParseException, RepositoryException, IOException {
		
		File file = ResourceUtils.getFile("classpath:ep-plan.ttl"); 
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

	public void saveTemplatePlanFromJSONLD(String jsonPayload) {

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

	public String getTemplatePlans() {
HashMap <String,String > map = new  HashMap <String,String >  ();
		
		String queryString = Constants.PREFIXES + "SELECT DISTINCT ?template ?label FROM <"+Constants.TEMPLATES_NAMED_GRAPH_IRI+"> WHERE { ?template a ep-plan:Plan. OPTIONAL {?template rdfs:label ?label} } ";
		   TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("template");
				         String label = "";
				         if (bindingSet.getValue("label") !=null) {
				        	 label = bindingSet.getValue("label").stringValue();
				         }				        
				         map.put(iri.stringValue(),label);
				      }
				   
			   }
			   Gson gson = new Gson(); 
			   String json = gson.toJson(map); 
		return json;
	}
	
	public String getTemplate (String templatePlanIRI)  {
		
		String ldjson ="error";	
		String query =  Constants.PREFIXES + " Construct FROM <"+Constants.TEMPLATES_NAMED_GRAPH_IRI+">  where { ?element ep-plan:isElementOfPlan ?plan.   ?element ?p ?o . ?plan ?c ?x.} Values (?plan) { (<"+templatePlanIRI+">) }";
		System.out.println(query);
		//Model m = Repositories.graphQuery(repository,query, r -> QueryResults.asModel(r));
		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		RDFWriter writer = Rio.createWriter(RDFFormat.JSONLD, stream);
		   conn.prepareGraphQuery(QueryLanguage.SPARQL,
				   query).evaluate(writer);
		ldjson = new String(stream.toByteArray());
		return ldjson; 
	}

	//there shoudl always be only one result
	public String getPlansNamedGraph(String systemPlanIri) {	
		Value iri =null;
		String queryString = Constants.PREFIXES +" SELECT ?plansNamedGraph FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> WHERE { <"+systemPlanIri+"> af:hasPlansStoredInGraph ?plansNamedGraph.}";
		   TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         iri = bindingSet.getValue("plansNamedGraph"); 
				      }
			   }
			
		return iri.toString();
	}

	/*
	public HashMap <String,String > getTopLevelPlan(String systemIri) {
HashMap <String,String > map = new  HashMap <String,String >  ();
		//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
		String queryString = Constants.PREFIXES + "SELECT ?plan ?designStep ?implementationStep ?deployStep ?operationStep FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?plan a rains:AccountabilityPlan. ?designStep ep-plan:isElementOfPlan ?plan; a rains:Design. ?implementationStep ep-plan:isElementOfPlan ?plan; a rains:Implementation. ?deployStep ep-plan:isElementOfPlan ?plan; a rains:Deployment. ?operationStep ep-plan:isElementOfPlan ?plan; a rains:Operation. FILTER NOT EXISTS {?plan ep-plan:isSubPlanOf ?anotherPlan} }";
		   TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("plan");				        
				         map.put("plan",iri.toString());
				         iri = bindingSet.getValue("designStep");				        
				         map.put("designStep",iri.toString());
				         iri = bindingSet.getValue("implementationStep");				        
				         map.put("implementationStep",iri.toString());
				         iri = bindingSet.getValue("deployStep");
				         map.put("deployStep",iri.toString());
				         iri = bindingSet.getValue("operationStep");
				         map.put("operationStep",iri.toString());
				      }
				   
			   }
		return map;
	}
*/
	
	
	public HashMap <String,String > getStagePlanIRI(String systemIri, String stage) {
HashMap <String,String > map = new  HashMap <String,String >  ();
		//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
		
		String stageIRI ="";
		switch (stage)  {

		case "design":
			stageIRI = RainsOntologyComponents.DesignStageAccountabilityPlan;
		break; 
		
		case "implementation":
			stageIRI = RainsOntologyComponents.ImplementationStageAccountabilityPlan;
		break; 
		
		case "deployment":
			stageIRI = RainsOntologyComponents.DeploymentStageAccountabilityPlan;
		break; 
		
		case "operation":
			stageIRI =  RainsOntologyComponents.OperationStageAccountabilityPlan;
		break; 
		
		}

        String queryString = Constants.PREFIXES + "SELECT ?plan FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?plan a <"+stageIRI+">; <"+RainsOntologyComponents.specifiedForSystem+"> <"+systemIri+">}";
		System.out.println(queryString);
        TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("plan");				        
				         map.put("planIRI",iri.toString());
				      }
				   
			   }
		return map;
	}

	
	public ArrayList <HashMap <String,String >> getSavedPlanForEachStage(String systemIri) {
  ArrayList <HashMap <String,String >> list = new  ArrayList  <HashMap <String,String >>   ();
		//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
		//String queryString = Constants.PREFIXES + "Select Distinct ?plan ?topLevelStepType ?topLevelStep FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?topLevelStep a ?topLevelStepType; ep-plan:isElementOfPlan ?topLevelPlan. ?plan ep-plan:isSubPlanOfPlan ?topLevelPlan; ep-plan:decomposesMultiStep ?topLevelStep. ?element ep-plan:isElementOfPlan ?plan. Filter (?topLevelStepType = <"+RainsOntologyComponents.DesignStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.ImplementationStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.DeploymentStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.OperationStep+">)}";
       String queryString = Constants.PREFIXES + "Select Distinct ?plan ?planType FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?plan a ?planType; <"+RainsOntologyComponents.specifiedForSystem+"> <"+systemIri+">. ?element ep-plan:isElementOfPlan ?plan.  Filter (?planType = <"+RainsOntologyComponents.DesignStageAccountabilityPlan+"> || ?planType = <"+RainsOntologyComponents.ImplementationStageAccountabilityPlan+"> || ?planType = <"+RainsOntologyComponents.DeploymentStageAccountabilityPlan+"> || ?planType = <"+RainsOntologyComponents.OperationStageAccountabilityPlan+">)}";
       System.out.println(queryString);
		TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				    	 HashMap <String,String > map = new HashMap <String,String > ();
				         BindingSet bindingSet = result.next();
				         Value iri = bindingSet.getValue("plan");				        
				         map.put("plan",iri.toString());
				          iri = bindingSet.getValue("planType");	
				          map.put("planType",iri.toString());
					    
				        // map.put("topLevelStepType",iri.toString());
				        // iri = bindingSet.getValue("topLevelStepType");				        
				        // map.put("topLevelStepType",iri.toString());
				         //iri = bindingSet.getValue("topLevelStep");				        
				         //map.put("topLevelStep",iri.toString());
				         list.add(map);
				      }			   
			   }
		return list;
	}
    
	public String  getPlanElementsAsGraph(String systemIri, String stage) {
		  ArrayList <HashMap <String,String >> list = new  ArrayList  <HashMap <String,String >>   ();
				//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
				//String queryString = Constants.PREFIXES + "Select Distinct ?plan ?topLevelStepType ?topLevelStep FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?topLevelStep a ?topLevelStepType; ep-plan:isElementOfPlan ?topLevelPlan. ?plan ep-plan:isSubPlanOfPlan ?topLevelPlan; ep-plan:decomposesMultiStep ?topLevelStep. ?element ep-plan:isElementOfPlan ?plan. Filter (?topLevelStepType = <"+RainsOntologyComponents.DesignStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.ImplementationStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.DeploymentStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.OperationStep+">)}";
		  
		  String planType = "";
		  System.out.println(stage);
		  if (stage.toLowerCase().equals("design")) {
			  planType = RainsOntologyComponents.DesignStageAccountabilityPlan;
		  }
		  
		  if (stage.toLowerCase().equals("implementation")) {
			  planType = RainsOntologyComponents.ImplementationStageAccountabilityPlan;
		  }
		  
		  if (stage.toLowerCase().equals("deployment")) {
			  planType = RainsOntologyComponents.DeploymentStageAccountabilityPlan;
		  }
		  
		  if (stage.toLowerCase().equals("operation")) {
			  planType = RainsOntologyComponents.OperationStageAccountabilityPlan;
		  }
		  	  
		  String queryString = Constants.PREFIXES + "Construct {?s ?p ?o} FROM <"+getPlansNamedGraph(systemIri)+">  Where {{?s ?p ?o. ?s ep-plan:isElementOfPlan ?plan. ?plan rains:specifiedForSystem <"+systemIri+">; a <"+planType+">} UNION{?s ?p ?o. ?constraint ep-plan:isElementOfPlan ?plan. ?plan rains:specifiedForSystem  <"+systemIri+">; a <"+planType+">.?constraint ep-plan:hasConstraintImplementation ?s.} UNION{?impl  <http://www.w3.org/ns/shacl#sparql> ?s. ?s ?p ?o .?constraint ep-plan:isElementOfPlan ?plan. ?plan rains:specifiedForSystem  <"+systemIri+">; a <"+planType+">.?constraint ep-plan:hasConstraintImplementation ?impl.}}";
				System.out.println(queryString);
				GraphQuery query  = conn.prepareGraphQuery(queryString);
				
			    
				
				String result = "no data";
				
				ByteArrayOutputStream stream = new ByteArrayOutputStream();
				RDFWriter writer = Rio.createWriter(RDFFormat.TURTLE, stream);
				   query.evaluate(writer);
				   result = new String(stream.toByteArray());
				
				/*
					  try (GraphQueryResult resultQuery = query.evaluate()) {
						  StringBuilder str = new StringBuilder ();
						   for (Statement st: resultQuery) {
						      if(st.getObject().toString().contains("http")) {
							   str.append("<"+st.getSubject()+">"+"<"+st.getPredicate()+">"+"<"+st.getObject()+">.\n");
						      }
						      else {
						    	  str.append("<"+st.getSubject()+">"+"<"+st.getPredicate()+">"+""+st.getObject()+".\n");
						      }
						      
						   }
						   
						   result = str.toString();
					  }
				*/
				return result;
			}
	
	
	public ArrayList <HashMap>  getPlanElementsForImplementationStage(String systemIri) {
		  ArrayList <HashMap <String,String >> list = new  ArrayList  <HashMap <String,String >>   ();
				//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
				//String queryString = Constants.PREFIXES + "Select Distinct ?plan ?topLevelStepType ?topLevelStep FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?topLevelStep a ?topLevelStepType; ep-plan:isElementOfPlan ?topLevelPlan. ?plan ep-plan:isSubPlanOfPlan ?topLevelPlan; ep-plan:decomposesMultiStep ?topLevelStep. ?element ep-plan:isElementOfPlan ?plan. Filter (?topLevelStepType = <"+RainsOntologyComponents.DesignStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.ImplementationStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.DeploymentStep+"> || ?topLevelStepType = <"+RainsOntologyComponents.OperationStep+">)}";
		       
		  ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
		  String queryString = Constants.PREFIXES + "Select Distinct ?element ?elementType ?input ?inputType ?output ?outputType FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?plan a ?planType; <"+RainsOntologyComponents.specifiedForSystem+"> <"+systemIri+">. ?element ep-plan:isElementOfPlan ?plan.  ?element a ?elementType. OPTIONAL {?element ep-plan:hasInputVariable ?input. ?input a ?inputType. FILTER (regex(str(?inputType), \"https://w3id.org/rains#\" ))} OPTIONAL {?element ep-plan:hasOutputVariable ?output. ?output a ?outputType. FILTER (regex(str(?outputType), \"https://w3id.org/rains#\" ))} FILTER (regex(str(?elementType), \"https://w3id.org/rains#\" ))}";
		       System.out.println(queryString);
				TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
					   try (TupleQueryResult result = tupleQuery.evaluate()) {
						   while (result.hasNext()) {  // iterate over the result
						    	HashMap <String,String> row = new HashMap <String,String>(); 
						        
						    	
						    	
						    	BindingSet bindingSet = result.next();	
						    	
						    	Set <String> bindings = bindingSet.getBindingNames();  
						    	
						    	Iterator it2 = bindings.iterator();
						    	while (it2.hasNext()) {
						    		String key = (String) it2.next();
						    		if (bindingSet.getValue(key)!=null)
						    		row.put(key, bindingSet.getValue(key).toString()) ;
						    	}
						       
						         resultSet.add(row);
						      }	   
					   }
				return resultSet;
			}
	
// to do : this currently retrieves the whole plan but in the future we may want to divide it into chunks depending on the agents associated with the task
public String getSavedPlanPartsForHumanTaskForm (String planIri, String systemIri, String executiontraceBundleIRI)  {
	
		String ldjson ="error";	
			
		String query =  Constants.PREFIXES + "Construct {?element ?p ?o . ?plan ?c ?x. <"+executiontraceBundleIRI+"> prov:wasDerivedFrom ?plan. <"+executiontraceBundleIRI+"> a ep-plan:ExecutionTraceBundle} FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {  ?element ep-plan:isElementOfPlan ?plan.   ?element ?p ?o . ?plan ?c ?x.} Values (?plan) { (<"+planIri+">)}"   ;
			
		System.out.println(query);
		//Model m = Repositories.graphQuery(repository,query, r -> QueryResults.asModel(r));
		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		RDFWriter writer = Rio.createWriter(RDFFormat.JSONLD, stream);
		   conn.prepareGraphQuery(QueryLanguage.SPARQL,
				   query).evaluate(writer);
		ldjson = new String(stream.toByteArray());
		return ldjson; 
	}	
	
	
public String getSavedPlan (String stage, String systemIri)  {
		
        System.out.println(stage+" : "+systemIri)	;
	
		String ldjson ="error";	
		
		String stageIRI ="";
		switch (stage)  {

		case "design":
			stageIRI = RainsOntologyComponents.DesignStageAccountabilityPlan;
		break; 
		
		case "implementation":
			stageIRI = RainsOntologyComponents.ImplementationStageAccountabilityPlan;
		break; 
		
		case "deployment":
			stageIRI = RainsOntologyComponents.DeploymentStageAccountabilityPlan;
		break; 
		
		case "operation":
			stageIRI =  RainsOntologyComponents.OperationStageAccountabilityPlan;
		break; 
		
		}
			
		//String query =  Constants.PREFIXES + "Construct FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?topLevelStep  ep-plan:isElementOfPlan ?topLevelPlan. ?plan ep-plan:isSubPlanOfPlan ?topLevelPlan; ep-plan:decomposesMultiStep ?topLevelStep. ?element ep-plan:isElementOfPlan ?plan.   ?element ?p ?o . ?plan ?c ?x.} Values (?topLevelStep) { (<"+topLevelStepIri+">)}"   ;
		String query =  Constants.PREFIXES + "Construct FROM <"+getPlansNamedGraph(systemIri)+"> WHERE {?plan  a <"+stageIRI+">; <"+RainsOntologyComponents.specifiedForSystem+"> <"+systemIri+">. ?element ep-plan:isElementOfPlan ?plan.   ?element ?p ?o . ?plan ?c ?x.}"   ;
			
		System.out.println(query);
		//Model m = Repositories.graphQuery(repository,query, r -> QueryResults.asModel(r));
		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		RDFWriter writer = Rio.createWriter(RDFFormat.JSONLD, stream);
		   conn.prepareGraphQuery(QueryLanguage.SPARQL,
				   query).evaluate(writer);
		ldjson = new String(stream.toByteArray());
		return ldjson; 
	}



public void saveUploadToWorkflowComponentLibrary(MultipartFile file) throws RDFParseException, RDFHandlerException, IOException {
  
   conn.add( file.getInputStream(), null, RDFFormat.TURTLE, f.createIRI(Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI));
}	



public HashMap <String,HashSet <String >> getStepComponentHierarchy () {
	HashMap <String,HashSet <String >> map = new  HashMap   <String,HashSet <String >> ();
	//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> { ?step rdfs:subClassOf* ep-plan:MultiStep. ?step rdfs:subClassOf ?parentStep.} ";
	
	TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	
			         BindingSet bindingSet = result.next();			         
			        
			         Value step = bindingSet.getValue("step");
			         Value parentStep = bindingSet.getValue("parentStep");	
			         if (map.containsKey(parentStep.toString())) {			        	
			        	 map.get(parentStep.toString()).add(step.toString());
			         }
			         else {
			        	 HashSet <String> set = new HashSet <String> ();
			        	 set.add(step.toString());
			        	 map.put(parentStep.toString(), set);
			         }
			         
			      }			   
		   }
	return map;
}

public HashMap <String,HashSet <String >> getVariableComponentHierarchy () {
	HashMap <String,HashSet <String >> map = new  HashMap   <String,HashSet <String >> ();
	//NOTE - to DO -> this could potentially be run as a single nested query and tehn the burden of performance optinmisation is on the graph store but I don't think it will matter that much in this case as we are using the same connection
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> { ?variable rdfs:subClassOf* ep-plan:MultiVariable. ?variable rdfs:subClassOf ?parentVariable.} ";
	System.out.println("get VariableComponentHierarchy " +queryString);
	TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	
			         BindingSet bindingSet = result.next();			         
			        
			         Value step = bindingSet.getValue("variable");
			         Value parentStep = bindingSet.getValue("parentVariable");	
			         if (map.containsKey(parentStep.toString())) {			        	
			        	 map.get(parentStep.toString()).add(step.toString());
			         }
			         else {
			        	 HashSet <String> set = new HashSet <String> ();
			        	 set.add(step.toString());
			        	 map.put(parentStep.toString(), set);
			         }
			         
			      }			   
		   }
	return map;
}

public String createNewExecutionBundle(String planIRI, String systemIRI) {
	// TODO Auto-generated method stub
	
	conn.begin();
	
	String executionBundleIRI = Constants.DEFAULT_NAMED_GRAPH_NAMESPACE+UUID.randomUUID();
	//create named graph for storing execution trace
	conn.add(f.createIRI(executionBundleIRI), RDF.TYPE, f.createIRI(EpPlanOntologyComponents.ExecutionTraceBundle), f.createIRI(executionBundleIRI));
	
	//save info in the system graph so we can link the trace and plan easily
	conn.add(f.createIRI(executionBundleIRI), f.createIRI(Constants.PROV_NAMESPACE+"wasDerivedFrom"),f.createIRI(planIRI) , f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	conn.add(f.createIRI(executionBundleIRI), f.createIRI(Constants.PROV_NAMESPACE+"wasDerivedFrom"),f.createIRI(planIRI) , f.createIRI(executionBundleIRI));
	
	
	//save the link between plan and execution trace bundle into systems named graph as well so we can later find it
	conn.add(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), f.createIRI(executionBundleIRI), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	conn.commit();
	
	return executionBundleIRI;
}

public String createProvenanceTraceHumanInterface(String token) {
HashMap <String,String> map =  AuthorisationCacheStorage.getDetailsForHumanGenrationTaskToken( token); 

//map.put("executiontraceBundleIRI",  rs.getString("executiontraceBundleIRI") );
if (map.get("status")!=null) {
	if (map.get("status").equals("Active")) {
		String planIRI = map.get("planIRI");
		String executiontraceBundleIRI = map.get("executiontraceBundleIRI");
		RepositoryResult<Statement> res= conn.getStatements(null, f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), f.createIRI(executiontraceBundleIRI), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
		
		
		
		// get system iri there should only be one added by createNewExecutionBundle(String planIRI, String systemIRI) 
		Statement stm  = res.next();
		Value system = stm.getSubject();
		return getSavedPlanPartsForHumanTaskForm (planIRI,system.toString(),executiontraceBundleIRI );		
	}
}
return "{\"error\":\"Can't retrive the plan structure\"}"	;


}

public String saveHumanTaskProvenanceTrace(String payload, String token) {
	HashMap <String,String> map =  AuthorisationCacheStorage.getDetailsForHumanGenrationTaskToken( token); 

	//map.put("executiontraceBundleIRI",  rs.getString("executiontraceBundleIRI") );
	if (map.get("status")!=null) {
		if (map.get("status").equals("Active")) {
			String planIRI = map.get("planIRI");
			String executiontraceBundleIRI = map.get("executiontraceBundleIRI");
			
			
			
			Model results = null;
			try {
				  // rdfParser.parse(inputStream	, null);
				   
				    RDFParser parser = Rio.createParser(RDFFormat.JSONLD);
				    parser.set(JSONSettings.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER,true);
				    //parser.parse(new StringReader(jsonld_dummy), null);
				   
				    results = Rio.parse(new StringReader(payload), null, RDFFormat.JSONLD);
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
			conn.add(results.getStatements(null, null, null, (Resource)null), f.createIRI(executiontraceBundleIRI));
			
			//Neeed to update the cache!!! and invalidate the token
			}
			else {
				System.out.println("model is null");
			}
			
			return "{\"success\":\"Execution trace Saved\"}" ;		
		}
	}
	return "{\"error\":\"Token invalid\"}"	;

	
}

//this one currently does not handle inherrent restrictions from parent classes, if the class does not have any restrictions defined directly all variables will be considered 
public ArrayList <String> getAllowedVariableTypesForStepType(String stepTypeIRI, String restrictionPropertyIRI) {
	// TODO Auto-generated method stub
	ArrayList <String> allowedTypes = new ArrayList <String> ();
	
String queryString = Constants.PREFIXES + "SELECT ?allowedPropertyRange From <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> WHERE { ?subject rdfs:subClassOf ?restriction. ?restriction owl:onProperty ?property. { ?restriction owl:allValuesFrom ?allowedPropertyRange ;  } UNION { ?restriction owl:allValuesFrom/owl:unionOf/rdf:rest*/rdf:first ?allowedPropertyRange.} FILTER (!isBlank(?allowedPropertyRange)) }order  by asc(?allowedPropertyRange) Values (?subject ?property ) {(<"+stepTypeIRI+"> <"+restrictionPropertyIRI+">) } ";
	
	TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	
			         BindingSet bindingSet = result.next();			         
			        
			         Value step = bindingSet.getValue("allowedPropertyRange");
			         allowedTypes.add(step.toString());
			      }			   
		   }
	//if no restrictions found add all available types
    if (allowedTypes.size() == 0) {
    
    queryString = Constants.PREFIXES + "Select Distinct ?variable FROM <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> { ?variable rdfs:subClassOf* ep-plan:MultiVariable. }order  by asc(?variable) ";
    System.out.println("Allowed Variable Query" +queryString);
    tupleQuery = conn.prepareTupleQuery(queryString);
	   try (TupleQueryResult result = tupleQuery.evaluate()) {
		      while (result.hasNext()) {  // iterate over the result
		    	
		         BindingSet bindingSet = result.next();			         
		        
		         Value var = bindingSet.getValue("variable");
		         allowedTypes.add(var.toString());
		         System.out.println("Allowed Variable "+var.toString());
		      }			   
	   }
    	
    	
    }
		   
	
 	return allowedTypes;
}

public ArrayList <String> getAllowedInformationElelementForInformationRealizationType(String informationRealizationType) {
	// TODO Auto-generated method stub
	ArrayList <String> allowedTypes = new ArrayList <String> ();
	
	// this doesn't work atm
	String queryString = Constants.PREFIXES + "SELECT ?allowedPropertyRange From <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> WHERE { ?subject rdfs:subClassOf ?restriction. ?restriction owl:onProperty ?property. { ?restriction owl:allValuesFrom ?allowedPropertyRange ;  } UNION { ?restriction owl:allValuesFrom/owl:unionOf/rdf:rest*/rdf:first ?allowedPropertyRange.} FILTER (!isBlank(?allowedPropertyRange)) }order  by asc(?allowedPropertyRange) Values (?subject ?property ) {(<"+informationRealizationType+"> <prov:hadMember>) } ";
		
		TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				    	
				         BindingSet bindingSet = result.next();			         
				        
				         Value step = bindingSet.getValue("allowedPropertyRange");
				         
				         
				         allowedTypes.add(step.toString());
				      }			   
			   }
		//if no restrictions found add all available types
	    if (allowedTypes.size() == 0) {
	    
	    queryString = Constants.PREFIXES + "Select Distinct ?infoElement ?infoElementComment FROM <"+Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI+"> Where {  ?infoElement rdfs:subClassOf* <"+SaoOntologyElements.InformationElement+">.OPTIONAL {?infoElement rdfs:comment ?infoElementComment.} }order  by asc(?infoElement) ";
	    System.out.println("Allowed Variable Query" +queryString);
	    tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	
			         BindingSet bindingSet = result.next();			         
			         String jsonString = "";
			         Value var = bindingSet.getValue("infoElement");
			         if (bindingSet.getValue("infoElementComment")!=null) {
			         Value var2 = bindingSet.getValue("infoElementComment");
			         
			          jsonString = "{\"iri\":\""+var.toString()+"\", \"comment\":"+var2.toString()+"}";
			         }
			         else {
			        	  jsonString = "{\"iri\":\""+var.toString()+"\", \"comment\":\"please add comment to ontology\"}";
			         }
			         
			         allowedTypes.add(jsonString);
			         System.out.println("Allowed Information Elemets "+var.toString());
			      }			   
		   }
	    	
	    	
	    }
			   
		
	 	return allowedTypes;

}


public HashSet getAgentsInExecutionTraces(String systemIRI) {

		RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
				
		// find named graphs for execution traces 
		HashSet <String> namedGraphsToQuery = new HashSet <String> ();
		while (res.hasNext()) {
			namedGraphsToQuery.add(res.next().getObject().toString());
		}
		// find named graphs for plans
		res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
		namedGraphsToQuery.add(res.next().getObject().toString());
		
		String fromPart = "";
		Iterator <String> it = namedGraphsToQuery.iterator();
		while (it.hasNext()) {
			fromPart = fromPart +  "FROM <" +it.next()+"> "; 
		}
		
		HashSet <String> resultSet = new HashSet <String> ();
		String queryString = Constants.PREFIXES + "Select Distinct ?agent "+fromPart+" Where { ?activity  prov:wasAssociatedWith ?agent. }";
		    System.out.println("Get agents execution trace query" +queryString);
		    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				      while (result.hasNext()) {  // iterate over the result
				    	
				         BindingSet bindingSet = result.next();			         
				        
				         Value var = bindingSet.getValue("agent");
				         resultSet.add(var.toString());
				        
			   }
		    	
		    	
		    }
				
		
		return resultSet;		


}

/*
public ArrayList <HashMap> getAgentsParticipationDetailsInExecutionTraces(String systemIRI, String agentIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct ?stepType ?activity ?entity ?outputType "+fromPart+" Where {?entity prov:wasGeneratedBy ?activity; ep-plan:correspondsToVariable ?var. ?var a ?outputType. ?activity  prov:wasAssociatedWith ?agent; ep-plan:correspondsToStep ?step. ?step a ?stepType FILTER(regex(str(?stepType), \"https://w3id.org/rains#\" ) && regex(str(?outputType), \"https://w3id.org/rains#\" ) )  } Values (?agent) {(<"+agentIRI+">)}";
	    System.out.println("Get agents execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	BindingSet bindingSet = result.next();			         
			        
			         Value var = bindingSet.getValue("stepType");
			         row.put("stepType", var.toString());
			         
			          var = bindingSet.getValue("entity");
			         row.put("entity", var.toString());
			         
			         if (bindingSet.getValue("outputType")!=null) {
				         var = bindingSet.getValue("outputType");
				         row.put("outputType", var.toString());
				         }
			         
			         var = bindingSet.getValue("activity");
			         row.put("activity", var.toString());
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}
*/
public ArrayList <HashMap> getAgentsParticipationDetailsInExecutionTraces(String systemIRI, String agentIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> "+fromPart+" Where {?infoRealization prov:wasGeneratedBy ?activity; ep-plan:correspondsToVariable ?accountableResult. ?accountableResult a ?accountableResultType; sao:relatesToAccountableObject ?accountableObject; rdfs:label ?accountableResultLabel. ?accountableObject rdfs:label ?accountableObjectLabel. ?activity  prov:wasAssociatedWith ?agent; ep-plan:correspondsToStep ?accountableAction.?accountableAction a ?accountableActionType; ep-plan:hasOutputVariable ?accountableResult; rdfs:label ?accountableActionLabel. OPTIONAL {?dependentAccountableActionActivity ep-plan:correspondsToStep ?dependentAccountableAction. ?dependentAccountableAction ep-plan:hasInputVariable ?accountableResult; a ?dependentAccountableActionType; rdfs:label ?dependentAccountableActionLabel. FILTER (regex(str(?dependentAccountableActionType), \"https://w3id.org/rains#\" ))}FILTER(regex(str(?accountableActionType), \"https://w3id.org/rains#\" ) && regex(str(?accountableResultType), \"https://w3id.org/rains#\" ) )  }  Values (?agent) {(<"+agentIRI+">)}";
	    System.out.println("Get agents execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	
			    	
			    	BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}


public ArrayList <HashMap> getAllActivitiesInExecutionTraces(String systemIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> "+fromPart+" Where {?infoRealization prov:wasGeneratedBy ?activity; ep-plan:correspondsToVariable ?accountableResult. ?accountableResult a ?accountableResultType; sao:relatesToAccountableObject ?accountableObject; rdfs:label ?accountableResultLabel. ?accountableObject rdfs:label ?accountableObjectLabel. ?activity  prov:wasAssociatedWith ?agent; ep-plan:correspondsToStep ?accountableAction.?accountableAction a ?accountableActionType; ep-plan:hasOutputVariable ?accountableResult; rdfs:label ?accountableActionLabel. OPTIONAL {?accountableAction ep-plan:hasInputVariable ?input. ?input a ?accountableResultInputType; rdfs:label ?accountableResultInputLabel; rdfs:comment ?accountableResultInputComment. ?inputInfoRealization ep-plan:correspondsToVariable ?input. FILTER (regex(str(?accountableResultInputType), \"https://w3id.org/rains#\" ))} OPTIONAL {?dependentAccountableActionActivity ep-plan:correspondsToStep ?dependentAccountableAction. ?dependentAccountableAction ep-plan:hasInputVariable ?accountableResult; a ?dependentAccountableActionType; rdfs:label ?dependentAccountableActionLabel. FILTER (regex(str(?dependentAccountableActionType), \"https://w3id.org/rains#\" ))}FILTER(regex(str(?accountableActionType), \"https://w3id.org/rains#\" ) && regex(str(?accountableResultType), \"https://w3id.org/rains#\" ) )  } order by ?activity ";
	    System.out.println("Get all activities execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	
			    	
			    	BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}


public ArrayList <HashMap> getAllEntitiesInExecutionTraces(String systemIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> "+fromPart+" Where {?infoRealization prov:wasGeneratedBy ?activity; ep-plan:correspondsToVariable ?accountableResult. ?accountableResult a ?accountableResultType; sao:relatesToAccountableObject ?accountableObject; rdfs:label ?accountableResultLabel. ?accountableObject rdfs:label ?accountableObjectLabel. ?activity  prov:wasAssociatedWith ?agent; ep-plan:correspondsToStep ?accountableAction.?accountableAction a ?accountableActionType; ep-plan:hasOutputVariable ?accountableResult; rdfs:label ?accountableActionLabel. FILTER(regex(str(?accountableActionType), \"https://w3id.org/rains#\" ) && regex(str(?accountableResultType), \"https://w3id.org/rains#\" ) )  } ";
	    System.out.println("Get all activities execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	
			    	
			    	BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}




public ArrayList <HashMap> getEntitiesOnDerivationPath(String systemIRI, String entityIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> "+fromPart+"Where {?variable a ep-plan:Variable. ?variable rdfs:label ?label; rdfs:comment ?comment. ?entity ep-plan:correspondsToVariable ?variable. ?entity prov:wasDerivedFrom+ ?influenceEntity. ?influenceEntity ep-plan:correspondsToVariable ?influenceVariable. ?influenceVariable rdfs:label ?influenceVariableLabel; rdfs:comment ?influenceVariableComment.} values (?entity) {(<"+entityIRI+">)}";
	    System.out.println("Get all activities execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	
			    	
			    	BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}

public ArrayList <HashMap> getEntitiesOnInfluencePath(String systemIRI, String entityIRI) {

	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
			
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct * FROM <"+Constants.SYSTEMS_NAMED_GRAPH_IRI+"> "+fromPart+"Where {?variable a ep-plan:Variable. ?variable rdfs:label ?label; rdfs:comment ?comment. ?entity ep-plan:correspondsToVariable ?variable. ?entity prov:wasDerivedFrom+ ?influenceEntity. ?influenceEntity ep-plan:correspondsToVariable ?influenceVariable. ?influenceVariable rdfs:label ?influenceVariableLabel; rdfs:comment ?influenceVariableComment.} values (?influenceEntity) {(<"+entityIRI+">)}";
	    System.out.println("Get all activities execution trace query" +queryString);
	    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
		   try (TupleQueryResult result = tupleQuery.evaluate()) {
			      while (result.hasNext()) {  // iterate over the result
			    	HashMap <String,String> row = new HashMap <String,String>(); 
			        
			    	
			    	
			    	BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	    	
	    	
	    }
			
	
	return resultSet;		
}




public ArrayList <HashMap> getActivityDetailsInExecutionTraces(String systemIRI, String activityIRI) {
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	//String queryString = Constants.PREFIXES + "Select Distinct *  Where {  ?activity prov:endedAtTime ?end. ?activity prov:startedAtTime ?start; ep-plan:correspondsToStep ?step;prov:wasAssociatedWith ?agent.?step ep-plan:isElementOfPlan ?plan.?plan a ?planType.OPTIONAL {?step rdfs:comment ?stepComment.}FILTER(?planType = rains:DesignStageAccountabilityPlan)}Values (?activity) {(<"+activityIRI+">)}";
	String queryString = Constants.PREFIXES + "Select Distinct *  Where {   ?activity  ep-plan:correspondsToStep ?step;prov:wasAssociatedWith ?agent.?step ep-plan:isElementOfPlan ?plan.?plan a ?planType. ?step rdfs:comment ?stepComment. OPTIONAL {?activity prov:startedAtTime ?start; prov:endedAtTime ?end. } OPTIONAL {?activity ?constraintresult ?constraint. ?constraint a ep-plan:Constraint; a ?constraintType. ?constraint rdfs:label ?constraintLabel; rdfs:comment ?constraintComment. Filter (?constraintType = rains:HumanConstraint || ?constraintType = rains:AutoConstraint)} FILTER(?planType = rains:DesignStageAccountabilityPlan || ?planType = rains:ImplementationStageAccountabilityPlan || ?planType = rains:OperationStageAccountabilityPlan || ?planType = rains:DeploymentStageAccountabilityPlan ) }Values (?activity) {(<"+activityIRI+">)}";
	
	
	System.out.println("Get activity details execution trace query" +queryString);
    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
	   try (TupleQueryResult result = tupleQuery.evaluate()) {
		      while (result.hasNext()) {  // iterate over the result
		    	HashMap <String,String> row = new HashMap <String,String>(); 
		    	/*  
		    	BindingSet bindingSet = result.next();			         
		        
		         Value var = bindingSet.getValue("start");
		         row.put("start", var.toString());
		         
		      
		         
		         if (bindingSet.getValue("stepComment")!=null) {
		         var = bindingSet.getValue("stepComment");
		         row.put("stepComment", var.toString());
		         }
		          var = bindingSet.getValue("agent");
		         row.put("agent", var.toString());
		          var = bindingSet.getValue("planType");
		         row.put("planType", var.toString());
		         resultSet.add(row);
		      }*/
		         BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	
}
	   return resultSet;
}

public ArrayList <HashMap> getOutputDetailsInExecutionTraces(String systemIRI, String infoRealizationIRI) {
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select *  Where {  ?infoRealization a sao:InformationRealization.?infoRealization rdfs:comment ?infoRealizationComment. Optional{ ?infoElement prov:wasMemberOf ?infoRealization.  ?infoElement a ?infoElementType. Optional {?infoElement rdfs:label ?infoElementLabel.} Optional {?infoElement rains:computedOnSlice ?slice.} Optional {?infoElement rains:computedOnDecisionThreshold ?decisionThreshold.} Optional{?infoElement  rains:hasResultValue ?resultValue.  } Optional {?infoElement rains:isEvaluationResultOf ?evaluationMeasure} Optional {?infoElement rains:hasResultLowerBound ?resultLowerBound.} Optional {?infoElement rains:hasResultUpperBound ?resultUpperBound} Optional {?infoElement rains:hasBase64Image ?image} OPTIONAL {?infoElement rdfs:comment ?infoElementComment.} Optional {?infoElement rains:isReusedObject ?reused} Optional {?infoElement rains:versionNote ?versionNote.} Optional {?infoElement rdfs:seeAlso ?seeAlso.}  Optional {?infoElement rains:version ?version.} Optional {?infoElement rains:versionDate ?versionDate} Optional{?infoElement sao:isAccountableFor ?isAccountableFor} FILTER(regex(str(?infoElementType), \"https://w3id.org/rains#\" )||regex(str(?infoElementType), \"https://w3id.org/sao#\" )||regex(str(?infoElementType), \"http://www.w3.org/ns/mls#\" )||regex(str(?infoElementType), \"http://purl.org/dc/terms/\" ))} } Order by ?infoElemenType Values (?infoRealization) {(<"+infoRealizationIRI+">)} ";
	System.out.println("Get info realization  details execution trace query" +queryString);
    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
	   try (TupleQueryResult result = tupleQuery.evaluate()) {
		      while (result.hasNext()) {  // iterate over the result
		    	HashMap <String,String> row = new HashMap <String,String>(); 
		        /*
		    	BindingSet bindingSet = result.next();			         
		        
		         Value var = bindingSet.getValue("infoElementType");
		         row.put("infoElementType", var.toString());
		        
		         if (bindingSet.getValue("infoElementComment")!=null) {
			         var = bindingSet.getValue("infoElementComment");
			         row.put("infoElementComment", var.toString());
			         }
		      
		         
		         if (bindingSet.getValue("infoRealizationComment")!=null) {
		         var = bindingSet.getValue("infoRealizationComment");
		         row.put("infoRealizationComment", var.toString());
		         }
		         
		         if (bindingSet.getValue("infoElementLabel")!=null) {
			         var = bindingSet.getValue("infoElementLabel");
			         row.put("infoElementLabel", var.toString());
			         }
		         resultSet.add(row);
		      }*/
		    	 BindingSet bindingSet = result.next();	
			    	
			    	Set <String> bindings = bindingSet.getBindingNames();  
			    	
			    	Iterator it2 = bindings.iterator();
			    	while (it2.hasNext()) {
			    		String key = (String) it2.next();
			    		if (bindingSet.getValue(key)!=null)
			    		row.put(key, bindingSet.getValue(key).toString()) ;
			    	}
			       
			         resultSet.add(row);
			      }
	
}
	   return resultSet;
}


public ArrayList <HashMap> getDependingActivities(String systemIRI, String entityIRI) {
	ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
	String queryString = Constants.PREFIXES + "Select Distinct ?activity ?stepType  Where { ?entity ep-plan:correspondsToVariable ?outputType. ?activity  prov:used ?entity; ep-plan:correspondsToStep ?step. ?step a ?stepType FILTER(regex(str(?stepType), \"https://w3id.org/rains#\" ))}Values (?entity) {(<"+entityIRI+">)}";
	System.out.println("Get depending details execution trace query" +queryString);
    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
	   try (TupleQueryResult result = tupleQuery.evaluate()) {
		      while (result.hasNext()) {  // iterate over the result
		    	HashMap <String,String> row = new HashMap <String,String>(); 
		        
		    	BindingSet bindingSet = result.next();			         
	        
		        	 Value    var = bindingSet.getValue("activity");
		         row.put("activity", var.toString());
		         
		          var = bindingSet.getValue("stepType");
		         row.put("stepType", var.toString());
		         
		         
		          
		         resultSet.add(row);
		      }
	
}
	   return resultSet;
}


public HashMap <String,HashMap <String,String >>getAccountableObjects (String systemIRI) {
	HashMap <String,HashMap <String,String >> map = new  HashMap   <String,HashMap <String, String >> ();
	String queryString = Constants.PREFIXES + "Select Distinct  ?object ?parentObject ?objectLabel Where { ?object sao:impacts* ?system; rdfs:label ?objectLabel. ?object sao:impacts ?parentObject. } Values (?system) {(<"+systemIRI+">)}";
	System.out.println("getAccountableObjects query" +queryString);
    TupleQuery   tupleQuery = conn.prepareTupleQuery(queryString);
	   try (TupleQueryResult result = tupleQuery.evaluate()) {
		      while (result.hasNext()) {  // iterate over the result
		    	HashMap <String,String> row = new HashMap <String,String>(); 
		        
		    	BindingSet bindingSet = result.next();			         
		      
		      
		         Value object = bindingSet.getValue("object");
		         Value parentObject = bindingSet.getValue("parentObject");
		         if (object!=null&&parentObject!=null) {
		         if (map.containsKey(parentObject.toString())) {			        	
		        	 map.get(parentObject.toString()).put(object.toString(),bindingSet.getValue("objectLabel").toString() );
		         }
		         else {
		        	 HashMap <String, String> map2 = new HashMap <String, String> ();
		        	 map2.put(object.toString(),bindingSet.getValue("objectLabel").toString());
		        	 map.put(parentObject.toString(), map2);
		         }
		         }
		      }
	
}
	   return map;
}

public void saveAccountableObject(String jsonPayload) {

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
	conn.add(results.getStatements(null, null, null, (Resource)null), f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	}
	else {
		System.out.println("model is null");
	}
	
}

public HashMap <String,ArrayList > getAfModelCard(String systemIRI) {
	  
	RepositoryResult<Statement> res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasAccountabilityTrace), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	
	// find named graphs for execution traces 
	HashSet <String> namedGraphsToQuery = new HashSet <String> ();
	while (res.hasNext()) {
		namedGraphsToQuery.add(res.next().getObject().toString());
	}
	// find named graphs for plans
	res= conn.getStatements(f.createIRI(systemIRI), f.createIRI(SystemComponentsIRI.hasPlansStoredInGraph), null, f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI));
	namedGraphsToQuery.add(res.next().getObject().toString());
	
	String fromPart = "";
	Iterator <String> it = namedGraphsToQuery.iterator();
	while (it.hasNext()) {
		fromPart = fromPart +  "FROM <" +it.next()+"> "; 
	}
	
HashMap <String,ArrayList > list = new HashMap <String,ArrayList >  ();	  

//GET RESULTS FOR THE MODEL OVERVIEW SECTION
ArrayList <HashMap> resultSet = new ArrayList <HashMap> ();
String queryString = Constants.PREFIXES + "Select Distinct ?version ?versionDate ?versionNote ?ownerComment ?ownerLabel ?overview ?name ?input ?output ?references ?algorithmComment ?licenseComment "+fromPart+" WHERE {?infoRealisation  ep-plan:correspondsToVariable ?var. ?var a rains:ModelComponent. ?model prov:wasMemberOf ?infoRealisation; a mls:Model. OPTIONAL{ ?model rdfs:comment ?overview.} OPTIONAL {?model rdfs:label ?name.} OPTIONAL { ?model rains:modelInputFormat ?input} OPTIONAL {?model rains:modelOutputFormat ?output} OPTIONAL {?model rdfs:seeAlso ?references} OPTIONAL {?algorithm prov:wasMemberOf ?infoRealisation; a mls:Algorithm. ?algorithm rdfs:comment ?algorithmComment. }  OPTIONAL {?license prov:wasMemberOf ?infoRealisation; a dcterms:LicenseDocument. ?license rdfs:comment ?licenseComment. }OPTIONAL {?owner prov:wasMemberOf ?infoRealisation; a sao:AccountableAgent; sao:isAccountableFor ?model. ?owner rdfs:comment ?ownerComment; rdfs:label ?ownerLabel.} OPTIONAL {?model rains:version ?version}OPTIONAL {?model rains:versionNote ?versionNote} OPTIONAL {?model rains:versionDate ?versionDate} }";
     System.out.println(queryString);
		TupleQuery tupleQuery = conn.prepareTupleQuery(queryString);
			   try (TupleQueryResult result = tupleQuery.evaluate()) {
				   while (result.hasNext()) {  // iterate over the result
				    	HashMap <String,String> row = new HashMap <String,String>(); 
				        
				    	
				    	
				    	BindingSet bindingSet = result.next();	
				    	
				    	Set <String> bindings = bindingSet.getBindingNames();  
				    	
				    	Iterator it2 = bindings.iterator();
				    	while (it2.hasNext()) {
				    		String key = (String) it2.next();
				    		if (bindingSet.getValue(key)!=null)
				    		row.put(key, bindingSet.getValue(key).toString()) ;
				    	}
				       
				         resultSet.add(row);
				      }	   
			   }
	    
	    list.put("model details", resultSet);
			   
	//GET RESULTS FOR THE CONSIDERATIONS SECTION
	    resultSet = new ArrayList <HashMap> ();
	    queryString = Constants.PREFIXES + "Select Distinct ?biasComment ?biasMitigation ?riskComment ?riskMitigation ?tradeoffComment ?limitationComment ?intendedUserGroupComment ?intendedUseCaseComment ?incorrectUseCaseComment "+fromPart+" WHERE {?infoRealisation  ep-plan:correspondsToVariable ?var. ?var a rains:ModelComponent. ?model prov:wasMemberOf ?infoRealisation; a mls:Model. OPTIONAL{?userGroup prov:wasMemberOf ?infoRealisation; a rains:IntendedUserGroup; rdfs:comment  ?intendedUserGroupComment }OPTIONAL{?intendedUseCase prov:wasMemberOf ?infoRealisation; a rains:IntendedUseCase; rdfs:comment  ?intendedUseCaseComment }OPTIONAL{?incorrectUseCase prov:wasMemberOf ?infoRealisation; a rains:IncorrectUseCase; rdfs:comment  ?incorrectUseCaseComment }OPTIONAL{?limitation prov:wasMemberOf ?infoRealisation; a rains:Limitation; rdfs:comment  ?limitationComment }OPTIONAL{?tradeoff prov:wasMemberOf ?infoRealisation; a rains:Tradeoff; rdfs:comment  ?tradeoffComment }OPTIONAL{?risk prov:wasMemberOf ?infoRealisation; a rains:Risk; rdfs:comment  ?riskComment. OPTIONAL {?risk rains:hasMitigationStrategy ?riskMitigation.  }} OPTIONAL{?bias prov:wasMemberOf ?infoRealisation; a rains:Bias; rdfs:comment  ?biasComment. OPTIONAL {?bias rains:hasMitigationStrategy ?biasMitigation.  }}}";
	         System.out.println(queryString);
	    		 tupleQuery = conn.prepareTupleQuery(queryString);
	    			   try (TupleQueryResult result = tupleQuery.evaluate()) {
	    				   while (result.hasNext()) {  // iterate over the result
	    				    	HashMap <String,String> row = new HashMap <String,String>(); 
	    				        
	    				    	
	    				    	
	    				    	BindingSet bindingSet = result.next();	
	    				    	
	    				    	Set <String> bindings = bindingSet.getBindingNames();  
	    				    	
	    				    	Iterator it2 = bindings.iterator();
	    				    	while (it2.hasNext()) {
	    				    		String key = (String) it2.next();
	    				    		if (bindingSet.getValue(key)!=null)
	    				    		row.put(key, bindingSet.getValue(key).toString()) ;
	    				    	}
	    				       
	    				         resultSet.add(row);
	    				      }	   
	    			   }
	    	    
	    	    list.put("considerations", resultSet);
	   
	    	  //GET RESULTS FOR THE TRAINING DATASET
	    	    resultSet = new ArrayList <HashMap> ();
	    	    queryString = Constants.PREFIXES + "Select Distinct ?dataset ?characteristic ?characteristicsLabel ?characteristicsComment ?characteristicsImage ?datasetLabel ?datasetComment "+fromPart+" WHERE {?trainingDatasetInfoRealization ep-plan:correspondsToVariable ?trainingVar.?trainingVar a rains:TrainingDataset. ?dataset prov:wasMemberOf ?trainingDatasetInfoRealization; a mls:Dataset; rains:hasRealizableObjectCharacteristic ?characteristic. ?characteristic rdfs:label ?characteristicsLabel. OPTIONAL {?characteristic rdfs:comment ?characteristicsComment.} OPTIONAL {?characteristic rains:hasBase64Image ?characteristicsImage.} OPTIONAL {?dataset rdfs:label ?datasetLabel.} OPTIONAL {?trainingDatasetInfoRealization rdfs:comment ?datasetComment.} }";
	    	         System.out.println(queryString);
	    	    		 tupleQuery = conn.prepareTupleQuery(queryString);
	    	    			   try (TupleQueryResult result = tupleQuery.evaluate()) {
	    	    				   while (result.hasNext()) {  // iterate over the result
	    	    				    	HashMap <String,String> row = new HashMap <String,String>(); 
	    	    				        
	    	    				    	
	    	    				    	
	    	    				    	BindingSet bindingSet = result.next();	
	    	    				    	
	    	    				    	Set <String> bindings = bindingSet.getBindingNames();  
	    	    				    	
	    	    				    	Iterator it2 = bindings.iterator();
	    	    				    	while (it2.hasNext()) {
	    	    				    		String key = (String) it2.next();
	    	    				    		if (bindingSet.getValue(key)!=null)
	    	    				    		row.put(key, bindingSet.getValue(key).toString()) ;
	    	    				    	}
	    	    				       
	    	    				         resultSet.add(row);
	    	    				      }	   
	    	    			   }
	    	    	    
	    	    	    list.put("training dataset", resultSet);
	    	  
	    	    	  //GET RESULTS FOR THE Evaluation DATASET
	    	    	    resultSet = new ArrayList <HashMap> ();
	    	    	    queryString = Constants.PREFIXES + "Select Distinct ?dataset ?characteristic ?characteristicsLabel ?characteristicsComment ?characteristicsImage ?datasetLabel ?datasetComment "+fromPart+" WHERE {?trainingDatasetInfoRealization ep-plan:correspondsToVariable ?trainingVar.?trainingVar a rains:EvaluationDataset. ?dataset prov:wasMemberOf ?trainingDatasetInfoRealization; a mls:Dataset; rains:hasRealizableObjectCharacteristic ?characteristic. ?characteristic rdfs:label ?characteristicsLabel. OPTIONAL {?characteristic rdfs:comment ?characteristicsComment.} OPTIONAL {?characteristic rains:hasBase64Image ?characteristicsImage.} OPTIONAL {?dataset rdfs:label ?datasetLabel.} OPTIONAL {?trainingDatasetInfoRealization rdfs:comment ?datasetComment.} }";
	    	    	         System.out.println(queryString);
	    	    	    		 tupleQuery = conn.prepareTupleQuery(queryString);
	    	    	    			   try (TupleQueryResult result = tupleQuery.evaluate()) {
	    	    	    				   while (result.hasNext()) {  // iterate over the result
	    	    	    				    	HashMap <String,String> row = new HashMap <String,String>(); 
	    	    	    				        
	    	    	    				    	
	    	    	    				    	
	    	    	    				    	BindingSet bindingSet = result.next();	
	    	    	    				    	
	    	    	    				    	Set <String> bindings = bindingSet.getBindingNames();  
	    	    	    				    	
	    	    	    				    	Iterator it2 = bindings.iterator();
	    	    	    				    	while (it2.hasNext()) {
	    	    	    				    		String key = (String) it2.next();
	    	    	    				    		if (bindingSet.getValue(key)!=null)
	    	    	    				    		row.put(key, bindingSet.getValue(key).toString()) ;
	    	    	    				    	}
	    	    	    				       
	    	    	    				         resultSet.add(row);
	    	    	    				      }	   
	    	    	    			   }
	    	    	    	    
	    	    	    	    list.put("evaluation dataset", resultSet);
	    	    	    	    
	    	    	    	  //GET RESULTS FOR THE Evaluation Results
	    	    	    	    resultSet = new ArrayList <HashMap> ();
	    	    	    	    queryString = Constants.PREFIXES + "Select Distinct ?evalCollection ?evalResultLabel ?evalResultComment ?evalResultValue ?evalResultImage ?evalResultSlice ?evalResultDecisionThreshold ?evalResultUpperBound ?evalResultLowerBound ?evalMeasureLabel ?evalMeasureComment "+fromPart+" WHERE {?evalCollection ep-plan:correspondsToVariable ?evalVar.?evalVar a rains:Evaluation. ?evalResult prov:wasMemberOf ?evalCollection; a mls:ModelEvaluation. OPTIONAL {?evalResult rdfs:label ?evalResultLabel} OPTIONAL {?evalResult rdfs:comment ?evalResultComment} OPTIONAL {?evalResult rains:hasResultValue ?evalResultValue} OPTIONAL {?evalResult rains:hasResultLowerBound ?evalResultLowerBound} OPTIONAL {?evalResult rains:hasResultUpperBound ?evalResultUpperBound} OPTIONAL {?evalResult rains:hasBase64Image ?evalResultImage} OPTIONAL {?evalResult rains:computedOnSlice ?evalResultSlice} OPTIONAL {?evalResult rains:computedOnDecisionThreshold ?evalResultDecisionThreshold} OPTIONAL {?evalResult rains:isEvaluationResultOf ?evalMeasure OPTIONAL {?evalMeasure rdfs:label ?evalMeasureLabel} OPTIONAL {?evalMeasure rdfs:comment ?evalMeasureComment} } }";
	    	    	    	    System.out.println(queryString);
	    	    	    	    		 tupleQuery = conn.prepareTupleQuery(queryString);
	    	    	    	    			   try (TupleQueryResult result = tupleQuery.evaluate()) {
	    	    	    	    				   while (result.hasNext()) {  // iterate over the result
	    	    	    	    				    	HashMap <String,String> row = new HashMap <String,String>(); 
	    	    	    	    				        
	    	    	    	    				    	
	    	    	    	    				    	
	    	    	    	    				    	BindingSet bindingSet = result.next();	
	    	    	    	    				    	
	    	    	    	    				    	Set <String> bindings = bindingSet.getBindingNames();  
	    	    	    	    				    	
	    	    	    	    				    	Iterator it2 = bindings.iterator();
	    	    	    	    				    	while (it2.hasNext()) {
	    	    	    	    				    		String key = (String) it2.next();
	    	    	    	    				    		if (bindingSet.getValue(key)!=null)
	    	    	    	    				    		row.put(key, bindingSet.getValue(key).toString()) ;
	    	    	    	    				    	}
	    	    	    	    				       
	    	    	    	    				         resultSet.add(row);
	    	    	    	    				      }	   
	    	    	    	    			   }
	    	    	    	    	    
	    	    	    	    	    list.put("evaluation results", resultSet);
	    
	    
	    return list;
	
}



}


