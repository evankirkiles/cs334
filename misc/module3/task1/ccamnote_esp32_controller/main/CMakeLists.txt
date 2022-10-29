if(IDF_VERSION_MAJOR GREATER_EQUAL 4)
    idf_component_register(SRC_DIRS src
        PRIV_REQUIRES log driver esp32-button esp_websocket_client nvs_flash
        INCLUDE_DIRS include)
else()
    set(COMPONENT_SRCDIRS src)
    set(COMPONENT_ADD_INCLUDEDIRS include)
    set(COMPONENT_PRIV_REQUIRES esp32-button esp_websocket_client)
    register_component()
endif()
