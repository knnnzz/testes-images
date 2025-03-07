from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
import requests
import os
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

API_KEY = "sk-WLVWz7rcAiICMAQ3hRtOqQN0EITveh9zzS2eNQd86aBYItRv"  # Substitua pela sua chave de API

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upscale', methods=['POST'])
def upscale_image():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    image_file = request.files['image']

    # Abre a imagem e verifica suas dimensões
    image = Image.open(image_file)
    width, height = image.size
    total_pixels = width * height

    # Verifica se as dimensões estão dentro do intervalo suportado
    if total_pixels < 1024 or total_pixels > 1048576:
        # Calcula a proporção para ajustar o tamanho
        scale_factor = (1048576 / total_pixels) ** 0.5 if total_pixels > 1048576 else (1024 / total_pixels) ** 0.5
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        image = image.resize((new_width, new_height), Image.LANCZOS)

    # Converte a imagem para bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    # Envia a imagem redimensionada para a API de upscale
    files = {
        "image": ("image.jpg", img_byte_arr, "image/jpeg")
    }
    data = {
        "output_format": "webp"
    }

    response = requests.post(
        "https://api.stability.ai/v2beta/stable-image/upscale/fast",
        headers={
            "authorization": f"Bearer {API_KEY}",
            "accept": "image/*"
        },
        files=files,
        data=data
    )

    if response.status_code == 200:
        output_path = "output_image.webp"
        with open(output_path, 'wb') as file:
            file.write(response.content)
        return send_file(output_path, mimetype='image/webp')
    else:
        print("Erro ao fazer o upscale:", response.status_code, response.text)
        return jsonify({"error": "Erro ao fazer o upscale"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9191)
