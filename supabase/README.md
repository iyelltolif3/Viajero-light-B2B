# Configuración de Base de Datos Supabase

## Inicialización de la Base de Datos

Para configurar la base de datos en Supabase, sigue estos pasos:

1. Accede al [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a "SQL Editor" en el menú lateral
4. Copia el contenido del archivo `migrations/initial_schema.sql`
5. Pega el contenido en el editor SQL
6. Haz clic en "RUN" para ejecutar el script

Este script creará:
- Tabla de configuración del sistema (`system_settings`)
- Tabla de planes (`plans`)
- Tabla de zonas (`zones`)
- Tabla de rangos de edad (`age_ranges`)
- Tabla de contactos de emergencia (`emergency_contacts`)

## Estructura de Tablas

### system_settings
- Configuración general del sistema
- Branding y personalización
- Configuración de notificaciones
- Configuración de pagos

### plans
- Planes de asistencia
- Detalles de cobertura
- Precios y multiplicadores
- Características y beneficios

### zones
- Zonas geográficas
- Lista de países por zona
- Multiplicadores de precio por zona

### age_ranges
- Rangos de edad
- Multiplicadores de precio por edad

### emergency_contacts
- Contactos de emergencia
- Información de contacto por país

## Mantenimiento

Para futuras modificaciones a la estructura de la base de datos:
1. Crea un nuevo archivo SQL en la carpeta `migrations` con el formato `YYYYMMDD_descripcion.sql`
2. Ejecuta el script en el SQL Editor de Supabase
3. Documenta los cambios en este README

## Políticas de Seguridad

Por defecto, todas las tablas son accesibles solo para usuarios autenticados. Para modificar las políticas de acceso:

1. Ve a "Authentication" > "Policies" en el Dashboard de Supabase
2. Selecciona la tabla que deseas modificar
3. Ajusta las políticas según tus necesidades
