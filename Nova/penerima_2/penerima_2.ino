/*********
  urutan sensor (kiri) (pintu) (kanan)
                123              456
*********/

#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Arduino.h>
#include <EEPROM.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
Servo pintu;

extern const char* default_nama_ssid = "wifi-iot";
extern const char* default_password = "password-iot";
extern const char* default_server = "http://labrobotika.go-web.my.id/server.php?apikey=";
extern const char* default_apikey = "c98010165fdf50397ec5cdd4fd61cc32";
String nama_ssid;
String password;
String server_url;
String apikey;
AsyncWebServer server(80);
int reset_default = 0;


//define the pins used by the transceiver module
#define ss 5
#define rst 14
#define dio0 2

#define led_merah 13
#define led_hijau 12
#define buzzer 26
#define pin_servo 27
#define trig_pin 15
#define echo_4 32
#define echo_5 34
#define echo_6 35

int tutup = 180;
int buka = 0;
int posisi_pintu = 0;
int sirine = 0;
int timer_sirine = 0;
float distance = 9999;
float batas_distance = 1.0;  //default 1 meter


String load, data;
char json[32];
StaticJsonDocument<200> doc;

int id;
int jarak_s1 = 0;
int jarak_s2 = 0;
int jarak_s3 = 0;
int jarak_s4 = 0;
int jarak_s5 = 0;
int jarak_s6 = 0;


String urutan_deteksi_pengirim = "";
String urutan_deteksi_penerima = "";
String status_kanan = "";
String status_kiri = "";
String status_pintu = "buka";
int jarak_deteksi = 30;

int dummy_1 = 0;
int dummy_2 = 0;
int dummy_3 = 0;
int dummy_4 = 0;
int dummy_5 = 0;
int dummy_6 = 0;

int timer = 0;
int interval_sirine = 500;


String out_1 = "0";
String out_2 = "0";
String out_3 = "0";
String out_4 = "0";
String out_5 = "0";
String out_6 = "0";
String out_7 = "0";
String out_8 = "0";
String out_9 = "0";
String out_10 = "0";
String out_11 = "0";
String out_12 = "0";
String out_13 = "0";


void debug(String message) {
  Serial.println(message);
}


void writeStringToEEPROM(int address, const String& str) {
  int len = str.length();
  EEPROM.write(address, len);
  for (int i = 0; i < len; i++) {
    EEPROM.write(address + 1 + i, str[i]);
  }
}
String readStringFromEEPROM(int address) {
  int len = EEPROM.read(address);
  char data[len + 1];
  for (int i = 0; i < len; i++) {
    data[i] = EEPROM.read(address + 1 + i);
  }
  data[len] = '\0';
  return String(data);
}
void saveCredentialsToEEPROM() {
  EEPROM.begin(512);
  writeStringToEEPROM(0, nama_ssid);
  writeStringToEEPROM(64, password);
  writeStringToEEPROM(128, server_url);
  writeStringToEEPROM(192, apikey);
  EEPROM.commit();
  debug("Konfigurasi yang disimpan ke EEPROM:");
  debug("nama_ssid: " + nama_ssid);
  debug("Password: " + password);
  debug("Server URL: " + server_url);
  debug("API Key: " + apikey);
}
void loadCredentialsFromEEPROM() {

  EEPROM.begin(512);
  nama_ssid = readStringFromEEPROM(0);
  password = readStringFromEEPROM(64);
  server_url = readStringFromEEPROM(128);
  apikey = readStringFromEEPROM(192);
  if (nama_ssid.length() == 0) {
    nama_ssid = default_nama_ssid;
    debug("SSID Default.");
  } else {
    debug("SSID EEPROM.");
  }
  if (password.length() == 0) password = default_password;
  if (server_url.length() == 0) server_url = default_server;
  if (apikey.length() == 0) apikey = default_apikey;

  Serial.println("SSID LENGTH : " + (String)nama_ssid.length());
  if (nama_ssid.length() > 250 || reset_default == 1) {
    debug("NOVALID:" + nama_ssid);
    delay(3000);
    debug("RESET DEFAULT...");
    nama_ssid = default_nama_ssid;
    password = default_password;
    server_url = default_server;
    apikey = default_apikey;
    saveCredentialsToEEPROM();
    delay(1000);
    debug("ESP RESTART...");
    delay(1000);
    ESP.restart();
  } else {
    debug("SSID :" + nama_ssid);
    delay(1000);
    debug("PASS :" + password);
    delay(1000);
    debug("URL :" + server_url);
    delay(1000);
    debug("API :" + apikey);
    delay(1000);
  }
}

void setupWiFi() {
  WiFi.begin(nama_ssid.c_str(), password.c_str());
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {

    delay(2000);
    debug("Connect Wi-Fi (" + (String)attempts + ")");

    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(led_hijau, HIGH);
    digitalWrite(led_merah, LOW);
    debug("Terhubung ke Wi-Fi");
    debug("ssid: " + String(WiFi.SSID()));
    debug("IP: " + WiFi.localIP().toString());
    delay(1000);
    debug("System Ready");
    proses_iot("");

  } else {
    //lcd.clear();
    digitalWrite(led_hijau, LOW);
    digitalWrite(led_merah, HIGH);
    debug("Gagal terhubung");
    delay(2000);
    debug("Beralih mode AP");
    delay(2000);

    debug("Gagal terhubung..");
    WiFi.softAP("wifi-esp32");
    debug("AP: wifi-esp32");
    delay(5000);
    debug("IP:" + WiFi.softAPIP().toString());

    delay(2000);
    server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
      String nama_ssidValue = (nama_ssid.length() > 0) ? nama_ssid : default_nama_ssid;
      String passwordValue = (password.length() > 0) ? password : default_password;
      String serverValue = (server_url.length() > 0) ? server_url : default_server;
      String apiKeyValue = (apikey.length() > 0) ? apikey : default_apikey;
      String htmlContent = R"(
        <!DOCTYPE html>
        <html>
        <head>
          <title>ESP32 WiFi Configuration</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            input[type="text"],
            input[type="password"] {
              width: 100%;
              padding: 10px;
              margin: 5px 0;
              display: inline-block;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-sizing: border-box;
            }
          
            input[type="submit"]:hover {
              background-color: #45a049;
            }
            .container {
              padding: 20px;
              border-radius: 5px;
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
            <div class="container">
              <h2>ESP WiFi Configuration</h2>
              <form action="/save" method="post">
                <label for="nama_ssid">WiFi SSID:</label>
                <input type="text" id="nama_ssid" name="nama_ssid" value=")"
                           + nama_ssidValue + R"(" required><br>
                <label for="password">WiFi Password:</label>
                <input type="text" id="password" name="password" value=")"
                           + passwordValue + R"(" required><br>
                <label for="server">Server URL:</label>
                <input type="text" id="server" name="server" value=")"
                           + serverValue + R"(" required><br>
                <label for="apikey">API Key:</label>
                <input type="text" id="apikey" name="apikey" value=")"
                           + apiKeyValue + R"(" required><br>
               <input  style=" width: 100%;color: #fff; background-color: green; padding: 10px 20px; text-decoration: none; border-radius: 4px;" type="submit" value="SAVE CONFIGURATION">
              </form>
              <br>
              <br>
              Kembali Ke pengaturan Awal :
             <a href="/reset" style="color: #fff; background-color: red; padding: 10px 20px; text-decoration: none; border-radius: 4px;">RESET DEFAULT</a>
            </div>
          </div>
        </body>
        </html>
      )";
      request->send(200, "text/html", htmlContent);
    });
    server.on("/save", HTTP_POST, [](AsyncWebServerRequest* request) {
      if (request->args() > 0) {  // Pastikan ada argumen yang disampaikan
        for (uint8_t i = 0; i < request->args(); i++) {
          if (request->argName(i) == "nama_ssid") {
            nama_ssid = request->arg(i);
          } else if (request->argName(i) == "password") {
            password = request->arg(i);
          } else if (request->argName(i) == "server") {
            server_url = request->arg(i);
          } else if (request->argName(i) == "apikey") {
            apikey = request->arg(i);
          }
        }
        saveCredentialsToEEPROM();  // Simpan konfigurasi ke EEPROM
        request->send(200, "text/html", R"(
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: #4CAF50;">Konfigurasi Berhasil Disimpan</h2>
            <p><br>Klik tombol dibawah ini untuk restart esp <br><br><br><a href="/restart" style="color: #fff; background-color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 4px;">RESTART ESP</a></p>
          </div>
        </body>
        )");
      } else {
        request->send(400, "text/html", "Bad Request: Tidak ada data yang disampaikan.");
      }
    });
    server.on("/reset", HTTP_GET, [](AsyncWebServerRequest* request) {
      nama_ssid = default_nama_ssid;
      password = default_password;
      server_url = default_server;
      apikey = default_apikey;
      saveCredentialsToEEPROM();
      request->send(200, "text/html", R"(
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: RED;">Konfigurasi Berhasil Di Reset</h2>
            <p><br>Klik tombol dibawah ini untuk restart esp <br><br><br><a href="/restart" style="color: #fff; background-color: red; padding: 10px 20px; text-decoration: none; border-radius: 4px;">RESTART ESP</a></p>
          </div>
        )");
    });
    server.on("/restart", HTTP_GET, [](AsyncWebServerRequest* request) {
      request->send(200, "text/html", R"(
        <head>
  <meta http-equiv="refresh" content="5;url=/">
</head>
<body>
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">   
    <p><br>ESP Restart... <br><br></p>
  </div>
</body>
        )");

      delay(1000);    // Tambahkan jeda sebelum merestart
      ESP.restart();  // Restart ESP
      request->redirect("/");
    });
  }
  server.begin();
}

void proses_iot(String nilai) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;
  String url = server_url + apikey + nilai;  // Menggunakan server_url
  url.replace(" ", "%20");
  Serial.println("Request URL: " + url);
  http.begin(client, url);
  int httpResponseCode = http.GET();
  if (httpResponseCode == HTTP_CODE_OK) {
    const size_t capacity = JSON_OBJECT_SIZE(1024);
    DynamicJsonDocument jsonDoc(capacity);
    String jsonResponse = http.getString();
    DeserializationError error = deserializeJson(jsonDoc, jsonResponse);
    if (error) {
      Serial.println("Error parsing JSON: " + String(error.c_str()));
      return;
    }
    for (int i = 1; i <= 15; i++) {
      String out = jsonDoc["out_" + String(i)].as<String>();
      Serial.println("out_" + String(i) + ": " + out);
    }

    jarak_deteksi = jsonDoc["out_1"].as<float>();
    interval_sirine = jsonDoc["out_2"].as<float>();
    

  } else {
    Serial.println("Error Code: " + String(httpResponseCode));
  }
  http.end();
}




void buka_pintu() {
  digitalWrite(buzzer, LOW);
  if (posisi_pintu != buka) {
    for (int a = tutup; a >= buka; a--) {
      pintu.write(a);
      posisi_pintu = a;
      delay(10);
    }
  }
}

void tutup_pintu() {
  if (posisi_pintu != tutup) {
    for (int a = buka; a <= tutup; a++) {
      pintu.write(a);
      posisi_pintu = a;
      delay(10);
    }
  }
}

void tes() {
  tutup_pintu();
  digitalWrite(led_merah, HIGH);
  digitalWrite(led_hijau, HIGH);
  digitalWrite(buzzer, HIGH);

  delay(1000);

  digitalWrite(led_merah, LOW);
  digitalWrite(led_hijau, LOW);
  digitalWrite(buzzer, LOW);
  buka_pintu();
}

void ada_kereta() {
  tutup_pintu();
  digitalWrite(led_hijau, LOW);
  if (sirine == 0) {
    if (millis() - timer_sirine > interval_sirine) {
      digitalWrite(buzzer, HIGH);
      digitalWrite(led_merah, HIGH);
      sirine = 1;
      timer_sirine = millis();
    }
  }
  if (sirine == 1) {
    if (millis() - timer_sirine > interval_sirine) {
      digitalWrite(buzzer, LOW);
      digitalWrite(led_merah, LOW);
      sirine = 0;
      timer_sirine = millis();
    }
  }
}

void tidak_ada_kereta() {
  timer_sirine = millis();
  buka_pintu();
  digitalWrite(led_merah, LOW);
  digitalWrite(led_hijau, HIGH);
  digitalWrite(buzzer, LOW);
}

int baca_sensor_jarak(int echo_pin) {
  digitalWrite(trig_pin, LOW);
  delayMicroseconds(2);
  digitalWrite(trig_pin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig_pin, LOW);

  long pulse = pulseIn(echo_pin, HIGH, 30000);  // timeout 30ms untuk hindari hang
  int cm = pulse * 0.034 / 2;
  return cm;
}

void kondisi_kereta() {
  //kondisi urutan
  if (jarak_s1 <= jarak_deteksi && dummy_1 == 0) {
    urutan_deteksi_pengirim += "1";
    dummy_1 = 1;
  }
  if (jarak_s2 <= jarak_deteksi && dummy_2 == 0) {
    urutan_deteksi_pengirim += "2";
    dummy_2 = 1;
  }
  if (jarak_s3 <= jarak_deteksi && dummy_3 == 0) {
    urutan_deteksi_pengirim += "3";
    dummy_3 = 1;
  }
  if (jarak_s4 <= jarak_deteksi && dummy_4 == 0) {
    urutan_deteksi_penerima += "4";
    dummy_4 = 1;
  }
  if (jarak_s5 <= jarak_deteksi && dummy_5 == 0) {
    urutan_deteksi_penerima += "5";
    dummy_5 = 1;
  }
  if (jarak_s6 <= jarak_deteksi && dummy_6 == 0) {
    urutan_deteksi_penerima += "6";
    dummy_6 = 1;
  }

  //reset urutan
  if (jarak_s1 > jarak_deteksi && jarak_s3 > jarak_deteksi && jarak_s3 > jarak_deteksi) {
    dummy_1 = 0;
    dummy_2 = 0;
    dummy_3 = 0;
    urutan_deteksi_pengirim = "";
  }

  if (jarak_s4 > jarak_deteksi && jarak_s5 > jarak_deteksi && jarak_s6 > jarak_deteksi) {
    dummy_4 = 0;
    dummy_5 = 0;
    dummy_6 = 0;
    urutan_deteksi_penerima = "";
  }

  //kondisi utama

  if (urutan_deteksi_pengirim == "123") {
    status_kiri = "ada_kereta";
    status_pintu = "tutup";
  }

  if (urutan_deteksi_penerima == "654") {
    status_kanan = "ada_kereta";
    status_pintu = "tutup";
  }
  if (urutan_deteksi_pengirim == "321" && status_kanan == "ada_kereta") {
    status_pintu = "buka";
  }
  if (urutan_deteksi_penerima == "456" && status_kiri == "ada_kereta") {
    status_pintu = "buka";
  }

  if (status_pintu == "tutup") {
    ada_kereta();
  } else if (status_pintu == "buka") {
    tidak_ada_kereta();
    status_kanan = "";
    status_kiri = "";
  }
}

void setup() {
  //initialize Serial Monitor
  Serial.begin(115200);
  pinMode(led_merah, OUTPUT);
  pinMode(led_hijau, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(trig_pin, OUTPUT);
  pinMode(echo_4, INPUT);
  pinMode(echo_5, INPUT);
  pinMode(echo_6, INPUT);


  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  pintu.setPeriodHertz(50);             // standard 50 hz servo
  pintu.attach(pin_servo, 1000, 2000);  // attaches the servo on pin 18 to the servo object


  tes();
  EEPROM.begin(512);
  //BERI NILAI 1 JIKA MAU DIRESET (PERTAMA UPLOAD WAJIB RESET)
  reset_default = 0;
  loadCredentialsFromEEPROM();
  setupWiFi();
 Serial.println("MENGECEK SERVER");
  proses_iot("");
  //setup LoRa transceiver module
  LoRa.setPins(ss, rst, dio0);

  while (!LoRa.begin(920100000)) {
    Serial.println(".");
    delay(500);
  }
  LoRa.setSyncWord(0x34);
  LoRa.setTxPower(20);
  LoRa.setCodingRate4(8);
  LoRa.setSignalBandwidth(500000);
  LoRa.setSpreadingFactor(7);
  Serial.println("LoRa Initializing OK!");
 
  delay(1000);
  WiFi.disconnect(true);  // Memutuskan koneksi dan menghapus kredensial
  WiFi.mode(WIFI_OFF);    // Mematikan modul Wi-Fi

  timer = millis();
  Serial.print("Estimasi jarak: ");
  Serial.println("jarak : " + String(distance) + "m batas_deteksi : " + String(batas_distance));
}

void loop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    // Menggunakan buffer char[] untuk data yang diterima
    load = LoRa.readString();  // langsung baca semua data sebagai String

    Serial.println(load);

    // Deserialisasi JSON dengan char[] sebagai input
    DeserializationError error = deserializeJson(doc, load);
    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      return;
    }

    // Membaca data JSON
    id = doc["id"];
    jarak_s1 = doc["sensor_1"];
    jarak_s2 = doc["sensor_2"];
    jarak_s3 = doc["sensor_3"];
    jarak_s4 = baca_sensor_jarak(echo_4);
    delay(20);
    jarak_s5 = baca_sensor_jarak(echo_5);
    delay(20);
    jarak_s6 = baca_sensor_jarak(echo_6);

    kondisi_kereta();
    Serial.println("Kiri : " + status_kiri + "/" +" kanan : " +  status_kanan);



    // Menampilkan data
    Serial.println("Sensor jarak : " + String(jarak_s1) + "/" + String(jarak_s2) + "/" + String(jarak_s3) + "/" + String(jarak_s4) + "/" + String(jarak_s5) + "/" + String(jarak_s6));
    Serial.println("Urutan kanan : " + urutan_deteksi_pengirim + "/ Urutan kiri : " + urutan_deteksi_penerima);
    // Pengolahan RSSI dan SNR bisa dipisahkan untuk pembacaan lebih efisien
    // int rssi = LoRa.packetRssi();
    // float snr = LoRa.packetSnr();
    // Serial.print("RSSI: ");
    // Serial.print(rssi);
    // Serial.print(" dBm, SNR: ");
    // Serial.print(snr);
    // Serial.println(" dB");
  }

  // Pemrosesan kondisi kereta tetap dipertahankan
  data = "";

}
