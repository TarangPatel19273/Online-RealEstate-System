package com.realestate.onlinerealestate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
@EnableAsync
public class OnlineRealEstateSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnlineRealEstateSystemApplication.class, args);
    }

    @Bean
    public ApplicationRunner initDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE loan_applications ALTER COLUMN status TYPE VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Could not alter status column: " + e.getMessage());
            }
        };
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
