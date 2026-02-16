package com.realestate.onlinerealestate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
@EnableAsync
public class OnlineRealEstateSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnlineRealEstateSystemApplication.class, args);
    }
}

// package com.realestate.onlinerealestate;

//
// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;
//
// @SpringBootApplication
// public class OnlineRealEstateSystemApplication {
//
// public static void main(String[] args) {
// SpringApplication.run(OnlineRealEstateSystemApplication.class, args);
// }
//
// }
