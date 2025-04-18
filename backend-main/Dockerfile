# Use Python 3.11 slim image with specific version
FROM python:3.11.8-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Copy project files
COPY . .

RUN pip install -r requirements.txt

# Expose port 8000
EXPOSE 8000

# Start the FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 