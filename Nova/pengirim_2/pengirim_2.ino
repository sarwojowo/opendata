#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>

String senddata;
unsigned int id = 1;
StaticJsonDocument<200> doc;
#define led 4
#define echo_1 8
#define echo_2 6
#define echo_3 7
#define trig_pin 5

int jarak_s1 = 0;
int jarak_s2 = 0;
int jarak_s3 = 0;

int baca_sensor_jarak(int echo_pin) {
  digitalWrite(trig_pin, LOW);
  delayMicroseconds(2);
  digitalWrite(trig_pin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig_pin, LOW);

  long pulse = pulseIn(echo_pin, HIGH);
  int cm = pulse * 0.034 / 2;
  return cm;
}

void cek_jarak() {
  jarak_s1 = baca_sensor_jarak(echo_1);
  delay(50);
  jarak_s2 = baca_sensor_jarak(echo_2);
  delay(50);
  jarak_s3 = baca_sensor_jarak(echo_3);

  Serial.print(String(jarak_s1) + "/");
  Serial.print(String(jarak_s2) + "/");
  Serial.println(String(jarak_s3));
}


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(led, OUTPUT);
  pinMode(trig_pin, OUTPUT);
  pinMode(echo_1, INPUT);
  pinMode(echo_2, INPUT);
  pinMode(echo_3, INPUT);
  while (!Serial) continue;
  //  while (!Serial);
  delay(1000);
  Serial.println("LoRa Sender");

  if (!LoRa.begin(920100000)) {  // 920.1 MHz
    Serial.println("Starting LoRa failed!");
    while (1)
      ;
  }
  LoRa.setSyncWord(0x34);
  // Setup Power,dBm
  LoRa.setTxPower(20);
  // Setup Coding Rate:5(4/5),6(4/6),7(4/7),8(4/8)
  LoRa.setCodingRate4(8);
  // Setup BandWidth, option: 7800,10400,15600,20800,31200,41700,62500,125000,250000,500000
  // Lower BandWidth for longer distance.
  LoRa.setSignalBandwidth(500000); 
  // Setup Spreading Factor (6 ~ 12)
  LoRa.setSpreadingFactor(7);
}

String format_device(int deviceid) {
  if (deviceid > 0 && deviceid < 10) {
    return "000" + String(deviceid);
  }
  if (deviceid >= 10 && deviceid < 100) {
    return "00" + String(deviceid);
  }
  if (deviceid >= 100 && deviceid < 1000) {
    return "0" + String(deviceid);
  }
  if (deviceid >= 1000 && deviceid < 10000) {
    return String(deviceid);
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(led, HIGH);
  cek_jarak();
 
  doc["id"] = format_device(id);
  doc["sensor_1"] = jarak_s1;
  doc["sensor_2"] = jarak_s2;
  doc["sensor_3"] = jarak_s3;

  serializeJson(doc, senddata);
  //senddata = "{\"item\":\"kereta\",\"id\":" + format_device(id) + "}";
  Serial.print("Sending packet: ");
  Serial.println(senddata);

  // send packet
  LoRa.beginPacket();
  LoRa.print(senddata);
  LoRa.print("\n");
  LoRa.endPacket(true);
  digitalWrite(led, LOW);
  senddata = "";
  delay(10);
}
