package uoa.init.graphdb;

import java.util.ArrayList;
import java.util.Iterator;

import org.eclipse.rdf4j.model.Namespace;
import org.eclipse.rdf4j.model.Resource;
import org.eclipse.rdf4j.model.Statement;
import org.eclipse.rdf4j.model.ValueFactory;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.RepositoryResult;
import org.eclipse.rdf4j.repository.manager.RemoteRepositoryManager;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;

public class GraphDBUtils {

	
 public static Repository getFabricRepository (RepositoryManager repositoryManager ) {
	repositoryManager.init();
	Repository repository = repositoryManager.getRepository(Constants.FABRIC_REPOSITORY_NAME);
	return repository;
}
 
 
 public static RepositoryManager getRepositoryManager () {
	 
	 return new RemoteRepositoryManager( Constants.GRAPH_DB_URL  ); 
 }
 

	
 public static boolean checkResourcePresent (RepositoryResult <Resource> res, String iriToLookFor) {
		boolean present = false; 
	    Iterator <Resource> it = res.iterator();
		
		while (it.hasNext()) {
			
			Resource element = it.next(); 
			if (element.stringValue().equals(iriToLookFor) ) {
				present = true;
			}
		}

	return present;
	}

 public static boolean checkNamespacePresent (RepositoryResult <Namespace> res, String iriToLookFor) {
		boolean present = false; 
	    Iterator <Namespace> it = res.iterator();
		
		while (it.hasNext()) {
			
			Namespace element = it.next(); 
			if (element.getName().equals(iriToLookFor) ) {
				present = true;
			}
		}

	return present;
	}
 
 
 
}
