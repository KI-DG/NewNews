package com.ssafy.specialization;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InitDbService {

    private final InitDb initDb;

//    @PostConstruct
//    public void test(){
//        initDb.init();
//    }

}
