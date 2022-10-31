#
# "main" pseudo-component makefile.
#
# (Uses default behaviour of compiling all source files in directory, adding 'include' to include path.)
COMPONENT_ADD_INCLUDEDIRS = include
COMPONENT_SRCDIRS = src
COMPONENT_PRIV_REQUIRES = log driver nvs_flash esp32-camera esp_websocket_client