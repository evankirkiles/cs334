#ifndef CONFIG_H
#define CONFIG_H

#include "driver/adc.h"
#include "driver/gpio.h"

// Bluetooth device config
#define HIDD_DEVICE_NAME "PersonalSpace"

// Configuration for controller inputs
// Joysticks
#define CONFIG_PIN_JOYSTICK_1_VRX ADC1_CHANNEL_6  // GPIO34, using ADC
#define CONFIG_PIN_JOYSTICK_1_VRY ADC1_CHANNEL_7  // GPIO35, using ADC
#define CONFIG_PIN_JOYSTICK_1_SW GPIO_NUM_25 // GPIO25
#define CONFIG_PIN_JOYSTICK_2_VRX ADC1_CHANNEL_4  // GPIO32, using ADC
#define CONFIG_PIN_JOYSTICK_2_VRY ADC1_CHANNEL_5  // GPIO33, using ADC
#define CONFIG_PIN_JOYSTICK_2_SW GPIO_NUM_26 // GPIO26
// Buttons
#define CONFIG_PIN_BUTTON_1 GPIO_NUM_27
#define CONFIG_PIN_BUTTON_2 GPIO_NUM_28

#endif /* CONFIG_H */
 