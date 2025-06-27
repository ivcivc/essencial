# Domiex-ReactTs

Domiex-ReactTs


# Verificar container
docker ps

# Conectar via psql
PGPASSWORD="@Urantia1" psql -h localhost -p 5433 -U postgres -d essencial

# Parar container
docker stop postgres-essencial

# Iniciar container
docker start postgres-essencial

# Ver logs
docker logs postgres-essencial

Host: localhost
Port: 5433
User: postgres
Password: @Urantia1
Database: essencial


Host: [IP-DO-SEU-WSL]
Port: 5433
User: postgres  
Password: @Urantia1
Database: essencial

postgresql://postgres:@Urantia1@localhost:5433/essencial

# Verificar container
docker ps

# Conectar via psql
PGPASSWORD="@Urantia1" psql -h localhost -p 5433 -U postgres -d essencial

# Parar container
docker stop postgres-essencial

# Iniciar container
docker start postgres-essencial

# Ver logs
docker logs postgres-essencial

ip addr show eth0 | grep inet

powershell -> wsl hostname -I