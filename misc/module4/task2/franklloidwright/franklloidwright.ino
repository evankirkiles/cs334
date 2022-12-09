#include <Servo.h>

Servo leftArmServo;
Servo rightArmServo;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  leftArmServo.attach(5);
  rightArmServo.attach(4);
}

void loop() {
  // put your main code here, to run repeatedly:
  leftArmServo.write(60); // rotate both servos in opposite directiions
  rightArmServo.write(107);
  delay(500);
}
