# Use an official Python image as the base
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy requirements.txt to the container
COPY requirements.txt .

# Install dependencies from requirements.txt
RUN pip3 install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the Flask port
EXPOSE 8081

# Run the Flask app
CMD ["python3", "app.py"]
