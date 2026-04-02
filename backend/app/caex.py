import os
import requests
from bs4 import BeautifulSoup
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64

AES_KEY = b'f56d82e1296770926b506ce60e2b46f4'
AES_IV  = b'729a9c1f9388f630'

def encrypt_aes(value):
    cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
    encrypted = cipher.encrypt(pad(value.encode('utf-8'), AES.block_size))
    return base64.b64encode(encrypted).decode('utf-8')

class CaexScraper:
    def __init__(self):
        self.session = None
        self.portal_url = 'https://ws.caexlogistics.com/WebSolSer/Login.aspx'
        self.tracking_url = 'https://ws.caexlogistics.com/WebSolSer/TrackingGuia.aspx'
        self.codigo = '2600001'
        self.usuario = 'BIOAGRICOLAS'
        self.password = os.getenv("CAEX_PASSWORD", "PON_LA_CONTRASEÑA_AQUI") 

    def login(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        try:
            res = self.session.get(self.portal_url, timeout=20)
            soup = BeautifulSoup(res.text, 'html.parser')

            def val(id_):
                el = soup.find('input', {'id': id_})
                return el['value'] if el and el.get('value') else ''

            payload = {
                '__VIEWSTATE': val('__VIEWSTATE'),
                '__VIEWSTATEGENERATOR': val('__VIEWSTATEGENERATOR'),
                '__EVENTVALIDATION': val('__EVENTVALIDATION'),
                'txtCodigo': '', 'txtLogin': '', 'txtPassword': '',
                'hfCodigo': encrypt_aes(self.codigo),
                'hfLogin': encrypt_aes(self.usuario),
                'hfPassword': encrypt_aes(self.password),
                'btnSubmit': 'Ingresar'
            }
            
            self.session.post(self.portal_url, data=payload, timeout=20)
            check = self.session.get(self.tracking_url, timeout=20)
            return 'Bienvenido' in check.text or 'Portal' in check.text
        except Exception:
            return False

    def rastrear(self, guia):
        # 1. Limpiar espacios accidentales al copiar y pegar
        guia_limpia = str(guia).strip()
        
        # 2. Control estricto de sesión
        if not self.session:
            if not self.login():
                self.session = None
                return {"error": "Fallo login en Cargo Expreso. ¿Pusiste tu CAEX_PASSWORD en el .env?"}

        try:
            res = self.session.get(self.tracking_url, timeout=20)
            if 'Login.aspx' in res.url:
                if not self.login():
                    self.session = None
                    return {"error": "Sesión expirada y fallo al reconectar. Revisa tu CAEX_PASSWORD en el .env"}
                res = self.session.get(self.tracking_url, timeout=20)

            soup = BeautifulSoup(res.text, 'html.parser')

            def val(id_):
                el = soup.find('input', {'id': id_})
                return el['value'] if el and el.get('value') else ''

            payload = {
                '__VIEWSTATE': val('__VIEWSTATE'),
                '__VIEWSTATEGENERATOR': val('__VIEWSTATEGENERATOR'),
                '__EVENTVALIDATION': val('__EVENTVALIDATION'),
                '__EVENTTARGET': '', '__EVENTARGUMENT': '',
                '__PREVIOUSPAGE': val('__PREVIOUSPAGE'),
                'ctl00$ContentPlaceHolder1$txtNumeroGuia': guia_limpia,
                'ctl00$ContentPlaceHolder1$btnRastrear': 'Rastrear Envio'
            }

            res = self.session.post(self.tracking_url, data=payload, timeout=20)
            soup = BeautifulSoup(res.text, 'html.parser')
            
            estado_acuse = ""
            el_estado = soup.find('span', {'id': 'ctl00_ContentPlaceHolder1_lblEstado'})
            if el_estado:
                estado_acuse = el_estado.text.strip()

            tabla = soup.find('table', {'id': 'ctl00_ContentPlaceHolder1_grdDatos'})
            
            # --- LA MAGIA DEL FALLBACK PARA GUIONES ---
            if not tabla and "-" in guia_limpia:
                # Si no la encontró y tiene guion, intentamos buscar la guía maestra
                guia_maestra = guia_limpia.split("-")[0]
                payload['ctl00$ContentPlaceHolder1$txtNumeroGuia'] = guia_maestra
                res = self.session.post(self.tracking_url, data=payload, timeout=20)
                soup = BeautifulSoup(res.text, 'html.parser')
                
                el_estado = soup.find('span', {'id': 'ctl00_ContentPlaceHolder1_lblEstado'})
                if el_estado:
                    estado_acuse = el_estado.text.strip()
                tabla = soup.find('table', {'id': 'ctl00_ContentPlaceHolder1_grdDatos'})

            if not tabla:
                return {"error": "Guía no encontrada en el portal interno de Cargo Expreso."}

            historial = []
            filas = tabla.find_all('tr')[1:]
            for fila in filas:
                celdas = fila.find_all('td')
                if len(celdas) >= 3:
                    historial.append({
                        "fecha": celdas[0].text.strip(),
                        "ruta": celdas[1].text.strip(),
                        "movimiento": celdas[2].text.strip()
                    })

            return {
                "guia": guia_limpia,
                "estado_general": estado_acuse,
                "ultimo_movimiento": historial[-1] if historial else None
            }
        except Exception as e:
            return {"error": f"Error del servidor de CAEX: {str(e)}"}
