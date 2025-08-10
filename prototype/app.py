from flask import Flask, render_template, request, send_file
import subprocess
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compile', methods=['POST'])
def compile_typst():
    content = request.form['content']
    image_file = request.files.get('image')

    image_url = None
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        image_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(image_file_path)
        image_url = f"file:///{os.path.abspath(image_file_path)}"

    with open("input.typst", "w") as file:
        file.write(content)

    if image_url:
        content = content.replace('![](data:image/*)', f'![]({image_url})')

    try:
        subprocess.run(['typst', 'compile', 'input.typst', 'output.pdf'], check=True)
        return send_file('output.pdf', as_attachment=False)
    except subprocess.CalledProcessError as e:
        return f"Error: {str(e)}", 400

if __name__ == '__main__':
    app.run(debug=True)
