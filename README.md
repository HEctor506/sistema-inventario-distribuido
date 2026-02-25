Diagrama de arquitectura del sistema:
<img width="710" height="231" alt="image" src="https://github.com/user-attachments/assets/6bff1589-9c39-45b8-8cda-6e1d0e25a4af" />

Diagrama de la base de datos:
<img width="517" height="277" alt="image" src="https://github.com/user-attachments/assets/b38d1b90-861f-4aae-a683-ea5fbc9b88e6" />

Instrucciones de despliegue:
1. Instalamos Tailscale en ambas máquinas y comprobamos su conexión mediante tailscale status
<img width="624" height="46" alt="image" src="https://github.com/user-attachments/assets/ce27e023-f5a9-4d43-abac-b2c9a35d77d8" />

2. Desplegamos la Máquina 2 (Base de datos + Servicio de Reportes)
Nos ubicamos en la carpeta correspondiente (sistemaReporte_BD) y
ejecutamos la orden para levantar los conetenedores docker compose up -d
Verificamos que los contenedoree estén activos
<img width="863" height="131" alt="image" src="https://github.com/user-attachments/assets/0877b0d9-729c-47e4-a425-4ee3002d0906" />

3. En la máquina 1 (App Web) nos ubicamos en aplicacion_web y levantamos los contenedores
<img width="564" height="297" alt="image" src="https://github.com/user-attachments/assets/d99a5552-cf78-48b3-886b-1de064bb2034" />
<img width="561" height="336" alt="image" src="https://github.com/user-attachments/assets/e3a14ca1-ecd1-4eba-bed5-19d6a5630c76" />





