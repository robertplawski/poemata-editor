# Poemata Editor

A lightweight web application for managing text files with a RESTful API and web interface. Built with FastAPI and React (using Vite as the bundler).

## Features

- Web-based file management interface
- RESTful API for file operations
- File preview functionality with customizable templates
- Search and filter capabilities
- Responsive design

## Project Structure

```
.
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── storage/             # Directory for storing text files (created automatically)
├── templates/           # HTML templates for file preview
├── frontend/            # React frontend application (using Vite)
│   ├── dist/            # Built frontend files
│   ├── src/             # Source code
│   └── package.json     # Node.js dependencies
└── README.md            # This file
```

## API Endpoints

### File Management

- `GET /api/files/` - List all files (with optional search query)
- `GET /api/files/{filepath}` - Read a file
- `POST /api/files/{filepath}` - Create a new file
- `PUT /api/files/{filepath}` - Update an existing file
- `DELETE /api/files/{filepath}` - Delete a file

### File Preview

- `GET /api/preview/{filepath}?template={template}` - Preview a file using a specific HTML template

### Web Interface

- `GET /` - Main web application

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js (for frontend development)

### Installation

1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Development

The frontend is built with React and Vite:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Docker Deployment

The application includes a multi-stage Dockerfile that:
1. Builds the React frontend using Node.js
2. Serves the FastAPI backend with the built frontend

To run with Docker:
```bash
docker build -t poemata-editor .
docker run -p 8000:8000 poemata-editor
```

Or use docker-compose:
```bash
docker-compose up
```

## Usage

1. Access the web interface at `http://localhost:8000`
2. Use the API endpoints to manage files programmatically
3. Preview files using the `/api/preview` endpoint with appropriate templates

## File Format

Text files should follow this structure:
- First line: Title
- Middle lines: Content
- Last line: Footer/Author information

## Templates

HTML templates in the `templates/` directory can be used to preview files with different styling. The template receives:
- `title`: First line of the file
- `content`: Array of middle lines
- `footer`: Last line of the file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.