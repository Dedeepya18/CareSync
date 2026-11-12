import React, { useState, useEffect } from 'react';
import { recordService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  FolderOpen,
  Tag,
  Lock,
  Search,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    title: '',
    documentType: 'lab_report',
    description: '',
    tags: '',
    issuingDoctorOrClinic: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await recordService.getRecords({
        type: filterType || undefined,
        search: searchQuery || undefined,
      });
      setRecords(res.data.records || []);
    } catch (err) {
      addToast('Failed to load records repository.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterType, searchQuery]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please select a file to upload.', 'error');
      return;
    }
    if (!form.title) {
      addToast('Document title is required.', 'error');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', selectedFile);
    data.append('title', form.title);
    data.append('documentType', form.documentType);
    data.append('description', form.description);
    data.append('tags', form.tags);
    data.append('issuingDoctorOrClinic', form.issuingDoctorOrClinic);

    try {
      await recordService.uploadRecord(data);
      addToast('Document uploaded and encrypted.', 'success');
      setShowModal(false);
      setForm({
        title: '',
        documentType: 'lab_report',
        description: '',
        tags: '',
        issuingDoctorOrClinic: '',
      });
      setSelectedFile(null);
      fetchRecords();
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this medical document?')) return;
    try {
      await recordService.deleteRecord(id);
      addToast('Document deleted.', 'info');
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      addToast('Failed to delete document.', 'error');
    }
  };

  const handleDownload = (recordId, filename) => {
    const token = localStorage.getItem('caresync_token');
    const url = `/api/records/${recordId}/download`;
    // Trigger download with auth header
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch(() => addToast('Download failed.', 'error'));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Accessing Medical Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
              Medical Records Vault
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Encrypted Health Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store and organize laboratory blood panels, prescriptions, scan reports, and medical certificates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Document Types</option>
            <option value="lab_report">Lab Reports</option>
            <option value="prescription">Prescriptions</option>
            <option value="scan_report">Scan Reports</option>
            <option value="medical_certificate">Certificates</option>
            <option value="discharge_summary">Discharge Summaries</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Records Grid */}
      {records.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Medical Records Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload your blood reports, scans, or prescriptions to maintain an organized digital health history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                    {r.documentType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-4 line-clamp-1">{r.title}</h3>
                {r.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p>Uploaded: {new Date(r.uploadDate).toLocaleDateString()}</p>
                  <p>File Size: {formatFileSize(r.fileSize)}</p>
                  {r.issuingDoctorOrClinic && (
                    <p className="truncate">Facility: {r.issuingDoctorOrClinic}</p>
                  )}
                </div>

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownload(r._id, r.originalFilename)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <button
                  onClick={() => handleDelete(r._id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Medical Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Blood Panel, Chest X-Ray"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="lab_report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="scan_report">Scan / Imaging Report</option>
                <option value="medical_certificate">Medical Certificate</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="vaccination_card">Vaccination Record</option>
                <option value="other">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Hospital</label>
              <input
                type="text"
                value={form.issuingDoctorOrClinic}
                onChange={(e) => setForm({ ...form, issuingDoctorOrClinic: e.target.value })}
                placeholder="e.g. St. Jude Labs"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. Lipids, HbA1c, Annual"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Attachment (PDF, PNG, JPG, DOC) *</label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Fasting blood work before quarterly cardiologist appointment."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {uploading ? 'Encrypting & Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalRecordsPage;

