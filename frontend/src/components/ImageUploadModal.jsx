import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, CheckCircle2, Sparkles } from 'lucide-react';
import { searchByImage } from '../services/api';

export const ImageUploadModal = ({ isOpen, onClose, onSearch }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file) => {
    setAnalyzing(true);
    setDetectedProduct(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await searchByImage(formData);
      const product = result?.matched_product;
      if (!product) throw new Error(result?.providerNotice || 'No matching product was found for this image.');
      setDetectedProduct({ name: product.canonical_name, confidence: result?.parsed_intent?.confidence });
    } catch (error) {
      setDetectedProduct({ error: error.message || 'Unable to retrieve real shopping data for this image.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSearch = () => {
    if (detectedProduct) {
      onSearch(detectedProduct.name, 'image');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Search Product by Image</h3>
          <p className="text-sm text-slate-400">Upload a product photo or screenshot for AI visual matching</p>
        </div>

        {/* Upload Dropzone */}
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-slate-500 group-hover:text-purple-400 mb-3 transition-colors" />
              <p className="mb-2 text-sm text-slate-300">
                <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, WEBP (MAX. 10MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img src={previewUrl} alt="Uploaded product" className="h-full object-contain" />
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setDetectedProduct(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-slate-300 rounded-lg hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis State */}
            {analyzing && (
              <div className="flex items-center justify-center space-x-2 py-4 text-purple-400 text-sm font-medium">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analyzing visual features & CLIP embeddings...</span>
              </div>
            )}

            {/* Detected Product Candidate */}
            {detectedProduct && !detectedProduct.error && !analyzing && (
              <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                      AI Matched Candidate {detectedProduct.confidence ? `(${(detectedProduct.confidence * 100).toFixed(0)}% Confidence)` : ''}
                    </span>
                    <h4 className="text-base font-bold text-white">{detectedProduct.name}</h4>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                </div>
                <button
                  onClick={handleConfirmSearch}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition"
                >
                  Confirm & Compare Listings
                </button>
              </div>
            )}
            {detectedProduct?.error && !analyzing && <p className="rounded-xl border border-rose-800/50 bg-rose-950/20 p-4 text-sm text-rose-300">{detectedProduct.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
