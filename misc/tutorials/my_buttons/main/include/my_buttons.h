#ifndef __MY_BUTTON_H__
#define __MY_BUTTON_H__

#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "button.h"
#include "config.h"

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

// type representing a single button
typedef struct {
  uint8_t pin;
} button_t;

// our button event state
typedef struct {
  uint16_t state;
} my_buttons_event_t;

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

/**
 * @brief Returns the queue in which button events will be emitted
 * 
 * @return QueueHandle_t 
 */
QueueHandle_t my_buttons_init(void);

#endif /* __MY_BUTTON_H__ */