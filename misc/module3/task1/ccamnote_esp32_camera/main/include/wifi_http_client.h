/*
 * wifi_http_client.h
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space, 
 */

#ifndef __WIFI_HTTP_CLIENT_H__
#define __WIFI_HTTP_CLIENT_H__

#include "esp_log.h"
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_camera.h"

#include "config.h"

// sends JPEG image data as a POST request to the HTTP server
esp_err_t http_post_image(const char *post_url, camera_fb_t *fb);

#endif /* __WIFI_HTTP_CLIENT_H__  */