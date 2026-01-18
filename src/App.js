import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Sparkles, Download, AlertCircle, CheckCircle, Trash2, Undo, Redo, X, Search, BarChart3, Moon, Sun, FileJson, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const DataCleaningApp = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [cleaningLog, setCleaningLog] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showFillDialog, setShowFillDialog] = useState(false);
  const [fillValue, setFillValue] = useState('');
  const [showFindReplaceDialog, setShowFindReplaceDialog] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [splitDelimiter, setSplitDelimiter] = useState(',');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeSeparator, setMergeSeparator] = useState(' ');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showStats, setShowStats] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [historyIndex, history]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setData(jsonData);
        setFile(uploadedFile);
        setHistory([jsonData]);
        setHistoryIndex(0);
        setCurrentStep('analysis');
        analyzeDataAuto(jsonData, Object.keys(jsonData[0]));
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const analyzeDataAuto = (dataToAnalyze, headersToAnalyze) => {
    const analysis = {
      totalRows: dataToAnalyze.length,
      totalColumns: headersToAnalyze.length,
      issues: [],
      qualityScore: 100
    };

    let totalCells = dataToAnalyze.length * headersToAnalyze.length;
    let problemCells = 0;

    const duplicates = dataToAnalyze.length - new Set(dataToAnalyze.map(row => JSON.stringify(row))).size;
    if (duplicates > 0) {
      analysis.issues.push({
        type: 'critical',
        title: 'Duplicate Rows Found',
        count: duplicates,
        description: `${duplicates} duplicate rows detected`
      });
      problemCells += duplicates * headersToAnalyze.length;
    }

    headersToAnalyze.forEach(header => {
      const values = dataToAnalyze.map(row => row[header]);
      
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      if (nullCount > 0) {
        analysis.issues.push({
          type: 'high',
          title: `Missing Values in "${header}"`,
          count: nullCount,
          description: `${nullCount} missing values (${((nullCount/dataToAnalyze.length)*100).toFixed(1)}%)`
        });
        problemCells += nullCount;
      }

      const stringValues = values.filter(v => typeof v === 'string' && v.length > 0);
      const hasUpperCase = stringValues.some(v => v === v.toUpperCase() && v !== v.toLowerCase());
      const hasLowerCase = stringValues.some(v => v === v.toLowerCase() && v !== v.toUpperCase());
      
      if (hasUpperCase && hasLowerCase && stringValues.length > 5) {
        const inconsistentCount = stringValues.length;
        analysis.issues.push({
          type: 'medium',
          title: `Inconsistent Case in "${header}"`,
          count: inconsistentCount,
          description: 'Mixed uppercase and lowercase values found'
        });
        problemCells += Math.floor(inconsistentCount * 0.3);
      }

      const spacesCount = stringValues.filter(v => v !== v.trim() || v.includes('  ')).length;
      if (spacesCount > 0) {
        analysis.issues.push({
          type: 'medium',
          title: `Extra Spaces in "${header}"`,
          count: spacesCount,
          description: 'Leading, trailing, or double spaces detected'
        });
        problemCells += Math.floor(spacesCount * 0.5);
      }
    });

    analysis.qualityScore = Math.max(0, Math.round(100 - (problemCells / totalCells) * 100));
    setAiAnalysis(analysis);
  };

  const saveToHistory = (newData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setData(newData);
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setData(history[historyIndex - 1]);
      addToLog('Undo: Reverted last change');
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setData(history[historyIndex + 1]);
      addToLog('Redo: Reapplied change');
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo]);

  const removeDuplicates = () => {
    const uniqueData = [];
    const seen = new Set();
    data.forEach(row => {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(row);
      }
    });
    const removed = data.length - uniqueData.length;
    saveToHistory(uniqueData);
    addToLog(`Removed ${removed} duplicate rows`);
  };

  const trimSpaces = () => {
    const newData = data.map(row => {
      const newRow = { ...row };
      headers.forEach(col => {
        if (typeof newRow[col] === 'string') {
          newRow[col] = newRow[col].trim().replace(/\s+/g, ' ');
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog('Trimmed spaces in all columns');
  };

  const changeCase = (columnName, caseType) => {
    const newData = data.map(row => {
      const newRow = { ...row };
      if (typeof newRow[columnName] === 'string') {
        switch(caseType) {
          case 'upper':
            newRow[columnName] = newRow[columnName].toUpperCase();
            break;
          case 'lower':
            newRow[columnName] = newRow[columnName].toLowerCase();
            break;
          case 'proper':
            newRow[columnName] = newRow[columnName].toLowerCase().split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            break;
          default:
            break;
        }
      }
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Changed case to ${caseType} in "${columnName}"`);
  };

  const removeMissingValues = (columnName) => {
    const newData = data.filter(row => {
      return row[columnName] !== null && row[columnName] !== undefined && row[columnName] !== '';
    });
    const removed = data.length - newData.length;
    saveToHistory(newData);
    addToLog(`Removed ${removed} rows with missing values in "${columnName}"`);
  };

  const fillMissingValues = (columnName, fillVal) => {
    const newData = data.map(row => {
      const newRow = { ...row };
      if (newRow[columnName] === null || newRow[columnName] === undefined || newRow[columnName] === '') {
        newRow[columnName] = fillVal;
      }
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Filled missing values in "${columnName}" with "${fillVal}"`);
  };

  const handleFillMissing = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    setShowFillDialog(true);
  };

  const applyFillMissing = () => {
    if (fillValue.trim() === '') {
      alert('Please enter a value to fill');
      return;
    }
    selectedColumns.forEach(col => fillMissingValues(col, fillValue));
    setShowFillDialog(false);
    setFillValue('');
  };

  const handleFindReplace = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    setShowFindReplaceDialog(true);
  };

  const applyFindReplace = () => {
    if (findText.trim() === '') {
      alert('Please enter text to find');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (typeof newRow[col] === 'string') {
          newRow[col] = newRow[col].replaceAll(findText, replaceText);
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Replaced "${findText}" with "${replaceText}" in ${selectedColumns.length} column(s)`);
    setShowFindReplaceDialog(false);
    setFindText('');
    setReplaceText('');
  };

  const removeSpecialCharacters = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (typeof newRow[col] === 'string') {
          newRow[col] = newRow[col].replace(/[^a-zA-Z0-9\s]/g, '');
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Removed special characters from ${selectedColumns.length} column(s)`);
  };

  const extractNumbers = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (typeof newRow[col] === 'string') {
          const numbers = newRow[col].match(/\d+/g);
          newRow[col] = numbers ? numbers.join('') : '';
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Extracted numbers from ${selectedColumns.length} column(s)`);
  };

  const extractText = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (typeof newRow[col] === 'string') {
          newRow[col] = newRow[col].replace(/[0-9]/g, '');
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Extracted text from ${selectedColumns.length} column(s)`);
  };

  const handleSplitColumn = () => {
    if (selectedColumns.length !== 1) {
      alert('Please select exactly ONE column to split!');
      return;
    }
    setShowSplitDialog(true);
  };

  const applySplitColumn = () => {
    if (!splitDelimiter) {
      alert('Please enter a delimiter');
      return;
    }
    const columnToSplit = selectedColumns[0];
    const newData = data.map(row => {
      const newRow = { ...row };
      if (typeof newRow[columnToSplit] === 'string') {
        const parts = newRow[columnToSplit].split(splitDelimiter);
        parts.forEach((part, idx) => {
          newRow[`${columnToSplit}_${idx + 1}`] = part.trim();
        });
      }
      return newRow;
    });
    
    const maxParts = Math.max(...data.map(row => {
      if (typeof row[columnToSplit] === 'string') {
        return row[columnToSplit].split(splitDelimiter).length;
      }
      return 0;
    }));
    
    const newHeaders = [...headers];
    const insertIndex = headers.indexOf(columnToSplit) + 1;
    for (let i = 1; i <= maxParts; i++) {
      if (!newHeaders.includes(`${columnToSplit}_${i}`)) {
        newHeaders.splice(insertIndex + i - 1, 0, `${columnToSplit}_${i}`);
      }
    }
    
    setHeaders(newHeaders);
    saveToHistory(newData);
    addToLog(`Split column "${columnToSplit}" by delimiter "${splitDelimiter}"`);
    setShowSplitDialog(false);
    setSplitDelimiter(',');
  };

  const handleMergeColumns = () => {
    if (selectedColumns.length < 2) {
      alert('Please select at least TWO columns to merge!');
      return;
    }
    setShowMergeDialog(true);
  };

  const applyMergeColumns = () => {
    const newColumnName = selectedColumns.join('_');
    const newData = data.map(row => {
      const newRow = { ...row };
      const mergedValue = selectedColumns.map(col => row[col] || '').join(mergeSeparator);
      newRow[newColumnName] = mergedValue;
      return newRow;
    });
    setHeaders([...headers, newColumnName]);
    saveToHistory(newData);
    addToLog(`Merged ${selectedColumns.length} columns into "${newColumnName}"`);
    setShowMergeDialog(false);
    setMergeSeparator(' ');
  };

  const formatDates = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (newRow[col]) {
          try {
            const date = new Date(newRow[col]);
            if (!isNaN(date.getTime())) {
              newRow[col] = date.toISOString().split('T')[0];
            }
          } catch (e) {}
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Formatted dates in ${selectedColumns.length} column(s) to YYYY-MM-DD`);
  };

  // New Advanced Features

  const removeOutliers = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = [...data];
    selectedColumns.forEach(col => {
      const numericValues = newData.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      if (numericValues.length === 0) return;
      
      numericValues.sort((a, b) => a - b);
      const q1 = numericValues[Math.floor(numericValues.length * 0.25)];
      const q3 = numericValues[Math.floor(numericValues.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      newData.forEach(row => {
        const val = parseFloat(row[col]);
        if (!isNaN(val) && (val < lowerBound || val > upperBound)) {
          row[col] = '';
        }
      });
    });
    saveToHistory(newData);
    addToLog(`Removed outliers from ${selectedColumns.length} column(s)`);
  };

  const validateEmails = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let invalidCount = 0;
    data.forEach(row => {
      selectedColumns.forEach(col => {
        if (row[col] && !emailRegex.test(row[col])) {
          invalidCount++;
        }
      });
    });
    alert(`Found ${invalidCount} invalid email(s) in selected column(s)`);
    addToLog(`Validated ${selectedColumns.length} column(s) for email format`);
  };

  const formatPhoneNumbers = () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column first!');
      return;
    }
    const newData = data.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => {
        if (typeof newRow[col] === 'string') {
          const digits = newRow[col].replace(/\D/g, '');
          if (digits.length === 10) {
            newRow[col] = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
          }
        }
      });
      return newRow;
    });
    saveToHistory(newData);
    addToLog(`Formatted phone numbers in ${selectedColumns.length} column(s)`);
  };

  const sortData = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...data].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortColumn(column);
    setSortDirection(direction);
    saveToHistory(sorted);
    addToLog(`Sorted by "${column}" (${direction})`);
  };

  const getColumnStats = (column) => {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (numericValues.length > 0) {
      return {
        count: values.length,
        unique: new Set(values).size,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)
      };
    }
    return {
      count: values.length,
      unique: new Set(values).size
    };
  };

  const exportToCSV = () => {
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.csv';
    a.click();
    addToLog('Exported to CSV');
  };

  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.json';
    a.click();
    addToLog('Exported to JSON');
  };

  const addToLog = (message) => {
    setCleaningLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };

  const downloadCleanedData = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
    XLSX.writeFile(workbook, 'cleaned_data.xlsx');
    addToLog('Downloaded cleaned data');
  };

  const resetApp = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setAiAnalysis(null);
    setCurrentStep('upload');
    setCleaningLog([]);
    setSelectedColumns([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';

  if (currentStep === 'upload') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${textColor} mb-2`}>AI-Powered Data Cleaning Tool</h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Upload your Excel file and let AI clean it for you</p>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-12`}>
            <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-blue-500 transition-all">
              <Upload size={64} className="text-gray-400 mb-4" />
              <span className={`text-xl font-semibold ${textColor} mb-2`}>Click to upload Excel file</span>
              <span className="text-sm text-gray-500">Supports .xlsx, .xls, .csv files</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-semibold">Auto Detection</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Sparkles className="mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold">AI Analysis</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Download className="mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-semibold">Easy Export</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'analysis' && aiAnalysis) {
    return (
      <div className={`min-h-screen ${bgColor} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${textColor}`}>File: {file.name}</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{data.length} rows × {headers.length} columns</p>
              </div>
              <button onClick={resetApp} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Upload New File
              </button>
            </div>
          </div>

          <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${textColor}`}>AI Analysis Results</h3>
              <div className="text-2xl font-bold text-green-600">Quality Score: {aiAnalysis.qualityScore}%</div>
            </div>

            {aiAnalysis.issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <p className="text-xl font-semibold text-green-600">No major issues found!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiAnalysis.issues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    issue.type === 'critical' ? 'bg-red-50 border-red-500' :
                    issue.type === 'high' ? 'bg-orange-50 border-orange-500' :
                    'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                      <AlertCircle className={
                        issue.type === 'critical' ? 'text-red-500' :
                        issue.type === 'high' ? 'text-orange-500' : 'text-yellow-500'
                      } />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <button onClick={() => setCurrentStep('cleaning')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold">
              Start Cleaning Data →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {showFillDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${textColor}`}>Fill Missing Values</h3>
              <button onClick={() => { setShowFillDialog(false); setFillValue(''); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Selected: <span className="font-semibold">{selectedColumns.join(', ')}</span>
            </p>
            <input type="text" value={fillValue} onChange={(e) => setFillValue(e.target.value)}
              placeholder="e.g., Unknown, 0, N/A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4" autoFocus />
            <div className="flex gap-2">
              <button onClick={applyFillMissing} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Apply</button>
              <button onClick={() => { setShowFillDialog(false); setFillValue(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showFindReplaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${textColor}`}>Find & Replace</h3>
              <button onClick={() => { setShowFindReplaceDialog(false); setFindText(''); setReplaceText(''); }} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Selected: <span className="font-semibold">{selectedColumns.join(', ')}</span></p>
            <div className="space-y-3 mb-4">
              <input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." className="w-full px-3 py-2 border rounded-lg" autoFocus />
              <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace with..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button onClick={applyFindReplace} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Replace</button>
              <button onClick={() => { setShowFindReplaceDialog(false); setFindText(''); setReplaceText(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSplitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${textColor}`}>Split Column</h3>
              <button onClick={() => { setShowSplitDialog(false); setSplitDelimiter(','); }} className="text-gray-500"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Column: <span className="font-semibold">{selectedColumns[0]}</span></p>
            <input type="text" value={splitDelimiter} onChange={(e) => setSplitDelimiter(e.target.value)} placeholder="Delimiter (e.g., ,)" className="w-full px-3 py-2 border rounded-lg mb-4" autoFocus />
            <div className="flex gap-2">
              <button onClick={applySplitColumn} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Split</button>
              <button onClick={() => { setShowSplitDialog(false); setSplitDelimiter(','); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMergeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${textColor}`}>Merge Columns</h3>
              <button onClick={() => { setShowMergeDialog(false); setMergeSeparator(' '); }} className="text-gray-500"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Merging: <span className="font-semibold">{selectedColumns.join(', ')}</span></p>
            <input type="text" value={mergeSeparator} onChange={(e) => setMergeSeparator(e.target.value)} placeholder="Separator" className="w-full px-3 py-2 border rounded-lg mb-4" autoFocus />
            <div className="flex gap-2">
              <button onClick={applyMergeColumns} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Merge</button>
              <button onClick={() => { setShowMergeDialog(false); setMergeSeparator(' '); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        <div className={`w-80 ${cardBg} border-r overflow-y-auto shadow-lg`}>
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">🛠️ Cleaning Tools</h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="border border-red-200 rounded-lg p-3 bg-red-50">
              <button onClick={removeDuplicates} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">
                <Trash2 size={16} />Remove Duplicates
              </button>
            </div>

            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
              <button onClick={trimSpaces} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                Trim Spaces
              </button>
            </div>

            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
              <h4 className="text-xs font-semibold mb-2">Change Case</h4>
              {selectedColumns.length === 0 ? (
                <p className="text-xs text-gray-500">Select columns</p>
              ) : (
                <div className="space-y-1">
                  <button onClick={() => selectedColumns.forEach(col => changeCase(col, 'upper'))} className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">UPPER</button>
                  <button onClick={() => selectedColumns.forEach(col => changeCase(col, 'lower'))} className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">lower</button>
                  <button onClick={() => selectedColumns.forEach(col => changeCase(col, 'proper'))} className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">Proper</button>
                </div>
              )}
            </div>

            <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
              <h4 className="text-xs font-semibold mb-2">Missing Values</h4>
              {selectedColumns.length === 0 ? (
                <p className="text-xs text-gray-500">Select columns</p>
              ) : (
                <div className="space-y-1">
                  <button onClick={() => selectedColumns.forEach(col => removeMissingValues(col))} className="w-full px-2 py-1 bg-orange-600 text-white rounded text-xs font-semibold">Remove Rows</button>
                  <button onClick={handleFillMissing} className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold">Fill Values</button>
                </div>
              )}
            </div>

            <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50">
              <button onClick={handleFindReplace} disabled={selectedColumns.length === 0} className="w-full px-2 py-1 bg-indigo-600 text-white rounded text-xs font-semibold disabled:opacity-50">Find & Replace</button>
            </div>

            <div className="border border-pink-200 rounded-lg p-3 bg-pink-50">
              <h4 className="text-xs font-semibold mb-2">Text Tools</h4>
              {selectedColumns.length === 0 ? (
                <p className="text-xs text-gray-500">Select columns</p>
              ) : (
                <div className="space-y-1">
                  <button onClick={removeSpecialCharacters} className="w-full px-2 py-1 bg-pink-600 text-white rounded text-xs font-semibold">Remove Special</button>
                  <button onClick={extractNumbers} className="w-full px-2 py-1 bg-pink-600 text-white rounded text-xs font-semibold">Extract Numbers</button>
                  <button onClick={extractText} className="w-full px-2 py-1 bg-pink-600 text-white rounded text-xs font-semibold">Extract Text</button>
                </div>
              )}
            </div>

            <div className="border border-teal-200 rounded-lg p-3 bg-teal-50">
              <h4 className="text-xs font-semibold mb-2">Column Ops</h4>
              {selectedColumns.length === 0 ? (
                <p className="text-xs text-gray-500">Select columns</p>
              ) : (
                <div className="space-y-1">
                  <button onClick={handleSplitColumn} disabled={selectedColumns.length !== 1} className="w-full px-2 py-1 bg-teal-600 text-white rounded text-xs font-semibold disabled:opacity-50">Split (1 col)</button>
                  <button onClick={handleMergeColumns} disabled={selectedColumns.length < 2} className="w-full px-2 py-1 bg-teal-600 text-white rounded text-xs font-semibold disabled:opacity-50">Merge (2+ cols)</button>
                </div>
              )}
            </div>

            <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
              <button onClick={formatDates} disabled={selectedColumns.length === 0} className="w-full px-2 py-1 bg-amber-600 text-white rounded text-xs font-semibold disabled:opacity-50">Format Dates</button>
            </div>

            <div className="border border-violet-200 rounded-lg p-3 bg-violet-50">
              <h4 className="text-xs font-semibold mb-2">Advanced</h4>
              {selectedColumns.length === 0 ? (
                <p className="text-xs text-gray-500">Select columns</p>
              ) : (
                <div className="space-y-1">
                  <button onClick={removeOutliers} className="w-full px-2 py-1 bg-violet-600 text-white rounded text-xs font-semibold">Remove Outliers</button>
                  <button onClick={validateEmails} className="w-full px-2 py-1 bg-violet-600 text-white rounded text-xs font-semibold">Validate Emails</button>
                  <button onClick={formatPhoneNumbers} className="w-full px-2 py-1 bg-violet-600 text-white rounded text-xs font-semibold">Format Phones</button>
                </div>
              )}
            </div>

            <div className="border border-cyan-200 rounded-lg p-3 bg-cyan-50">
              <button onClick={() => setShowStats(!showStats)} className="w-full px-2 py-1 bg-cyan-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1">
                <BarChart3 size={14} />Statistics
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className={`${cardBg} border-b p-3 flex items-center justify-between shadow-sm`}>
            <div className="flex items-center gap-3">
              <div>
                <h2 className={`text-lg font-bold ${textColor}`}>{file.name}</h2>
                <p className="text-xs text-gray-600">{filteredData.length} rows</p>
              </div>
              
              <div className="flex gap-1 ml-3 border-l pl-3">
                <button onClick={undo} disabled={historyIndex <= 0} className="px-2 py-1 bg-gray-100 rounded text-xs disabled:opacity-40" title="Undo (Ctrl+Z)">
                  <Undo size={14} />
                </button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="px-2 py-1 bg-gray-100 rounded text-xs disabled:opacity-40" title="Redo (Ctrl+Y)">
                  <Redo size={14} />
                </button>
              </div>

              <button onClick={() => setDarkMode(!darkMode)} className="px-2 py-1 bg-gray-100 rounded text-xs ml-3">
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
            
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-7 pr-2 py-1 border rounded text-xs w-32" />
              </div>
              
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold flex items-center gap-1">
                  <Download size={14} />Export
                </button>
                {showExportMenu && (
                  <div className={`absolute right-0 mt-1 ${cardBg} border rounded shadow-lg z-10 w-32`}>
                    <button onClick={() => { downloadCleanedData(); setShowExportMenu(false); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                      <FileSpreadsheet size={12} />Excel
                    </button>
                    <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                      <FileSpreadsheet size={12} />CSV
                    </button>
                    <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                      <FileJson size={12} />JSON
                    </button>
                  </div>
                )}
              </div>
              
              <button onClick={() => setCurrentStep('analysis')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold">Analysis</button>
              <button onClick={resetApp} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">New</button>
            </div>
          </div>

          {showStats && (
            <div className={`${cardBg} p-3 border-b`}>
              <h3 className={`text-sm font-bold ${textColor} mb-2`}>Column Statistics</h3>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {headers.slice(0, 4).map(header => {
                  const stats = getColumnStats(header);
                  return (
                    <div key={header} className="border rounded p-2">
                      <p className="font-semibold truncate">{header}</p>
                      <p className="text-gray-600">Count: {stats.count}</p>
                      <p className="text-gray-600">Unique: {stats.unique}</p>
                      {stats.min && <p className="text-gray-600">Min: {stats.min}</p>}
                      {stats.max && <p className="text-gray-600">Max: {stats.max}</p>}
                      {stats.avg && <p className="text-gray-600">Avg: {stats.avg}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto p-2">
            <div className={`${cardBg} rounded-lg shadow-lg overflow-hidden`}>
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {headers.map(header => (
                      <th key={header} className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-blue-50"
                        onClick={() => sortData(header)}>
                        <div className="flex items-center gap-1">
                          <input type="checkbox" checked={selectedColumns.includes(header)} onChange={() => {
                            if (selectedColumns.includes(header)) {
                              setSelectedColumns(selectedColumns.filter(c => c !== header));
                            } else {
                              setSelectedColumns([...selectedColumns, header]);
                            }
                          }} className="rounded" />
                          <span className={selectedColumns.includes(header) ? 'text-blue-600 font-bold' : ''}>{header}</span>
                          {sortColumn === header && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                  {filteredData.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50">
                      {headers.map(header => (
                        <td key={header} className={`px-2 py-2 whitespace-nowrap ${selectedColumns.includes(header) ? 'bg-blue-50' : ''}`}>
                          {row[header] === null || row[header] === undefined || row[header] === '' ? (
                            <span className="text-red-500 italic text-xs">empty</span>
                          ) : (
                            <span className={darkMode ? 'text-gray-200' : 'text-gray-900'}>{String(row[header])}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 100 && (
                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 text-center border-t">
                  Showing 100 of {filteredData.length} rows
                </div>
              )}
            </div>
          </div>

          {cleaningLog.length > 0 && (
            <div className={`${cardBg} border-t p-2`}>
              <h3 className={`text-xs font-semibold ${textColor} mb-1`}>📝 Log</h3>
              <div className="space-y-0.5 max-h-20 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                {cleaningLog.slice(-5).map((log, idx) => (
                  <div key={idx} className="text-gray-700">
                    <span className="text-blue-600 font-semibold">{log.time}</span> - {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCleaningApp;