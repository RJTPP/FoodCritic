# Use an official Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt watchgod

# Copy the application code from the app directory
COPY app /app

# Expose port 8000 for FastAPI
EXPOSE 8000

# Run FastAPI with --reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
