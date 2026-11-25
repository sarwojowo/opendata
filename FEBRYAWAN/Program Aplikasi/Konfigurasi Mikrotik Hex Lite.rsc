# 2026-01-09 01:52:59 by RouterOS 7.20.2
# software id = Z7S5-C0PN
#
# model = RB750r2
# serial number = 67D208F40B11
/interface ethernet
set [ find default-name=ether2 ] name=ether2-ISP1
set [ find default-name=ether3 ] name=ether3-ISP2
set [ find default-name=ether4 ] name=ether4-ISP3
set [ find default-name=ether5 ] name=ether5-LAN
/interface wireless security-profiles
set [ find default=yes ] supplicant-identity=MikroTik
/ip pool
add name=dhcp_pool_lan ranges=192.168.88.2-192.168.88.254
/ip dhcp-server
add address-pool=dhcp_pool_lan interface=ether5-LAN lease-time=10m name=\
    dhcp_lan
/routing table
add fib name=to_ISP1
add fib name=to_ISP2
add fib name=to_ISP3
/ip neighbor discovery-settings
set discover-interface-list=!dynamic
/ip address
add address=192.168.10.2/24 comment="IP dari ISP 1" interface=ether2-ISP1 \
    network=192.168.10.0
add address=192.168.20.2/24 comment="IP dari ISP 2" interface=ether3-ISP2 \
    network=192.168.20.0
add address=192.168.30.2/24 comment="IP dari ISP 3" interface=ether4-ISP3 \
    network=192.168.30.0
add address=192.168.88.1/24 comment="Gateway LAN" interface=ether5-LAN \
    network=192.168.88.0
/ip dhcp-server network
add address=192.168.88.0/24 dns-server=8.8.8.8,8.8.4.4 gateway=192.168.88.1
/ip dns
set allow-remote-requests=yes servers=8.8.8.8,8.8.4.4
/ip firewall address-list
add address=192.168.10.0/24 list=LOCAL-NET
add address=192.168.20.0/24 list=LOCAL-NET
add address=192.168.30.0/24 list=LOCAL-NET
add address=192.168.88.0/24 list=LOCAL-NET
/ip firewall mangle
add action=accept chain=prerouting comment="Bypass Lokal" dst-address-list=\
    LOCAL-NET in-interface=ether5-LAN
add action=mark-connection chain=input in-interface=ether2-ISP1 \
    new-connection-mark=conn_ISP1
add action=mark-connection chain=input in-interface=ether3-ISP2 \
    new-connection-mark=conn_ISP2
add action=mark-connection chain=input in-interface=ether4-ISP3 \
    new-connection-mark=conn_ISP3
add action=mark-routing chain=output connection-mark=conn_ISP1 \
    new-routing-mark=to_ISP1 passthrough=no
add action=mark-routing chain=output connection-mark=conn_ISP2 \
    new-routing-mark=to_ISP2 passthrough=no
add action=mark-routing chain=output connection-mark=conn_ISP3 \
    new-routing-mark=to_ISP3 passthrough=no
add action=mark-connection chain=prerouting dst-address-type=!local \
    in-interface=ether5-LAN new-connection-mark=conn_ISP1 \
    per-connection-classifier=both-addresses-and-ports:3/0
add action=mark-connection chain=prerouting dst-address-type=!local \
    in-interface=ether5-LAN new-connection-mark=conn_ISP2 \
    per-connection-classifier=both-addresses-and-ports:3/1
add action=mark-routing chain=prerouting connection-mark=conn_ISP1 \
    in-interface=ether5-LAN new-routing-mark=to_ISP1 passthrough=no
add action=mark-routing chain=prerouting connection-mark=conn_ISP2 \
    in-interface=ether5-LAN new-routing-mark=to_ISP2 passthrough=no
add action=mark-connection chain=prerouting dst-address-type=!local \
    in-interface=ether5-LAN new-connection-mark=conn_ISP3 \
    per-connection-classifier=both-addresses-and-ports:3/2
add action=mark-routing chain=prerouting connection-mark=conn_ISP3 \
    in-interface=ether5-LAN new-routing-mark=to_ISP3 passthrough=no
/ip firewall nat
add action=masquerade chain=srcnat comment="NAT ISP 1" out-interface=\
    ether2-ISP1
add action=masquerade chain=srcnat comment="NAT ISP 2" out-interface=\
    ether3-ISP2
add action=masquerade chain=srcnat comment="NAT ISP 3" out-interface=\
    ether4-ISP3
add action=masquerade chain=srcnat comment="NAT ISP 3 Susulan" out-interface=\
    ether4-ISP3
/ip route
add check-gateway=ping comment="Main ISP 1" distance=1 gateway=192.168.10.1
add check-gateway=ping comment="Backup ISP 2" distance=2 gateway=192.168.20.1
add check-gateway=ping comment="Backup ISP 3" distance=3 gateway=192.168.30.1
add check-gateway=ping comment="Jalur Khusus PCC ISP 1" distance=1 gateway=\
    192.168.10.1 routing-table=to_ISP1
add check-gateway=ping comment="Jalur Khusus PCC ISP 2" distance=1 gateway=\
    192.168.20.1 routing-table=to_ISP2
add check-gateway=ping comment="Jalur Khusus PCC ISP 3" distance=1 gateway=\
    192.168.30.1 routing-table=to_ISP3
/system clock
set time-zone-name=Asia/Jakarta
/system identity
set name=EMULATOR-hEX
