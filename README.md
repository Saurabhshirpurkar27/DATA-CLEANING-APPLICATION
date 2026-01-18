# 🧹 AI-Powered Data Cleaning Application

A modern, feature-rich web application for cleaning and transforming messy datasets with AI-powered analysis. Built with React and designed for data analysts, beginners, and professionals who need quick data cleaning solutions.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## ✨ Features

### 🤖 AI Analysis
- Automatic data quality assessment
- Dynamic quality score calculation (0-100%)
- Issue detection (duplicates, missing values, formatting issues)
- Smart recommendations for cleaning

### 🛠️ Basic Cleaning Operations
- **Remove Duplicates** - Eliminate duplicate rows instantly
- **Trim Spaces** - Remove extra whitespace from all columns
- **Change Case** - Convert to UPPERCASE, lowercase, or Proper Case
- **Missing Values** - Fill or remove rows with missing data
- **Find & Replace** - Search and replace text across columns

### ✨ Text Operations
- **Remove Special Characters** - Clean unwanted symbols
- **Extract Numbers** - Pull only numeric values
- **Extract Text** - Remove numbers, keep text only

### 📊 Column Operations
- **Split Columns** - Divide data by delimiter (comma, space, etc.)
- **Merge Columns** - Combine multiple columns with custom separator
- **Date Formatting** - Standardize dates to YYYY-MM-DD format

### 🚀 Advanced Features
- **Remove Outliers** - Detect and remove statistical outliers using IQR method
- **Email Validation** - Validate email formats and identify invalid entries
- **Phone Formatting** - Standardize phone numbers to (123) 456-7890 format
- **Sort Data** - Click column headers to sort ascending/descending

### 📈 Data Analysis
- **Statistics Dashboard** - View min, max, average, count, and unique values
- **Column Summary** - Quick overview of data distribution
- **Visual Indicators** - Color-coded issue severity (Critical, High, Medium)

### 🎨 User Experience
- **Search/Filter** - Instantly search across all data
- **Undo/Redo** - Full history management with Ctrl+Z/Ctrl+Y shortcuts
- **Dark Mode** 🌙 - Easy on the eyes
- **Multiple Export Formats** - Download as Excel (.xlsx), CSV, or JSON
- **Cleaning Log** - Track all operations performed
- **Real-time Preview** - See changes immediately

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Saurabhshirpurkar27/data-cleaning-app.git
cd data-cleaning-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

---

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "xlsx": "^0.18.5",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.3.6"
}
```

---

## 🎯 Usage

### 1. Upload Your Data
- Click "Upload Excel file" or drag & drop
- Supports `.xlsx`, `.xls`, and `.csv` formats

### 2. Review AI Analysis
- View detected issues and quality score
- Understand data quality at a glance

### 3. Clean Your Data
- Select columns by clicking checkboxes
- Choose cleaning operations from sidebar
- Use keyboard shortcuts for faster workflow

### 4. Export Clean Data
- Download as Excel, CSV, or JSON
- Share with your team or use in analysis

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo last operation |
| `Ctrl + Y` | Redo operation |
| Click column header | Sort data |
| Checkbox in header | Select/deselect column |

---

## 🏗️ Project Structure

```
data-cleaning-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main application component
│   ├── index.js            # Entry point
│   ├── index.css           # Global styles with Tailwind
│   └── ...
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🎨 Screenshots

### 📤 Upload Interface
![Upload Interface](https://github.com/Saurabhshirpurkar27/DATA-CLEANING-APPLICATION/blob/main/s1.PNG)
*Clean, intuitive design for uploading files with drag-and-drop support.*

### 🤖 AI Analysis Dashboard
![AI Analysis](https://github.com/Saurabhshirpurkar27/DATA-CLEANING-APPLICATION/blob/main/s2.PNG)
*Automatic detection of data quality issues with severity indicators.*

### 🛠️ Data Cleaning Workspace
![Cleaning Workspace](https://github.com/Saurabhshirpurkar27/DATA-CLEANING-APPLICATION/blob/main/s3.PNG)
*Side-by-side view of cleaning tools and data preview with real-time updates.*

### 🌙 Dark Mode
![Dark Mode](https://github.com/Saurabhshirpurkar27/DATA-CLEANING-APPLICATION/blob/main/s4.PNG)
*Eye-friendly dark theme for extended work sessions.*

> **Note:** Screenshots showcase the application's key features and user interface.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contribution
- Add more data cleaning operations
- Improve AI analysis algorithms
- Add data visualization charts
- Create cleaning templates/presets
- Add support for more file formats
- Implement batch processing
- Add unit tests

---

## 🐛 Known Issues

- Large files (>10MB) may take longer to process
- Some date formats might not auto-detect correctly
- Browser memory limitations for extremely large datasets

---

## 📝 Roadmap

- [ ] Backend API integration
- [ ] User authentication
- [ ] Save cleaning templates
- [ ] Batch file processing
- [ ] Advanced data visualization
- [ ] Scheduled cleaning jobs
- [ ] Cloud storage integration
- [ ] Collaboration features
- [ ] Mobile responsive improvements
- [ ] API for programmatic access

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Saurabh Shirpurkar**
- GitHub: [@Saurabhshirpurkar27](https://github.com/Saurabhshirpurkar27)
- LinkedIn: [Saurabh Shirpurkar](https://www.linkedin.com/in/saurabh-shirpurkar)
- Email: saurabhshirpurkar42@gmail.com

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Excel processing by [SheetJS](https://sheetjs.com/)

---

## 💡 Use Cases

- **Data Analysts** - Quick data preparation for analysis
- **Students** - Learn data cleaning techniques
- **Researchers** - Prepare datasets for studies
- **Business Users** - Clean CRM exports, sales data, etc.
- **Developers** - Test data transformation logic

---

## 🔒 Privacy

- All data processing happens locally in your browser
- No data is sent to external servers
- Your files remain private and secure

---

## 📊 Performance

- Handles datasets up to 100,000 rows efficiently
- Real-time updates for operations
- Optimized rendering for large tables
- Memory-efficient data structures

---

## 🌟 Star this repository if you find it helpful!

Made with ❤️ by SAURABH SHIRPURKAR

---

**Happy Data Cleaning! 🧹✨**
