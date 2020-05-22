package uoa.web.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import uoa.init.graphdb.CheckAndSetUpGraphDB;

@SpringBootApplication
public class ServingWebContentApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServingWebContentApplication.class, args);
        CheckAndSetUpGraphDB.checkRepositorySetUp();
    }

}
