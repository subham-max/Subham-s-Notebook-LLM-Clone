import React, { useState } from 'react';
import Upload from './components/upload';
import PDFViewer from './components/PDFViewer';
import Chat from './components/chat';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [filename, setFilename] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handleUploadSuccess = (data) => {
    setDocumentId(data.documentId);
    setFilename(data.filename);
    setPageCount(data.pageCount);
    setCurrentPage(1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Subham Paul NOTEBOOK LLM CLONE</h1>
      </header>
      
      {!documentId ? (
        <Upload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <div className="main-container">
          <div className="pdf-section">
            <PDFViewer 
              documentId={documentId}
              filename={filename}
              pageCount={pageCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
          
          <div className="chat-section">
            <Chat 
              documentId={documentId}
              filename={filename}
              onCitationClick={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;