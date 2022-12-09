/*
 * bt_helper.h
 * author: evan kirkiles
 * created on Thu Dec 08 2022
 * 2022 the nobot space, 
 */
#ifndef BT_HELPER_H
#define BT_HELPER_H

// bluetooth includes
#include "esp_bt.h"
#include "esp_hidd_prf_api.h"
#include "esp_bt_defs.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_gatt_defs.h"
#include "esp_bt_main.h"
#include "esp_bt_device.h"
#include "hid_dev.h"

void hidd_event_callback(esp_hidd_cb_event_t event, esp_hidd_cb_param_t *param);
void gap_event_callback(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param);
bool hidd_send_joystick_value(uint16_t joystick_buttons, uint8_t joystick_x, uint8_t joystick_y, uint8_t joystick_2_x, uint8_t joystick_2_y);

#endif /* BT_HELPER_H */
