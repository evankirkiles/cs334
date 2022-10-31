/*
 * wifi_http_client.c
 * author: evan kirkiles
 * created on Thu Oct 27 2022
 * 2022 the nobot space,
 */

#include "wifi_http_client.h"

#define MAX_HTTP_RECV_BUFFER 512
#define MAX_HTTP_OUTPUT_BUFFER 2048

static const char *TAG = "CCAMNotary HTTP Client";

/**
 * @brief Handles received HTTP events from the HTTP client.
 *
 * @param evt
 * @return esp_err_t
 */
esp_err_t _http_event_handler(esp_http_client_event_t *evt) {
  switch (evt->event_id) {
    case HTTP_EVENT_ERROR:
      ESP_LOGD(TAG, "HTTP_EVENT_ERROR");
      break;
    case HTTP_EVENT_ON_CONNECTED:
      ESP_LOGD(TAG, "HTTP_EVENT_ON_CONNECTED");
      break;
    case HTTP_EVENT_HEADER_SENT:
      ESP_LOGD(TAG, "HTTP_EVENT_HEADER_SENT");
      break;
    case HTTP_EVENT_ON_HEADER:
      ESP_LOGD(TAG, "HTTP_EVENT_ON_HEADER, key=%s, value=%s", evt->header_key, evt->header_value);
      break;
    case HTTP_EVENT_ON_DATA:
      ESP_LOGD(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
      break;
    case HTTP_EVENT_ON_FINISH:
      ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
      break;
    case HTTP_EVENT_DISCONNECTED:
      ESP_LOGD(TAG, "HTTP_EVENT_DISCONNECTED");
      break;
  }
  return ESP_OK;
}

/**
 * @brief Sends a JPEG image buffer in an HTTP request to the server
 *
 * @param post_url The full URL of the server to post to
 * @param buf The frame buffer represented as uint8_ts, from fb->buf
 * @param buflen The length of the frame buffer, from fb->len
 */
esp_err_t http_post_image(const char *post_url, camera_fb_t *fb) {
  esp_http_client_config_t config = {
      .url = post_url,
      .event_handler = _http_event_handler,
      .method = HTTP_METHOD_POST,
  };

  // init the HTTP client, attaching the image data to the post field
  esp_http_client_handle_t http_client = esp_http_client_init(&config);
  esp_http_client_set_method(http_client, HTTP_METHOD_POST);
  esp_http_client_set_post_field(http_client, (const char *)fb->buf, fb->len);
  esp_http_client_set_header(http_client, "Content-Type", "image/jpg");

  // send the HTTP client's request
  esp_err_t err = esp_http_client_perform(http_client);
  if (err == ESP_OK) {
    int status_code = esp_http_client_get_status_code(http_client);
    ESP_LOGI(TAG, "Sent buffer of len %d. Got status code %d.", fb->len, status_code);
  }

  // clean up the HTTP client now
  esp_http_client_cleanup(http_client);

  return err;
}