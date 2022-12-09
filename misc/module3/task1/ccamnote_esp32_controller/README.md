# Module 3, Task 1: Controller

_by Evan Kirkiles. Nov. 1, 2022_

the controller is a standalone system that emits state-based messages over websockets to a server. it reads state from two components:

1. a button using the `esp32-button` component, and
2. a capacitive touch sensor using the `esp32-touch` driver.

the state diff is calculated within the controller and used to only send events when something actually changes in the controller itself.

## Development

To run the controller's code, you'll need the [Espressif IDE](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html).

```bash
# clone the git repository and navigate into the controller
$ git clone --recurse-submodules -j8 git@github.com:evankirkiles/cs334.git
$ cd cs334/misc/module3/task1/ccamnote_esp32_controller

# load ESP-IDF environment variables
$ $IDF_PATH/export.sh
```

now, make any modifications to `main/include/config.h`, changing the WiFi credentials and server URL. then, build & flash your ESP32. it is highly recommended to use the [VSCode Espressif IDF](https://marketplace.visualstudio.com/items?itemName=espressif.esp-idf-extension) extension, as this provides a GUI for running the `idf.py` commands below:

```bash
# build the code
$ idf.py build

# flash to your connected ESP-32, replacing the port
#   e.g. idf.py flash -p /dev/cu.usbserial-1410
$ idf.py flash -p <USB-PORT-FOR-ESP32>
```

if everything worked, you should begin receiving controller input on the server configured in `config.h`!

### Common Problems

the submodule for the `esp32-button` component is sometimes broken. in that case, you can simply download the `esp32-button` repository from [here](https://github.com/craftmetrics/esp32-button) and put that in your `components/` folder. make sure you `invert` the debouncer as well, otherwise your button inputs will be inverted.
