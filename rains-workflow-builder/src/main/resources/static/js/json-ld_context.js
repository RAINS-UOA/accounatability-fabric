var context = {};

//PROV context

context.wasStartedAtTime = "http://www.w3.org/ns/prov#startedAtTime";
context.wasAssociatedWith = {"@id":"http://www.w3.org/ns/prov#wasAssociatedWith","@type": "@id"};


//Rains context

context.AccountabilityPlan   = "https://w3id.org/rains-plan#AccountabilityPlan";

context.DesigStep   = "https://w3id.org/rains-plan#Design";
context.ImplementationStep   = "https://w3id.org/rains-plan#Implementation";
context.DeploymentStep   = "https://w3id.org/rains-plan#Deployment";
context.OperationStep   = "https://w3id.org/rains-plan#Operation";

//AF context

context.DesignStageTemplate   = "https://rainsproject.org/af#DesignStageTemplate";
context.ImplementationStageTemplate   = "https://rainsproject.org/af#ImplementationStageTemplate";
context.DeploymentStageTemplate   = "https://rainsproject.org/af#DeploymentStageTemplate";
context.OperationStageTemplate   = "https://rainsproject.org/af#OperationStageTemplate";
context.belongsToRow ="https://rainsproject.org/af#belongsToRow";
//rdfs context

context.label = "http://www.w3.org/2000/01/rdf-schema#label";

//ep-plan terms 
context.Activity	= "https://w3id.org/ep-plan#Activity";
context.Agent	= "https://w3id.org/ep-plan#Agent";
context.Communication	= "https://w3id.org/ep-plan#Communication";
context.CommunicationSpecification	= "https://w3id.org/ep-plan#CommunicationSpecification";
context.Constraint	= "https://w3id.org/ep-plan#Constraint";
context.ConstraintEvaluation	= "https://w3id.org/ep-plan#ConstraintEvaluation";
context.Entity	= "https://w3id.org/ep-plan#Entity";
context.EntityCollection	= "https://w3id.org/ep-plan#EntityCollection";
context.ExecutionTraceBundle	= "https://w3id.org/ep-plan#ExecutionTraceBundle";
context.FailedActivity	= "https://w3id.org/ep-plan#FailedActivity";
context.MultiActivity	= "https://w3id.org/ep-plan#MultiActivity";
context.MultiStep	= "https://w3id.org/ep-plan#MultiStep";
context.MultiVariable	= "https://w3id.org/ep-plan#MultiVariable";
context.Objective	= "https://w3id.org/ep-plan#Objective";
context.Plan	= "https://w3id.org/ep-plan#Plan";
context.Policy	= "https://w3id.org/ep-plan#Policy";
context.Rationale	= "https://w3id.org/ep-plan#Rationale";
context.ResponsibleAgent	= "https://w3id.org/ep-plan#ResponsibleAgent";
context.Step	= "https://w3id.org/ep-plan#Step";
context.Variable	= "https://w3id.org/ep-plan#Variable";
context.achieves	= {"@id":"https://w3id.org/ep-plan#achieves","@type": "@id"};
context.constrains	= {"@id":"https://w3id.org/ep-plan#constrains","@type": "@id"};
context.correspondsToCommunicationSpecification	= {"@id":"https://w3id.org/ep-plan#correspondsToCommunicationSpecification","@type": "@id"};
context.correspondsToStep	= {"@id":"https://w3id.org/ep-plan#correspondsToStep","@type": "@id"};
context.correspondsToVariable	= {"@id":"https://w3id.org/ep-plan#correspondsToVariable","@type": "@id"};
context.decomposesMultiStep	= {"@id":"https://w3id.org/ep-plan#decomposesMultiStep","@type": "@id"};
context.evaluatedAgainst	= {"@id":"https://w3id.org/ep-plan#evaluatedAgainst","@type": "@id"};
context.evaluatedFor	= {"@id":"https://w3id.org/ep-plan#evaluatedFor","@type": "@id"};
context.evaluatedTraceElement	= {"@id":"https://w3id.org/ep-plan#evaluatedTraceElement","@type": "@id"};
context.hasConstraint	= {"@id":"https://w3id.org/ep-plan#hasConstraint","@type": "@id"};
context.hasConstraintImplementation	= {"@id":"https://w3id.org/ep-plan#hasConstraintImplementation","@type": "@id"};
context.hasCorrespondingActivity	= {"@id":"https://w3id.org/ep-plan#hasCorrespondingActivity","@type": "@id"};
context.hasCorrespondingCommunication	= {"@id":"https://w3id.org/ep-plan#hasCorrespondingCommunication","@type": "@id"};
context.hasCorrespondingEntity	= {"@id":"https://w3id.org/ep-plan#hasCorrespondingEntity","@type": "@id"};
context.hasInputVariable	= {"@id":"https://w3id.org/ep-plan#hasInputVariable","@type": "@id"};
context.hasOutputVariable	= {"@id":"https://w3id.org/ep-plan#hasOutputVariable","@type": "@id"};
context.hasPart	= {"@id":"https://w3id.org/ep-plan#hasPart","@type": "@id"};
context.hasPayload	= {"@id":"https://w3id.org/ep-plan#hasPayload","@type": "@id"};
context.hasPermittedAgent	= {"@id":"https://w3id.org/ep-plan#hasPermittedAgent","@type": "@id"};
context.hasRationale	= {"@id":"https://w3id.org/ep-plan#hasRationale","@type": "@id"};
context.hasRecipient	= {"@id":"https://w3id.org/ep-plan#hasRecipient","@type": "@id"};
context.hasSender	= {"@id":"https://w3id.org/ep-plan#hasSender","@type": "@id"};
context.hasTraceElement	= {"@id":"https://w3id.org/ep-plan#hasTraceElement","@type": "@id"};
context.includesCommunicationSpecification	= {"@id":"https://w3id.org/ep-plan#includesCommunicationSpecification","@type": "@id"};
context.includesConstraint	= {"@id":"https://w3id.org/ep-plan#includesConstraint","@type": "@id"};
context.includesObjective	= {"@id":"https://w3id.org/ep-plan#includesObjective","@type": "@id"};
context.includesPlanElement	= {"@id":"https://w3id.org/ep-plan#includesPlanElement","@type": "@id"};
context.includesPolicy	= {"@id":"https://w3id.org/ep-plan#includesPolicy","@type": "@id"};
context.includesResponsibleAgent	= {"@id":"https://w3id.org/ep-plan#includesResponsibleAgent","@type": "@id"};
context.includesStep	= {"@id":"https://w3id.org/ep-plan#includesStep","@type": "@id"};
context.includesSubPlan	= {"@id":"https://w3id.org/ep-plan#includesSubPlan","@type": "@id"};
context.includesVariable	= {"@id":"https://w3id.org/ep-plan#includesVariable","@type": "@id"};
context.isAchievedBy	= {"@id":"https://w3id.org/ep-plan#isAchievedBy","@type": "@id"};
context.isCommunicationSpecificationOfPlan	= {"@id":"https://w3id.org/ep-plan#isCommunicationSpecificationOfPlan","@type": "@id"};
context.isConstraintImplementationOf	= {"@id":"https://w3id.org/ep-plan#isConstraintImplementationOf","@type": "@id"};
context.isConstraintOfPlan	= {"@id":"https://w3id.org/ep-plan#isConstraintOfPlan","@type": "@id"};
context.isDecomposedAsPlan	= {"@id":"https://w3id.org/ep-plan#isDecomposedAsPlan","@type": "@id"};

context.isElementOfPlan	= {"@id":"https://w3id.org/ep-plan#isElementOfPlan","@type": "@id"};

context.isElementOfTrace	= {"@id":"https://w3id.org/ep-plan#isElementOfTrace","@type": "@id"};
context.isInputVariableOf	= {"@id":"https://w3id.org/ep-plan#isInputVariableOf","@type": "@id"};
context.isObjectiveOfPlan	= {"@id":"https://w3id.org/ep-plan#isObjectiveOfPlan","@type": "@id"};
context.isOutputVariableOf	= {"@id":"https://w3id.org/ep-plan#isOutputVariableOf","@type": "@id"};
context.isPartOf	= {"@id":"https://w3id.org/ep-plan#isPartOf","@type": "@id"};
context.isPayloadIn	= {"@id":"https://w3id.org/ep-plan#isPayloadIn","@type": "@id"};
context.isPermittedAgentFor	= {"@id":"https://w3id.org/ep-plan#isPermittedAgentFor","@type": "@id"};
context.isPolicyOfPlan	= {"@id":"https://w3id.org/ep-plan#isPolicyOfPlan","@type": "@id"};
context.isPrecededBy	= {"@id":"https://w3id.org/ep-plan#isPrecededBy","@type": "@id"};
context.isQualifiedEvaluationOf	= {"@id":"https://w3id.org/ep-plan#isQualifiedEvaluationOf","@type": "@id"};
context.isRationaleOf	= {"@id":"https://w3id.org/ep-plan#isRationaleOf","@type": "@id"};
context.isRecipientIn	= {"@id":"https://w3id.org/ep-plan#isRecipientIn","@type": "@id"};
context.isResponsibleAgentOfPlan	= {"@id":"https://w3id.org/ep-plan#isResponsibleAgentOfPlan","@type": "@id"};
context.isSenderIn	= {"@id":"https://w3id.org/ep-plan#isSenderIn","@type": "@id"};
context.isStepOfPlan	= {"@id":"https://w3id.org/ep-plan#isStepOfPlan","@type": "@id"};
context.isSubPlanOfPlan	= {"@id":"https://w3id.org/ep-plan#isSubPlanOfPlan","@type": "@id"};
context.isVariableOfPlan	= {"@id":"https://w3id.org/ep-plan#isVariableOfPlan","@type": "@id"};
context.precedes	= {"@id":"https://w3id.org/ep-plan#precedes","@type": "@id"};
context.qualifiedEvaluation	= {"@id":"https://w3id.org/ep-plan#qualifiedEvaluation","@type": "@id"};
context.satisfied	= {"@id":"https://w3id.org/ep-plan#satisfied","@type": "@id"};
context.satisfiedBy	= {"@id":"https://w3id.org/ep-plan#satisfiedBy","@type": "@id"};
context.violated	= {"@id":"https://w3id.org/ep-plan#violated","@type": "@id"};
context.violatedBy	= {"@id":"https://w3id.org/ep-plan#violatedBy","@type": "@id"};
context.wasEvaluatedtraceElement	= {"@id":"https://w3id.org/ep-plan#wasEvaluatedtraceElement","@type": "@id"};