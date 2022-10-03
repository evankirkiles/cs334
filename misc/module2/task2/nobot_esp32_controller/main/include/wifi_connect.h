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

#include "sdkconfig.h"

/* The examples use WiFi configuration that you can set via project configuration menu
   If you'd rather not, just change the below entries to strings with
   the config you want - ie #define EXAMPLE_WIFI_SSID "mywifissid"
*/
#define ESP_WIFI_SSID CONFIG_ESP_WIFI_SSID
#define ESP_WIFI_PASS CONFIG_ESP_WIFI_PASSWORD
#define ESP_MAXIMUM_RETRY CONFIG_ESP_MAXIMUM_RETRY

void wifi_init_sta(void);

#endif /* __WIFI_CONNECT_H__  */