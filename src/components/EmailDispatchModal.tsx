'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  FileText,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  editionId: string | undefined;
  editionNumber: number | undefined;
  defaultName?: string;
  defaultEmail?: string;
}

export function EmailDispatchModal({
  isOpen,
  onClose,
  editionId,
  editionNumber = 1,
  defaultName = 'Distinguished Reader',
  defaultEmail = '',
}: EmailDispatchModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [recipientName, setRecipientName] = useState(defaultName);
  const [deliveryTime, setDeliveryTime] = useState<'instant' | '06:00' | '07:30'>('instant');
  const [format, setFormat] = useState<'html_broadsheet' | 'plain_text_wire'>('html_broadsheet');
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    dispatchId: string;
    message: string;
    previewHtml?: string;
  } | null>(null);

  // Lock body scroll and pause Lenis while Email Modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.stop();
      }
    } else {
      document.body.classList.remove('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMsg('Please enter a valid recipient email address.');
      playAudioHaptic('click');
      return;
    }

    if (!editionId) {
      setErrorMsg('No active morning edition found to dispatch.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    playAudioHaptic('action');

    try {
      const res = await fetch('/api/email/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          editionId,
          deliveryTime,
          format,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch morning edition.');
      }

      setSuccessData({
        dispatchId: data.dispatchId,
        message: data.message,
        previewHtml: data.previewHtml,
      });
      if (data.previewHtml) {
        setPreviewHtml(data.previewHtml);
      }
      playAudioHaptic('bell');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown dispatch error';
      setErrorMsg(msg);
      playAudioHaptic('click');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setErrorMsg(null);
    setActiveTab('configure');
  };

  return (
    <div
      className="email-dispatch-overlay"
      data-lenis-prevent="true"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Dispatch Morning Edition via Email Courier"
    >
      <div
        className="email-dispatch-modal"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="email-modal-header">
          <div className="flex items-center gap-2">
            <div className="email-icon-badge">
              <Mail size={16} className="text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="email-modal-title">Morning Dispatch Courier</h3>
              <p className="email-modal-subtitle">
                Deliver Edition #{editionNumber} to your personal inbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="email-close-btn"
            title="Close modal (Esc)"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="email-tabs-bar">
          <button
            onClick={() => setActiveTab('configure')}
            className={`email-tab-btn ${activeTab === 'configure' ? 'active' : ''}`}
          >
            <Send size={12} className="inline mr-1" />
            <span>Configure Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`email-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          >
            <Eye size={12} className="inline mr-1" />
            <span>Broadsheet HTML Preview</span>
          </button>
        </div>

        {/* Success State View */}
        {successData ? (
          <div className="email-success-container">
            <div className="success-icon-wrap">
              <CheckCircle2 size={42} className="text-emerald-500" />
            </div>
            <h4 className="success-title">Morning Edition Queued for Delivery!</h4>
            <p className="success-desc">{successData.message}</p>

            <div className="dispatch-receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">DISPATCH IDENTIFIER:</span>
                <span className="receipt-value font-mono">{successData.dispatchId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">RECIPIENT INBOX:</span>
                <span className="receipt-value">{recipientEmail}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">SCHEDULED DELIVERY:</span>
                <span className="receipt-value font-mono">
                  {deliveryTime === 'instant' ? 'INSTANT DISPATCH' : `${deliveryTime} EST`}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">VERBATIM GROUNDING:</span>
                <span className="receipt-value text-emerald-600 dark:text-emerald-400 font-semibold">
                  100% Primary Source Grounded
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={handleReset} className="email-action-btn secondary">
                Send to Another Address
              </button>
              <button onClick={onClose} className="email-action-btn primary">
                Done & Return to Paper
              </button>
            </div>
          </div>
        ) : activeTab === 'preview' ? (
          /* Live Email Preview Tab */
          <div className="email-preview-container">
            <div className="preview-top-status">
              <span>PREVIEW RENDERING: 680PX RESPONSIVE BROADSHEET DIGEST</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                GMAIL &bull; APPLE MAIL COMPLIANT
              </span>
            </div>
            <div className="preview-html-frame">
              {previewHtml ? (
                <iframe
                  title="HTML Email Preview"
                  srcDoc={previewHtml}
                  className="preview-iframe"
                />
              ) : (
                <div className="preview-placeholder">
                  <FileText size={32} className="text-stone-400 mb-2" />
                  <p>Click &quot;Configure Dispatch&quot; and enter recipient details to generate the live preview template.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Configure Dispatch Form */
          <form onSubmit={handleSendDispatch} className="email-form">
            {errorMsg && (
              <div className="email-error-banner">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-field-group">
              <label className="email-field-label">Recipient Email Address</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="reader@sovereign-intelligence.com"
                className="email-text-input"
              />
              <span className="field-hint">
                The morning edition will be securely dispatched directly to this address.
              </span>
            </div>

            <div className="form-field-group">
              <label className="email-field-label">Subscriber Salutation</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Distinguished Reader / Dr. Alex Chen"
                className="email-text-input"
              />
            </div>

            {/* Schedule Selector */}
            <div className="form-field-group">
              <label className="email-field-label">Delivery Schedule</label>
              <div className="schedule-pills-row">
                <button
                  type="button"
                  onClick={() => setDeliveryTime('instant')}
                  className={`schedule-pill ${deliveryTime === 'instant' ? 'active' : ''}`}
                >
                  <Sparkles size={12} className="inline mr-1" />
                  <span>Instant Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryTime('06:00')}
                  className={`schedule-pill ${deliveryTime === '06:00' ? 'active' : ''}`}
                >
                  <Clock size={12} className="inline mr-1" />
                  <span>06:00 AM Dawn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryTime('07:30')}
                  className={`schedule-pill ${deliveryTime === '07:30' ? 'active' : ''}`}
                >
                  <Clock size={12} className="inline mr-1" />
                  <span>07:30 AM Commute</span>
                </button>
              </div>
            </div>

            {/* Format Selector */}
            <div className="form-field-group">
              <label className="email-field-label">Delivery Format</label>
              <div className="schedule-pills-row">
                <button
                  type="button"
                  onClick={() => setFormat('html_broadsheet')}
                  className={`schedule-pill ${format === 'html_broadsheet' ? 'active' : ''}`}
                >
                  <FileText size={12} className="inline mr-1" />
                  <span>HTML Broadsheet Digest</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('plain_text_wire')}
                  className={`schedule-pill ${format === 'plain_text_wire' ? 'active' : ''}`}
                >
                  <Copy size={12} className="inline mr-1" />
                  <span>Plain-Text Wire</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="email-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="email-btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="email-btn-primary"
              >
                {isSubmitting ? (
                  <span>Queuing Courier...</span>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Morning Edition</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
