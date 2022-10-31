if(IDF_VERSION_MAJOR GREATER_EQUAL 4)
    idf_component_register(SRC_DIRS src
        PRIV_REQUIRES
            log
            driver
            nvs_flash
            esp32-camera
            esp_http_client
            esp_websocket_client
        INCLUDE_DIRS include)
else()
    set(COMPONENT_SRCDIRS src)
    set(COMPONENT_ADD_INCLUDEDIRS include)
    set(COMPONENT_PRIV_REQUIRES 
            log
            driver
            nvs_flash
            esp32-camera
            esp_http_client
            esp_websocket_client)
    register_component()
endif()
