# CSVInsight - Intelligent Data Analysis Platform

A modern, full-stack web application for CSV data analysis, visualization, and preprocessing with an aesthetic design that works seamlessly on both desktop and mobile devices.

## 🚀 Features

- **CSV Upload**: Drag-and-drop or click to upload CSV files
- **Data Visualization**: Interactive charts for numeric and categorical data
- **Statistical Analysis**: Comprehensive statistics for all column types
- **Data Preprocessing**: 
  - Handle missing values (mean, median, mode, drop, fill)
  - Remove duplicates
  - Encode categorical variables (label, one-hot)
  - Normalize numeric data
  - Drop unwanted columns
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Session Management**: In-memory storage for fast processing

## 📁 Project Structure

```
CSVInsight/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── routes/
│   │   │   ├── upload.py       # Upload CSV
│   │   │   ├── analyze.py      # Column analysis & stats
│   │   │   └── preprocess.py   # Preprocessing API
│   │   └── utils/
│   │       ├── data_store.py   # Store uploaded CSV in memory
│   │       └── preprocessing.py# Preprocessing functions
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── AnalyzePanel.jsx
│   │   │   ├── PreprocessPanel.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── store/
│   │   │   └── appState.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning preprocessing
- **Uvicorn**: ASGI server

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **Recharts**: Charting library
- **Axios**: HTTP client
- **Lucide React**: Icon library

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
```

3. **Activate virtual environment**:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**:
```bash
pip install -r requirements.txt
```

5. **Create necessary directories**:
```bash
mkdir -p app/routes app/utils
```

6. **Add __init__.py files**:
```bash
# Windows
type nul > app/__init__.py
type nul > app/routes/__init__.py
type nul > app/utils/__init__.py

# macOS/Linux
touch app/__init__.py
touch app/routes/__init__.py
touch app/utils/__init__.py
```

7. **Run the backend server**:
```bash
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎯 Usage

1. **Start Backend**: Open terminal and run `uvicorn app.main:app --reload` in the backend directory
2. **Start Frontend**: Open another terminal and run `npm run dev` in the frontend directory
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Upload CSV**: Click or drag-and-drop your CSV file
5. **Analyze**: Select columns to visualize and view statistics
6. **Preprocess**: Apply preprocessing operations to clean your data
7. **ML Models**: (Coming soon) Train and evaluate machine learning models

## 🌐 API Endpoints

### Upload
- `POST /api/upload` - Upload CSV file

### Analysis
- `POST /api/analyze` - Analyze specific column
- `POST /api/correlations` - Get correlation matrix
- `GET /api/preview/{session_id}` - Preview data

### Preprocessing
- `POST /api/preprocess` - Apply multiple preprocessing operations
- `POST /api/drop-columns` - Drop columns
- `POST /api/handle-missing` - Handle missing values
- `POST /api/encode` - Encode categorical columns
- `POST /api/normalize` - Normalize numeric columns
- `POST /api/remove-duplicates` - Remove duplicate rows

### Session
- `GET /api/session/{session_id}` - Get session info
- `DELETE /api/session/{session_id}` - Delete session

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎨 Design Features

- **Modern Gradient Background**: Eye-catching purple-gray gradient
- **Glass Morphism**: Translucent panels with backdrop blur
- **Smooth Animations**: Fade-in, slide-in effects
- **Interactive Charts**: Hover effects and tooltips
- **Custom Scrollbars**: Styled to match the theme
- **Notification System**: Toast notifications for user feedback

## 🔮 Future Enhancements

- [ ] User authentication and sessions
- [ ] Save and load preprocessing pipelines
- [ ] Machine Learning models (Classification, Regression, Clustering)
- [ ] Export processed CSV files
- [ ] Data visualization templates
- [ ] Collaboration features
- [ ] Database integration for persistent storage
- [ ] Docker containerization
- [ ] Cloud deployment (AWS, Azure, GCP)

## 🐛 Troubleshooting

### Backend Issues

**Port already in use**:
```bash
# Change port in uvicorn command
uvicorn app.main:app --reload --port 8001
```

**Module not found**:
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Dependencies installation failed**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**:
- Check that backend is running on port 8000
- Verify CORS settings in `backend/app/main.py`

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- CSVInsight Team

## 📧 Contact

For questions or support, please contact: contact@csvinsight.com

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- React and Vite for the frontend tooling
- Tailwind CSS for the beautiful styling
- Recharts for data visualization
- All open-source contributors

---

Made with ❤️ by CSVInsight Team