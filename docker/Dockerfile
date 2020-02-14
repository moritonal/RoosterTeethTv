# Initialize
FROM python:3

# Install
WORKDIR /app
RUN apt-get update && apt-get install --yes net-tools 
RUN pip install --no-cache-dir numpy

RUN git clone https://github.com/novnc/websockify /app/websockify

# Run-time
# ENTRYPOINT [ "ls", "/app/websockify" ]
RUN chmod +x /app/websockify/run

ENTRYPOINT bash /app/websockify/run -v 6060 "$TARGET"
