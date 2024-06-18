import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider, folder }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        setUploadProgress(0); // Reset progress before the upload starts
        const formData = new FormData();
        formData.append("file", file);
  
        const resFile = await axios({
          method: "Post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: "ed2830f1e2081900b63a",
            pinata_secret_api_key: "9fad4ffb4d78395f9deee72a582810579515afd2c412c555e4d085fcf676255e",
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        });
  
        console.log(resFile.data);
        const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
        const signer = contract.connect(provider.getSigner());
        signer.setValue(account, folder, ImgHash, file.name);
        

        alert("File Uploaded Successfully!");
        setFileName("No file selected");
        setFile(null);
        setUploadProgress(0);
      } catch (e) {
        alert("Unable to upload to Pinata");
      }
    }
  };
    

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    e.preventDefault();
  };

  return (
    <div className="file-upload-container">
      <h2>Upload file</h2>
      <form className="file-upload-form" onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <label htmlFor="file-upload" className="file-input-label">
            Choose File
          </label>
          <input
            disabled={!account}
            type="file"
            id="file-upload"
            name="data"
            onChange={retrieveFile}
          />
        </div>
        <div className="file-details">
          <span className="file-name">Image: {fileName}</span>
          <button type="submit" className="upload-btn" disabled={!file}>
            Upload File
          </button>
        </div>
        {uploadProgress > 0 && (
          <div className="progress-wrapper">
            <progress key={uploadProgress} value={uploadProgress} max="100" />
            <span className="progress-value">{" " + uploadProgress}%</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default FileUpload;