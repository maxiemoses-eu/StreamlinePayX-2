# ----------------------------------------------------
# Stage 1: Base Image and Dependencies
# ----------------------------------------------------
# Use a lightweight official Python image for the base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app

# Set the working directory inside the container
WORKDIR ${APP_HOME}

# Install essential system dependencies required for database drivers (like asyncpg/PostgreSQL) and compilation.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        # General build essentials
        build-essential \
        # PostgreSQL client library headers for compilation (CRUCIAL for libpq-dev)
        libpq-dev \
        # Other necessary dev packages
        python3-dev \
    && pip install pipenv \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy the Pipenv files first to leverage Docker layer caching
COPY Pipfile Pipfile.lock ./

# Install Python dependencies using pipenv in system mode
# --system: Install into the system environment (not a virtualenv)
# --deploy: Ensure Pipfile.lock is used and dependencies are locked
# --ignore-pipfile: Trust the lock file (faster and more secure)
RUN pipenv install --system --deploy --ignore-pipfile

# ----------------------------------------------------
# Stage 2: Application Code and Security
# ----------------------------------------------------

# Copy the rest of the application code (app.py, db/, routers/, etc.)
COPY . .

# Security Best Practice: Create a non-root user and switch to it.
# This significantly limits potential damage if the application process is compromised.
RUN useradd -m appuser
USER appuser

# Expose the application port
EXPOSE 9090

# Command to run the application using uvicorn.
# We set the host to 0.0.0.0 to make it accessible outside the container.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9090"]
