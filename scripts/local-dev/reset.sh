@echo off 
echo Resetting local development environment... 
docker-compose down -v 
docker-compose up -d 
