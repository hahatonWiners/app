# Use Python 3.13
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Copy the entire virtual environment
COPY .venv /app/venv

# Set up the virtual environment
ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"
ENV PYTHONPATH="/app/venv/lib/python3.13/site-packages"

# Copy project files
COPY . .

# Expose port 8000
EXPOSE 8000

# Start the FastAPI app with uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]