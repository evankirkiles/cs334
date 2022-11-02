#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_spi_flash.h"

#include "my_buttons.h"

#define TAG "MyButtonsMain"

/* -------------------------------------------------------------------------- */
/*                              STATIC FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * @brief Task for reading the button state from my_buttons_init
 *
 * @param pvParameter Placeholder values to pass into the function (not used)
 */
static void read_buttons_task(void *pvParameter) {
  // start the button event queue
  QueueHandle_t my_buttons_queue = my_buttons_init();
  my_buttons_event_t ev_buttons = {};

  // continually loop to read input from our buttons
  while (true) {
    // wait up to 30ms for any button events in the queue
    if (xQueueReceive(my_buttons_queue, &ev_buttons, 30 / portTICK_PERIOD_MS)) {
      // if we got a button event, log it!
      ESP_LOGI(TAG, "BUTTON STATE: %d %d", !!(ev_buttons.state & 0b10), !!(ev_buttons.state & 0b01));
    }
  }
}

/**
 * @brief Begins the task to read our button state
 *
 * @return esp_err_t ESP_OK (never fails)
 */
static esp_err_t read_buttons_init(void) {
  xTaskCreate(read_buttons_task, "read_buttons_task", 2048, NULL, 4, NULL);
  return ESP_OK;
}

/* -------------------------------------------------------------------------- */
/*                               MAIN EXECUTION                               */
/* -------------------------------------------------------------------------- */

/**
 * @brief Our main project function.
 *
 * You will always want this function to initiate some sort of infinite loop,
 * either through a FreeRTOS task or by implementing your own. The former is
 * far easier, however.
 */
void app_main(void) {
  esp_err_t ret;

  // 1. initialize non-volatile storage. if we're out of memory or there's a new
  // version, attempt to erase the current NVS and re-initialize it.
  ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  // 2. now begin our button read task
  ESP_ERROR_CHECK(read_buttons_init());
}