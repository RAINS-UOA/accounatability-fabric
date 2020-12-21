# rains-workflow-builder

# How to run

Prerequisites

Java 1.8 +
Maven
Git 
Graph DB download form <a href="https://graphdb.ontotext.com/">here</a>

## Set up Graph DB

Create a repository called AccountabilityFabric and make sure you chose the option Ruleset - no inference 

The app will b elooking for a repository with this name so don't run the Accountability Fabric before you create the repository


## Acountability Fabric

````
git clone --single-branch --branch ESWC-2020 https://github.com/RAINS-UOA/rains-workflow-builder.git
````

then cd into the project directory and run 

````
mvn spring-boot:run
````

Go to localhost:8080 and you shoudl see the landing page of the accounatbility fabric
