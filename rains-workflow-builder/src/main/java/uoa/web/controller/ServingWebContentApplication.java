package uoa.web.controller;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;
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

    public static void main(String[] args) throws ClientProtocolException, IOException {
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
