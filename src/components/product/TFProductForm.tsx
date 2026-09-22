"use client";

import { useState, useMemo, useEffect } from "react";
import { Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

export function DTFProductForm({ productId }: { productId: number }) {
  const widthOptions = Array.from({ length: 43 }, (_, i) => 1 + i * 0.5); // 1" to 22"
  const heightOptions = Array.from({ length: 239 }, (_, i) => 1 + i * 0.5); // 1" to 120"

  // Form State
  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [addon, setAddon] = useState<string>("");
  const [jobName, setJobName] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  // File & Preview State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ w: string; h: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cleanup object URLs to prevent memory leaks when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageDimensions(null);

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/") && !selectedFile.name.endsWith(".ai") && !selectedFile.name.endsWith(".eps")) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        const img = new window.Image();
        img.onload = () => {
          const widthInInches = (img.width / 300).toFixed(1);
          const heightInInches = (img.height / 300).toFixed(1);
          setImageDimensions({ w: widthInInches, h: heightInInches });
        };
        img.src = objectUrl;
      }
    }
  };

  // Unit Price Calculation (Per Item)
  const unitPrice = useMemo(() => {
    let calculated = quantity * 0.04;
   
    if (calculated < 5.00) calculated = 5.00;
    
    if (addon === "Remove White Background" || addon === "Remove Black Background") {
      calculated += 10.00;
    }
    return calculated.toFixed(2);
  }, [quantity, addon]);

  // Total Price Calculation (Display Only)
  const totalPrice = Number(unitPrice).toFixed(2);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file.");
    if (!agreed) return alert("You must agree to the File Submission Agreement.");

    try {
      setIsSubmitting(true);

      // 1. Create a FormData instance for multipart/form-data
      const formData = new FormData();
      
      // 2. Append all standard fields
      // FormData requires strings or Blob/Files, so we convert numbers to strings
      formData.append("productId", String(productId));
      formData.append("quantity", String(quantity));
      formData.append("price", unitPrice);
      formData.append("width", String(width));
      formData.append("height", String(height));
      formData.append("jobName", jobName);
      
      if (notes) formData.append("notes", notes);
      if (addon) formData.append("addon", addon);
      
      // 3. Append the physical File object
      formData.append("file", file);

      // 4. Send the request (Do NOT manually set Content-Type header)
      const response = await fetch("/api/cart/add", {
        method: "POST",
        body: formData, 
      });
      
      const data = await response.json();
      
      if (response.ok && (data.success || !data.error)) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Optional: Reset form state here if desired
        // setFile(null);
        // setJobName("");
      } else {
        alert(data.message || data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding to cart.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleAddToCart} className="space-y-6 mt-6">
      
      {/* Dimensions & Quantity Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-1.5">Width (In) *</label>
          <select 
            className="w-full rounded-xl border border-primary-100 bg-white px-3 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" 
            value={width} 
            onChange={(e) => setWidth(Number(e.target.value))}
          >
            {widthOptions.map(num => <option key={`w-${num}`} value={num}>{num}"</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-1.5">Height (In) *</label>
          <select 
            className="w-full rounded-xl border border-primary-100 bg-white px-3 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" 
            value={height} 
            onChange={(e) => setHeight(Number(e.target.value))}
          >
            {heightOptions.map(num => <option key={`h-${num}`} value={num}>{num}"</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-1.5">Quantity *</label>
          <input 
            type="number" 
            min="1"
            className="w-full rounded-xl border border-primary-100 bg-white px-3 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      {/* Additional Services */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-1.5">Additional Services</label>
        <select 
          className="w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
          value={addon}
          onChange={(e) => setAddon(e.target.value)}
        >
          <option value="">None</option>
          <option value="Remove White Background">Remove White Background (+$10.00)</option>
          <option value="Remove Black Background">Remove Black Background (+$10.00)</option>
        </select>
      </div>

      {/* File Upload with Preview */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-1.5">Upload File *</label>
        <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:bg-surfaceMuted transition group relative overflow-hidden bg-white">
          <input 
            type="file" 
            accept=".png,.eps,.ai"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleFileChange}
            required
          />
          <div className="flex flex-col items-center pointer-events-none">
            {file ? (
              <div className="flex flex-col items-center w-full">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-24 h-24 object-contain mb-3 rounded-lg border border-primary-100 shadow-sm bg-gray-50" />
                ) : (
                  <ImageIcon className="text-accent-600 mb-3" size={40} strokeWidth={1.5} />
                )}
                <span className="text-sm font-semibold text-primary-900 truncate max-w-full px-4">{file.name}</span>
                {imageDimensions && (
                  <span className="text-xs font-medium text-accent-700 mt-2 bg-accent-50 border border-accent-100 px-3 py-1.5 rounded-md">
                    Uploaded file size: {imageDimensions.w} x {imageDimensions.h} in @ 300dpi
                  </span>
                )}
                <span className="text-xs text-primary-400 mt-3 underline">Click or drag to change file</span>
              </div>
            ) : (
              <>
                <Upload className="text-primary-300 mb-2 group-hover:text-accent-600 transition-colors" size={24} />
                <span className="text-sm font-semibold text-accent-600">Click or Drag File Here</span>
                <span className="text-xs text-primary-400 mt-1 max-w-[200px] leading-relaxed">
                  Accepted: PNG, EPS, AI (RGB/CMYK)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Text Inputs */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-1.5">Job Name *</label>
        <input 
          required 
          type="text" 
          className="w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
          placeholder="e.g. Summer Festival Shirts"
          value={jobName} 
          onChange={e => setJobName(e.target.value)} 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-1.5">Order Notes (Optional)</label>
        <textarea 
          className="w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600 resize-none" 
          rows={3} 
          placeholder="Any special instructions..."
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
        />
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input 
          required 
          type="checkbox" 
          className="mt-1 w-4 h-4 rounded border-primary-200 text-accent-600 focus:ring-accent-600" 
          checked={agreed} 
          onChange={e => setAgreed(e.target.checked)} 
        />
        <span className="text-sm text-primary-600 leading-relaxed">
          I have read and agree to the <a href="#" className="text-accent-600 hover:underline">File Submission Agreement</a>.
        </span>
      </label>

      {/* Price & Submit */}
      <div className="pt-6 border-t border-primary-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-500 font-medium mb-0.5">
            Total Price <span className="text-xs font-normal text-primary-400 ml-1">(${unitPrice} ea)</span>
          </p>
          <p className="text-3xl font-display font-bold text-accent-600">${totalPrice}</p>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <CheckCircle2 size={18} />
              Added to Cart
            </>
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </form>
  );
}