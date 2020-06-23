package uoa.init.graphdb;

import java.util.UUID;

public class Constants {
	
	public static String AUTHORISATION_CACHE_DATABASE_PATH = System.getProperty("user.dir")+"/src/main/resources/sqlite/authorisationCache";
	
	public static final String EPPLAN_NAMESPACE = "https://w3id.org/ep-plan#";

	public static final  String  DEFAULT_NAMED_GRAPH_NAMESPACE ="https://rainsproject.org/NamedGraph/";

	public static final String TEMPLATES_NAMED_GRAPH_IRI ="https://rainsproject.org/Templates";
	
	public static final String WORKFLOW_COMPONENTS_NAMED_GRAPH_IRI ="https://rainsproject.org/WorkflowComponents";

	public static final String GRAPH_DB_URL  = "http://localhost:7200";
	
	public static final String DEFAULT_INSTANCE_NAMESPACE  = "https://rainsproject.org/InstanceData/";
	
	public static final String FABRIC_REPOSITORY_NAME = "AccountabilityFabric"; 

	public static final String SYSTEMS_NAMED_GRAPH_IRI = "https://rainsproject.org/Systems";
	
	public static final String AF_NAMESPACE = "https://rainsproject.org/af#";
	
	public static final String RAINS_PLAN_NAMESPACE = "https://w3id.org/rains-plan#";
	
	public static final String PROV_NAMESPACE = "http://www.w3.org/ns/prov#";
	
	public static final String PREFIXES = "Prefix af: <"+AF_NAMESPACE+"> Prefix ep-plan: <"+EPPLAN_NAMESPACE+"> Prefix rains: <"+RAINS_PLAN_NAMESPACE+"> Prefix prov: <"+PROV_NAMESPACE+">";
	
}
