import React, { useState } from 'react';
import axios from 'axios';

const Upload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);
    
    // Create FormData
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Use full URL instead of env variable
      const response = await axios.post(
        'https://backend-for-notebookllm.onrender.com/api/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000 // 60 seconds
        }
      );
      
      console.log('Upload Success:', response.data);
      onUploadSuccess(response.data);
      
    } catch (error) {
      console.error('Upload Error:', error);
      
      // Better error message
      let errorMsg = 'Upload failed';
      if (error.response?.data?.error) {
        errorMsg += `: ${error.response.data.error}`;
      } else if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>📁 Upload PDF</h2>
        <p>Upload your document to start chatting</p>
        
        <div style={{ margin: '1rem 0' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px dashed #667eea',
              borderRadius: '6px'
            }}
          />
          {file && <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>}
        </div>
        
        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: uploading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {uploading ? '⏳ Uploading...' : '🚀 Upload PDF'}
        </button>
      </div>
    </div>
  );
};

export default Upload;