# Sistema de Gestión de Eventos Académicos (FCC - BUAP)

> **Materia:** Desarrollo de Aplicaciones Web (Otoño 2025)  
> **Facultad:** Facultad de Ciencias de la Computación, BUAP

Este repositorio contiene el código fuente del proyecto final. El sistema es una aplicación web responsiva que integra el módulo de gestión de usuarios desarrollado durante el curso con un nuevo **módulo avanzado para la administración de eventos académicos**.

El objetivo principal es permitir la gestión completa (CRUD) de conferencias, talleres y seminarios bajo un estricto control de roles y permisos.

---

## 🛠 Tecnologías Utilizadas

* **Frontend:** Angular (Componentes, Servicios HTTP, Angular Material, Gráficas).
* **Backend:** Django (API REST, Autenticación, ORM).
* **Despliegue:** Vercel (Frontend) y pyAnywhere (Backend).

---

## 🚀 Funcionalidades Principales

### 1. Gestión de Usuarios y Roles
El sistema administra tres tipos de perfiles con accesos diferenciados:
* **Administradores**
* **Maestros**
* **Alumnos**

### 2. Módulo de Eventos Académicos
Implementación de un CRUD completo para eventos institucionales:
* **Registro de Eventos:** Formularios validados que capturan información detallada como tipo de evento, fechas (con *DatePicker*), horarios (con *TimePicker*), lugar y cupo máximo.
* **Listado Dinámico:** Visualización de eventos en tablas con soporte para paginación, filtrado por nombre y ordenamiento.
* **Edición y Eliminación:** Funciones exclusivas para el administrador, protegidas mediante ventanas modales de confirmación para evitar cambios accidentales.

### 3. Lógica de Negocio y Permisos
Se implementó una lógica de visualización basada en el rol del usuario autenticado:
* **Administradores:** Tienen control total para crear, editar y eliminar cualquier evento.
* **Maestros:** Visualizan únicamente eventos dirigidos a profesores y al público en general. No tienen permisos de edición ni eliminación.
* **Alumnos:** Visualizan únicamente eventos dirigidos a estudiantes (filtrados por programa educativo) y al público en general.

### 4. Dashboard Estadístico
Se incluye una sección de gráficas dinámicas (histogramas, barras, circulares) que consumen datos del backend para mostrar estadísticas sobre el total de usuarios registrados en la plataforma.

---

## 💻 Instrucciones de Instalación

### Backend (Django)

1.  Clonar el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    ```
2.  Crear y activar un entorno virtual:
    ```bash
    python -m venv venv
    # Windows: venv\Scripts\activate
    # Linux/Mac: source venv/bin/activate
    ```
3.  Instalar las dependencias:
    ```bash
    pip install -r requirements.txt
    ```
4.  Realizar migraciones y ejecutar el servidor:
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

### Frontend (Angular)

1.  Navegar a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Ejecutar el servidor de desarrollo:
    ```bash
    ng serve
    ```

---

_Proyecto desarrollado para la asignatura de Desarrollo de Aplicaciones Web._