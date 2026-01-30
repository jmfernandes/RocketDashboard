# RocketDashboard

A satellite telemetry dashboard built with Django and Django REST Framework.

## Why Django

Django was chosen because it provides robust built-in user authentication, security permissions, and role-based access control that can be enabled when needed. The ORM includes model-level type checking and validation out of the box, so data integrity is enforced at both the serializer and database layers without extra libraries. The project does not currently require user login, but Django's auth system can be turned on with minimal changes if needed in the future.

## Requirements

- Python 3.11+

## Installation & Setup

```bash
make setup
```

This will install dependencies, run migrations, and seed the database with 100 sample telemetry entries.

To start the development server:

```bash
make runserver
```

Then visit `http://localhost:8000`.

Run `make help` to see all available commands.

## Project Structure

```
RocketDashboard/
├── manage.py
├── Makefile
├── requirements.txt
│
├── RocketDashboard/           # Main Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/                      # All Django apps live here
│   ├── pages/                 # Home page app
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── telemetry/             # Telemetry app
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       ├── management/
│       │   └── commands/
│       │       └── setup_db.py
│       └── api/               # REST API for telemetry
│           ├── views.py
│           ├── serializers.py
│           └── urls.py
│
├── templates/                 # HTML templates
│   ├── _base.html
│   ├── home.html
│   └── telemetry/
│       └── telemetry_list.html
│
└── static/                    # Static assets (CSS, JS, fonts)
```

### App structure

All Django apps are kept in the `apps/` directory to separate them from the main `RocketDashboard/` project configuration folder. Each app uses the `apps.` prefix in its namespacing (e.g. `apps.telemetry`, `apps.pages`) which is reflected in `AppConfig.name` and `INSTALLED_APPS`. This keeps the project root clean and makes it clear which code is project configuration vs. application logic.

## Navigating the Application

- **Home** (`/`) - Landing page.
- **Telemetry** (`/telemetry/`) - The main dashboard. Navigate here to view the telemetry data table with filtering by satellite ID and health status.
- **API** - Click the "API" link in the navbar to go directly to the Django REST Framework browsable API.

## REST API

The API is built with [Django REST Framework](https://www.django-rest-framework.org/). Clicking the **API** link in the navigation bar takes you to the browsable API interface. From there you can:

- Browse to `/api/telemetry/` to see all telemetry entries.
- Use the built-in HTML form at the bottom of the page to submit new entries directly.
- Navigate to an individual entry (e.g. `/api/telemetry/1/`) to update or delete it.
- See validation error messages rendered automatically by the Django backend if you submit invalid data (e.g. negative altitude, invalid timestamp format).

### Endpoints

| Method | URL                    | Description                                        |
|--------|------------------------|----------------------------------------------------|
| GET    | `/api/`                | API root with links to available endpoints          |
| GET    | `/api/telemetry/`      | List all entries (supports `?satellite_id=` and `?status=` filters) |
| POST   | `/api/telemetry/`      | Create a new telemetry entry                        |
| GET    | `/api/telemetry/<id>/` | Retrieve a single entry                             |
| PUT    | `/api/telemetry/<id>/` | Update an entry                                     |
| DELETE | `/api/telemetry/<id>/` | Delete an entry                                     |

### Validation

- `timestamp` must be a valid ISO 8601 datetime.
- `altitude` and `velocity` must be non-negative numbers.
- `status` must be one of: `healthy`, `warning`, `critical`.

## Unique Improvements & Notes

- The bootstrap css files are stored locally so that this web app works on an air-gapped intra-net.
- For production I would use gunicorn and nginx for reverse proxy and serving the app.
- I can overwrite the basic Django templates for rest API and 404 errors for unique links and messages.
- Makefiles allow me to put commands that would normally go in a "scripts" folder into one convenient location.
- Much like the internal Django HTML templates, I can overwride their internal command system by putting my own code in /management/commands/


## Testing

```bash
pytest
```
