#
# "main" pseudo-component makefile.
#
# (Uses default behaviour of compiling all source files in directory, adding 'include' to include path.)
COMPONENT_ADD_INCLUDEDIRS = include
COMPONENT_SRCDIRS = src src/bl
COMPONENT_PRIV_REQUIRES = log driver nvs_flash esp32-button bt

ifeq ($(GCC_NOT_5_2_0), 1)
hid_device_le_prf.o:
CFLAGS += -Wno-unused-const-variable
          endif