from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import zipfile
from pathlib import Path
import tempfile
import shutil
import os
import pandas as pd

from utils import calculate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Моковая функция для конвертации изображений в CSV
def convert_to_csv(image_bytes: bytes, output_path: Path):
    # Здесь должна быть логика конвертации изображения в CSV
    # Пока что создаём пустой CSV-файл
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("номер поезда,приоритет\nX969,5\nV965,22\n")
    return output_path

def parce_csv(input_path, output_dir, sep=';'):
    """
    Parse a CSV file and create separate CSV files for each container.
    
    Args:
        input_path (Path): Path to the input CSV file
        output_dir (Path): Directory to save the output CSV files
        sep (str): CSV separator character
    """
    try:
        # Read the CSV file
        data = pd.read_csv(input_path, sep=sep)
        
        # Check if required columns exist
        if 'container_id' not in data.columns:
            raise ValueError("CSV file must contain a 'container_id' column")
            
        # Get unique container IDs
        containers = data['container_id'].unique()
        
        # Set container_id as index for easier filtering
        data = data.set_index('container_id')
        
        # Create output directory if it doesn't exist
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Process each container
        for cont in containers:
            # Get data for this container
            cont_data = data.loc[cont]
            
            # Create result DataFrame with required columns
            result_df = pd.DataFrame({
                'номер поезда': cont_data.index,
                'приоритет': cont_data.values
            })
            
            # Save to CSV
            output_file = output_dir / f"{cont}.csv"
            result_df.to_csv(output_file, index=False)
            
        return True
    except Exception as e:
        print(f"Error parsing CSV: {str(e)}")
        return False

@app.get("/")
def read_root():
    return {"message": "Приложение успешно запущено"}
    
@app.post("/upload")
async def upload_data(a: int, b: int, c: int, d: int,  file: UploadFile = File(...)):
    # Проверяем, что загружен именно ZIP-файл
    if file.content_type not in ["application/zip", "application/x-zip-compressed"]:
        raise HTTPException(status_code=400, detail="Неверный тип файла. Поддерживаются только ZIP-архивы.")

    tempdir = Path(tempfile.mkdtemp())
    input_dir = Path(tempfile.mkdtemp())
    try:
        # Сброс позиции на начало файла и распаковка
        file.file.seek(0)
        with zipfile.ZipFile(file.file) as zf:
            file_list = zf.infolist()
            
            # Check if there's only one file in the zip
            if len(file_list) == 1:
                # Extract the single file
                file_info = file_list[0]
                filename = Path(file_info.filename)
                file_ext = filename.suffix.lower()
                
                with zf.open(file_info) as extracted_file:
                    file_bytes = extracted_file.read()
                    
                    if file_ext == ".csv":
                        # Save the CSV file temporarily
                        input_path = input_dir / filename.name
                        temp_csv_path = tempdir / filename.name
                        with open(input_path, 'wb') as out_file:
                            out_file.write(file_bytes)
                        
                        # Parse the CSV file
                        if parce_csv(input_path, tempdir):
                            # If parsing was successful, we don't need the original file
                            shutil.rmtree(input_dir)
                            print(os.listdir(tempdir))
                        else:
                            # If parsing failed, keep the original file
                            print("CSV parsing failed, keeping original file")
            else:
                # Process multiple files as before
                for zip_info in file_list:
                    if zip_info.is_dir():
                        continue  # Пропускаем директории

                    filename = Path(zip_info.filename)
                    file_ext = filename.suffix.lower()

                    with zf.open(zip_info) as extracted_file:
                        file_bytes = extracted_file.read()

                        if file_ext in [".jpg", ".jpeg", ".png"]:
                            # Конвертируем изображение в CSV
                            csv_filename = filename.stem + ".csv"
                            output_path = tempdir / csv_filename
                            convert_to_csv(file_bytes, output_path)
                        elif file_ext == ".csv":
                            # Сохраняем CSV-файл напрямую
                            output_path = tempdir / filename.name
                            with open(output_path, 'wb') as out_file:
                                out_file.write(file_bytes)
                        else:
                            # Пропускаем файлы с неподдерживаемыми расширениями
                            continue
        
        output = calculate(str(tempdir), a, b, c, d)
        output.to_csv(tempdir / "result.csv")

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Повреждённый или недопустимый ZIP-архив.")
    finally:
        await file.close()

    return {"filename": file.filename, "tempdir": str(tempdir), "message": f"Файлы успешно обработаны и сохранены в формате CSV"}

@app.post("/download")
async def download(data: dict):
    try:
        if not data or "tempdir" not in data:
            raise HTTPException(status_code=400, detail="Missing tempdir parameter")
            
        temp_dir = data["tempdir"]
        file_path = Path(temp_dir) / "result.csv"
        
        # Log the paths for debugging
        print(f"Looking for file at: {file_path}")
        print(f"Directory exists: {os.path.exists(temp_dir)}")
        print(f"Directory contents: {os.listdir(temp_dir) if os.path.exists(temp_dir) else 'Directory not found'}")
        
        if not os.path.exists(temp_dir):
            raise HTTPException(status_code=404, detail=f"Temporary directory not found: {temp_dir}")
            
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Result file not found at: {file_path}")
            
        response = FileResponse(
            path=str(file_path),
            filename="result.csv",
            media_type="text/csv",
            headers={
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Content-Disposition": f'attachment; filename="result.csv"'
            }
        )
        return response
    except Exception as e:
        print(f"Error in download endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/delete_temp")
def delete_temp(data: dict):
    shutil.rmtree(data["tempdir"])
    return {"message": "Temporary directory deleted"}

@app.websocket("/ws")
async def send(websocket: WebSocket):
    await websocket.accept()
    for i in range(1, 1001):
        await websocket.send_json({"message": "test_text", "progress": str(i*0.1)})

@app.post("/get_csv_data")
async def get_csv_data(data: dict):
    try:
        if not data or "tempdir" not in data:
            raise HTTPException(status_code=400, detail="Missing tempdir parameter")
            
        temp_dir = data["tempdir"]
        file_path = Path(temp_dir) / "result.csv"
        
        if not os.path.exists(temp_dir):
            raise HTTPException(status_code=404, detail=f"Temporary directory not found: {temp_dir}")
            
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Result file not found at: {file_path}")
            
        # Read CSV file using pandas
        df = pd.read_csv(file_path)
        
        # Convert DataFrame to list of dictionaries for JSON response
        data = df.to_dict(orient='records')
        headers = df.columns.tolist()
        
        return JSONResponse(content={
            "headers": headers,
            "data": data
        })
    except Exception as e:
        print(f"Error in get_csv_data endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
