if(IDF_VERSION_MAJOR GREATER_EQUAL 4)
    idf_component_register(SRC_DIRS src src/bl
        PRIV_REQUIRES
            log
            driver
            nvs_flash
            esp32-button
            bt
        INCLUDE_DIRS include include/bl)
else()
    set(COMPONENT_SRCDIRS src src/bl)
    set(COMPONENT_ADD_INCLUDEDIRS include include/bl)
    set(COMPONENT_PRIV_REQUIRES 
            log
            driver
            nvs_flash
            esp32-button
            bt)
    register_component()
endif()

if(GCC_NOT_5_2_0)
    component_compile_options(-Wno-unused-const-variable)
    endif()
