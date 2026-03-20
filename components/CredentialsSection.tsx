'use client';

import { useState, useRef } from 'react';
import {
    Briefcase, Award, FileText, Plus, Trash2, Upload,
    ExternalLink, CheckCircle, Calendar, Building2,
    ChevronDown, ChevronUp, X, Edit2, Save, Loader2,
} from 'lucide-react';
import { API_URL, getBackendUrl } from '@/lib/api';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WorkExp {
    _id?: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skills: string[];
}

interface Certification {
    _id?: string;
    title: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialUrl?: string;
    fileUrl?: string;
    fileName?: string;
}

interface Resume {
    fileUrl?: string;
    fileName?: string;
    uploadedAt?: string;
}

interface Props {
    user: any;
    isOwner: boolean;           // true = viewing your own profile
    onUpdate?: (u: any) => void;
}

// ── Validation Score Bar ──────────────────────────────────────────────────────
function ValidationScore({ score }: { score: number }) {
    const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171';
    const label = score >= 70 ? 'Highly Verified' : score >= 40 ? 'Partially Verified' : 'Low Verification';

    return (
        <div
            className="p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Profile Credibility</span>
                <span className="text-sm font-bold" style={{ color }}>{score}/100 · {label}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Based on skills, work experience, certifications, resume, and linked profiles.
            </p>
        </div>
    );
}

// ── Work Experience Form ──────────────────────────────────────────────────────
function WorkExpForm({ exp, onSave, onCancel }: { exp: Partial<WorkExp>; onSave: (e: WorkExp) => void; onCancel: () => void }) {
    const [form, setForm] = useState<WorkExp>({
        company: exp.company || '',
        role: exp.role || '',
        startDate: exp.startDate?.slice(0, 7) || '',
        endDate: exp.endDate?.slice(0, 7) || '',
        current: exp.current || false,
        description: exp.description || '',
        skills: exp.skills || [],
        _id: exp._id,
    });
    const [skillInput, setSkillInput] = useState('');

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) {
            setForm(f => ({ ...f, skills: [...f.skills, s] }));
        }
        setSkillInput('');
    };

    return (
        <div
            className="p-4 rounded-2xl space-y-3"
            style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Company *</label>
                    <input
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="e.g. Google"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Role *</label>
                    <input
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        placeholder="e.g. Frontend Developer"
                        style={inputStyle}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Date *</label>
                    <input
                        type="month"
                        value={form.startDate}
                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                    <input
                        type="month"
                        value={form.current ? '' : form.endDate}
                        onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                        disabled={form.current}
                        style={{ ...inputStyle, opacity: form.current ? 0.4 : 1 }}
                    />
                    <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.current}
                            onChange={e => setForm(f => ({ ...f, current: e.target.checked, endDate: '' }))}
                            className="accent-cyan-400"
                        />
                        <span className="text-xs text-gray-400">Currently working here</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="What did you build / achieve?"
                    style={{ ...inputStyle, resize: 'none' }}
                />
            </div>

            <div>
                <label className="text-xs text-gray-400 mb-1 block">Skills used</label>
                <div className="flex gap-2 mb-2">
                    <input
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add skill + Enter"
                        style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={addSkill} style={smallBtnStyle}>Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {form.skills.map((s, i) => (
                        <span key={i} style={tagStyle}>
                            {s}
                            <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter((_, j) => j !== i) }))}
                                className="ml-1 opacity-60 hover:opacity-100">×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => { if (form.company && form.role && form.startDate) onSave(form); else toast.error('Company, role and start date are required'); }}
                    style={saveBtnStyle}
                >
                    <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
            </div>
        </div>
    );
}

// ── Cert Form ─────────────────────────────────────────────────────────────────
function CertForm({ cert, onSave, onCancel }: { cert: Partial<Certification>; onSave: (c: Certification) => void; onCancel: () => void }) {
    const [form, setForm] = useState<Certification>({
        title: cert.title || '',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate?.slice(0, 7) || '',
        expiryDate: cert.expiryDate?.slice(0, 7) || '',
        credentialUrl: cert.credentialUrl || '',
        fileUrl: cert.fileUrl || '',
        fileName: cert.fileName || '',
        _id: cert._id,
    });
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File) => {
        setUploading(true);
        const token = localStorage.getItem('auth_token');
        const fd = new FormData();
        fd.append('certificate', file);
        try {
            const res = await fetch(`${API_URL}/users/me/certificates/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) {
                setForm(f => ({ ...f, fileUrl: data.data.fileUrl, fileName: data.data.fileName }));
                toast.success('Certificate uploaded');
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    return (
        <div
            className="p-4 rounded-2xl space-y-3"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Certificate Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. AWS Certified Developer" style={inputStyle} />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Issuer *</label>
                    <input value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" style={inputStyle} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Issue Date</label>
                    <input type="month" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Expiry Date</label>
                    <input type="month" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} style={inputStyle} />
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-400 mb-1 block">Credential URL</label>
                <input value={form.credentialUrl} onChange={e => setForm(f => ({ ...f, credentialUrl: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>

            <div>
                <label className="text-xs text-gray-400 mb-1 block">Upload Certificate (PDF/Image)</label>
                <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
                <button onClick={() => fileRef.current?.click()} style={uploadBtnStyle} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : form.fileName ? form.fileName : 'Choose file'}
                </button>
                {form.fileUrl && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> File uploaded</p>}
            </div>

            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => { if (form.title && form.issuer) onSave(form); else toast.error('Title and issuer are required'); }}
                    style={saveBtnStyle}
                >
                    <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
            </div>
        </div>
    );
}

// ── Main CredentialsSection ───────────────────────────────────────────────────
export default function CredentialsSection({ user, isOwner, onUpdate }: Props) {
    const [workExperience, setWorkExperience] = useState<WorkExp[]>(user?.workExperience || []);
    const [certifications, setCertifications] = useState<Certification[]>(user?.certifications || []);
    const [resume, setResume] = useState<Resume>(user?.resume || {});
    const [validationScore, setValidationScore] = useState(user?.validationScore || 0);

    const [addingExp, setAddingExp] = useState(false);
    const [editingExpId, setEditingExpId] = useState<string | null>(null);
    const [addingCert, setAddingCert] = useState(false);
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [savingExp, setSavingExp] = useState(false);
    const [savingCert, setSavingCert] = useState(false);

    const resumeRef = useRef<HTMLInputElement>(null);

    const token = () => localStorage.getItem('auth_token');

    // ── Save work experience list ───────────────────────────────────────────────
    const saveExperience = async (list: WorkExp[]) => {
        setSavingExp(true);
        try {
            const res = await fetch(`${API_URL}/users/me/experience`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ workExperience: list }),
            });
            const data = await res.json();
            if (data.success) {
                setWorkExperience(list);
                setValidationScore(data.data.validationScore);
                setAddingExp(false);
                setEditingExpId(null);
                toast.success('Experience saved');
                onUpdate?.({ ...user, workExperience: list, validationScore: data.data.validationScore });
            } else toast.error(data.message || 'Failed to save');
        } catch { toast.error('Error saving experience'); }
        finally { setSavingExp(false); }
    };

    // ── Save certifications list ────────────────────────────────────────────────
    const saveCertifications = async (list: Certification[]) => {
        setSavingCert(true);
        try {
            const res = await fetch(`${API_URL}/users/me/certifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ certifications: list }),
            });
            const data = await res.json();
            if (data.success) {
                setCertifications(list);
                setValidationScore(data.data.validationScore);
                setAddingCert(false);
                setEditingCertId(null);
                toast.success('Certification saved');
                onUpdate?.({ ...user, certifications: list, validationScore: data.data.validationScore });
            } else toast.error(data.message || 'Failed to save');
        } catch { toast.error('Error saving certification'); }
        finally { setSavingCert(false); }
    };

    // ── Upload resume ───────────────────────────────────────────────────────────
    const uploadResume = async (file: File) => {
        if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed for resume'); return; }
        setUploadingResume(true);
        const fd = new FormData();
        fd.append('resume', file);
        try {
            const res = await fetch(`${API_URL}/users/me/resume`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) {
                setResume(data.data.resume);
                setValidationScore(v => Math.min(v + 20, 100));
                toast.success('Resume uploaded!');
                onUpdate?.({ ...user, resume: data.data.resume });
            } else toast.error(data.message || 'Upload failed');
        } catch { toast.error('Upload failed'); }
        finally { setUploadingResume(false); }
    };

    // ── Delete resume ───────────────────────────────────────────────────────────
    const deleteResume = async () => {
        try {
            await fetch(`${API_URL}/users/me/resume`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token()}` },
            });
            setResume({});
            toast.success('Resume removed');
        } catch { toast.error('Failed to remove resume'); }
    };

    const formatDate = (d?: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Validation Score */}
            <ValidationScore score={validationScore} />

            {/* ── Work Experience ── */}
            <section
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: '20px', padding: '20px' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Briefcase className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h3 className="font-semibold text-white">Work Experience</h3>
                        <span style={countBadge}>{workExperience.length}</span>
                    </div>
                    {isOwner && (
                        <button onClick={() => setAddingExp(true)} style={addBtnStyle}>
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    )}
                </div>

                {addingExp && isOwner && (
                    <div className="mb-4">
                        <WorkExpForm
                            exp={{}}
                            onSave={exp => saveExperience([...workExperience, exp])}
                            onCancel={() => setAddingExp(false)}
                        />
                    </div>
                )}

                {workExperience.length === 0 && !addingExp && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                        {isOwner ? 'Add your work experience to boost your credibility.' : 'No work experience listed.'}
                    </p>
                )}

                <div className="space-y-4">
                    {workExperience.map((exp, i) => (
                        editingExpId === (exp._id || String(i)) && isOwner ? (
                            <WorkExpForm
                                key={exp._id || i}
                                exp={exp}
                                onSave={updated => {
                                    const list = workExperience.map((e, j) => (exp._id ? e._id === exp._id : j === i) ? updated : e);
                                    saveExperience(list);
                                }}
                                onCancel={() => setEditingExpId(null)}
                            />
                        ) : (
                            <div key={exp._id || i} style={cardStyle}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-white text-sm">{exp.role}</div>
                                            <div className="text-cyan-400 text-xs font-medium">{exp.company}</div>
                                            <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(exp.startDate)} – {exp.current ? <span className="text-green-400">Present</span> : formatDate(exp.endDate)}
                                            </div>
                                            {exp.description && (
                                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{exp.description}</p>
                                            )}
                                            {exp.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {exp.skills.map((s, j) => <span key={j} style={tagStyle}>{s}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => setEditingExpId(exp._id || String(i))} style={iconBtn}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => saveExperience(workExperience.filter((_, j) => j !== i))}
                                                style={{ ...iconBtn, color: '#f87171' }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </section>

            {/* ── Certifications ── */}
            <section
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '20px', padding: '20px' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award className="w-4 h-4 text-violet-400" />
                        </div>
                        <h3 className="font-semibold text-white">Certifications</h3>
                        <span style={countBadge}>{certifications.length}</span>
                    </div>
                    {isOwner && (
                        <button onClick={() => setAddingCert(true)} style={addBtnStyle}>
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    )}
                </div>

                {addingCert && isOwner && (
                    <div className="mb-4">
                        <CertForm
                            cert={{}}
                            onSave={cert => saveCertifications([...certifications, cert])}
                            onCancel={() => setAddingCert(false)}
                        />
                    </div>
                )}

                {certifications.length === 0 && !addingCert && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                        {isOwner ? 'Add certifications to verify your skills.' : 'No certifications listed.'}
                    </p>
                )}

                <div className="space-y-3">
                    {certifications.map((cert, i) => (
                        editingCertId === (cert._id || String(i)) && isOwner ? (
                            <CertForm
                                key={cert._id || i}
                                cert={cert}
                                onSave={updated => {
                                    const list = certifications.map((c, j) => (cert._id ? c._id === cert._id : j === i) ? updated : c);
                                    saveCertifications(list);
                                }}
                                onCancel={() => setEditingCertId(null)}
                            />
                        ) : (
                            <div key={cert._id || i} style={cardStyle}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Award className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-white text-sm flex items-center gap-2">
                                                {cert.title}
                                                {cert.fileUrl && <CheckCircle className="w-3.5 h-3.5 text-green-400" title="File uploaded" />}
                                            </div>
                                            <div className="text-violet-400 text-xs">{cert.issuer}</div>
                                            {cert.issueDate && (
                                                <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(cert.issueDate)}
                                                    {cert.expiryDate && ` – ${formatDate(cert.expiryDate)}`}
                                                </div>
                                            )}
                                            <div className="flex gap-3 mt-2">
                                                {cert.credentialUrl && (
                                                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                                                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" /> Verify
                                                    </a>
                                                )}
                                                {cert.fileUrl && (
                                                    <a href={`${getBackendUrl()}${cert.fileUrl}`} target="_blank" rel="noreferrer"
                                                        className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> View Certificate
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => setEditingCertId(cert._id || String(i))} style={iconBtn}>
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => saveCertifications(certifications.filter((_, j) => j !== i))}
                                                style={{ ...iconBtn, color: '#f87171' }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </section>

            {/* ── Resume ── */}
            <section
                style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.18)', borderRadius: '20px', padding: '20px' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText className="w-4 h-4 text-pink-400" />
                        </div>
                        <h3 className="font-semibold text-white">Resume</h3>
                    </div>
                    {isOwner && (
                        <>
                            <input ref={resumeRef} type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} />
                            <button onClick={() => resumeRef.current?.click()} style={addBtnStyle} disabled={uploadingResume}>
                                {uploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {resume.fileUrl ? 'Replace' : 'Upload PDF'}
                            </button>
                        </>
                    )}
                </div>

                {resume.fileUrl ? (
                    <div style={cardStyle}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{resume.fileName || 'Resume.pdf'}</div>
                                    {resume.uploadedAt && (
                                        <div className="text-xs text-gray-500">Uploaded {formatDate(resume.uploadedAt)}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`${getBackendUrl()}${resume.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ ...saveBtnStyle, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> View
                                </a>
                                {isOwner && (
                                    <button onClick={deleteResume} style={{ ...cancelBtnStyle, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                        {isOwner
                            ? 'Upload your resume (PDF) so recruiters can evaluate you properly.'
                            : 'No resume uploaded.'}
                    </p>
                )}
            </section>
        </div>
    );
}

// ── Shared inline styles (avoids Tailwind purge issues) ───────────────────────
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 10,
    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff', fontSize: 13, outline: 'none',
};
const cardStyle: React.CSSProperties = {
    padding: '14px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
};
const tagStyle: React.CSSProperties = {
    fontSize: 11, padding: '2px 8px', borderRadius: 999,
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
    color: '#67e8f9', display: 'inline-flex', alignItems: 'center',
};
const countBadge: React.CSSProperties = {
    fontSize: 11, padding: '1px 7px', borderRadius: 999,
    background: 'rgba(255,255,255,0.08)', color: '#9ca3af',
};
const addBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
    color: '#22d3ee', cursor: 'pointer',
};
const saveBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
    color: '#22d3ee', cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 10, fontSize: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#9ca3af', cursor: 'pointer',
};
const uploadBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 10, fontSize: 12,
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
    color: '#c4b5fd', cursor: 'pointer', width: '100%',
};
const iconBtn: React.CSSProperties = {
    padding: 6, borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#9ca3af', cursor: 'pointer',
};
const smallBtnStyle: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
    color: '#22d3ee', cursor: 'pointer', whiteSpace: 'nowrap',
};