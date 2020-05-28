package uoa.init.graphdb;

import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.eclipse.rdf4j.repository.Repository;
import org.eclipse.rdf4j.repository.RepositoryConnection;
import org.eclipse.rdf4j.repository.manager.RepositoryManager;

public class ConnectionFactory extends BasePooledObjectFactory<RepositoryConnection>   {
	Repository repository;
	
	public ConnectionFactory(Repository repository) {
		this.repository = repository; 
	}

	@Override
	public RepositoryConnection create() throws Exception {
			
		RepositoryConnection conn = repository.getConnection();	
		return conn;
	}

	@Override
	public PooledObject<RepositoryConnection> wrap(RepositoryConnection obj) {
		// TODO Auto-generated method stub
		return new DefaultPooledObject<RepositoryConnection>(obj);
	}

}
