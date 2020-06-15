package uoa.semantic.system;

import uoa.init.graphdb.Constants;

public class SystemComponentsIRI {

	public static final String TEMPLATE_COLLECTION = Constants.AF_NAMESPACE + "TemplatesCollection"; 

	public static String SYSTEM_COLLECTION = Constants.AF_NAMESPACE + "SystemsCollection"; 
	
	public static String hasPlansStoredInGraph  = Constants.AF_NAMESPACE + "hasPlansStoredInGraph";
	
	public static final String DESIGN_STAGE_TEMPLATE = Constants.AF_NAMESPACE + "DesignStageTemplate";
	
	public static final String IMPLEMENTATION_STAGE_TEMPLATE = Constants.AF_NAMESPACE + "ImplemenationStageTemplate";
	
	public static final String DEPLOYMENT_STAGE_TEMPLATE = Constants.AF_NAMESPACE + "DeploymentStageTemplate";
	
	public static final String OPERATION_STAGE_TEMPLATE = Constants.AF_NAMESPACE + "OperationStageTemplate";

	public static final String COMPONENT_COLLECTION = Constants.AF_NAMESPACE + "ComponentCollection";
}
