import React, { useEffect, useRef, useState } from "react";

const Manager = () => {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimerRef = useRef(null);
  const [inputVisible, setInputVisible] = useState(false);

  // Fetch entries from backend on mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/passwords');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error('Fetch entries error:', err);
      }
    };
    fetchEntries();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const resetForm = () => {
    setSite("");
    setUsername("");
    setPassword("");
    setEditingId(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!site.trim()) e.site = "Site URL is required";
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const perform = async () => {
      try {
        if (editingId) {
          const res = await fetch(`http://localhost:5000/api/passwords/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site, username, password })
          });
          if (!res.ok) throw new Error('Update failed');
          const updated = await res.json();
          setEntries((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
          showToast('Password updated');
        } else {
          const res = await fetch('http://localhost:5000/api/passwords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site, username, password })
          });
          if (!res.ok) throw new Error('Save failed');
          const created = await res.json();
          setEntries((prev) => [...prev, created]);
          showToast('Password saved');
        }
        resetForm();
      } catch (err) {
        console.error(err);
        showToast('Server error');
      }
    };
    perform();
  };

  const handleEdit = (id) => {
    const item = entries.find((x) => x.id === id);
    if (!item) return;
    setSite(item.site);
    setUsername(item.username);
    setPassword(item.password);
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Delete this password entry?");
    if (!ok) return;
    const perform = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/passwords/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setEntries((prev) => prev.filter((x) => x.id !== id));
        showToast('Password deleted');
      } catch (err) {
        console.error(err);
        showToast('Server error');
      }
    };
    perform();
  };

  const showToast = (message = "Copied to clipboard!") => {
    setToast({ show: true, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ show: false, message: "" }), 1800);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (err) {
      console.error("Clipboard failed:", err);
      showToast("Unable to copy");
    }
  };

  // Row-level state for toggling visibility of passwords
  const [visibleMap, setVisibleMap] = useState({});
  const toggleVisible = (id) => {
    setVisibleMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <main className="min-h-[78.2vh] px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="header mb-4">
            <h1 className="text-4xl text-center font-semibold">
              Lock <span className="text-[#18f7fb]">Pluse</span>
            </h1>
            <p className="text-center text-gray-600 mt-1">Your own password manager</p>
          </div>

          <form onSubmit={handleSave} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring ${errors.site ? "border-red-400" : "border-gray-300"}`}
                placeholder="https://example.com"
                type="text"
              />
              {errors.site && <div className="text-sm text-red-500 mt-1">{errors.site}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring ${errors.username ? "border-red-400" : "border-gray-300"}`}
                  placeholder="you@example.com"
                  type="text"
                />
                {errors.username && <div className="text-sm text-red-500 mt-1">{errors.username}</div>}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring ${errors.password ? "border-red-400" : "border-gray-300"}`}
                    placeholder="Enter a password"
                    type={inputVisible ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setInputVisible((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer hover:opacity-90 hover:scale-105 transition"
                    aria-label={inputVisible ? "Hide password" : "Show password"}
                  >
                    <img
                      src={inputVisible ? "/hide.png" : "/show.png"}
                      alt={inputVisible ? "hide" : "show"}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </button>
                </div>
                {errors.password && <div className="text-sm text-red-500 mt-1">{errors.password}</div>}
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                type="submit"
                className="bg-[#0a0025] text-white px-4 py-2 rounded-md hover:opacity-95 hover:scale-105 transition cursor-pointer"
              >
                {editingId ? "Update Password" : "Save Password"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="ml-2 px-3 py-2 rounded-md border cursor-pointer hover:opacity-90 hover:scale-105 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="passwords mt-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Your Passwords</h2>

            {entries.length === 0 ? (
              <div className="p-6 rounded-md bg-white text-center text-gray-600 shadow-sm">No passwords added yet</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-[#0a0025] text-white">
                      <th className="text-left px-4 py-3 text-sm">Sr.</th>
                      <th className="text-left px-4 py-3 text-sm">Site</th>
                      <th className="text-left px-4 py-3 text-sm">Username</th>
                      <th className="text-left px-4 py-3 text-sm">Password</th>
                      <th className="text-left px-4 py-3 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {entries.map((entry, idx) => (
                      <tr key={entry.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm align-top">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm align-top">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs">{entry.site}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(entry.site)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={`Copy site ${entry.site}`}
                            >
                              <img src="/copy.png" alt="copy site" className="w-5 h-5 cursor-pointer" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs">{entry.username}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(entry.username)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={`Copy username ${entry.username}`}
                            >
                              <img src="/copy.png" alt="copy username" className="w-5 h-5 cursor-pointer" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs">{visibleMap[entry.id] ? entry.password : "•".repeat(8)}</span>
                            <button
                              type="button"
                              onClick={() => toggleVisible(entry.id)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={visibleMap[entry.id] ? `Hide password for ${entry.site}` : `Show password for ${entry.site}`}
                            >
                              <img
                                src={visibleMap[entry.id] ? "/hide.png" : "/show.png"}
                                alt={visibleMap[entry.id] ? "hide" : "show"}
                                className="w-5 h-5 cursor-pointer"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(entry.password)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={`Copy password for ${entry.site}`}
                            >
                              <img src="/copy.png" alt="copy" className="w-5 h-5 cursor-pointer" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(entry.id)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={`Edit ${entry.site}`}
                            >
                              <img src="/edit.png" alt="edit" className="w-5 h-5 cursor-pointer" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="p-1 cursor-pointer hover:opacity-90 hover:scale-110 transition"
                              aria-label={`Delete ${entry.site}`}
                            >
                              <img src="/delete.png" alt="delete" className="w-5 h-5 cursor-pointer" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Toast notification */}
        <div
          aria-live="polite"
          className={`fixed right-6 bottom-6 z-50 transition-opacity ${toast.show ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="bg-black text-white px-4 py-2 rounded-md shadow">{toast.message}</div>
        </div>
      </main>
    </div>
  );
};

export default Manager;
