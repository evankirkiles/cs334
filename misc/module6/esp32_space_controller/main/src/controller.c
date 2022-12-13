/*
 * controller.c
 * author: evan kirkiles
 * created on Thu Dec 08 2022
 * 2022 the nobot space,
 */

#include "config.h"
#include "controller.h"
#include "freertos/FreeRTOS.h"
#include "button.h"
#include "bt_helper.h"
#include "esp_log.h"

// tag for ESP logging
static const char *TAG = "controller.c";

/* -------------------------------------------------------------------------- */
/*                                   BUTTONS                                  */
/* -------------------------------------------------------------------------- */

typedef struct {
  uint8_t pin;
} button_t;

// button maps for easy button reference
#define BUTTON_SELECT (             \
    PIN_BIT(CONFIG_PIN_BUTTON_0) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_1) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_2) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_3) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_4) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_5) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_6) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_7) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_8) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_9) |  \
    PIN_BIT(CONFIG_PIN_BUTTON_10) | \
    PIN_BIT(CONFIG_PIN_BUTTON_11) | \
    PIN_BIT(CONFIG_PIN_BUTTON_12) | \
    PIN_BIT(CONFIG_PIN_BUTTON_13) | \
    PIN_BIT(CONFIG_PIN_BUTTON_14) | \
    PIN_BIT(CONFIG_PIN_BUTTON_15))
static const button_t button_idx_map[] = {
    [0] { CONFIG_PIN_BUTTON_0 },
    [1] { CONFIG_PIN_BUTTON_1 },
    [2] { CONFIG_PIN_BUTTON_2 },
    [3] { CONFIG_PIN_BUTTON_3 },
    [4] { CONFIG_PIN_BUTTON_4 },
    [5] { CONFIG_PIN_BUTTON_5 },
    [6] { CONFIG_PIN_BUTTON_6 },
    [7] { CONFIG_PIN_BUTTON_7 },
    [8] { CONFIG_PIN_BUTTON_8 },
    [9] { CONFIG_PIN_BUTTON_9 },
    [10] { CONFIG_PIN_BUTTON_10 },
    [11] { CONFIG_PIN_BUTTON_11 },
    [12] { CONFIG_PIN_BUTTON_12 },
    [13] { CONFIG_PIN_BUTTON_13 },
    [14] { CONFIG_PIN_BUTTON_14 },
    [15] { CONFIG_PIN_BUTTON_15 },
};
static const size_t button_idx_map_length = sizeof(button_idx_map) / sizeof(button_t);

// queue into which button events are placed
static QueueHandle_t button_queue;

/**
 * @brief Manages button states across the controller
 *
 * When the button press state changes, emits a binary representation of the
 * press state across all of the buttons.
 *
 * @param pvParameter Placeholder parameter for xTaskCreate
 */
static void read_buttons_task(void *pvParameter) {
  // begin esp32-button reading task
  button_event_t ev;
  uint16_t button_state = 0;       // current buttons inputs
  uint16_t last_button_state = 0;  // previous button inputs

  // start button reading queue
  QueueHandle_t button_events = button_init(BUTTON_SELECT);
  while (true) {
    // attempt to read an event from the button queue into ev
    if (xQueueReceive(button_events, &ev, 20 / portTICK_PERIOD_MS)) {
      // if successul, search for the matching button pin
      for (int i = 0; i < button_idx_map_length; i++) {
        if (button_idx_map[i].pin == ev.pin) {
          // log the button event, and update button state
          ESP_LOGD(TAG, "button pin: %d event: %d idx: %d", ev.pin, ev.event, i);
          if (ev.event == BUTTON_UP) {
            button_state &= ~(1 << i);
          } else {
            button_state |= (1 << i);
          }
        }
      }
      // emit the button event to the main queue if the button state has changed
      if (button_state != last_button_state) {
        xQueueSend(button_queue, &button_state, 20 / portTICK_PERIOD_MS);
        last_button_state = button_state;
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                  JOYSTICKS                                 */
/* -------------------------------------------------------------------------- */

/**
 * @brief Reads analog joystick input from an ADC channel.
 *
 * The ESP32 integrates two 12-bit SAR (Successive Approximation Register) ADCs,
 * supporting a total of 18 measurement channels (analog enabled pins).
 *
 * The ADC driver API supports ADC1 (8 channels, attached to GPIOs 32 - 39), and
 * ADC2 (10 channels, attached to GPIOs 0, 2, 4, 12 - 15 and 25 - 27). However,
 * the usage of ADC2 has some restrictions for the application:
 *
 * 1. ADC2 is used by the Wi-Fi driver. Therefore the application can only use
 *      ADC2 when the Wi-Fi driver has not started.
 * 2. Some of the ADC2 pins are used as strapping pins (GPIO 0, 2, 15) thus
 *      cannot be used freely.
 *
 * @param channel The input ADC channel.
 * @return uint8_t - The analog input (0-255) to the channel.
 */
static uint8_t read_joystick_channel(adc1_channel_t channel) {
  adc1_config_width(ADC_WIDTH_BIT_10);                  // Range 0-1023
  adc1_config_channel_atten(channel, ADC_ATTEN_DB_11);  // ADC_ATTEN_DB_11 = 0-3,6V
  return (uint8_t)(adc1_get_raw(channel) >> 2);         // Read analog and shift to 0-255
}

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */

/**
 * @brief The task for reading / emitting events from the controller.
 *
 * @param pvParameter A placeholder parameter to pass to the task.
 */
static void read_controller_task(void *pvParameter) {
  // begin button monitoring
  button_queue = xQueueCreate(4, sizeof(uint16_t));
  xTaskCreate(read_buttons_task, "button_task", 2048, NULL, 2, NULL);

  // maintain state of controller buttons
  uint8_t js1_x, js1_y;
  uint8_t js2_x, js2_y;
  uint16_t s_buttons = 0;
  uint16_t s_buttons_last = 0;
  uint32_t s_joysticks = 0;
  uint32_t s_joysticks_last = 0;

  // continually loop to get input
  while (true) {
    // spend 20ms to receive any button events
    if (xQueueReceive(button_queue, &s_buttons, 20 / portTICK_PERIOD_MS))
      ESP_LOGD(TAG, "buttons changed: %d", s_buttons);
    // read in joystick values, rotated 90º counterclockwise
    js1_x = 0xFF - read_joystick_channel(CONFIG_PIN_JOYSTICK_1_VRY);
    js1_y = read_joystick_channel(CONFIG_PIN_JOYSTICK_1_VRX);
    js2_x = 0xFF - read_joystick_channel(CONFIG_PIN_JOYSTICK_2_VRY);
    js2_y = read_joystick_channel(CONFIG_PIN_JOYSTICK_2_VRX);
    // convert to checksum
    s_joysticks = (js2_x << 24) + (js2_y << 16) + (js1_x << 8) + js1_y;
    // if something changed, transmit across bluetooth
    if (s_joysticks != s_joysticks_last || s_buttons != s_buttons_last) {
      ESP_LOGD(TAG, "emitted event: BUTTONS: (%d) JS1: (%d,%d) JS2: (%d,%d)", s_buttons, js1_x, js1_y, js2_x, js2_y);
      hidd_send_joystick_value(s_buttons, js1_x, js1_y, js2_x, js2_y);
      // current values are now previous ones
      s_buttons_last = s_buttons;
      s_joysticks_last = s_joysticks;
    }
  }
}

/**
 * @brief Begins the controller reading task
 *
 * @return esp_err_t
 */
esp_err_t controller_init(void) {
  xTaskCreate(read_controller_task, "controller_task", 2048, NULL, 1, NULL);
  return ESP_OK;
}