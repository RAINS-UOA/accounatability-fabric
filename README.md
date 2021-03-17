# rains-workflow-builder

# How to run

Prerequisites

Java 1.8 +,
Maven,
Git, 
Graph DB download from <a href="https://graphdb.ontotext.com/">here</a>

## Set up Graph DB
Launch GraphDB, by default, you can access GraphDB from a browser on localhost:7200.

Create a repository called AccountabilityFabric and make sure you chose the option Ruleset - no inference:
![](readmefigures/IC.png)

The app will be looking for a repository with this name so don't run the Accountability Fabric before you create the repository


## Acountability Fabric

````
git clone --single-branch --branch ESWC-2021 https://github.com/RAINS-UOA/rains-workflow-builder.git
````

then cd into the project directory and run 

````
mvn spring-boot:run
````

Go to localhost:8080 and you should see the landing page of the Accounatbility Fabric

---
The work presented here is licensed under a Creative Commons Attribution NonCommercial ShareAlike 4.0 International License (CC BY-NC-SA 4.0) https://creativecommons.org/licenses/by-nc-sa/4.0/
