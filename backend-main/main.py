from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import zipfile
from pathlib import Path
import tempfile

from utils import calculate

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Моковая функция для конвертации изображений в CSV
def convert_to_csv(image_bytes: bytes, output_path: Path):
    # Здесь должна быть логика конвертации изображения в CSV
    # Пока что создаём пустой CSV-файл
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("mock,data\n")
    return output_path

@app.get("/")
def read_root():
    return {"message": "Приложение успешно запущено"}
    
@app.post("/upload")
async def upload_data(a: int, b: int, c: int, d: int,  file: UploadFile = File(...)):
    # Проверяем, что загружен именно ZIP-файл
    if file.content_type not in ["application/zip", "application/x-zip-compressed"]:
        raise HTTPException(status_code=400, detail="Неверный тип файла. Поддерживаются только ZIP-архивы.")

    tempdir = tempfile.mkdtemp()
    try:
        # Сброс позиции на начало файла и распаковка
        file.file.seek(0)
        with zipfile.ZipFile(file.file) as zf:
            for zip_info in zf.infolist():
                if zip_info.is_dir():
                    continue  # Пропускаем директории

                filename = Path(zip_info.filename)
                file_ext = filename.suffix.lower()

                with zf.open(zip_info) as extracted_file:
                    file_bytes = extracted_file.read()

                    if file_ext in [".jpg", ".jpeg", ".png"]:
                        # Конвертируем изображение в CSV
                        csv_filename = filename.stem + ".csv"
                        output_path = f"{tempdir}/{csv_filename}"
                        convert_to_csv(file_bytes, output_path)
                    elif file_ext == ".csv":
                        # Сохраняем CSV-файл напрямую
                        output_path = f"{tempdir}/{filename.name}"
                        with open(output_path, 'wb') as out_file:
                            out_file.write(file_bytes)
                    else:
                        # Пропускаем файлы с неподдерживаемыми расширениями
                        continue
        
        output = calculate(tempdir)
        output.to_csv(f"{tempdir}/{filename.name}")

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Повреждённый или недопустимый ZIP-архив.")
    finally:
        await file.close()

    return {"filename": file.filename, "tempdir": tempdir, "message": f"Файлы успешно обработаны и сохранены в формате CSV"}

@app.get("/download")
def download(data: dict):
    file_response = FileResponse(data["tempdir"] + "/result.csv")
    shutil.rmtree(data["tempdir"])
    return file_response

@app.get("/delete_temp")
def delete_temp(data: dict):
    shutil.rmtree(data["tempdir"])
    return {"message": "Temporary directory deleted"}

@app.websocket("/ws")
async def send(websocket: WebSocket):
    await websocket.accept()
    for i in range(1, 1001):
        await websocket.send_json({"message": "test_text", "progress": str(i*0.1)})
