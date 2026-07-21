import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Drop this into the Profile page (or a Settings page) to let users
// turn 2FA on/off. Shows the QR code during setup, then asks for the
// first code to confirm before actually enabling it.
const TwoFactorSettings = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(user?.twoFactorEnabled || false);
  const [message, setMessage] = useState("");

  const startSetup = async () => {
    setMessage("");
    const { data } = await api.post("/auth/2fa/setup");
    setQrCode(data.qrCodeDataUrl);
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/2fa/confirm", { token: code });
      setEnabled(true);
      setQrCode(null);
      setCode("");
      setMessage("Two-factor authentication is now enabled.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid code");
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/2fa/disable", { token: code });
      setEnabled(false);
      setCode("");
      setMessage("Two-factor authentication disabled.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid code");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
      <h2 className="font-semibold text-slate-800 mb-1">Two-Factor Authentication</h2>
      <p className="text-sm text-slate-500 mb-4">
        {enabled ? "2FA is currently enabled on your account." : "Add an extra layer of security to your login."}
      </p>

      {message && <p className="text-sm text-blue-600 mb-3">{message}</p>}

      {!enabled && !qrCode && (
        <button
          onClick={startSetup}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          Enable 2FA
        </button>
      )}

      {qrCode && (
        <form onSubmit={confirmSetup} className="space-y-3">
          <p className="text-sm text-slate-600">Scan this with Google Authenticator or Authy:</p>
          <img src={qrCode} alt="2FA QR code" className="w-40 h-40 border border-slate-200 rounded-lg" />
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit code"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium">
            Confirm & Enable
          </button>
        </form>
      )}

      {enabled && (
        <form onSubmit={disable} className="space-y-3">
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter current 6-digit code to disable"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button className="bg-red-50 text-red-700 hover:bg-red-100 text-sm px-4 py-2 rounded-lg font-medium">
            Disable 2FA
          </button>
        </form>
      )}
    </div>
  );
};

export default TwoFactorSettings;
