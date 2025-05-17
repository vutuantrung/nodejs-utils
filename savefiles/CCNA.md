# CCNA

# Table of contents
1. [Tutorial](#tutorial)
2. [Some paragraph](#paragraph1)
    1. [Sub paragraph](#subparagraph1)
3. [Another paragraph](#paragraph2)

![alt text](_kakeZz_(twitter).JPG "Title")

###  [Tutorial: Markdown syntax](https://www.markdownguide.org/basic-syntax/)

> Dorothy followed her through many of the beautiful rooms in her castle.

<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item
    <ul>
      <li>Indented item</li>
      <li>Indented item</li>
    </ul>
  </li>
  <li>Fourth item</li>
</ul>

        R1 (config)# interface vlan <value_int>
        R1 (config)# interface vlan <value_int>


###  [Bài 59: Giao thức phát hiện thiết bị láng giềng CDP trên thiết bị Cisco FEE](https://www.markdownguide.org/basic-syntax/)
<details close>
  <summary>Detail</summary>

#### Note:
<ul>
  <li>CDP đc gửi 60s một lần qua các Switchs và ngược lại</li>
</ul>

#### Configuration code:
> ___Sw (config)#___ interface <value_int></br>
> ___Sw (config-if)#___ no cdp enable => tắt cdp</br>
> ___Sw (config)#___ no cdp run

#### Images:
<div style='display: flex'>
    <img src="1.jpg" width="600" style='margin: 5'>
</div>
</details>

###  [Bài 94: Giao thức VTP đồng bộ hóa thông tin VLAN giữa các Switch](https://www.markdownguide.org/basic-syntax/)
<details close>
  <summary>Detail</summary>

#### Note:
<ul>
  <li>đồng bộ hóa thông tin (VLAN config) giữa các Sw mà không cần manual config cho mỗi cái</li>
  <li>name_domain: phân biệt chữ hoa/thường</li>
  <li>Switch chỉ cập nhật status CỦA NÓ khi chỉ số <strong><em>revision</em></strong> của NÓ <strong><em>bé hơn</em></strong> của Switch gửi, nếu không NÓ sẽ bị cập nhập ngược lại, nếu bằng thì không làm gì</li>
</ul>

#### Configuration code:
> ___Sw (config)#___ vtp domain <name_domain></br>
> ___Sw (config)#___ vtp mode <<strong><em>Server</em></strong>|<strong><em>Client</em></strong>|<strong><em>Transparent</em></strong>></br>
> ___Sw (config)#___ show vtp status

#### Images:
<div style='display: flex'>
    <img src="94_1.jpg" width="300" style='margin: 5'>
</div>
</details>

###  [Bài 95: Giải pháp Router on a Stick trên Cisco Router](https://www.markdownguide.org/basic-syntax/)
<details close>
  <summary>Detail</summary>

#### Note:
<ul>
  <li><strong><em>Bài toán:</em></strong>: kết nối vlan cùng switch, mỗi device trỏ Default gateway -> interface thiết bị kết nối (router) các interfaces của vlan => càng nhiều vlan càng nhiều interface của thiết bị kết nối</li>
  <li><strong><em>Giải pháp:</em></strong> tạo kết nối trunk từ (Switch và Router) => tạo và đặt ip cho các sub-interface => trỏ Default gateway của device tới các sub-interface</li>
</ul>

#### Configuration code:
> ___Sw (config)#___ interface f0/0.1</br>
> ___Sw (config-if)#___ ip address 30.0.0.1 255.0.0.0

#### Images:
<div style='display: flex'>
    <img src="95_1.jpg" height='300' style='margin: 5'>
    <img src="95_2.jpg" height="300" style='margin: 5'>
</div>
</details>

###  [Bài 96: Giải pháp SVI trên Switch Layer 3](https://www.markdownguide.org/basic-syntax/)
<details close>
  <summary>Detail</summary>

#### Note:
<ul>
    <li>Cổng giao tiếp ảo</li>
    <li>Đóng vai trò Default gateway để các interface device trỏ đến</li>
    <li>Nếu chưa xuất hiện vlan, có thể chưa có bất kỳ device nào cắm vào</li>
</ul>

#### Configuration code:

> ___Sw (config)#___ interface vlan 3 </br>
> ___Sw (config-if)#___ ip address 30.0.0.1 255.0.0.0</br>
> ___Sw (config-if)#___ no shutdown</br>
> ___Sw (config-if)#___ exit

> ___Sw (config)#___ interface vlan 5</br>
> ___Sw (config-if)#___ ip address 50.0.0.1 255.0.0.0</br>
> ___Sw (config-if)#___ no shutdown</br>
> ___Sw (config-if)#___ exit

> ___Sw (config)#___ ip routing

> ___Sw (config)#___ no ip routing 

#### Images:

<div style='display: flex'>
    <img src="96_1.jpg" height='300' style='margin: 5'>
</div>
</details>

###  [Bài 97: Cấu hình định tuyến trên Switch Layer 3](https://www.markdownguide.org/basic-syntax/)
<details close>
  <summary>Detail</summary>

#### Note:
<ul>
    <li>Kết nối ra ngoài Internete các device trong VLAN</li>
</ul>

#### Configuration code:

> ___Sw (config)#___ ip route 0.0.0.0 0.0.0.0 10.0.0.1

Thực hiện default route để interface kết nối với router ra được mạng ngoài

> ___R (config)#___ 30.0.0.0 255.0.0.0 10.0.0.2</br>
> ___R (config)#___ 50.0.0.0 255.0.0.0 10.0.0.2

Tại router NAT, route interface kết nối mạng ngoài tới VLAN để nhận hồi đáp từ mạng internet ngoài

> ___Sw (config)#___ interface f0/1</br>
> ___Sw (config-if)#___ no switchport => chuyển layer 2 sang 3</br> 
> ___Sw (config-if)#___ ip address 10.0.0.2 255.0.0.0</br>

Đặt ip cho interface cho cổng giao tiếps

#### Images:

<div style='display: flex'>
    <img src="97_1.jpg" height='300' style='margin: 5'>
</div>
</details>