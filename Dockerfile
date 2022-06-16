FROM python:3.8.2

# These two environment variables prevent __pycache__/ files.
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Make a new directory to put the code in.
RUN mkdir -p /home/web

COPY /web/ /home/web/

WORKDIR /home/web

# Upgrade pip
RUN pip install --upgrade pip

# Install the requirements.
RUN pip install --no-cache-dir -r requirements.txt

RUN python manage.py collectstatic --noinput

RUN chmod +x /home/web/wait-for-it.sh
