/*
 * bt_helper.c
 * author: evan kirkiles
 * created on Thu Dec 08 2022
 * 2022 the nobot space,
 */

#include "bt_helper.h"
#include "config.h"
#include "esp_log.h"
#include <string.h>

static const char* TAG = "bt_helper.c";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

static bool connected = false;
static bool sec_conn = false;
static uint16_t hid_conn_id;

static uint8_t hidd_service_uuid128[] = {
    /* LSB <--------------------------------------------------------------------------------> MSB */
    // first uuid, 16bit, [12],[13] is the value
    0xfb,
    0x34,
    0x9b,
    0x5f,
    0x80,
    0x00,
    0x00,
    0x80,
    0x00,
    0x10,
    0x00,
    0x00,
    0x12,
    0x18,
    0x00,
    0x00,
};

static esp_ble_adv_data_t hidd_adv_data = {
    .set_scan_rsp = false,
    .include_name = true,
    .include_txpower = true,
    .min_interval = 0x0006,  // slave connection min interval, Time = min_interval * 1.25 msec
    .max_interval = 0x0010,  // slave connection max interval, Time = max_interval * 1.25 msec
    .appearance = 0x03c4,    // HID Gamepad,
    .manufacturer_len = 0,
    .p_manufacturer_data = NULL,
    .service_data_len = 0,
    .p_service_data = NULL,
    .service_uuid_len = sizeof(hidd_service_uuid128),
    .p_service_uuid = hidd_service_uuid128,
    .flag = 0x6,
};

static esp_ble_adv_params_t hidd_adv_params = {
    .adv_int_min = 0x20,
    .adv_int_max = 0x30,
    .adv_type = ADV_TYPE_IND,
    .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
    .channel_map = ADV_CHNL_ALL,
    .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
};

/* -------------------------------------------------------------------------- */
/*                                  CALLBACKS                                 */
/* -------------------------------------------------------------------------- */

/**
 * @brief Callback for bluetooth HIDD events.
 *
 * @param event
 * @param param
 */
void hidd_event_callback(esp_hidd_cb_event_t event, esp_hidd_cb_param_t* param) {
  switch (event) {
    case ESP_HIDD_EVENT_REG_FINISH: {
      ESP_LOGI(TAG, "ESP_HIDD_EVENT_REG_FINISH");
      if (param->init_finish.state == ESP_HIDD_INIT_OK) {
        esp_ble_gap_set_device_name(HIDD_DEVICE_NAME);
        esp_ble_gap_config_adv_data(&hidd_adv_data);
      }
      break;
    }
    case ESP_BAT_EVENT_REG:
      ESP_LOGI(TAG, "ESP_BAT_EVENT_REG");
      break;
    case ESP_HIDD_EVENT_DEINIT_FINISH:
      ESP_LOGI(TAG, "ESP_HIDD_EVENT_DEINIT_FINISH");
      break;
    case ESP_HIDD_EVENT_BLE_CONNECT: {
      ESP_LOGI(TAG, "ESP_HIDD_EVENT_BLE_CONNECT");
      connected = true;
      hid_conn_id = param->connect.conn_id;
      // on connect, update the connection for higher timeout value
      esp_ble_conn_update_params_t conn_params = {0};
      memcpy(conn_params.bda, param->connect.remote_bda, sizeof(esp_bd_addr_t));
      conn_params.latency = 0;
      conn_params.max_int = 0x20;
      conn_params.min_int = 0x10;
      conn_params.timeout = 400;
      esp_ble_gap_update_conn_params(&conn_params);
      break;
    }
    case ESP_HIDD_EVENT_BLE_DISCONNECT: {
      ESP_LOGI(TAG, "ESP_HIDD_EVENT_BLE_DISCONNECT");
      sec_conn = false;
      connected = false;
      esp_ble_gap_start_advertising(&hidd_adv_params);
      break;
    }
    case ESP_HIDD_EVENT_BLE_VENDOR_REPORT_WRITE_EVT: {
      ESP_LOGI(TAG, "%s, ESP_HIDD_EVENT_BLE_VENDOR_REPORT_WRITE_EVT", __func__);
      ESP_LOG_BUFFER_HEX(TAG, param->vendor_write.data, param->vendor_write.length);
    }
    default:
      break;
  }
  return;
}

/**
 * @brief Callback for generic access profile (GAP) events.
 *
 * @param event
 * @param param
 */
void gap_event_callback(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t* param) {
  switch (event) {
    case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
      ESP_LOGI(TAG, "ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT");
      esp_ble_gap_start_advertising(&hidd_adv_params);
      break;
    case ESP_GAP_BLE_SEC_REQ_EVT:
      ESP_LOGI(TAG, "ESP_GAP_BLE_SEC_REQ_EVT");
      for (int i = 0; i < ESP_BD_ADDR_LEN; i++)
        ESP_LOGD(TAG, "%x:", param->ble_security.ble_req.bd_addr[i]);
      break;
    case ESP_GAP_BLE_AUTH_CMPL_EVT:
      ESP_LOGI(TAG, "ESP_GAP_BLE_AUTH_CMPL_EVT");
      sec_conn = true;
      esp_bd_addr_t bd_addr;
      memcpy(bd_addr, param->ble_security.auth_cmpl.bd_addr, sizeof(esp_bd_addr_t));
      ESP_LOGI(TAG, "remote BD_ADDR: %08x%04x",
               (bd_addr[0] << 24) + (bd_addr[1] << 16) + (bd_addr[2] << 8) + bd_addr[3],
               (bd_addr[4] << 8) + bd_addr[5]);
      ESP_LOGI(TAG, "address type = %d", param->ble_security.auth_cmpl.addr_type);
      ESP_LOGI(TAG, "pair status = %s", param->ble_security.auth_cmpl.success ? "success" : "fail");
      if (!param->ble_security.auth_cmpl.success)
        ESP_LOGE(TAG, "fail reason = 0x%x", param->ble_security.auth_cmpl.fail_reason);
      break;
    default:
      break;
  }
}

/**
 * @brief Attempts to send the value of the joystick over BLE
 *
 * @param joystick_buttons
 * @param joystick_x
 * @param joystick_y
 * @param joystick_2_x
 * @param joystick_2_y
 * @return true
 * @return false
 */
bool hidd_send_joystick_value(uint16_t joystick_buttons, uint8_t joystick_x, uint8_t joystick_y, uint8_t joystick_2_x, uint8_t joystick_2_y) {
  if (!connected) return false;
  esp_hidd_send_joystick_value(hid_conn_id, joystick_buttons, joystick_x, joystick_y, joystick_2_x, joystick_2_y);
  return true;
}