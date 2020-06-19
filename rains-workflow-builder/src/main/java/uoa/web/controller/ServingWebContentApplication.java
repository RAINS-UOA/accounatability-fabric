package uoa.web.controller;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import uoa.init.graphdb.CheckAndSetUpGraphDB;
import uoa.web.storage.FileUploadStorageProperties;
import uoa.web.storage.FileUploadStorageService;

@SpringBootApplication
@EnableConfigurationProperties(FileUploadStorageProperties.class)
public class ServingWebContentApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServingWebContentApplication.class, args);
        CheckAndSetUpGraphDB.checkRepositorySetUp();
    }

    @Bean
	CommandLineRunner init(FileUploadStorageService storageService) {
		return (args) -> {
			storageService.deleteAll();
			storageService.init();
		};
	}
}
