package com.subscript;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SmpApplication {

  public static void main(String[] args) {
    SpringApplication.run(SmpApplication.class, args);
  }
}
