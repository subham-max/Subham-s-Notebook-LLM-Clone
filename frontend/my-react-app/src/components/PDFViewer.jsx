import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ documentId, filename, pageCount, currentPage, onPageChange }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchPDF = async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);
    setPdfFile(null);

    try {
      console.log('Fetching document info...');
      const docResponse = await axios.get(`http://localhost:5001/api/documents/${documentId}`);
      const { filepath } = docResponse.data;

      const fullUrl = `http://localhost:5001${filepath}`;
      console.log('Downloading PDF:', fullUrl);

      const pdfResponse = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // FIXED: Use Blob instead of Uint8Array
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      setPdfFile(blob);

      console.log('PDF Blob created:', blob.size, 'bytes');

    } catch (err) {
      console.error('PDF Load Error:', err);
      setError(`Failed to load PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchPDF();
}, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    console.log('PDF loaded with', numPages, 'pages');
  };

  const goToPage = (page) => {
    const totalPages = numPages || pageCount;
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-controls">
          <div><strong>{filename || 'Document'}</strong> - Loading...</div>
        </div>
        <div className="pdf-content" style={{
          height: 'calc(100% - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa'
        }}>
          <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>PDF</div>
            <div>Loading PDF from server...</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              Check console (F12) if stuck
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-controls">
          <div><strong>{filename || 'Document'}</strong> - Error</div>
        </div>
        <div className="pdf-content" style={{
          height: 'calc(100% - 60px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffe6e6',
          color: '#d63031',
          padding: '1rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '90%' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Error</div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{error}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <strong>Troubleshooting:</strong><br />
              1. Is backend running on <code style={{ background: '#f1f1f1', padding: '2px 6px' }}>http://localhost:5001</code>?<br />
              2. Open this URL directly: <br />
              <code style={{ 
                background: '#f1f1f1', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                wordBreak: 'break-all'
              }}>
                http://localhost:5001{docResponse?.data?.filepath || '/uploads/...'}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div>
          <strong>{filename || 'Document'}</strong> - Page {currentPage} of {numPages || pageCount}
        </div>
        <div>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage <= 1 ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= (numPages || pageCount)}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage >= (numPages || pageCount) ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage >= (numPages || pageCount) ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div className="pdf-content" style={{
        height: 'calc(100% - 60px)',
        overflow: 'auto',
        padding: '1rem',
        background: 'white'
      }}>
        {pdfFile ? (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
           
            onLoadError={(error) => {
              console.error('react-pdf render error:', error);
              setError('Failed to render PDF in viewer');
            }}
            loading={
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#666'
              }}>
                Rendering page {currentPage}...
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(800, window.innerWidth - 100)}
              loading={
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  margin: '1rem 0'
                }}>
                  Loading page {currentPage}...
                </div>
              }
              error={
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#d63031',
                  background: '#ffe6e6',
                  borderRadius: '8px'
                }}>
                  Failed to render page {currentPage}
                </div>
              }
            />
          </Document>
        ) : (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666'
          }}>
            PDF data ready, rendering...
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;