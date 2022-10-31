/*
 * wifi_ws_client.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space, 
 */

#ifndef __WIFI_WS_CLIENT_H__
#define __WIFI_WS_CLIENT_H__

#include "esp_event.h"

#include "config.h"

// set this to point to the websocket URI you will be sending controller inputs to.
#define WEBSOCKET_URI CONFIG_WEBSOCKET_URI

esp_err_t websocket_client_start(void);
void websocket_client_send(const char *data, int len);
esp_err_t websocket_client_listen(esp_event_handler_t event_handler);
void websocket_client_stop(void);

#endif /* __WIFI_WS_CLIENT_H__  */