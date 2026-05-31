import React, { useState } from 'react';
import { Fingerprint, Key, User, Power, Eye, EyeOff } from 'lucide-react';

export default function ModernSecureLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Xác thực hệ thống với:", { username, password });
    };

    return (
        <div className="w-full min-h-screen bg-[#e0e5ec] flex items-center justify-center p-4 relative font-sans selection:bg-[#ff4757] selection:text-white">
            {/* Hiệu ứng lưới Blueprint mờ phía sau */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Khung máy chính (Chassis) */}
            <div className="w-full max-w-md bg-[#e0e5ec] rounded-[24px] p-8 relative shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] border border-[#ffffff40]">

                {/* Đinh vít cơ khí ở 4 góc */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]"></div>

                {/* Màn hình hiển thị LCD CRT chìm sâu */}
                <div className="w-full bg-[#1a1c1e] rounded-xl p-4 mb-8 relative overflow-hidden shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] border border-slate-800">
                    {/* Hiệu ứng quét tia CRT */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none"></div>

                    <div className="flex justify-between items-center">
                        <div className="font-mono text-xs text-[#22c55e] tracking-widest uppercase animate-pulse">
                            :: SYSTEM_AUTH_v2.0
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-ping"></span>
                            <span className="font-mono text-[10px] text-[#22c55e]">CORE_ONLINE</span>
                        </div>
                    </div>
                    <div className="mt-2 font-mono text-lg text-slate-300 font-bold tracking-wide">
                        SECURE ACCESS PORTAL
                    </div>
                </div>

                {/* Form Nhập liệu */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Trường Username */}
                    <div className="relative">
                        <label className="block font-mono text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 ml-1">
                            OPERATOR_ID
                        </label>
                        <div className="relative flex items-center bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]">
                            <div className="pl-4 text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tên đăng nhập..."
                                className="w-full bg-transparent py-3 px-3 font-mono text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Trường Password */}
                    <div className="relative">
                        <label className="block font-mono text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 ml-1">
                            ACCESS_KEY
                        </label>
                        <div className="relative flex items-center bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]">
                            <div className="pl-4 text-slate-400">
                                <Key size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mật mã hệ thống..."
                                className="w-full bg-transparent py-3 px-3 font-mono text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="pr-4 text-slate-400 hover:text-slate-600 outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Nút Đăng nhập 3D lò xo cơ khí */}
                    <button
                        type="submit"
                        className="w-full mt-4 bg-[#ff4757] hover:brightness-110 text-white font-mono font-bold tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 border-t border-white/20 shadow-[4px_4px_10px_#babecc,-4px_-4px_10px_#ffffff] active:translate-y-[2px] active:shadow-[inset_4px_4px_6px_rgba(0,0,0,0.3)] transition-all duration-150 group"
                    >
                        <Power size={16} className="group-hover:rotate-45 transition-transform" />
                        INITIALIZE ACCESS
                    </button>
                </form>

                {/* Chân trang trang trí: Khe tản nhiệt cơ khí */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-300/50">
                    <span className="font-mono text-[10px] text-slate-400">RESTRICTED AREA</span>
                    <div className="flex gap-1">
                        <div className="w-6 h-1.5 bg-slate-300 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                        <div className="w-6 h-1.5 bg-slate-300 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                        <div className="w-6 h-1.5 bg-slate-300 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}