/*
 * ws_client.c
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/event_groups.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_websocket_client.h"
#include "esp_event.h"
#include "esp_system.h"

#include "wifi_ws_client.h"

#define NO_DATA_TIMEOUT_SEC 300

/** \brief Tag for ESP logging */
static const char *TAG = "CCAMNotary Websocket Client";

/* ----------------------------- SHUTDOWN TIMER ----------------------------- */

static TimerHandle_t shutdown_signal_timer;
static SemaphoreHandle_t shutdown_sema;

esp_websocket_client_handle_t client;

/**
 * @brief Handler called after 10 seconds of no data
 *
 * Closes the websocket connection after no data has been received for 10 seconds.
 * This may need to be changed––though I'm not sure about HTTP standards on the topic.
 *
 * @param xTimer
 */
static void shutdown_signaler(TimerHandle_t xTimer)
{
  ESP_LOGI(TAG, "No data received for %d seconds, signaling shutdown", NO_DATA_TIMEOUT_SEC);
  xSemaphoreGive(shutdown_sema);
}

/* ---------------------------- WEBSOCKET EVENTS ---------------------------- */

/**
 * @brief Handles any event coming from the websocket.
 *
 * All events are simply logged, except for data events in which the data is
 * logged and the shutdown timer is reset to keep the websocket connection open.
 *
 * @param handler_args
 * @param base
 * @param event_id
 * @param event_data
 */
static void websocket_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
  esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
  switch (event_id)
  {
  case WEBSOCKET_EVENT_CONNECTED:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_CONNECTED");
    // send a client_type message to initialize connection
    char init_msg[64] = "{\"type\": \"client_type\", \"data\": \"controller\"}";
    ESP_LOGI(TAG, "Sending %s", init_msg);
    esp_websocket_client_send_text(client, init_msg, strlen(init_msg), portMAX_DELAY);
    break;
  case WEBSOCKET_EVENT_DISCONNECTED:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_DISCONNECTED");
    break;
  case WEBSOCKET_EVENT_DATA:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_DATA");
    // opcode 10 is just pings, ignore those
    if (data->op_code != 10)
    {
      ESP_LOGI(TAG, "Received opcode=%d", data->op_code);
      ESP_LOGI(TAG, "Received=%.*s", data->data_len, (char *)data->data_ptr);
      ESP_LOGW(TAG, "Total payload length=%d, data-len=%d, current payload offset=%d\r\n", data->payload_len, data->data_len, data->payload_offset);
    }
    xTimerReset(shutdown_signal_timer, portMAX_DELAY);
    break;
  case WEBSOCKET_EVENT_ERROR:
    ESP_LOGI(TAG, "WEBSOCKET_EVENT_ERROR");
    break;
  }
}

/**
 * @brief Begins the websocket connection.
 */
void websocket_client_start(void)
{
  // init the websocket connection config
  esp_websocket_client_config_t websocket_cfg = {
      .uri = WEBSOCKET_URI};

  // create the shutdown signal, called after no data for NO_DATA_TIMEOUT_SEC seconds
  shutdown_signal_timer = xTimerCreate("Websocket shutdown timer", NO_DATA_TIMEOUT_SEC * 1000 / portTICK_PERIOD_MS, pdFALSE, NULL, shutdown_signaler);
  shutdown_sema = xSemaphoreCreateBinary();

  // begin the connection, with the above event handler for all events
  ESP_LOGI(TAG, "Connecting to %s...", websocket_cfg.uri);
  client = esp_websocket_client_init(&websocket_cfg);
  esp_websocket_register_events(client, WEBSOCKET_EVENT_ANY, websocket_event_handler, (void *)client);
  esp_websocket_client_start(client);
  xTimerStart(shutdown_signal_timer, portMAX_DELAY);
}

/**
 * @brief Sends a message through the websocket. Should already be JSON-encoded
 */
void websocket_client_send(const char *data, int len)
{
  // send the message
  if (esp_websocket_client_is_connected(client))
  {
    ESP_LOGI(TAG, "Sending %s", data);
    esp_websocket_client_send_text(client, data, len, portMAX_DELAY);
  }
  else
  {
    ESP_LOGW(TAG, "Failed to send message '%s' - websocket is not connected.", data);
  }
}

/**
 * @brief Ends the websocket connection.
 */
void websocket_client_stop(void)
{
  // shut down the websocket
  xSemaphoreTake(shutdown_sema, portMAX_DELAY);
  esp_websocket_client_stop(client);
  ESP_LOGI(TAG, "websocket stopped");
  esp_websocket_client_destroy(client);
}