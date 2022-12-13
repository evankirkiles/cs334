#ifndef CONFIG_H
#define CONFIG_H

#include "driver/adc.h"
#include "driver/gpio.h"

// Bluetooth device config
#define HIDD_DEVICE_NAME "PersonalSpace"

// Configuration for controller inputs
// Joysticks
#define CONFIG_PIN_JOYSTICK_1_VRX ADC1_CHANNEL_6 // GPIO34, using ADC1_6
#define CONFIG_PIN_JOYSTICK_1_VRY ADC1_CHANNEL_7 // GPIO35, using ADC1_7
#define CONFIG_PIN_JOYSTICK_1_SW 0               // Unset
#define CONFIG_PIN_JOYSTICK_2_VRX ADC1_CHANNEL_4 // GPIO32, using ADC1_4
#define CONFIG_PIN_JOYSTICK_2_VRY ADC1_CHANNEL_5 // GPIO33, using ADC1_5
#define CONFIG_PIN_JOYSTICK_2_SW 0               // Unset

// Standard gamepad button mapping
/** Right arrow pad (Down, Right, Left, Up) */
#define CONFIG_PIN_BUTTON_0 0
#define CONFIG_PIN_BUTTON_1 0
#define CONFIG_PIN_BUTTON_2 0
#define CONFIG_PIN_BUTTON_3 0
/** Top shoulder triggers (Left, Right) */
#define CONFIG_PIN_BUTTON_4 GPIO_NUM_19
#define CONFIG_PIN_BUTTON_5 GPIO_NUM_17
/** Bottom shoulder triggers (Left, Right) */
#define CONFIG_PIN_BUTTON_6 GPIO_NUM_18
#define CONFIG_PIN_BUTTON_7 GPIO_NUM_5
// Select button
#define CONFIG_PIN_BUTTON_8 0
// Start button
#define CONFIG_PIN_BUTTON_9 0
// Joystick presses (Left, Right)
#define CONFIG_PIN_BUTTON_10 CONFIG_PIN_JOYSTICK_1_SW
#define CONFIG_PIN_BUTTON_11 CONFIG_PIN_JOYSTICK_2_SW
/** Left arrow pad (Down, Right, Left, Up) */
#define CONFIG_PIN_BUTTON_12 0
#define CONFIG_PIN_BUTTON_13 0
#define CONFIG_PIN_BUTTON_14 0
#define CONFIG_PIN_BUTTON_15 0

#endif /* CONFIG_H */
