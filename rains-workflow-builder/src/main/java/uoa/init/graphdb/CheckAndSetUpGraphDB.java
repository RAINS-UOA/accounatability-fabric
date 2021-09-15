package uoa.init.graphdb;






import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Iterator;
import java.util.UUID;

import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
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
import org.eclipse.rdf4j.repository.RepositoryException;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;
import org.eclipse.rdf4j.rio.RDFParseException;
import org.springframework.util.ResourceUtils;

import uoa.semantic.system.SystemComponentsIRI;
import uoa.web.controller.ServiceController;
import uoa.web.storage.AuthorisationCacheStorage;






public class CheckAndSetUpGraphDB {



public static void checkRepositorySetUp () throws ClientProtocolException, IOException {
	
	RepositoryManager repositoryManager = new RemoteRepositoryManager( "http://localhost:7200" );
	// Get the repository from repository manager, note the repository id set in configuration .ttl file
	//https://graphdb.ontotext.com/documentation/free/configuring-a-repository.html#configure-a-repository-programmatically
	
	Repository repository = GraphDBUtils.getFabricRepository(repositoryManager);
	
		
    if (repository==null) {
      	//HAndle if there  is no repository
    	System.out.println ("Creating  Accountability Fabric Repository");
    	
    	CloseableHttpClient httpClient = HttpClients.createDefault();
    	HttpPost configureRepository = new HttpPost("http://localhost:7200/rest/repositories");
    	MultipartEntityBuilder builder = MultipartEntityBuilder.create();

    	// This attaches the file to the POST:
    	File f = ResourceUtils.getFile("classpath:AccountabilityFabricRepositoryConfig.ttl");   	
    	builder.addBinaryBody(
    	    "config",
    	    new FileInputStream(f),
    	    ContentType.APPLICATION_OCTET_STREAM,
    	    f.getName()
    	);

    	HttpEntity multipart = builder.build();
    	configureRepository.setEntity(multipart);
    	CloseableHttpResponse response = httpClient.execute(configureRepository);
    	HttpEntity responseEntity = response.getEntity();
    	//to do - check if it worked
    	repository = GraphDBUtils.getFabricRepository(repositoryManager);
    	
    	
    	
    }
	
	
	
    if (repository!=null) {
    
    	//set up connection for service controll as well 
    	ServiceController.repository = repository;
    	
    	ServiceController.connectionPool = new GenericObjectPool<RepositoryConnection>(new ConnectionFactory(repository));
    	
    	ValueFactory f = repository.getValueFactory();

	// Open a connection to this repository
	RepositoryConnection conn = repository.getConnection();	
	
	//check if rainsnamespace present
	if (!GraphDBUtils.checkNamespacePresent (conn.getNamespaces(), Constants.RAINS_PLAN_NAMESPACE)) {
		System.out.println ("Setting rains namespace") ; 
		conn.setNamespace("rains", Constants.RAINS_PLAN_NAMESPACE);
	}
	
	if (!GraphDBUtils.checkNamespacePresent (conn.getNamespaces(), Constants.AF_NAMESPACE)) {
		System.out.println ("Setting accountability fabric namespace") ; 
		conn.setNamespace("af", Constants.AF_NAMESPACE);
	}
	
	if (!GraphDBUtils.checkResourcePresent (conn.getContextIDs(), Constants.SYSTEMS_NAMED_GRAPH_IRI)) {
		System.out.println ("Adding the default Systems named graph") ;
		
		IRI context = f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI);
		conn.add(f.createIRI(Constants.SYSTEMS_NAMED_GRAPH_IRI), RDF.TYPE, f.createIRI(SystemComponentsIRI.SYSTEM_COLLECTION), context); 		
	}
	
	if (!GraphDBUtils.checkResourcePresent (conn.getContextIDs(), Constants.TEMPLATES_NAMED_GRAPH_IRI)) {
		System.out.println ("Adding the default Templates named graph") ;
		
		IRI context = f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI);
		conn.add(f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI), RDF.TYPE, f.createIRI(SystemComponentsIRI.TEMPLATE_COLLECTION), context); 		
	}
	
	if (!GraphDBUtils.checkResourcePresent (conn.getContextIDs(), Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI)) {
		System.out.println ("Adding the System Components named graph") ;
		
		//Resource componentCollection = f.createIRI(Constants.TEMPLATES_NAMED_GRAPH_IRI+"/"+UUID.randomUUID());
		IRI context = f.createIRI( Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI);
		conn.add(f.createIRI( Constants.WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI), RDF.TYPE, f.createIRI(SystemComponentsIRI.COMPONENT_COLLECTION), context); 
		
		try {
			GraphDBUtils.addDefaultSystemComponentNamedGraphOntologies(context,conn);
		} catch (RDFParseException | RepositoryException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
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
	
	
	//create Authorisation Cache SQLLite database
	
	AuthorisationCacheStorage.createNewDatabase();
	
    }
    
    else {
    	
    	//HAndle if there  is still no repository
    	 System.out.println("Could not connet to the GraphDB repository. ");
    	 System.exit (0);
    	 
    }
	
}







}
