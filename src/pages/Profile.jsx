import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, LogOut,
  Key, ShoppingBag, CheckCircle, AlertCircle, X, Save,
  ArrowRight, Shield, Sparkles, ChevronRight
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
});

const INFO_FIELDS = [
  { key: "name",      label: "Full name",      icon: User,     color: "#8b5cf6" },
  { key: "email",     label: "Email address",  icon: Mail,     color: "#3b82f6" },
  { key: "phone",     label: "Phone number",   icon: Phone,    color: "#10b981" },
  { key: "address",   label: "Address",        icon: MapPin,   color: "#f59e0b" },
  { key: "createdAt", label: "Member since",   icon: Calendar, color: "#ec4899" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [form, setForm]         = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => {
    API.get("/user/me")
      .then(({ data }) => {
        setUser(data);
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/user/profile", form);
      setUser(data); setEditing(false);
      setToast({ msg: "Profile updated successfully!", type: "success" });
    } catch {
      setToast({ msg: "Failed to update profile.", type: "error" });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    ["token", "customerToken", "adminToken", "role"].forEach(k => localStorage.removeItem(k));
    navigate("/portal");
  };

  const displayValue = (key) => {
    if (key === "createdAt")
      return user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
        : "N/A";
    return user?.[key] || "—";
  };

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.spinnerWrap}>
        <div style={s.spinnerRing} />
        <span style={s.spinnerLabel}>Loading profile…</span>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ─── Background blobs ─── */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      <div style={s.wrap}>

        {/* ─── Toast ─── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              style={{ ...s.toast, ...(toast.type === "success" ? s.toastOk : s.toastErr) }}
            >
              {toast.type === "success"
                ? <CheckCircle size={16} style={{ flexShrink: 0 }} />
                : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Profile hero card ─── */}
        <motion.div {...fadeUp(0)} style={s.heroCard}>
          {/* gradient top bar */}
          <div style={s.heroBar} />

          {/* avatar */}
          <div style={s.avatarRing}>
            <div style={s.avatarInner}>
              <span style={{ fontSize: 38 }}>👤</span>
            </div>
            <div style={s.verifiedBadge}><Shield size={11} color="#fff" /></div>
          </div>

          <div style={s.heroBody}>
            <h2 style={s.heroName}>{user?.name || "Your Name"}</h2>
            <p style={s.heroEmail}>{user?.email}</p>
            <div style={s.heroBadges}>
              <span style={{ ...s.badge, background: "#f3e8ff", color: "#7c3aed" }}>
                <Sparkles size={11} /> Premium Member
              </span>
              <span style={{ ...s.badge, background: "#ecfdf5", color: "#059669" }}>
                <Shield size={11} /> Verified
              </span>
              {user?.createdAt && (
                <span style={{ ...s.badge, background: "#fef3c7", color: "#b45309" }}>
                  <Calendar size={11} /> Since {new Date(user.createdAt).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Info / Edit card ─── */}
        <motion.div {...fadeUp(0.08)} style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardHeadLeft}>
              <div style={{ ...s.cardIconBox, background: "#ede9fe" }}>
                <User size={15} color="#7c3aed" />
              </div>
              <div>
                <div style={s.cardTitle}>Personal information</div>
                <div style={s.cardSub}>Your account details</div>
              </div>
            </div>
            {!editing && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)} style={s.editPill}>
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* View mode */}
            {!editing && (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {INFO_FIELDS.map(({ key, label, icon: Icon, color }, i) => (
                  <div key={key} style={{ ...s.infoRow, borderBottom: i < INFO_FIELDS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={s.infoLeft}>
                      <div style={{ ...s.infoIconBox, background: color + "18" }}>
                        <Icon size={14} color={color} />
                      </div>
                      <span style={s.infoLabel}>{label}</span>
                    </div>
                    <span style={s.infoValue}>{displayValue(key)}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Edit mode */}
            {editing && (
              <motion.form key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit} style={s.editForm}>
                {[
                  { name: "name",    label: "Full name",     type: "text",  placeholder: "Your full name",    disabled: false },
                  { name: "email",   label: "Email address", type: "email", placeholder: "your@email.com",    disabled: true  },
                  { name: "phone",   label: "Phone number",  type: "tel",   placeholder: "+91 98765 43210",   disabled: false },
                ].map(({ name, label, type, placeholder, disabled }) => (
                  <div key={name} style={s.formGroup}>
                    <label style={s.formLabel}>{label}</label>
                    <input
                      name={name} type={type} value={form[name]}
                      onChange={e => setForm({ ...form, [name]: e.target.value })}
                      placeholder={placeholder} disabled={disabled}
                      className={disabled ? "profile-input-disabled" : "profile-input"}
                      style={disabled ? s.inputDisabled : s.input}
                    />
                    {disabled && <p style={s.hint}>Email address cannot be changed</p>}
                  </div>
                ))}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Address</label>
                  <textarea name="address" rows={3} value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Your full delivery address"
                    className="profile-input"
                    style={{ ...s.input, resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>
                <div style={s.formBtns}>
                  <button type="submit" className="profile-save-btn" style={s.saveBtn}>
                    <Save size={15} /> Save changes
                  </button>
                  <button type="button" className="profile-cancel-btn" style={s.cancelBtn}
                    onClick={() => { setEditing(false); setForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: user?.address || "" }); }}>
                    <X size={15} /> Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Quick actions ─── */}
        <motion.div {...fadeUp(0.14)} style={s.actionsGrid}>
          {[
            { label: "Change password",  sub: "Update your credentials",  icon: Key,         iconBg: "#ede9fe", iconColor: "#7c3aed", action: () => navigate("/change-password") },
            { label: "My orders",        sub: "Track your purchases",      icon: ShoppingBag, iconBg: "#e0f2fe", iconColor: "#0284c7", action: () => navigate("/orders") },
          ].map(({ label, sub, icon: Icon, iconBg, iconColor, action }) => (
            <motion.button key={label} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={action} style={s.actionCard}>
              <div style={{ ...s.actionIcon, background: iconBg }}>
                <Icon size={20} color={iconColor} />
              </div>
              <div style={s.actionText}>
                <span style={s.actionLabel}>{label}</span>
                <span style={s.actionSub}>{sub}</span>
              </div>
              <ChevronRight size={16} color="#cbd5e1" />
            </motion.button>
          ))}
        </motion.div>

        {/* ─── Logout ─── */}
        <motion.div {...fadeUp(0.2)}>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout} style={s.logoutBtn}>
            <div style={s.logoutIcon}>
              <LogOut size={18} color="#ef4444" />
            </div>
            <div style={s.actionText}>
              <span style={{ ...s.actionLabel, color: "#dc2626" }}>Sign out</span>
              <span style={s.actionSub}>Log out of your account</span>
            </div>
            <ArrowRight size={16} color="#fca5a5" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh",
    background: "#f8f7fc",
    padding: "40px 16px 60px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: "-120px", left: "-100px",
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, #ede9fe 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "absolute", top: "30%", right: "-150px",
    width: 500, height: 500, borderRadius: "50%",
    background: "radial-gradient(circle, #fce7f3 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  blob3: {
    position: "absolute", bottom: "-100px", left: "30%",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  wrap: {
    maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", gap: 16,
  },
  loadingPage: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#f8f7fc",
  },
  spinnerWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  spinnerRing: {
    width: 44, height: 44, borderRadius: "50%",
    border: "3px solid #ede9fe", borderTop: "3px solid #8b5cf6",
    animation: "spin 0.8s linear infinite",
  },
  spinnerLabel: { fontSize: 14, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" },

  toast: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 18px", borderRadius: 14,
    fontSize: 13, fontWeight: 600, marginBottom: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  toastOk: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  toastErr: { background: "#fff1f2", color: "#dc2626", border: "1px solid #fecaca" },

  heroCard: {
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 4px 32px rgba(139,92,246,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid rgba(139,92,246,0.10)",
    display: "flex", flexDirection: "column", alignItems: "center",
    paddingBottom: 28,
    position: "relative",
  },
  heroBar: {
    width: "100%", height: 90,
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)",
    marginBottom: 0,
    position: "relative",
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: "50%",
    border: "4px solid #fff",
    background: "#fff",
    marginTop: -44,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 24px rgba(139,92,246,0.20)",
    position: "relative",
    zIndex: 2,
  },
  avatarInner: {
    width: 78, height: 78, borderRadius: "50%",
    background: "linear-gradient(135deg, #ede9fe, #fce7f3)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: "50%",
    background: "#10b981", border: "2px solid #fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  heroBody: { textAlign: "center", padding: "16px 24px 0", width: "100%" },
  heroName: {
    fontSize: 22, fontWeight: 700, color: "#1e293b",
    margin: 0, letterSpacing: "-0.4px",
  },
  heroEmail: { fontSize: 13, color: "#94a3b8", margin: "4px 0 14px" },
  heroBadges: {
    display: "flex", flexWrap: "wrap", gap: 8,
    justifyContent: "center",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 12px", borderRadius: 40,
    fontSize: 12, fontWeight: 600,
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  cardHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 22px", borderBottom: "1px solid #f8fafc",
    background: "#fafafa",
  },
  cardHeadLeft: { display: "flex", alignItems: "center", gap: 12 },
  cardIconBox: {
    width: 34, height: 34, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#1e293b" },
  cardSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

  editPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 40,
    background: "#ede9fe", color: "#7c3aed",
    border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 700,
    transition: "all 0.18s",
  },

  infoRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", gap: 12, flexWrap: "wrap",
  },
  infoLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  infoIconBox: {
    width: 32, height: 32, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  infoLabel: { fontSize: 13, fontWeight: 600, color: "#475569" },
  infoValue: { fontSize: 13, fontWeight: 500, color: "#1e293b", textAlign: "right" },

  editForm: { padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  formLabel: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 12,
    fontSize: 14, color: "#1e293b", outline: "none",
    background: "#f8f9fb",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.18s",
    width: "100%", boxSizing: "border-box",
  },
  inputDisabled: {
    padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12,
    fontSize: 14, color: "#94a3b8", background: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
    width: "100%", boxSizing: "border-box", cursor: "not-allowed",
  },
  hint: { fontSize: 11, color: "#94a3b8", margin: 0 },
  formBtns: { display: "flex", gap: 10, marginTop: 4 },
  saveBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff", border: "none", borderRadius: 14,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
    transition: "all 0.18s",
  },
  cancelBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px", background: "#f1f5f9",
    color: "#475569", border: "none", borderRadius: 14,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    transition: "all 0.18s",
  },

  actionsGrid: { display: "flex", flexDirection: "column", gap: 10 },
  actionCard: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 18px",
    background: "#fff", borderRadius: 18,
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    cursor: "pointer", textAlign: "left", width: "100%",
    transition: "all 0.2s",
  },
  actionIcon: {
    width: 46, height: 46, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  actionText: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  actionLabel: { fontSize: 14, fontWeight: 700, color: "#1e293b" },
  actionSub: { fontSize: 12, color: "#94a3b8" },

  logoutBtn: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 18px", width: "100%",
    background: "#fff7f7", borderRadius: 18,
    border: "1px solid #fee2e2",
    cursor: "pointer", textAlign: "left",
    transition: "all 0.2s",
  },
  logoutIcon: {
    width: 46, height: 46, borderRadius: 14,
    background: "#fee2e2",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }

  .profile-input:focus {
    border-color: #8b5cf6 !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12) !important;
  }
  .profile-edit-btn:hover {
    background: #ddd6fe !important;
  }
  .profile-save-btn:hover {
    background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 18px rgba(139,92,246,0.40) !important;
  }
  .profile-cancel-btn:hover {
    background: #e2e8f0 !important;
  }
`;




