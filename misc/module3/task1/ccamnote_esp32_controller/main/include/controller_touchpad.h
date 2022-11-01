/*
 * controller_touchpad.h
 * author: evan kirkiles
 * created on Mon Oct 31 2022
 * 2022 the nobot space, 
 */

#ifndef __CONTROLLER_TOUCHPAD_H__
#define __CONTROLLER_TOUCHPAD_H__

#include "config.h"
#include "esp_log.h"
#include "driver/touch_pad.h"
#include "stdbool.h"

/* -------------------------------------------------------------------------- */
/*                                    PINS                                    */
/* -------------------------------------------------------------------------- */

// touchpad enters on GPIO pin 13
#define TOUCHPAD_PIN CONFIG_PIN_TOUCHPAD
// less than this value = touchpad pressed, higiher = touchpad unpressed
#define TOUCHPAD_TOUCHED_THRESHOLD (500)

struct QueueDefinition;
typedef struct QueueDefinition* QueueHandle_t;

/* -------------------------------------------------------------------------- */
/*                                  TEMPLATES                                 */
/* -------------------------------------------------------------------------- */

// the event handler for the controller buttons
QueueHandle_t controller_touchpad_init(void);

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

typedef struct {
  bool state;
} controller_touchpad_event_t;

#endif /* __CONTROLLER_BUTTONS_H__ */