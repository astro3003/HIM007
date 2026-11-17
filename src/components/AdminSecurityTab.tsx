import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Lock,
  RefreshCw,
  CheckCircle2,
  Ban,
  Unlock,
  Send,
  KeyRound,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { SecuritySnapshot, SecuritySeverity } from '../types';
import { backendService } from '../services/api';

interface AdminSecurityTabProps {
  onUnreadCountChange?: (count: number) => void;
  onNotice?: (msg: string) => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  onUnreadCountChange,
  onNotice,
}) => {
  const [snapshot, setSnapshot] = useState<SecuritySnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [alertEmail, setAlertEmail] = useState<string>('guru.chelaforex@gmail.com');
  const [autoBlockCritical, setAutoBlockCritical] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [testingAlert, setTestingAlert] = useState<boolean>(false);

  // PIN rotation state
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinStatus, setPinStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [changingPin, setChangingPin] = useState<boolean>(false);

  const loadSnapshot = useCallback(async (syncInputs = false) => {
    const data = await backendService.getSecuritySnapshot();
    if (data) {
      setSnapshot(data);
      if (syncInputs) {
        setWebhookUrl(data.settings.webhookUrl || '');
        setAlertEmail(data.settings.alertEmail || 'guru.chelaforex@gmail.com');
        setAutoBlockCritical(data.settings.autoBlockCritical);
      }
      if (onUnreadCountChange) {
        onUnreadCountChange(data.stats.unreadAlertsCount || 0);
      }
    }
    setLoading(false);
  }, [onUnreadCountChange]);

  useEffect(() => {
    void loadSnapshot(true);
    const interval = setInterval(() => {
      void loadSnapshot(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadSnapshot]);

  const handleAcknowledgeAll = async () => {
    const updated = await backendService.acknowledgeSecurityEvents();
    if (updated) {
      setSnapshot(updated);
      onUnreadCountChange?.(0);
      onNotice?.('ALL SECURITY ALERTS MARKED AS ACKNOWLEDGED');
    }
  };

  const handleSaveAlertSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const saved = await backendService.updateSecuritySettings({
      webhookUrl,
      alertEmail,
      autoBlockCritical,
    });
    setSavingSettings(false);
    if (saved) {
      await loadSnapshot(false);
      onNotice?.('INTRUSION ALERT SETTINGS SAVED');
    }
  };

  const handleTestAlert = async () => {
    setTestingAlert(true);
    const res = await backendService.sendTestSecurityAlert();
    setTestingAlert(false);
    await loadSnapshot(false);
    if (res.ok) {
      onNotice?.(
        res.webhookDelivered
          ? 'TEST INTRUSION ALERT SENT TO WEBHOOK & AUDIT LOG'
          : 'TEST INTRUSION ALERT LOGGED IN HQ (ADD WEBHOOK URL FOR EXTERNAL PUSH)'
      );
    }
  };

  const handleToggleBlockIp = async (ip: string, isCurrentlyBlocked: boolean) => {
    if (ip === 'unknown') return;
    await backendService.updateSecuritySettings(
      isCurrentlyBlocked ? { unblockIp: ip } : { blockIp: ip }
    );
    await loadSnapshot(false);
    onNotice?.(isCurrentlyBlocked ? `UNBLOCKED IP ${ip}` : `BLOCKED IP ${ip} AT FIREWALL`);
  };

  const handleRotatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);
    if (newPin !== confirmPin) {
      setPinStatus({ ok: false, text: 'New PIN and confirmation do not match.' });
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setPinStatus({ ok: false, text: 'New PIN must be exactly 6 numerical digits.' });
      return;
    }
    setChangingPin(true);
    const result = await backendService.changeAdminPin(currentPin, newPin);
    setChangingPin(false);
    setPinStatus({ ok: result.success, text: result.message });
    if (result.success) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      onNotice?.('ADMIN SECURITY PIN UPDATED');
      await loadSnapshot(false);
    }
  };

  const getSeverityBadge = (sev: SecuritySeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/90 border-red-500 text-red-300';
      case 'HIGH':
        return 'bg-[#FF4D00]/20 border-[#FF4D00] text-[#FF7A45]';
      case 'MEDIUM':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      default:
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
    }
  };

  const stats = snapshot?.stats;
  const events = snapshot?.events || [];
  const blockedIps = snapshot?.settings?.blockedIps || [];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Security Posture KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14171F] border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#C8C4BC] uppercase tracking-wider">Firewall Perimeter</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>ACTIVE PROTECTION</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-950 border border-emerald-500/40 text-emerald-300">
            WAF + SCRYPT
          </span>
        </div>

        <div className="bg-[#14171F] border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#C8C4BC] uppercase tracking-wider">Unread Threat Alerts</div>
            <div className={`text-lg font-bold mt-0.5 ${(stats?.unreadAlertsCount || 0) > 0 ? 'text-[#FF4D00]' : 'text-white'}`}>
              {stats?.unreadAlertsCount ?? 0} ALERTS
            </div>
          </div>
          <Bell className={`w-5 h-5 ${(stats?.unreadAlertsCount || 0) > 0 ? 'text-[#FF4D00] animate-bounce' : 'text-[#C8C4BC]/50'}`} />
        </div>

        <div className="bg-[#14171F] border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#C8C4BC] uppercase tracking-wider">Blocked Attacks</div>
            <div className="text-lg font-bold text-white mt-0.5">{stats?.blockedAttacks ?? 0} STOPPED</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-[#FF4D00]" />
        </div>

        <div className="bg-[#14171F] border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#C8C4BC] uppercase tracking-wider">Active Lockouts / Bans</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {(stats?.activeLockoutsCount || 0) + (stats?.blockedIpsCount || 0)} IPs
            </div>
          </div>
          <Ban className="w-5 h-5 text-red-400" />
        </div>
      </div>

      {/* Intrusion Feed & Actions */}
      <div className="bg-[#14171F] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#111319] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-bold text-white uppercase tracking-wide">
              Live Intrusion & Attack Audit Log ({events.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadSnapshot(false)}
              className="px-2.5 py-1 bg-[#0B0D12] hover:bg-white/10 border border-white/15 rounded-md text-[#C8C4BC] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>REFRESH</span>
            </button>
            {(stats?.unreadAlertsCount || 0) > 0 && (
              <button
                type="button"
                onClick={handleAcknowledgeAll}
                className="px-2.5 py-1 bg-[#FF4D00] hover:bg-[#E03E1A] text-white font-bold rounded-md flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>ACKNOWLEDGE ALL ({stats?.unreadAlertsCount})</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#C8C4BC]">Loading security telemetry...</div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-white font-bold">Zero Security Incidents Recorded</div>
            <p className="text-[#C8C4BC]/70 max-w-md mx-auto">
              Brute-force PIN guesses, unauthorized admin API calls, XSS/SQLi probes, and upload exploits appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10 max-h-[360px] overflow-y-auto">
            {events.map((ev) => {
              const isBanned = blockedIps.includes(ev.ip);
              return (
                <div
                  key={ev.id}
                  className={`p-3.5 transition-colors ${
                    !ev.acknowledged && ev.severity !== 'LOW' ? 'bg-[#FF4D00]/[0.06]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold border rounded-sm ${getSeverityBadge(ev.severity)}`}>
                          {ev.severity}
                        </span>
                        {!ev.acknowledged && ev.severity !== 'LOW' && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FF4D00] text-white rounded-sm">
                            NEW ALERT
                          </span>
                        )}
                        <span className="text-white font-bold">{ev.title}</span>
                        <span className="text-[#C8C4BC]/60 text-[10px]">{ev.type}</span>
                      </div>
                      <div className="text-[#C8C4BC]">{ev.detail}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#C8C4BC]/70 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#FF4D00]" />
                          IP: <strong className="text-white">{ev.ip}</strong>
                        </span>
                        <span>
                          ROUTE: <strong className="text-white">{ev.method} {ev.path}</strong>
                        </span>
                        <span>TIME: {new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      {ev.payloadPreview && (
                        <div className="mt-1 px-2 py-1 bg-[#0B0D12] border border-white/10 rounded text-[10px] text-amber-300 break-all">
                          SIGNATURE: {ev.payloadPreview}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-sm border ${
                          ev.blocked
                            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/15 text-[#C8C4BC]'
                        }`}
                      >
                        {ev.blocked ? 'BLOCKED' : 'LOGGED'}
                      </span>
                      {ev.ip && ev.ip !== 'unknown' && ev.severity !== 'LOW' && (
                        <button
                          type="button"
                          onClick={() => void handleToggleBlockIp(ev.ip, isBanned)}
                          className={`px-2 py-0.5 text-[10px] rounded-sm border flex items-center gap-1 cursor-pointer ${
                            isBanned
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900'
                          }`}
                        >
                          {isBanned ? <Unlock className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          <span>{isBanned ? 'UNBLOCK IP' : 'BLOCK IP'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Configuration Grid: Instant Alert Webhook + Change PIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Notification Channels */}
        <form onSubmit={handleSaveAlertSettings} className="bg-[#14171F] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-white uppercase">
              <Bell className="w-4 h-4 text-[#FF4D00]" />
              <span>Real-Time Owner Alert Channels</span>
            </div>
            <button
              type="button"
              disabled={testingAlert}
              onClick={handleTestAlert}
              className="px-2.5 py-1 bg-[#0B0D12] hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{testingAlert ? 'SENDING...' : 'SEND TEST ALERT'}</span>
            </button>
          </div>

          <div>
            <label className="block text-[10px] text-[#C8C4BC] uppercase mb-1">
              Instant Push Webhook URL (Discord / Slack / Telegram Bridge / n8n)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
              className="w-full bg-[#0B0D12] border border-white/15 rounded-lg p-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF4D00]"
            />
            <p className="text-[10px] text-[#C8C4BC]/70 mt-1">
              Whenever a HIGH or CRITICAL hack attempt happens, HIM dispatches an instant JSON alert to this URL.
            </p>
          </div>

          <div>
            <label className="block text-[10px] text-[#C8C4BC] uppercase mb-1">
              Owner Notification Email (Included in Alert Payloads)
            </label>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              className="w-full bg-[#0B0D12] border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FF4D00]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-[#C8C4BC]">
            <input
              type="checkbox"
              checked={autoBlockCritical}
              onChange={(e) => setAutoBlockCritical(e.target.checked)}
              className="accent-[#FF4D00] w-4 h-4"
            />
            <span>Auto-ban external attacker IPs immediately on CRITICAL exploits (XSS/Traversal/Prototype Pollution)</span>
          </label>

          <button
            type="submit"
            disabled={savingSettings}
            className="w-full py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            {savingSettings ? 'SAVING SETTINGS...' : 'SAVE INTRUSION ALERT CONFIGURATION'}
          </button>
        </form>

        {/* Rotate Admin PIN */}
        <form onSubmit={handleRotatePin} className="bg-[#14171F] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white uppercase border-b border-white/10 pb-3">
            <KeyRound className="w-4 h-4 text-[#FF4D00]" />
            <span>Rotate Admin Security PIN</span>
          </div>

          <p className="text-[#C8C4BC]/80 leading-relaxed">
            PIN is hashed server-side using salted <span className="text-white font-semibold">Scrypt</span> and never stored in browser source code. Rotate regularly to stay protected.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-[#C8C4BC] uppercase mb-1">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
                className="w-full bg-[#0B0D12] border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FF4D00]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#C8C4BC] uppercase mb-1">New 6-Digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
                className="w-full bg-[#0B0D12] border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FF4D00]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#C8C4BC] uppercase mb-1">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                required
                className="w-full bg-[#0B0D12] border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#FF4D00]"
              />
            </div>
          </div>

          {pinStatus && (
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                pinStatus.ok
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#FF4D00]/15 border-[#FF4D00] text-[#FF7A45]'
              }`}
            >
              {pinStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{pinStatus.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPin}
            className="w-full py-2.5 bg-[#0B0D12] hover:bg-[#FF4D00] border border-white/20 hover:border-[#FF4D00] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{changingPin ? 'UPDATING HASH...' : 'UPDATE ADMIN SECURITY PIN'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
