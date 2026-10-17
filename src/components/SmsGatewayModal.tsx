'use client';

import React, { useState, useEffect } from 'react';
import { SmsService, SmsGatewayConfig, SmsRecord } from '@/utils/smsService';
import { 
  Smartphone, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface SmsGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSentSms?: SmsRecord | null;
  darkMode?: boolean;
}

export const SmsGatewayModal: React.FC<SmsGatewayModalProps> = ({
  isOpen,
  onClose,
  lastSentSms,
  darkMode = false,
}) => {
  const [provider, setProvider] = useState<'twilio' | 'africastalking' | 'termii' | 'textbelt'>('twilio');
  const [accountSid, setAccountSid] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [senderId, setSenderId] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    const saved = SmsService.getSavedConfig();
    if (saved) {
      setProvider(saved.provider);
      if (saved.accountSid) setAccountSid(saved.accountSid);
      if (saved.apiKey) setApiKey(saved.apiKey);
      if (saved.apiSecret) setApiSecret(saved.apiSecret);
      if (saved.senderId) setSenderId(saved.senderId);
    }
    if (lastSentSms?.toPhone) {
      setTestPhone(lastSentSms.toPhone);
    }
  }, [isOpen, lastSentSms]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    const config: SmsGatewayConfig = {
      provider,
      accountSid: accountSid.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      apiSecret: apiSecret.trim() || undefined,
      senderId: senderId.trim() || undefined,
    };
    SmsService.saveConfig(config);
    setTestResult({ success: true, message: 'SMS gateway configuration saved successfully!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleClearConfig = () => {
    SmsService.saveConfig(null);
    setAccountSid('');
    setApiKey('');
    setApiSecret('');
    setSenderId('');
    setTestResult({ success: true, message: 'Reset to default mode.' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid phone number (with country code e.g. +1... or +234...)' });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const customConfig: SmsGatewayConfig = {
        provider,
        accountSid: accountSid.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        senderId: senderId.trim() || undefined,
      };

      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhone.trim(),
          message: `[QueueMate Test] Hello! Real cellular SMS delivery is connected. You will receive notifications when you are next in line.`,
          customerName: 'Test Recipient',
          companyName: 'QueueMate',
          customConfig,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `SMS delivered to ${testPhone} via ${data.provider.toUpperCase()}! (Message ID: ${data.messageId || data.textId || 'Delivered'})`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.warning || 'Failed to dispatch real SMS. Please check your credentials or country code.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network request to /api/sms/send failed.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const sampleEnv = `# Add to your .env.local file:
# Option A: Twilio (Global)
TWILIO_ACCOUNT_SID=${accountSid || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
TWILIO_AUTH_TOKEN=${apiSecret || 'your_twilio_auth_token'}
TWILIO_PHONE_NUMBER=${senderId || '+1234567890'}

# Option B: Africa's Talking (Africa)
AFRICASTALKING_USERNAME=${accountSid || 'sandbox'}
AFRICASTALKING_API_KEY=${apiKey || 'atsk_xxxxxxxxxxxx'}
AFRICASTALKING_FROM=${senderId || 'QueueMate'}

# Option C: Termii (Nigeria/West Africa)
TERMII_API_KEY=${apiKey || 'your_termii_api_key'}
TERMII_SENDER_ID=${senderId || 'QueueMate'}
`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          darkMode ? 'bg-[#182335] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">SMS Phone Delivery & Gateway Setup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your SMS provider or send directly from your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Quick Notice: Why the SMS didn't reach the phone previously */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start space-x-3 text-blue-900 dark:text-blue-200">
            <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-xs">Why didn&apos;t the SMS reach the phone?</p>
              <p className="text-[11.5px] leading-relaxed text-blue-800/90 dark:text-blue-300">
                Web browsers cannot talk to telecom towers directly without a cellular SMS gateway API 
                (like Twilio, Termii, or Africa&apos;s Talking). Without an API key, the system runs in <strong>simulated mode</strong>.
                You can now send directly via your phone&apos;s SMS app or connect a real gateway below!
              </p>
            </div>
          </div>

          {/* Quick Action 1: Instant Native SMS / WhatsApp Fallback */}
          {lastSentSms && (
            <div className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Latest Alert: Ticket #{lastSentSms.ticketNumber} ({lastSentSms.customerName})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">{lastSentSms.toPhone}</span>
              </div>
              <p className="text-[11px] font-mono p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 mb-3 break-words">
                &ldquo;{lastSentSms.message}&rdquo;
              </p>

              <div className="flex items-center space-x-2">
                {lastSentSms.nativeSmsUrl && (
                  <a
                    href={lastSentSms.nativeSmsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send via Phone Messages App</span>
                  </a>
                )}

                {lastSentSms.whatsappUrl && (
                  <a
                    href={lastSentSms.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Cellular SMS Gateway Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'twilio', name: 'Twilio', badge: 'Global' },
                { id: 'africastalking', name: "Africa's Talking", badge: 'Africa' },
                { id: 'termii', name: 'Termii', badge: 'Nigeria' },
                { id: 'textbelt', name: 'Textbelt', badge: 'Free / Easy' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    provider === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : darkMode
                      ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {provider === 'twilio' && 'Twilio API Credentials'}
                {provider === 'africastalking' && "Africa's Talking Credentials"}
                {provider === 'termii' && 'Termii API Key'}
                {provider === 'textbelt' && 'Textbelt API Key'}
              </span>
              <span className="text-[10px] text-slate-400">Stored locally in your browser</span>
            </div>

            {provider === 'twilio' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Twilio Account SID</label>
                  <input
                    type="text"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Twilio Phone Number / Sender</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'africastalking' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Africa&apos;s Talking Username</label>
                  <input
                    type="text"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    placeholder="e.g. sandbox or your_app_username"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="atsk_••••••••••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sender ID (Optional)</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="QueueMate"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'termii' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Termii API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="TERMI_API_KEY_••••••••"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="QueueMate"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'textbelt' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Textbelt Key (Leave blank or &apos;textbelt&apos; for free test)</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="textbelt (free tier) or paid key"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Gateway Config</span>
              </button>
              <button
                type="button"
                onClick={handleClearConfig}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Test Live Send to Phone */}
          <form onSubmit={handleSendTestSms} className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Test Real Phone Delivery</span>
              </span>
              <span className="text-[10px] text-slate-400">Requires country code (e.g. +234, +27, +1)</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+234 801 234 5678 or +1 555 123 4567"
                className="flex-1 px-3 py-2 rounded-xl border text-xs font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSendingTest || !testPhone.trim()}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer flex-shrink-0"
              >
                {isSendingTest ? 'Sending...' : 'Send Test SMS'}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/40'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
            )}
          </form>

          {/* Environment Variables Reference */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Server-side Configuration (.env.local)
              </span>
              <button
                type="button"
                onClick={copyEnvToClipboard}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'Copied' : 'Copy Sample .env'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10.5px] overflow-x-auto select-all leading-relaxed border border-slate-800">
              {sampleEnv}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
