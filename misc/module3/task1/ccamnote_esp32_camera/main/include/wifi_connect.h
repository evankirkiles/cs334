/*
 * wifi_connect.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

// INSPIRED BY: https://github.com/espressif/esp-idf/blob/v4.2/examples/common_components/protocol_examples_common/connect.c
// The above is the standard espressif example for connecting to wifi. See the
// function example_connect(), which is implemented below in wifi_connect().

#ifndef __WIFI_CONNECT_H__
#define __WIFI_CONNECT_H__

#include "esp_wifi.h"
#include "esp_event.h"

#include "config.h"

esp_err_t wifi_init_sta(void);

#endif /* __WIFI_CONNECT_H__  */