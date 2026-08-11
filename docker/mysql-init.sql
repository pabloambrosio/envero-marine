-- Corre solo en la primera inicialización del volumen (docker-entrypoint-initdb.d).
-- `prisma migrate dev` necesita crear una shadow database temporal para
-- detectar drift, así que el usuario dev requiere privilegios globales.
-- Solo aplica al contenedor local; en HostGator se usa `migrate deploy`,
-- que no necesita shadow DB ni estos permisos.
GRANT ALL PRIVILEGES ON *.* TO 'envero'@'%';
FLUSH PRIVILEGES;
