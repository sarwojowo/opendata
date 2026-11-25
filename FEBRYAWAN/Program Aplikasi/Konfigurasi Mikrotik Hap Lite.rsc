# jan/12/2026 19:51:53 by RouterOS 6.44.3
# software id = 264W-ZQSR
#
# model = RouterBOARD 941-2nD
# serial number = 8CE5086A0BBB
/interface ethernet
set [ find default-name=ether1 ] name=ether1-WAN-Real
set [ find default-name=ether2 ] name=ether2-Out-ISP1
set [ find default-name=ether3 ] name=ether3-Out-ISP2
set [ find default-name=ether4 ] name=ether4-Out-ISP3
/interface wireless
set [ find default-name=wlan1 ] ssid=MikroTik
/interface wireless security-profiles
set [ find default=yes ] supplicant-identity=MikroTik
/queue simple
add max-limit=10M/10M name=Limit-ISP1-10M target=ether2-Out-ISP1
add max-limit=6M/6M name=Limit-ISP2-6M target=ether3-Out-ISP2
add max-limit=4M/4M name=Limit-ISP3-4M target=ether4-Out-ISP3
/ip address
add address=192.168.10.1/24 comment="Gateway ISP 1" interface=ether2-Out-ISP1 \
    network=192.168.10.0
add address=192.168.20.1/24 comment="Gateway ISP 2" interface=ether3-Out-ISP2 \
    network=192.168.20.0
add address=192.168.30.1/24 comment="Gateway ISP 3" interface=ether4-Out-ISP3 \
    network=192.168.30.0
/ip dhcp-client
add dhcp-options=hostname,clientid disabled=no interface=ether1-WAN-Real
/ip firewall nat
add action=masquerade chain=srcnat out-interface=ether1-WAN-Real
/system clock
set time-zone-name=Asia/Jakarta
/system identity
set name=ISP-EMULATOR-hAP
